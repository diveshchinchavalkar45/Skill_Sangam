import { query } from '../db/index.js';
import {
  calculateMatch,
  getUserMatchProfile,
  getProjectMatchData
} from '../services/matchService.js';

export async function listProjects(req, res) {
  try {
    const {
      search,
      domain,
      skill,
      event,
      location,
      status = 'open',
      sort = 'match',
      limit = 30,
      offset = 0
    } = req.query;

    let sql = `
      SELECT p.*,
             d.name as domain_name,
             u.name as owner_name,
             u.email as owner_email,
             (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as current_team_size
      FROM projects p
      JOIN domains d ON p.domain_id = d.id
      JOIN users u ON p.owner_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND p.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (p.title ILIKE $${params.length} OR p.description ILIKE $${params.length} OR p.short_description ILIKE $${params.length})`;
    }

    if (domain) {
      params.push(domain);
      sql += ` AND (p.domain_id = $${params.length} OR d.name ILIKE $${params.length})`;
    }

    if (event) {
      params.push(`%${event}%`);
      sql += ` AND p.event_name ILIKE $${params.length}`;
    }

    if (location) {
      params.push(`%${location}%`);
      sql += ` AND p.location ILIKE $${params.length}`;
    }

    if (skill) {
      params.push(skill);
      sql += ` AND p.id IN (
        SELECT prs.project_id
        FROM project_required_skills prs
        JOIN skills s ON prs.skill_id = s.id
        WHERE s.name ILIKE $${params.length} OR prs.skill_id = $${params.length}
      )`;
    }

    sql += ' ORDER BY p.created_at DESC';

    const result = await query(sql, params);
    const projectsList = result.rows;

    // Fetch user match profile if user is authenticated
    let userProfile = null;
    let userRequests = new Set();
    let userMemberships = new Set();

    if (req.user) {
      userProfile = await getUserMatchProfile(req.user.id);
      const reqRes = await query('SELECT project_id FROM join_requests WHERE user_id = $1 AND status = $2', [req.user.id, 'pending']);
      for (const r of reqRes.rows) userRequests.add(r.project_id);

      const memRes = await query('SELECT project_id FROM project_members WHERE user_id = $1', [req.user.id]);
      for (const m of memRes.rows) userMemberships.add(m.project_id);
    }

    // Attach required skills & roles & calculate matches
    const enrichedProjects = [];
    for (const proj of projectsList) {
      const skillsRes = await query(
        `SELECT s.id, s.name, s.category, prs.count_needed
         FROM project_required_skills prs
         JOIN skills s ON prs.skill_id = s.id
         WHERE prs.project_id = $1`,
        [proj.id]
      );
      proj.required_skills = skillsRes.rows;

      const rolesRes = await query(
        `SELECT r.id, r.name, prr.count_needed
         FROM project_required_roles prr
         JOIN user_roles r ON prr.role_id = r.id
         WHERE prr.project_id = $1`,
        [proj.id]
      );
      proj.required_roles = rolesRes.rows;

      if (userProfile) {
        proj.match = calculateMatch(userProfile, proj);
        proj.is_owner = proj.owner_id === req.user.id;
        proj.is_member = userMemberships.has(proj.id);
        proj.has_pending_request = userRequests.has(proj.id);
      } else {
        proj.match = null;
        proj.is_owner = false;
        proj.is_member = false;
        proj.has_pending_request = false;
      }

      enrichedProjects.push(proj);
    }

    // Sort by match score if user is logged in and requested match sort
    if (sort === 'match' && userProfile) {
      enrichedProjects.sort((a, b) => (b.match?.matchScore || 0) - (a.match?.matchScore || 0));
    } else if (sort === 'team_size') {
      enrichedProjects.sort((a, b) => b.current_team_size - a.current_team_size);
    }

    const paginated = enrichedProjects.slice(Number(offset), Number(offset) + Number(limit));

    return res.json({
      success: true,
      data: {
        projects: paginated,
        total: enrichedProjects.length
      }
    });
  } catch (err) {
    console.error('listProjects error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve projects' }
    });
  }
}

export async function createProject(req, res) {
  try {
    const ownerId = req.user.id;
    const {
      title,
      shortDescription,
      description,
      domainId,
      eventName,
      location,
      startDate,
      endDate,
      hoursPerWeek = 15,
      maxTeamSize = 4,
      requiredSkills = [],
      requiredRoles = []
    } = req.body;

    const projRes = await query(
      `INSERT INTO projects (
        title, short_description, description, domain_id,
        event_name, location, owner_id, start_date, end_date,
        hours_per_week, max_team_size, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'open')
      RETURNING id, title, short_description, description, domain_id,
                event_name, location, owner_id, start_date, end_date,
                hours_per_week, max_team_size, status, created_at`,
      [title, shortDescription || description.slice(0, 150), description, domainId, eventName, location, ownerId, startDate, endDate, hoursPerWeek, maxTeamSize]
    );

    const project = projRes.rows[0];

    // Add owner as Project Lead member
    await query(
      `INSERT INTO project_members (project_id, user_id, role_in_project)
       VALUES ($1, $2, 'Project Lead')`,
      [project.id, ownerId]
    );

    // Insert required skills
    for (const sk of requiredSkills) {
      let skillId = sk;
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sk)) {
        const sCheck = await query('SELECT id FROM skills WHERE LOWER(name) = LOWER($1)', [sk]);
        if (sCheck.rows.length > 0) {
          skillId = sCheck.rows[0].id;
        } else {
          const ins = await query('INSERT INTO skills (name) VALUES ($1) RETURNING id', [sk]);
          skillId = ins.rows[0].id;
        }
      }
      await query(
        `INSERT INTO project_required_skills (project_id, skill_id, count_needed)
         VALUES ($1, $2, 1)
         ON CONFLICT DO NOTHING`,
        [project.id, skillId]
      );
    }

    // Insert required roles
    for (const rl of requiredRoles) {
      let roleId = rl;
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rl)) {
        const rCheck = await query('SELECT id FROM user_roles WHERE LOWER(name) = LOWER($1)', [rl]);
        if (rCheck.rows.length > 0) {
          roleId = rCheck.rows[0].id;
        } else {
          const ins = await query('INSERT INTO user_roles (name) VALUES ($1) RETURNING id', [rl]);
          roleId = ins.rows[0].id;
        }
      }
      await query(
        `INSERT INTO project_required_roles (project_id, role_id, count_needed)
         VALUES ($1, $2, 1)
         ON CONFLICT DO NOTHING`,
        [project.id, roleId]
      );
    }

    const fullProject = await getProjectMatchData(project.id);

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project: fullProject }
    });
  } catch (err) {
    console.error('createProject error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create project' }
    });
  }
}

export async function getProjectById(req, res) {
  try {
    const { id } = req.params;
    const project = await getProjectMatchData(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    let match = null;
    let isOwner = false;
    let isMember = false;
    let hasPendingRequest = false;

    if (req.user) {
      isOwner = project.owner_id === req.user.id;
      isMember = project.members.some(m => m.user_id === req.user.id);

      const reqCheck = await query(
        `SELECT id, status FROM join_requests WHERE project_id = $1 AND user_id = $2`,
        [id, req.user.id]
      );
      hasPendingRequest = reqCheck.rows.some(r => r.status === 'pending');

      const userProfile = await getUserMatchProfile(req.user.id);
      if (userProfile) {
        match = calculateMatch(userProfile, project);
      }
    }

    return res.json({
      success: true,
      data: {
        project: {
          ...project,
          is_owner: isOwner,
          is_member: isMember,
          has_pending_request: hasPendingRequest,
          match
        }
      }
    });
  } catch (err) {
    console.error('getProjectById error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve project' }
    });
  }
}

export async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check ownership
    const existing = await query('SELECT owner_id FROM projects WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    if (existing.rows[0].owner_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only project owners can modify project details' }
      });
    }

    const {
      title,
      shortDescription,
      description,
      domainId,
      eventName,
      location,
      startDate,
      endDate,
      hoursPerWeek,
      maxTeamSize,
      status,
      requiredSkills,
      requiredRoles
    } = req.body;

    await query(
      `UPDATE projects SET
        title = COALESCE($2, title),
        short_description = COALESCE($3, short_description),
        description = COALESCE($4, description),
        domain_id = COALESCE($5, domain_id),
        event_name = COALESCE($6, event_name),
        location = COALESCE($7, location),
        start_date = COALESCE($8, start_date),
        end_date = COALESCE($9, end_date),
        hours_per_week = COALESCE($10, hours_per_week),
        max_team_size = COALESCE($11, max_team_size),
        status = COALESCE($12, status),
        updated_at = NOW()
       WHERE id = $1`,
      [id, title, shortDescription, description, domainId, eventName, location, startDate, endDate, hoursPerWeek, maxTeamSize, status]
    );

    if (Array.isArray(requiredSkills)) {
      await query('DELETE FROM project_required_skills WHERE project_id = $1', [id]);
      for (const sk of requiredSkills) {
        let skillId = sk;
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sk)) {
          const sCheck = await query('SELECT id FROM skills WHERE LOWER(name) = LOWER($1)', [sk]);
          if (sCheck.rows.length > 0) {
            skillId = sCheck.rows[0].id;
          } else {
            const ins = await query('INSERT INTO skills (name) VALUES ($1) RETURNING id', [sk]);
            skillId = ins.rows[0].id;
          }
        }
        await query(
          `INSERT INTO project_required_skills (project_id, skill_id, count_needed)
           VALUES ($1, $2, 1)
           ON CONFLICT DO NOTHING`,
          [id, skillId]
        );
      }
    }

    if (Array.isArray(requiredRoles)) {
      await query('DELETE FROM project_required_roles WHERE project_id = $1', [id]);
      for (const rl of requiredRoles) {
        let roleId = rl;
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rl)) {
          const rCheck = await query('SELECT id FROM user_roles WHERE LOWER(name) = LOWER($1)', [rl]);
          if (rCheck.rows.length > 0) {
            roleId = rCheck.rows[0].id;
          } else {
            const ins = await query('INSERT INTO user_roles (name) VALUES ($1) RETURNING id', [rl]);
            roleId = ins.rows[0].id;
          }
        }
        await query(
          `INSERT INTO project_required_roles (project_id, role_id, count_needed)
           VALUES ($1, $2, 1)
           ON CONFLICT DO NOTHING`,
          [id, roleId]
        );
      }
    }

    const updated = await getProjectMatchData(id);

    return res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project: updated }
    });
  } catch (err) {
    console.error('updateProject error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update project' }
    });
  }
}

export async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await query('SELECT owner_id FROM projects WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    if (existing.rows[0].owner_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only project owners can delete this project' }
      });
    }

    await query('DELETE FROM projects WHERE id = $1', [id]);

    return res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (err) {
    console.error('deleteProject error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to delete project' }
    });
  }
}

export default {
  listProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject
};

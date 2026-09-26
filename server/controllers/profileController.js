import { query } from '../db/index.js';
import { getUserMatchProfile } from '../services/matchService.js';

export function calculateCompletion(user) {
  let score = 0;
  if (user.name) score += 10;
  if (user.user_type) score += 10;
  if (user.institute_or_company) score += 10;
  if (user.year_or_experience) score += 10;
  if (user.location) score += 10;
  if (user.bio && user.bio.trim().length > 10) score += 10;
  if (Array.isArray(user.skills) && user.skills.length > 0) score += 20;
  if (Array.isArray(user.domains) && user.domains.length > 0) score += 10;
  if (user.availability && user.availability.start_date) score += 10;
  return Math.min(100, score);
}

export async function getMyProfile(req, res) {
  try {
    const profile = await getUserMatchProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User profile not found' }
      });
    }

    const completion = calculateCompletion(profile);

    return res.json({
      success: true,
      data: {
        profile: {
          ...profile,
          completionPercentage: completion
        }
      }
    });
  } catch (err) {
    console.error('getMyProfile error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve profile' }
    });
  }
}

export async function updateMyProfile(req, res) {
  try {
    const userId = req.user.id;
    const {
      name,
      profileImageUrl,
      userType,
      instituteOrCompany,
      yearOrExperience,
      location,
      country,
      bio,
      teamPreference,
      skills,
      domains,
      preferredRoles
    } = req.body;

    // Update basic fields
    await query(
      `UPDATE users SET
        name = COALESCE($2, name),
        profile_image_url = COALESCE($3, profile_image_url),
        user_type = COALESCE($4, user_type),
        institute_or_company = COALESCE($5, institute_or_company),
        year_or_experience = COALESCE($6, year_or_experience),
        location = COALESCE($7, location),
        country = COALESCE($8, country),
        bio = COALESCE($9, bio),
        team_preference = COALESCE($10, team_preference),
        updated_at = NOW()
       WHERE id = $1`,
      [userId, name, profileImageUrl, userType, instituteOrCompany, yearOrExperience, location, country, bio, teamPreference]
    );

    // Update Skills if provided
    if (Array.isArray(skills)) {
      await query('DELETE FROM user_skills WHERE user_id = $1', [userId]);
      for (const sk of skills) {
        let skillId = sk.id;
        // If skillId is not a UUID or not provided, find or insert by name
        if (!skillId) {
          const skCheck = await query('SELECT id FROM skills WHERE LOWER(name) = LOWER($1)', [sk.name]);
          if (skCheck.rows.length > 0) {
            skillId = skCheck.rows[0].id;
          } else {
            const ins = await query('INSERT INTO skills (name) VALUES ($1) RETURNING id', [sk.name]);
            skillId = ins.rows[0].id;
          }
        }
        await query(
          `INSERT INTO user_skills (user_id, skill_id, proficiency)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, skill_id) DO UPDATE SET proficiency = EXCLUDED.proficiency`,
          [userId, skillId, sk.proficiency || 'intermediate']
        );
      }
    }

    // Update Domains if provided
    if (Array.isArray(domains)) {
      await query('DELETE FROM user_domains WHERE user_id = $1', [userId]);
      for (const d of domains) {
        let domainId = d;
        // Check if string name rather than UUID
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(d)) {
          const dCheck = await query('SELECT id FROM domains WHERE LOWER(name) = LOWER($1)', [d]);
          if (dCheck.rows.length > 0) {
            domainId = dCheck.rows[0].id;
          } else {
            const ins = await query('INSERT INTO domains (name) VALUES ($1) RETURNING id', [d]);
            domainId = ins.rows[0].id;
          }
        }
        await query(
          `INSERT INTO user_domains (user_id, domain_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [userId, domainId]
        );
      }
    }

    // Update Preferred Roles if provided
    if (Array.isArray(preferredRoles)) {
      await query('DELETE FROM user_preferred_roles WHERE user_id = $1', [userId]);
      for (const r of preferredRoles) {
        let roleId = r;
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(r)) {
          const rCheck = await query('SELECT id FROM user_roles WHERE LOWER(name) = LOWER($1)', [r]);
          if (rCheck.rows.length > 0) {
            roleId = rCheck.rows[0].id;
          } else {
            const ins = await query('INSERT INTO user_roles (name) VALUES ($1) RETURNING id', [r]);
            roleId = ins.rows[0].id;
          }
        }
        await query(
          `INSERT INTO user_preferred_roles (user_id, role_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [userId, roleId]
        );
      }
    }

    const updated = await getUserMatchProfile(userId);
    const completion = calculateCompletion(updated);

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        profile: {
          ...updated,
          completionPercentage: completion
        }
      }
    });
  } catch (err) {
    console.error('updateMyProfile error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update profile' }
    });
  }
}

export async function getUserProfile(req, res) {
  try {
    const { id } = req.params;
    const profile = await getUserMatchProfile(id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }

    // Fetch user's public projects
    const projRes = await query(
      `SELECT p.id, p.title, p.short_description, p.domain_id, d.name as domain_name,
              p.event_name, p.status, p.created_at,
              (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as current_team_size,
              p.max_team_size
       FROM projects p
       JOIN domains d ON p.domain_id = d.id
       WHERE p.owner_id = $1 OR p.id IN (SELECT project_id FROM project_members WHERE user_id = $1)
       ORDER BY p.created_at DESC`,
      [id]
    );

    return res.json({
      success: true,
      data: {
        profile,
        projects: projRes.rows
      }
    });
  } catch (err) {
    console.error('getUserProfile error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch user' }
    });
  }
}

export async function getUserSkills(req, res) {
  try {
    const { id } = req.params;
    const skillsRes = await query(
      `SELECT s.id, s.name, s.category, us.proficiency
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       WHERE us.user_id = $1`,
      [id]
    );

    return res.json({
      success: true,
      data: { skills: skillsRes.rows }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch user skills' }
    });
  }
}

export async function getUserProjects(req, res) {
  try {
    const { id } = req.params;
    const projRes = await query(
      `SELECT p.id, p.title, p.short_description, p.status, p.created_at,
              d.name as domain_name, p.event_name,
              pm.role_in_project, (p.owner_id = $1) as is_owner
       FROM projects p
       JOIN domains d ON p.domain_id = d.id
       LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $1
       WHERE p.owner_id = $1 OR pm.user_id = $1
       ORDER BY p.created_at DESC`,
      [id]
    );

    return res.json({
      success: true,
      data: { projects: projRes.rows }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch user projects' }
    });
  }
}

export default {
  getMyProfile,
  updateMyProfile,
  getUserProfile,
  getUserSkills,
  getUserProjects
};

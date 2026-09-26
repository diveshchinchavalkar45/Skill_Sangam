import { query } from '../db/index.js';

export async function createJoinRequest(req, res) {
  try {
    const { id: projectId } = req.params;
    const userId = req.user.id;
    const { message } = req.body;

    // Fetch project
    const projRes = await query(
      `SELECT p.id, p.owner_id, p.status, p.max_team_size,
              (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as current_members
       FROM projects p WHERE p.id = $1`,
      [projectId]
    );

    if (projRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    const project = projRes.rows[0];

    // Cannot request to join own project
    if (project.owner_id === userId) {
      return res.status(400).json({
        success: false,
        error: { code: 'OWNER_CANNOT_JOIN', message: 'You are the owner of this project' }
      });
    }

    // Check project status and capacity
    if (project.status !== 'open' || Number(project.current_members) >= Number(project.max_team_size)) {
      return res.status(400).json({
        success: false,
        error: { code: 'PROJECT_FULL_OR_CLOSED', message: 'This project is full or closed to new members' }
      });
    }

    // Check if user is already a member
    const memRes = await query(
      `SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [projectId, userId]
    );
    if (memRes.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_MEMBER', message: 'You are already a member of this project' }
      });
    }

    // Check existing request
    const reqRes = await query(
      `SELECT id, status FROM join_requests WHERE project_id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    if (reqRes.rows.length > 0) {
      const existing = reqRes.rows[0];
      if (existing.status === 'pending') {
        return res.status(400).json({
          success: false,
          error: { code: 'DUPLICATE_REQUEST', message: 'You already have a pending join request for this project' }
        });
      }

      // If previously rejected or cancelled, allow re-requesting by updating to pending
      const updated = await query(
        `UPDATE join_requests SET
           status = 'pending',
           message = COALESCE($3, message),
           updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [existing.id, projectId, message]
      );

      return res.json({
        success: true,
        message: 'Join request submitted successfully',
        data: { request: updated.rows[0] }
      });
    }

    // Insert new request
    const insertRes = await query(
      `INSERT INTO join_requests (project_id, user_id, message, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [projectId, userId, message]
    );

    return res.status(201).json({
      success: true,
      message: 'Join request submitted successfully',
      data: { request: insertRes.rows[0] }
    });
  } catch (err) {
    console.error('createJoinRequest error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to submit join request' }
    });
  }
}

export async function getMyRequests(req, res) {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT jr.*,
              p.title as project_title,
              p.status as project_status,
              p.max_team_size,
              d.name as domain_name,
              u.name as owner_name,
              u.email as owner_email
       FROM join_requests jr
       JOIN projects p ON jr.project_id = p.id
       JOIN domains d ON p.domain_id = d.id
       JOIN users u ON p.owner_id = u.id
       WHERE jr.user_id = $1
       ORDER BY jr.created_at DESC`,
      [userId]
    );

    return res.json({
      success: true,
      data: { requests: result.rows }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve join requests' }
    });
  }
}

export async function getProjectRequests(req, res) {
  try {
    const { id: projectId } = req.params;
    const userId = req.user.id;

    const projCheck = await query('SELECT owner_id FROM projects WHERE id = $1', [projectId]);
    if (projCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    if (projCheck.rows[0].owner_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only project owners can view project join requests' }
      });
    }

    const requests = await query(
      `SELECT jr.*,
              u.name as applicant_name,
              u.email as applicant_email,
              u.user_type as applicant_user_type,
              u.institute_or_company,
              u.year_or_experience,
              u.bio,
              u.profile_image_url
       FROM join_requests jr
       JOIN users u ON jr.user_id = u.id
       WHERE jr.project_id = $1
       ORDER BY jr.created_at DESC`,
      [projectId]
    );

    return res.json({
      success: true,
      data: { requests: requests.rows }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve project requests' }
    });
  }
}

export async function updateRequestStatus(req, res) {
  try {
    const { id: requestId } = req.params;
    const { status, roleInProject } = req.body;
    const userId = req.user.id;

    // Fetch request with project info
    const reqRes = await query(
      `SELECT jr.*, p.owner_id, p.max_team_size, p.status as project_status,
              (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as current_members
       FROM join_requests jr
       JOIN projects p ON jr.project_id = p.id
       WHERE jr.id = $1`,
      [requestId]
    );

    if (reqRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Join request not found' }
      });
    }

    const request = reqRes.rows[0];

    // Authorization checks
    if (status === 'accepted' || status === 'rejected') {
      if (request.owner_id !== userId) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Only the project owner can accept or reject requests' }
        });
      }
    } else if (status === 'cancelled') {
      if (request.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Only the applicant can cancel their request' }
        });
      }
    }

    // If accepting, ensure project is not full
    if (status === 'accepted') {
      if (Number(request.current_members) >= Number(request.max_team_size)) {
        return res.status(400).json({
          success: false,
          error: { code: 'PROJECT_FULL', message: 'Cannot accept: project has reached maximum team size' }
        });
      }

      // Add user to project_members
      await query(
        `INSERT INTO project_members (project_id, user_id, role_in_project)
         VALUES ($1, $2, $3)
         ON CONFLICT (project_id, user_id) DO UPDATE SET role_in_project = EXCLUDED.role_in_project`,
        [request.project_id, request.user_id, roleInProject || 'Team Member']
      );

      // Check if project now reached capacity
      const updatedCount = Number(request.current_members) + 1;
      if (updatedCount >= Number(request.max_team_size)) {
        await query(`UPDATE projects SET status = 'full', updated_at = NOW() WHERE id = $1`, [request.project_id]);
      }
    }

    // Update request status
    const updateRes = await query(
      `UPDATE join_requests SET status = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [requestId, status]
    );

    return res.json({
      success: true,
      message: `Join request ${status} successfully`,
      data: { request: updateRes.rows[0] }
    });
  } catch (err) {
    console.error('updateRequestStatus error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update join request status' }
    });
  }
}

export default {
  createJoinRequest,
  getMyRequests,
  getProjectRequests,
  updateRequestStatus
};

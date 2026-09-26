import { query } from '../db/index.js';

export async function createInvitation(req, res) {
  try {
    const { id: projectId } = req.params;
    const inviterId = req.user.id;
    const { inviteeId, roleId, message } = req.body;

    // Check project ownership and status
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

    if (project.owner_id !== inviterId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only project owners can send invitations' }
      });
    }

    if (project.status !== 'open' || Number(project.current_members) >= Number(project.max_team_size)) {
      return res.status(400).json({
        success: false,
        error: { code: 'PROJECT_FULL_OR_CLOSED', message: 'This project is full or closed to new members' }
      });
    }

    if (inviteeId === inviterId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INVITEE', message: 'You cannot invite yourself' }
      });
    }

    // Check if invitee is already a member
    const memRes = await query(
      `SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [projectId, inviteeId]
    );
    if (memRes.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_MEMBER', message: 'User is already a member of this project' }
      });
    }

    // Check existing invitation
    const invRes = await query(
      `SELECT id, status FROM invitations WHERE project_id = $1 AND invitee_id = $2`,
      [projectId, inviteeId]
    );

    if (invRes.rows.length > 0) {
      const existing = invRes.rows[0];
      if (existing.status === 'pending') {
        return res.status(400).json({
          success: false,
          error: { code: 'DUPLICATE_INVITATION', message: 'An active invitation is already pending for this candidate' }
        });
      }

      const updated = await query(
        `UPDATE invitations SET
           status = 'pending',
           role_id = COALESCE($3, role_id),
           message = COALESCE($4, message),
           updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [existing.id, projectId, roleId, message]
      );

      return res.json({
        success: true,
        message: 'Invitation sent successfully',
        data: { invitation: updated.rows[0] }
      });
    }

    const insertRes = await query(
      `INSERT INTO invitations (project_id, inviter_id, invitee_id, role_id, message, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [projectId, inviterId, inviteeId, roleId, message]
    );

    return res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: { invitation: insertRes.rows[0] }
    });
  } catch (err) {
    console.error('createInvitation error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to send invitation' }
    });
  }
}

export async function getMyInvitations(req, res) {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT inv.*,
              p.title as project_title,
              p.short_description as project_description,
              p.status as project_status,
              p.max_team_size,
              d.name as domain_name,
              u.name as inviter_name,
              u.email as inviter_email,
              r.name as role_name
       FROM invitations inv
       JOIN projects p ON inv.project_id = p.id
       JOIN domains d ON p.domain_id = d.id
       JOIN users u ON inv.inviter_id = u.id
       LEFT JOIN user_roles r ON inv.role_id = r.id
       WHERE inv.invitee_id = $1
       ORDER BY inv.created_at DESC`,
      [userId]
    );

    return res.json({
      success: true,
      data: { invitations: result.rows }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve invitations' }
    });
  }
}

export async function updateInvitationStatus(req, res) {
  try {
    const { id: invitationId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const invRes = await query(
      `SELECT inv.*, p.max_team_size, p.status as project_status,
              r.name as role_name,
              (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as current_members
       FROM invitations inv
       JOIN projects p ON inv.project_id = p.id
       LEFT JOIN user_roles r ON inv.role_id = r.id
       WHERE inv.id = $1`,
      [invitationId]
    );

    if (invRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Invitation not found' }
      });
    }

    const invitation = invRes.rows[0];

    // Authorization checks
    if (status === 'accepted' || status === 'rejected') {
      if (invitation.invitee_id !== userId) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Only the invited user can accept or reject this invitation' }
        });
      }
    } else if (status === 'cancelled') {
      if (invitation.inviter_id !== userId) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Only the project owner can cancel this invitation' }
        });
      }
    }

    if (status === 'accepted') {
      if (Number(invitation.current_members) >= Number(invitation.max_team_size)) {
        return res.status(400).json({
          success: false,
          error: { code: 'PROJECT_FULL', message: 'Cannot accept: project is full' }
        });
      }

      // Add invitee as project member
      await query(
        `INSERT INTO project_members (project_id, user_id, role_in_project)
         VALUES ($1, $2, $3)
         ON CONFLICT (project_id, user_id) DO UPDATE SET role_in_project = EXCLUDED.role_in_project`,
        [invitation.project_id, invitation.invitee_id, invitation.role_name || 'Team Member']
      );

      const updatedCount = Number(invitation.current_members) + 1;
      if (updatedCount >= Number(invitation.max_team_size)) {
        await query(`UPDATE projects SET status = 'full', updated_at = NOW() WHERE id = $1`, [invitation.project_id]);
      }
    }

    const updateRes = await query(
      `UPDATE invitations SET status = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [invitationId, status]
    );

    return res.json({
      success: true,
      message: `Invitation ${status} successfully`,
      data: { invitation: updateRes.rows[0] }
    });
  } catch (err) {
    console.error('updateInvitationStatus error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update invitation status' }
    });
  }
}

export default {
  createInvitation,
  getMyInvitations,
  updateInvitationStatus
};

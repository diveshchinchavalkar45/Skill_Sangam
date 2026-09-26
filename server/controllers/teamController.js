import { query } from '../db/index.js';

export async function getProjectTeam(req, res) {
  try {
    const { id: projectId } = req.params;

    // Check project exists
    const projRes = await query(
      `SELECT p.id, p.title, p.owner_id, p.status, p.max_team_size, d.name as domain_name
       FROM projects p
       JOIN domains d ON p.domain_id = d.id
       WHERE p.id = $1`,
      [projectId]
    );

    if (projRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    const project = projRes.rows[0];

    // Fetch members
    const membersRes = await query(
      `SELECT pm.user_id, pm.role_in_project, pm.joined_at,
              u.name, u.email, u.user_type, u.institute_or_company,
              u.location, u.profile_image_url, (u.id = $2) as is_owner
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1
       ORDER BY (u.id = $2) DESC, pm.joined_at ASC`,
      [projectId, project.owner_id]
    );

    // Fetch required roles
    const reqRolesRes = await query(
      `SELECT r.id, r.name, prr.count_needed
       FROM project_required_roles prr
       JOIN user_roles r ON prr.role_id = r.id
       WHERE prr.project_id = $1`,
      [projectId]
    );

    // Calculate filled vs open roles
    const assignedRoles = membersRes.rows.map(m => (m.role_in_project || '').toLowerCase());
    const roleStatus = reqRolesRes.rows.map(reqRole => {
      const needed = reqRole.count_needed;
      const countFilled = assignedRoles.filter(
        assigned => assigned.includes(reqRole.name.toLowerCase()) || reqRole.name.toLowerCase().includes(assigned)
      ).length;

      return {
        roleId: reqRole.id,
        roleName: reqRole.name,
        needed,
        filled: countFilled,
        status: countFilled >= needed ? 'FILLED' : 'OPEN'
      };
    });

    return res.json({
      success: true,
      data: {
        project,
        members: membersRes.rows,
        roleBreakdown: roleStatus,
        totalMembers: membersRes.rows.length,
        maxTeamSize: project.max_team_size,
        isFull: membersRes.rows.length >= project.max_team_size
      }
    });
  } catch (err) {
    console.error('getProjectTeam error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve project team' }
    });
  }
}

export async function updateMemberRole(req, res) {
  try {
    const { id: projectId, userId } = req.params;
    const currentUserId = req.user.id;
    const { roleInProject } = req.body;

    // Check project ownership
    const projRes = await query('SELECT owner_id FROM projects WHERE id = $1', [projectId]);
    if (projRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    if (projRes.rows[0].owner_id !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only project owners can modify member roles' }
      });
    }

    // Verify member exists in project
    const memRes = await query(
      'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (memRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'MEMBER_NOT_FOUND', message: 'User is not a member of this project' }
      });
    }

    const updated = await query(
      `UPDATE project_members SET role_in_project = $3
       WHERE project_id = $1 AND user_id = $2
       RETURNING *`,
      [projectId, userId, roleInProject]
    );

    return res.json({
      success: true,
      message: 'Role updated successfully',
      data: { member: updated.rows[0] }
    });
  } catch (err) {
    console.error('updateMemberRole error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update member role' }
    });
  }
}

export async function removeMember(req, res) {
  try {
    const { id: projectId, userId } = req.params;
    const currentUserId = req.user.id;

    const projRes = await query('SELECT owner_id, status FROM projects WHERE id = $1', [projectId]);
    if (projRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    const project = projRes.rows[0];

    // Project owner can remove anyone except themselves; a member can remove themselves (leave project)
    if (project.owner_id !== currentUserId && userId !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to remove this member' }
      });
    }

    if (userId === project.owner_id) {
      return res.status(400).json({
        success: false,
        error: { code: 'CANNOT_REMOVE_OWNER', message: 'Project owner cannot be removed from project' }
      });
    }

    await query('DELETE FROM project_members WHERE project_id = $1 AND user_id = $2', [projectId, userId]);

    // If project was marked full, reopen it
    if (project.status === 'full') {
      await query(`UPDATE projects SET status = 'open', updated_at = NOW() WHERE id = $1`, [projectId]);
    }

    return res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (err) {
    console.error('removeMember error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to remove member' }
    });
  }
}

export default {
  getProjectTeam,
  updateMemberRole,
  removeMember
};

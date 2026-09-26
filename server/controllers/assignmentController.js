import { query } from '../db/index.js';

/**
 * GET /api/assignments
 * List all assignments with live stats (enrolled, submitted, groups formed, user group status)
 */
export async function getAssignments(req, res) {
  try {
    const userId = req.user?.id;

    const assignmentsRes = await query(`
      SELECT a.*,
             (SELECT COUNT(*) FROM assignment_groups WHERE assignment_id = a.id) as total_groups,
             (SELECT COUNT(*) FROM assignment_groups WHERE assignment_id = a.id AND status = 'submitted') as submitted_groups,
             (SELECT COUNT(*) FROM assignment_groups WHERE assignment_id = a.id AND status = 'forming') as open_groups,
             (SELECT COUNT(*) FROM assignment_group_members agm 
              JOIN assignment_groups ag ON agm.group_id = ag.id 
              WHERE ag.assignment_id = a.id AND ag.status = 'submitted') as submitted_students_count,
             (SELECT COUNT(*) FROM assignment_community_posts WHERE assignment_id = a.id) as community_posts_count
      FROM assignments a
      ORDER BY a.due_date ASC
    `);

    const assignments = [];

    for (const a of assignmentsRes.rows) {
      const totalEnrolled = a.total_students_enrolled || 40;
      const submittedStudents = parseInt(a.submitted_students_count || 0, 10);
      const submissionPercentage = totalEnrolled > 0 ? Math.min(100, Math.round((submittedStudents / totalEnrolled) * 100)) : 0;

      // Check if current user is in a group for this assignment
      let userGroup = null;
      if (userId) {
        const userGroupRes = await query(`
          SELECT ag.id, ag.name, ag.status, ag.submission_url, ag.submitted_at, agm.role_in_group,
                 (ag.leader_id = $2) as is_leader
          FROM assignment_group_members agm
          JOIN assignment_groups ag ON agm.group_id = ag.id
          WHERE ag.assignment_id = $1 AND agm.user_id = $2
        `, [a.id, userId]);

        if (userGroupRes.rows.length > 0) {
          userGroup = userGroupRes.rows[0];
        }
      }

      assignments.push({
        ...a,
        total_groups: parseInt(a.total_groups || 0, 10),
        submitted_groups: parseInt(a.submitted_groups || 0, 10),
        open_groups: parseInt(a.open_groups || 0, 10),
        submitted_students_count: submittedStudents,
        submission_percentage: submissionPercentage,
        community_posts_count: parseInt(a.community_posts_count || 0, 10),
        user_group: userGroup,
        has_submitted: !!userGroup?.submitted_at
      });
    }

    return res.json({
      success: true,
      data: {
        assignments
      }
    });
  } catch (err) {
    console.error('getAssignments error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve course assignments' }
    });
  }
}

/**
 * GET /api/assignments/:id
 * Retrieve assignment details, all created groups with members, and community discussion feed
 */
export async function getAssignmentById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const asgnRes = await query('SELECT * FROM assignments WHERE id = $1', [id]);
    if (asgnRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Assignment not found' }
      });
    }

    const assignment = asgnRes.rows[0];

    // Fetch all groups created under this assignment
    const groupsRes = await query(`
      SELECT ag.*, u.name as leader_name, u.email as leader_email,
             (SELECT COUNT(*) FROM assignment_group_members WHERE group_id = ag.id) as current_member_count
      FROM assignment_groups ag
      JOIN users u ON ag.leader_id = u.id
      WHERE ag.assignment_id = $1
      ORDER BY ag.created_at ASC
    `, [id]);

    const groups = [];
    for (const g of groupsRes.rows) {
      const membersRes = await query(`
        SELECT agm.user_id, agm.role_in_group, agm.joined_at, u.name, u.email, u.profile_image_url,
               u.education_level, u.institute_or_company, u.year_or_experience
        FROM assignment_group_members agm
        JOIN users u ON agm.user_id = u.id
        WHERE agm.group_id = $1
        ORDER BY agm.joined_at ASC
      `, [g.id]);

      const memberCount = parseInt(g.current_member_count || 0, 10);
      const isMember = userId ? membersRes.rows.some(m => m.user_id === userId) : false;
      const isLeader = userId ? g.leader_id === userId : false;

      groups.push({
        ...g,
        current_member_count: memberCount,
        max_size: assignment.max_team_size || 4,
        is_full: memberCount >= (assignment.max_team_size || 4),
        is_member: isMember,
        is_leader: isLeader,
        members: membersRes.rows
      });
    }

    // Community discussion feed
    const postsRes = await query(`
      SELECT acp.*, u.name as author_name, u.profile_image_url as author_avatar,
             u.user_type as author_type, u.education_level as author_level,
             u.institute_or_company as author_institute
      FROM assignment_community_posts acp
      JOIN users u ON acp.user_id = u.id
      WHERE acp.assignment_id = $1
      ORDER BY acp.created_at ASC
    `, [id]);

    // Live Stats calculation
    const totalEnrolled = assignment.total_students_enrolled || 40;
    const submittedGroups = groups.filter(g => g.status === 'submitted');
    const submittedStudents = submittedGroups.reduce((acc, g) => acc + g.current_member_count, 0);
    const submissionPercentage = totalEnrolled > 0 ? Math.min(100, Math.round((submittedStudents / totalEnrolled) * 100)) : 0;
    const openGroups = groups.filter(g => g.status === 'forming' && !g.is_full);

    const currentUserGroup = groups.find(g => g.is_member) || null;

    return res.json({
      success: true,
      data: {
        assignment: {
          ...assignment,
          stats: {
            total_students_enrolled: totalEnrolled,
            submitted_students_count: submittedStudents,
            submission_percentage: submissionPercentage,
            total_groups_count: groups.length,
            open_groups_count: openGroups.length,
            full_groups_count: groups.filter(g => g.is_full || g.status === 'submitted').length,
            submitted_groups_count: submittedGroups.length,
          },
          current_user_group: currentUserGroup,
          has_submitted: !!currentUserGroup?.submitted_at
        },
        groups,
        community_posts: postsRes.rows
      }
    });
  } catch (err) {
    console.error('getAssignmentById error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve assignment details' }
    });
  }
}

/**
 * POST /api/assignments/:id/groups
 * Create a new team group under this assignment
 */
export async function createGroup(req, res) {
  try {
    const { id: assignmentId } = req.params;
    const userId = req.user.id;
    const { name, role = 'Team Lead' } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Group name must be at least 2 characters' }
      });
    }

    // Check if user is already in a group for this assignment
    const existing = await query(`
      SELECT group_id FROM assignment_group_members 
      WHERE assignment_id = $1 AND user_id = $2
    `, [assignmentId, userId]);

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_IN_GROUP', message: 'You are already in a group for this assignment. Leave your current group first.' }
      });
    }

    // Create group
    const grpRes = await query(`
      INSERT INTO assignment_groups (assignment_id, name, leader_id, status)
      VALUES ($1, $2, $3, 'forming')
      RETURNING *
    `, [assignmentId, name.trim(), userId]);

    const group = grpRes.rows[0];

    // Add leader as member
    await query(`
      INSERT INTO assignment_group_members (group_id, assignment_id, user_id, role_in_group)
      VALUES ($1, $2, $3, $4)
    `, [group.id, assignmentId, userId, role]);

    // Optional notification in community
    await query(`
      INSERT INTO assignment_community_posts (assignment_id, user_id, post_type, content)
      VALUES ($1, $2, 'teammate_search', $3)
    `, [assignmentId, userId, `Created a new group "${name.trim()}"! Looking for active teammates to collaborate.`]);

    return res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: { group }
    });
  } catch (err) {
    console.error('createGroup error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create group' }
    });
  }
}

/**
 * POST /api/assignments/:id/groups/:groupId/join
 * Join an existing group with vacancies
 */
export async function joinGroup(req, res) {
  try {
    const { id: assignmentId, groupId } = req.params;
    const userId = req.user.id;
    const { role = 'Team Member' } = req.body || {};

    // Check if user already in group
    const existing = await query(`
      SELECT group_id FROM assignment_group_members 
      WHERE assignment_id = $1 AND user_id = $2
    `, [assignmentId, userId]);

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_IN_GROUP', message: 'You are already in a group for this assignment.' }
      });
    }

    // Check group capacity
    const grpRes = await query(`
      SELECT ag.*, a.max_team_size,
             (SELECT COUNT(*) FROM assignment_group_members WHERE group_id = ag.id) as current_members
      FROM assignment_groups ag
      JOIN assignments a ON ag.assignment_id = a.id
      WHERE ag.id = $1 AND ag.assignment_id = $2
    `, [groupId, assignmentId]);

    if (grpRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'GROUP_NOT_FOUND', message: 'Group not found' }
      });
    }

    const group = grpRes.rows[0];
    if (group.status === 'submitted') {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_SUBMITTED', message: 'This group has already submitted their assignment and is closed to new members.' }
      });
    }

    const currentCount = parseInt(group.current_members, 10);
    const maxCount = group.max_team_size || 4;
    if (currentCount >= maxCount) {
      return res.status(400).json({
        success: false,
        error: { code: 'GROUP_FULL', message: 'This group has reached maximum member capacity.' }
      });
    }

    // Insert membership
    await query(`
      INSERT INTO assignment_group_members (group_id, assignment_id, user_id, role_in_group)
      VALUES ($1, $2, $3, $4)
    `, [groupId, assignmentId, userId, role]);

    // If new count reaches max, mark full
    if (currentCount + 1 >= maxCount) {
      await query(`UPDATE assignment_groups SET status = 'full' WHERE id = $1`, [groupId]);
    }

    return res.json({
      success: true,
      message: `Joined "${group.name}" successfully!`
    });
  } catch (err) {
    console.error('joinGroup error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to join group' }
    });
  }
}

/**
 * POST /api/assignments/:id/groups/:groupId/leave
 * Leave the current group
 */
export async function leaveGroup(req, res) {
  try {
    const { id: assignmentId, groupId } = req.params;
    const userId = req.user.id;

    // Check membership
    const memRes = await query(`
      SELECT * FROM assignment_group_members
      WHERE group_id = $1 AND user_id = $2
    `, [groupId, userId]);

    if (memRes.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'NOT_MEMBER', message: 'You are not a member of this group' }
      });
    }

    // Delete membership
    await query(`
      DELETE FROM assignment_group_members
      WHERE group_id = $1 AND user_id = $2
    `, [groupId, userId]);

    // Check remaining members
    const remRes = await query(`
      SELECT user_id FROM assignment_group_members WHERE group_id = $1
    `, [groupId]);

    if (remRes.rows.length === 0) {
      // Disband empty group
      await query('DELETE FROM assignment_groups WHERE id = $1', [groupId]);
    } else {
      // Reopen group status to forming
      await query(`UPDATE assignment_groups SET status = 'forming' WHERE id = $1`, [groupId]);
    }

    return res.json({
      success: true,
      message: 'You have left the group'
    });
  } catch (err) {
    console.error('leaveGroup error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to leave group' }
    });
  }
}

/**
 * POST /api/assignments/:id/groups/:groupId/submit
 * Submit group assignment work
 */
export async function submitGroupAssignment(req, res) {
  try {
    const { id: assignmentId, groupId } = req.params;
    const userId = req.user.id;
    const { submissionUrl, submissionNotes } = req.body;

    if (!submissionUrl || !submissionUrl.trim().startsWith('http')) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Please provide a valid submission URL (GitHub repo or Drive link)' }
      });
    }

    // Verify user is member of this group
    const memRes = await query(`
      SELECT * FROM assignment_group_members WHERE group_id = $1 AND user_id = $2
    `, [groupId, userId]);

    if (memRes.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only team members can submit for this group' }
      });
    }

    const updatedRes = await query(`
      UPDATE assignment_groups
      SET submission_url = $2,
          submission_notes = $3,
          submitted_at = NOW(),
          status = 'submitted'
      WHERE id = $1
      RETURNING *
    `, [groupId, submissionUrl.trim(), submissionNotes || '']);

    return res.json({
      success: true,
      message: 'Group assignment submitted successfully!',
      data: { group: updatedRes.rows[0] }
    });
  } catch (err) {
    console.error('submitGroupAssignment error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to submit group assignment' }
    });
  }
}

/**
 * POST /api/assignments/:id/community
 * Add a new post / question to the assignment community
 */
export async function addCommunityPost(req, res) {
  try {
    const { id: assignmentId } = req.params;
    const userId = req.user.id;
    const { content, postType = 'discussion' } = req.body;

    if (!content || content.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Message content must be at least 2 characters' }
      });
    }

    const validTypes = ['discussion', 'teammate_search', 'doubt', 'announcement'];
    const type = validTypes.includes(postType) ? postType : 'discussion';

    const insRes = await query(`
      INSERT INTO assignment_community_posts (assignment_id, user_id, post_type, content)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [assignmentId, userId, type, content.trim()]);

    const userRes = await query(`
      SELECT name, profile_image_url, user_type, education_level, institute_or_company 
      FROM users WHERE id = $1
    `, [userId]);

    const post = {
      ...insRes.rows[0],
      author_name: userRes.rows[0]?.name,
      author_avatar: userRes.rows[0]?.profile_image_url,
      author_type: userRes.rows[0]?.user_type,
      author_level: userRes.rows[0]?.education_level,
      author_institute: userRes.rows[0]?.institute_or_company
    };

    return res.status(201).json({
      success: true,
      message: 'Post added to assignment community',
      data: { post }
    });
  } catch (err) {
    console.error('addCommunityPost error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to post in assignment community' }
    });
  }
}

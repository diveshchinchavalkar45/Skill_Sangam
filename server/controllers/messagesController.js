import { query } from '../db/index.js';

export async function getProjectMessages(req, res) {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check project exists
    const projRes = await query('SELECT id, owner_id FROM projects WHERE id = $1', [projectId]);
    if (projRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    const project = projRes.rows[0];

    // Authorization: User must be project owner, project member, or have pending request/invitation
    const isOwner = project.owner_id === userId;
    const memberCheck = await query('SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2', [projectId, userId]);
    const reqCheck = await query('SELECT 1 FROM join_requests WHERE project_id = $1 AND user_id = $2', [projectId, userId]);
    const invCheck = await query('SELECT 1 FROM invitations WHERE project_id = $1 AND invitee_id = $2', [projectId, userId]);

    if (!isOwner && memberCheck.rows.length === 0 && reqCheck.rows.length === 0 && invCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have access to messages for this project' }
      });
    }

    const messagesRes = await query(
      `SELECT m.*,
              s.name as sender_name,
              s.email as sender_email,
              s.profile_image_url as sender_image,
              (s.id = $2) as is_mine
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       WHERE m.project_id = $1
       ORDER BY m.created_at ASC`,
      [projectId, userId]
    );

    // Mark unread messages sent to this user as read
    await query(
      `UPDATE messages SET read_at = NOW()
       WHERE project_id = $1 AND receiver_id = $2 AND read_at IS NULL`,
      [projectId, userId]
    );

    return res.json({
      success: true,
      data: { messages: messagesRes.rows }
    });
  } catch (err) {
    console.error('getProjectMessages error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve messages' }
    });
  }
}

export async function sendMessage(req, res) {
  try {
    const { projectId } = req.params;
    const senderId = req.user.id;
    const { message, receiverId } = req.body;

    const projRes = await query('SELECT id, owner_id FROM projects WHERE id = $1', [projectId]);
    if (projRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    const project = projRes.rows[0];

    // Determine target receiver
    let targetReceiver = receiverId;
    if (!targetReceiver) {
      // If sender is not owner, default receiver is owner
      if (senderId !== project.owner_id) {
        targetReceiver = project.owner_id;
      } else {
        // If owner didn't specify receiver, find first other member
        const otherMem = await query(
          'SELECT user_id FROM project_members WHERE project_id = $1 AND user_id != $2 LIMIT 1',
          [projectId, senderId]
        );
        targetReceiver = otherMem.rows[0]?.user_id || senderId;
      }
    }

    const insertRes = await query(
      `INSERT INTO messages (project_id, sender_id, receiver_id, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [projectId, senderId, targetReceiver, message]
    );

    const inserted = insertRes.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: {
          ...inserted,
          sender_name: req.user.name,
          sender_email: req.user.email,
          sender_image: req.user.profile_image_url,
          is_mine: true
        }
      }
    });
  } catch (err) {
    console.error('sendMessage error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to send message' }
    });
  }
}

export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await query(
      `UPDATE messages SET read_at = NOW()
       WHERE id = $1 AND receiver_id = $2`,
      [id, userId]
    );

    return res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to mark message as read' }
    });
  }
}

export default {
  getProjectMessages,
  sendMessage,
  markAsRead
};

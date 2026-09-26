import { query } from '../db/index.js';

export async function getOrganizerDashboard(req, res) {
  try {
    const { eventId } = req.query;

    // Total counts
    const userCountRes = await query("SELECT COUNT(*) FROM users WHERE user_type != 'organizer'");
    const projectCountRes = await query('SELECT COUNT(*) FROM projects');
    const memberCountRes = await query('SELECT COUNT(*) FROM project_members');
    const pendingReqCountRes = await query("SELECT COUNT(*) FROM join_requests WHERE status = 'pending'");

    // Skill distribution
    const skillDistRes = await query(
      `SELECT s.name, COUNT(us.user_id) as count
       FROM skills s
       JOIN user_skills us ON s.id = us.skill_id
       GROUP BY s.id, s.name
       ORDER BY count DESC
       LIMIT 10`
    );

    // Domain distribution
    const domainDistRes = await query(
      `SELECT d.name, COUNT(p.id) as count
       FROM domains d
       LEFT JOIN projects p ON d.id = p.domain_id
       GROUP BY d.id, d.name
       ORDER BY count DESC`
    );

    // Events list
    const eventsRes = await query(
      `SELECT e.*,
              (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as participant_count,
              (SELECT COUNT(*) FROM projects WHERE event_name ILIKE ('%' || e.name || '%')) as project_count
       FROM events e
       ORDER BY e.start_date ASC`
    );

    // Active projects with team stats
    let projectsSql = `
      SELECT p.id, p.title, p.status, p.max_team_size, p.event_name,
             d.name as domain_name, u.name as owner_name,
             (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as current_members
      FROM projects p
      JOIN domains d ON p.domain_id = d.id
      JOIN users u ON p.owner_id = u.id
    `;
    const params = [];

    if (eventId) {
      const ev = await query('SELECT name FROM events WHERE id = $1', [eventId]);
      if (ev.rows.length > 0) {
        params.push(`%${ev.rows[0].name}%`);
        projectsSql += ` WHERE p.event_name ILIKE $1`;
      }
    }

    projectsSql += ' ORDER BY p.created_at DESC LIMIT 20';
    const projectsRes = await query(projectsSql, params);

    return res.json({
      success: true,
      data: {
        stats: {
          totalParticipants: Number(userCountRes.rows[0].count),
          totalProjects: Number(projectCountRes.rows[0].count),
          totalTeamMemberships: Number(memberCountRes.rows[0].count),
          pendingRequests: Number(pendingReqCountRes.rows[0].count)
        },
        skillDistribution: skillDistRes.rows,
        domainDistribution: domainDistRes.rows,
        events: eventsRes.rows,
        recentProjects: projectsRes.rows
      }
    });
  } catch (err) {
    console.error('getOrganizerDashboard error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve organizer analytics' }
    });
  }
}

export async function getEvents(req, res) {
  try {
    const events = await query(
      `SELECT e.*,
              (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as participant_count,
              (SELECT COUNT(*) FROM projects WHERE event_name ILIKE ('%' || e.name || '%')) as project_count
       FROM events e
       ORDER BY e.start_date ASC`
    );

    return res.json({
      success: true,
      data: { events: events.rows }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve events' }
    });
  }
}

export async function getEventUsers(req, res) {
  try {
    const { eventId } = req.params;

    const users = await query(
      `SELECT u.id, u.name, u.email, u.user_type, u.institute_or_company,
              u.year_or_experience, u.location, u.team_preference,
              ep.joined_at,
              (SELECT array_agg(s.name) FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = u.id) as skills
       FROM event_participants ep
       JOIN users u ON ep.user_id = u.id
       WHERE ep.event_id = $1
       ORDER BY ep.joined_at DESC`,
      [eventId]
    );

    return res.json({
      success: true,
      data: { users: users.rows }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve event participants' }
    });
  }
}

export async function getEventProjects(req, res) {
  try {
    const { eventId } = req.params;

    const ev = await query('SELECT name FROM events WHERE id = $1', [eventId]);
    if (ev.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Event not found' }
      });
    }

    const eventName = ev.rows[0].name;

    const projects = await query(
      `SELECT p.id, p.title, p.short_description, p.status, p.max_team_size,
              d.name as domain_name, u.name as owner_name,
              (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as current_members
       FROM projects p
       JOIN domains d ON p.domain_id = d.id
       JOIN users u ON p.owner_id = u.id
       WHERE p.event_name ILIKE $1
       ORDER BY p.created_at DESC`,
      [`%${eventName}%`]
    );

    return res.json({
      success: true,
      data: {
        eventName,
        projects: projects.rows
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve event projects' }
    });
  }
}

export default {
  getOrganizerDashboard,
  getEvents,
  getEventUsers,
  getEventProjects
};

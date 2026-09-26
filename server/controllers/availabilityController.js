import { query } from '../db/index.js';

export async function getMyAvailability(req, res) {
  try {
    const result = await query(
      `SELECT id, user_id, start_date, end_date, hours_per_week, timezone
       FROM availability
       WHERE user_id = $1`,
      [req.user.id]
    );

    return res.json({
      success: true,
      data: {
        availability: result.rows[0] || null
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve availability' }
    });
  }
}

export async function updateMyAvailability(req, res) {
  try {
    const { startDate, endDate, hoursPerWeek, timezone = 'Asia/Kolkata' } = req.body;
    const userId = req.user.id;

    const result = await query(
      `INSERT INTO availability (user_id, start_date, end_date, hours_per_week, timezone)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         start_date = EXCLUDED.start_date,
         end_date = EXCLUDED.end_date,
         hours_per_week = EXCLUDED.hours_per_week,
         timezone = EXCLUDED.timezone
       RETURNING id, user_id, start_date, end_date, hours_per_week, timezone`,
      [userId, startDate, endDate, hoursPerWeek, timezone]
    );

    return res.json({
      success: true,
      message: 'Availability updated successfully',
      data: {
        availability: result.rows[0]
      }
    });
  } catch (err) {
    console.error('updateMyAvailability error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update availability' }
    });
  }
}

export default {
  getMyAvailability,
  updateMyAvailability
};

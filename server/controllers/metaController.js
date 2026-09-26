import { query } from '../db/index.js';

export async function getSkills(req, res) {
  try {
    const { search, category } = req.query;
    let sql = 'SELECT id, name, category FROM skills WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND name ILIKE $${params.length}`;
    }

    if (category) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    sql += ' ORDER BY category ASC, name ASC';

    const result = await query(sql, params);
    return res.json({
      success: true,
      data: { skills: result.rows }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve skills' }
    });
  }
}

export async function getSkillCategories(req, res) {
  try {
    const result = await query(
      `SELECT DISTINCT category FROM skills WHERE category IS NOT NULL ORDER BY category ASC`
    );
    return res.json({
      success: true,
      data: { categories: result.rows.map(r => r.category) }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve skill categories' }
    });
  }
}

export async function getDomains(req, res) {
  try {
    const result = await query('SELECT id, name FROM domains ORDER BY name ASC');
    return res.json({
      success: true,
      data: { domains: result.rows }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve domains' }
    });
  }
}

export async function getRoles(req, res) {
  try {
    const result = await query('SELECT id, name FROM user_roles ORDER BY name ASC');
    return res.json({
      success: true,
      data: { roles: result.rows }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve roles' }
    });
  }
}

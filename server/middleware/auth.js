import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';

const JWT_SECRET = process.env.SESSION_SECRET || 'skillsangam_super_secure_jwt_secret_dev_2026_key';

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      userType: user.user_type || user.userType
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token required'
        }
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await query(
      `SELECT id, email, name, user_type, institute_or_company, year_or_experience,
              location, country, bio, profile_image_url, team_preference, created_at, updated_at
       FROM users WHERE id = $1`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User associated with this token no longer exists'
        }
      });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired session token'
      }
    });
  }
}

export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await query(
      `SELECT id, email, name, user_type, institute_or_company, year_or_experience,
              location, country, bio, profile_image_url, team_preference, created_at, updated_at
       FROM users WHERE id = $1`,
      [decoded.id]
    );

    req.user = result.rows.length > 0 ? result.rows[0] : null;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
}

export function requireOrganizer(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }

  if (req.user.user_type !== 'organizer') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Organizer privileges required to access this resource'
      }
    });
  }

  next();
}

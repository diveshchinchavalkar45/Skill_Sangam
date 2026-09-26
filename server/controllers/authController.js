import bcrypt from 'bcryptjs';
import { query } from '../db/index.js';
import { generateToken } from '../middleware/auth.js';

export async function register(req, res) {
  try {
    const {
      email,
      password,
      name,
      userType = 'student',
      educationLevel = (userType === 'student' ? 'college' : 'not_applicable'),
      instituteOrCompany,
      yearOrExperience,
      location,
      country = 'India',
      bio,
      teamPreference = 'open_to_both'
    } = req.body;

    const existing = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email address already exists'
        }
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await query(
      `INSERT INTO users (
        email, password_hash, name, user_type, education_level,
        institute_or_company, year_or_experience,
        location, country, bio, team_preference
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, email, name, user_type, education_level, institute_or_company, year_or_experience,
                location, country, bio, profile_image_url, team_preference, created_at, updated_at`,
      [email.toLowerCase(), passwordHash, name, userType, educationLevel, instituteOrCompany, yearOrExperience, location, country, bio, teamPreference]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user,
        token
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to register account'
      }
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const result = await query(
      `SELECT id, email, password_hash, name, user_type, institute_or_company,
              year_or_experience, location, country, bio, profile_image_url,
              team_preference, created_at, updated_at
       FROM users WHERE LOWER(email) = LOWER($1)`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash || '');
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Never return password_hash
    delete user.password_hash;
    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user,
        token
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to authenticate user'
      }
    });
  }
}

export async function logout(req, res) {
  return res.json({
    success: true,
    message: 'Logged out successfully'
  });
}

export async function getMe(req, res) {
  return res.json({
    success: true,
    data: {
      user: req.user
    }
  });
}

export default {
  register,
  login,
  logout,
  getMe
};

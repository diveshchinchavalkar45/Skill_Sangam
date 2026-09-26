import { query } from '../db/index.js';

/**
 * Calculates a transparent, deterministic match score between a user and a project.
 *
 * Base score weights:
 * - Skills: 60%
 * - Domain: 20%
 * - Availability: 10%
 * - Role Compatibility: 10%
 */
export function calculateMatch(userData, projectData) {
  // 1. SKILLS (60%)
  const userSkillMap = new Map();
  if (Array.isArray(userData.skills)) {
    for (const sk of userData.skills) {
      const name = typeof sk === 'string' ? sk : sk.name;
      const proficiency = sk.proficiency || 'intermediate';
      if (name) userSkillMap.set(name.toLowerCase(), proficiency);
    }
  }

  const projectSkills = Array.isArray(projectData.required_skills)
    ? projectData.required_skills
    : [];

  let matchedSkills = [];
  let missingSkills = [];

  for (const psk of projectSkills) {
    const skName = typeof psk === 'string' ? psk : psk.name;
    if (!skName) continue;
    if (userSkillMap.has(skName.toLowerCase())) {
      matchedSkills.push(skName);
    } else {
      missingSkills.push(skName);
    }
  }

  const totalRequiredSkills = projectSkills.length;
  const skillScore = totalRequiredSkills > 0
    ? matchedSkills.length / totalRequiredSkills
    : 1.0;

  // 2. DOMAIN (20%)
  const userDomains = Array.isArray(userData.domains)
    ? userData.domains.map(d => (typeof d === 'string' ? d : d.name).toLowerCase())
    : [];
  const projectDomainName = (projectData.domain_name || projectData.domain || '').toLowerCase();

  const domainMatches = userDomains.length > 0 && projectDomainName
    ? userDomains.includes(projectDomainName)
    : false;

  const domainScore = domainMatches ? 1.0 : 0.0;

  // 3. AVAILABILITY (10%)
  let availabilityScore = 0.5; // neutral default if unconfigured
  let availabilityReason = 'Availability not configured';
  let dateOverlap = false;

  if (userData.availability && userData.availability.start_date && userData.availability.end_date) {
    const uStart = new Date(userData.availability.start_date).getTime();
    const uEnd = new Date(userData.availability.end_date).getTime();
    const pStart = new Date(projectData.start_date).getTime();
    const pEnd = new Date(projectData.end_date).getTime();

    const overlapStart = Math.max(uStart, pStart);
    const overlapEnd = Math.min(uEnd, pEnd);

    if (overlapEnd >= overlapStart) {
      dateOverlap = true;
      const totalProjectDays = Math.max(1, (pEnd - pStart) / (1000 * 60 * 60 * 24) + 1);
      const overlapDays = (overlapEnd - overlapStart) / (1000 * 60 * 60 * 24) + 1;
      const dateRatio = Math.min(1, Math.max(0, overlapDays / totalProjectDays));

      let hoursRatio = 1.0;
      if (projectData.hours_per_week && userData.availability.hours_per_week) {
        hoursRatio = Math.min(1.0, userData.availability.hours_per_week / projectData.hours_per_week);
      }

      availabilityScore = (dateRatio * 0.7) + (hoursRatio * 0.3);
      availabilityReason = `Timeline overlaps (${Math.round(dateRatio * 100)}% project duration, ${userData.availability.hours_per_week}h/week)`;
    } else {
      availabilityScore = 0.0;
      availabilityReason = 'No timeline overlap with project dates';
    }
  }

  // 4. ROLE COMPATIBILITY (10%)
  const userRoles = Array.isArray(userData.preferred_roles)
    ? userData.preferred_roles.map(r => (typeof r === 'string' ? r : r.name).toLowerCase())
    : [];

  const projectRoles = Array.isArray(projectData.required_roles)
    ? projectData.required_roles.map(r => (typeof r === 'string' ? r : r.name).toLowerCase())
    : [];

  let matchedRoles = [];
  for (const ur of userRoles) {
    if (projectRoles.includes(ur)) {
      matchedRoles.push(ur);
    }
  }

  let roleScore = 0.0;
  if (projectRoles.length === 0) {
    roleScore = 1.0;
  } else if (matchedRoles.length > 0) {
    roleScore = Math.min(1.0, matchedRoles.length / projectRoles.length);
  }

  // FINAL WEIGHTED FORMULA
  const finalRaw = (skillScore * 0.60) +
                   (domainScore * 0.20) +
                   (availabilityScore * 0.10) +
                   (roleScore * 0.10);

  const matchScore = Math.min(100, Math.max(0, Math.round(finalRaw * 100)));

  // EXPLAINABLE REASONS
  const reasons = [];

  if (totalRequiredSkills > 0) {
    if (matchedSkills.length > 0) {
      reasons.push(`${matchedSkills.length}/${totalRequiredSkills} required skills match (${matchedSkills.slice(0, 3).join(', ')}${matchedSkills.length > 3 ? '...' : ''})`);
    } else {
      reasons.push(`No required skills matched yet (needs ${projectSkills.slice(0, 2).map(s => typeof s === 'string' ? s : s.name).join(', ')})`);
    }
  }

  if (domainMatches) {
    reasons.push(`Domain matches (${projectData.domain_name || projectData.domain || 'Domain'})`);
  } else if (projectData.domain_name || projectData.domain) {
    reasons.push(`Project domain is ${projectData.domain_name || projectData.domain}`);
  }

  if (dateOverlap) {
    reasons.push(availabilityReason);
  } else if (userData.availability) {
    reasons.push(availabilityReason);
  }

  if (matchedRoles.length > 0) {
    reasons.push(`Preferred role matches (${matchedRoles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')})`);
  }

  return {
    matchScore,
    skillScore: Math.round(skillScore * 100),
    domainScore: Math.round(domainScore * 100),
    availabilityScore: Math.round(availabilityScore * 100),
    roleScore: Math.round(roleScore * 100),
    matchedSkills,
    missingSkills,
    matchedRoles,
    reasons
  };
}

/**
 * Fetches full profile context for a user for matching calculations
 */
export async function getUserMatchProfile(userId) {
  const userRes = await query(
    `SELECT u.id, u.name, u.email, u.user_type, u.education_level, u.institute_or_company,
            u.year_or_experience, u.location, u.country, u.bio, u.team_preference,
            u.profile_image_url
     FROM users u WHERE u.id = $1`,
    [userId]
  );
  if (userRes.rows.length === 0) return null;

  const user = userRes.rows[0];

  // Skills
  const skillsRes = await query(
    `SELECT s.id, s.name, s.category, us.proficiency
     FROM user_skills us
     JOIN skills s ON us.skill_id = s.id
     WHERE us.user_id = $1`,
    [userId]
  );
  user.skills = skillsRes.rows;

  // Domains
  const domainsRes = await query(
    `SELECT d.id, d.name
     FROM user_domains ud
     JOIN domains d ON ud.domain_id = d.id
     WHERE ud.user_id = $1`,
    [userId]
  );
  user.domains = domainsRes.rows;

  // Preferred Roles
  const rolesRes = await query(
    `SELECT r.id, r.name
     FROM user_preferred_roles upr
     JOIN user_roles r ON upr.role_id = r.id
     WHERE upr.user_id = $1`,
    [userId]
  );
  user.preferred_roles = rolesRes.rows;

  // Availability
  const availRes = await query(
    `SELECT start_date, end_date, hours_per_week, timezone
     FROM availability
     WHERE user_id = $1`,
    [userId]
  );
  user.availability = availRes.rows[0] || null;

  return user;
}

/**
 * Fetches full project context for matching calculations
 */
export async function getProjectMatchData(projectId) {
  const projRes = await query(
    `SELECT p.*, d.name as domain_name, u.name as owner_name, u.email as owner_email,
            (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as current_team_size
     FROM projects p
     JOIN domains d ON p.domain_id = d.id
     JOIN users u ON p.owner_id = u.id
     WHERE p.id = $1`,
    [projectId]
  );
  if (projRes.rows.length === 0) return null;

  const project = projRes.rows[0];

  // Required skills
  const skillsRes = await query(
    `SELECT s.id, s.name, s.category, prs.count_needed
     FROM project_required_skills prs
     JOIN skills s ON prs.skill_id = s.id
     WHERE prs.project_id = $1`,
    [projectId]
  );
  project.required_skills = skillsRes.rows;

  // Required roles
  const rolesRes = await query(
    `SELECT r.id, r.name, prr.count_needed
     FROM project_required_roles prr
     JOIN user_roles r ON prr.role_id = r.id
     WHERE prr.project_id = $1`,
    [projectId]
  );
  project.required_roles = rolesRes.rows;

  // Members
  const membersRes = await query(
    `SELECT pm.user_id, pm.role_in_project, pm.joined_at, u.name, u.email, u.profile_image_url
     FROM project_members pm
     JOIN users u ON pm.user_id = u.id
     WHERE pm.project_id = $1`,
    [projectId]
  );
  project.members = membersRes.rows;

  return project;
}

/**
 * Get recommended projects for a user sorted by matchScore descending
 */
export async function getRecommendedProjects(userId, options = {}) {
  const user = await getUserMatchProfile(userId);
  if (!user) return [];

  // Fetch all open projects not owned by this user and where user is not already a member
  let sql = `
    SELECT p.id
    FROM projects p
    WHERE p.status = 'open'
      AND p.owner_id != $1
      AND p.id NOT IN (SELECT project_id FROM project_members WHERE user_id = $1)
  `;
  const params = [userId];

  if (options.domain) {
    params.push(options.domain);
    sql += ` AND p.domain_id = $${params.length}`;
  }

  if (options.event) {
    params.push(`%${options.event}%`);
    sql += ` AND p.event_name ILIKE $${params.length}`;
  }

  const res = await query(sql, params);
  const projectIds = res.rows.map(r => r.id);

  const matchedProjects = [];
  for (const pid of projectIds) {
    const project = await getProjectMatchData(pid);
    if (!project) continue;
    const match = calculateMatch(user, project);

    matchedProjects.push({
      ...project,
      match
    });
  }

  // Sort descending by matchScore
  matchedProjects.sort((a, b) => b.match.matchScore - a.match.matchScore);

  const limit = options.limit || 20;
  const offset = options.offset || 0;
  return matchedProjects.slice(offset, offset + limit);
}

/**
 * Get recommended candidate users for a project owner sorted by matchScore descending
 */
export async function getRecommendedCandidates(projectId, options = {}) {
  const project = await getProjectMatchData(projectId);
  if (!project) return [];

  // Find candidate users who:
  // - Are not the project owner
  // - Are not already members of this project
  // - Are not organizers
  const res = await query(
    `SELECT u.id
     FROM users u
     WHERE u.id != $1
       AND u.user_type != 'organizer'
       AND u.id NOT IN (SELECT user_id FROM project_members WHERE project_id = $2)
     ORDER BY u.created_at DESC`,
    [project.owner_id, projectId]
  );

  const candidateIds = res.rows.map(r => r.id);
  const candidates = [];

  for (const cid of candidateIds) {
    const candidate = await getUserMatchProfile(cid);
    if (!candidate) continue;

    // Check if there is already a pending join request or invitation
    const reqRes = await query(
      `SELECT id, status FROM join_requests WHERE project_id = $1 AND user_id = $2`,
      [projectId, cid]
    );
    const invRes = await query(
      `SELECT id, status FROM invitations WHERE project_id = $1 AND invitee_id = $2`,
      [projectId, cid]
    );

    const match = calculateMatch(candidate, project);
    candidates.push({
      ...candidate,
      hasPendingRequest: reqRes.rows.some(r => r.status === 'pending'),
      hasPendingInvitation: invRes.rows.some(r => r.status === 'pending'),
      existingInvitation: invRes.rows[0] || null,
      existingRequest: reqRes.rows[0] || null,
      match
    });
  }

  // Sort descending by matchScore
  candidates.sort((a, b) => b.match.matchScore - a.match.matchScore);

  const limit = options.limit || 20;
  const offset = options.offset || 0;
  return candidates.slice(offset, offset + limit);
}

export default {
  calculateMatch,
  getUserMatchProfile,
  getProjectMatchData,
  getRecommendedProjects,
  getRecommendedCandidates
};

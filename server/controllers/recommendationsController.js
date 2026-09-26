import {
  getRecommendedProjects,
  getRecommendedCandidates
} from '../services/matchService.js';
import { query } from '../db/index.js';

export async function recommendProjects(req, res) {
  try {
    const userId = req.user.id;
    const { domain, event, limit = 20, offset = 0 } = req.query;

    const projects = await getRecommendedProjects(userId, {
      domain,
      event,
      limit: Number(limit),
      offset: Number(offset)
    });

    return res.json({
      success: true,
      data: {
        projects,
        total: projects.length
      }
    });
  } catch (err) {
    console.error('recommendProjects error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve project recommendations' }
    });
  }
}

export async function recommendCandidates(req, res) {
  try {
    const { id: projectId } = req.params;
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    // Check if project exists and user is owner
    const projCheck = await query('SELECT owner_id FROM projects WHERE id = $1', [projectId]);
    if (projCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    if (projCheck.rows[0].owner_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only project owners can view candidate recommendations' }
      });
    }

    const candidates = await getRecommendedCandidates(projectId, {
      limit: Number(limit),
      offset: Number(offset)
    });

    return res.json({
      success: true,
      data: {
        candidates,
        total: candidates.length
      }
    });
  } catch (err) {
    console.error('recommendCandidates error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve candidate recommendations' }
    });
  }
}

export default {
  recommendProjects,
  recommendCandidates
};

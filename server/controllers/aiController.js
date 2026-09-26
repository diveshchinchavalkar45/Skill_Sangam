import {
  extractProjectRequirements,
  normalizeSkills,
  generateProjectDescription,
  analyzeTeamGaps
} from '../services/geminiService.js';
import { getProjectMatchData } from '../services/matchService.js';

export async function handleExtractRequirements(req, res) {
  try {
    const { description } = req.body;
    const result = await extractProjectRequirements(description);
    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('handleExtractRequirements error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'AI_ERROR', message: 'Failed to extract requirements' }
    });
  }
}

export async function handleNormalizeSkills(req, res) {
  try {
    const { skills } = req.body;
    const result = await normalizeSkills(skills);
    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('handleNormalizeSkills error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'AI_ERROR', message: 'Failed to normalize skills' }
    });
  }
}

export async function handleGenerateDescription(req, res) {
  try {
    const { title, domain, keywords } = req.body;
    const result = await generateProjectDescription({ title, domain, keywords });
    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('handleGenerateDescription error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'AI_ERROR', message: 'Failed to generate project description' }
    });
  }
}

export async function handleAnalyzeGaps(req, res) {
  try {
    const { projectId } = req.body;
    const project = await getProjectMatchData(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    const result = await analyzeTeamGaps({
      project,
      teamMembers: project.members || [],
      requiredRoles: project.required_roles || [],
      requiredSkills: project.required_skills || []
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('handleAnalyzeGaps error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'AI_ERROR', message: 'Failed to analyze team gaps' }
    });
  }
}

export default {
  handleExtractRequirements,
  handleNormalizeSkills,
  handleGenerateDescription,
  handleAnalyzeGaps
};

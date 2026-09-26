import { Router } from 'express';
import {
  handleExtractRequirements,
  handleNormalizeSkills,
  handleGenerateDescription,
  handleAnalyzeGaps
} from '../controllers/aiController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  aiExtractSchema,
  aiNormalizeSchema,
  aiDescriptionSchema,
  aiTeamGapSchema
} from '../validators/schemas.js';
import { aiLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/extract-requirements', requireAuth, aiLimiter, validate(aiExtractSchema), handleExtractRequirements);
router.post('/normalize-skills', requireAuth, aiLimiter, validate(aiNormalizeSchema), handleNormalizeSkills);
router.post('/generate-description', requireAuth, aiLimiter, validate(aiDescriptionSchema), handleGenerateDescription);
router.post('/analyze-gaps', requireAuth, aiLimiter, validate(aiTeamGapSchema), handleAnalyzeGaps);

export default router;

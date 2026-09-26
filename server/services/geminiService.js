import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const SYSTEM_INSTRUCTION = `You are SkillSangam AI, an assistant designed to help students and professionals form effective project teams.

Your responsibilities are:
1. Understand project requirements.
2. Identify useful skills and roles.
3. Normalize inconsistent skill names.
4. Suggest suitable project roles.
5. Explain team composition gaps.
6. Generate concise project descriptions when requested.
7. Provide structured recommendations.

You must never invent user qualifications.
You must never claim that a person possesses a skill unless that skill exists in the provided data.
You must never override deterministic database facts.
You must return valid JSON whenever JSON output is requested.
Keep responses concise, practical, and suitable for students, hackathons, academic projects, and early-stage startups.
Do not make discriminatory recommendations based on protected characteristics.
Do not use gender, religion, caste, race, disability, political beliefs, or other sensitive personal attributes for team matching.
Focus only on legitimate project-related factors such as skills, roles, interests, availability, and experience.`;

let genAI = null;
const apiKey = process.env.GEMINI_API_KEY?.trim();

if (apiKey) {
  try {
    genAI = new GoogleGenAI({ apiKey });
    console.log('Gemini AI client initialized successfully.');
  } catch (err) {
    console.warn('Failed to initialize Gemini AI client:', err.message);
  }
} else {
  console.log('GEMINI_API_KEY not set in environment. Intelligent heuristic fallback active.');
}

/**
 * 15.1 Project Requirement Extraction
 */
export async function extractProjectRequirements(description) {
  if (genAI && apiKey) {
    try {
      const prompt = `Analyze this project description and extract the most appropriate domain, required technical/soft skills, and suggested project roles.
Return valid JSON matching this schema:
{
  "suggestedDomain": "string (e.g. AgriTech, FinTech, HealthTech, AI/ML, EdTech, Smart City, SaaS, Web3)",
  "requiredSkills": ["string", "string"],
  "suggestedRoles": ["string", "string"],
  "summary": "1-2 sentence concise summary"
}

Project Description:
"${description}"`;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text.trim());
      if (parsed.suggestedDomain && Array.isArray(parsed.requiredSkills)) {
        return parsed;
      }
    } catch (err) {
      console.warn('Gemini extraction failed, using heuristic fallback:', err.message);
    }
  }

  // Fallback Heuristics
  const text = (description || '').toLowerCase();
  let suggestedDomain = 'AI/ML';
  if (text.includes('farm') || text.includes('crop') || text.includes('agri')) suggestedDomain = 'AgriTech';
  else if (text.includes('money') || text.includes('bank') || text.includes('pay') || text.includes('fin')) suggestedDomain = 'FinTech';
  else if (text.includes('health') || text.includes('patient') || text.includes('clinic') || text.includes('doctor')) suggestedDomain = 'HealthTech';
  else if (text.includes('school') || text.includes('student') || text.includes('tutor') || text.includes('learn')) suggestedDomain = 'EdTech';
  else if (text.includes('traffic') || text.includes('bus') || text.includes('city') || text.includes('transit')) suggestedDomain = 'Smart City';
  else if (text.includes('carbon') || text.includes('climate') || text.includes('energy') || text.includes('green')) suggestedDomain = 'ClimateTech';
  else if (text.includes('security') || text.includes('vulnerability') || text.includes('crypto')) suggestedDomain = 'Cybersecurity';
  else if (text.includes('shop') || text.includes('cart') || text.includes('market') || text.includes('ecommerce')) suggestedDomain = 'E-Commerce';

  const requiredSkills = [];
  if (text.includes('python') || text.includes('ai') || text.includes('ml') || text.includes('model')) requiredSkills.push('Python', 'Machine Learning');
  if (text.includes('react') || text.includes('ui') || text.includes('frontend') || text.includes('web')) requiredSkills.push('React', 'Tailwind CSS');
  if (text.includes('node') || text.includes('backend') || text.includes('api') || text.includes('server')) requiredSkills.push('Node.js', 'PostgreSQL');
  if (text.includes('hardware') || text.includes('sensor') || text.includes('iot') || text.includes('arduino')) requiredSkills.push('IoT', 'Arduino');
  if (text.includes('figma') || text.includes('design') || text.includes('ux')) requiredSkills.push('UI/UX Design', 'Figma');
  if (text.includes('flutter') || text.includes('mobile') || text.includes('android')) requiredSkills.push('Flutter');

  if (requiredSkills.length === 0) {
    requiredSkills.push('React', 'Node.js', 'Python');
  }

  const suggestedRoles = [];
  if (requiredSkills.includes('React') || requiredSkills.includes('UI/UX Design')) suggestedRoles.push('Frontend Developer');
  if (requiredSkills.includes('Node.js') || requiredSkills.includes('PostgreSQL')) suggestedRoles.push('Backend Developer');
  if (requiredSkills.includes('Python') || requiredSkills.includes('Machine Learning')) suggestedRoles.push('AI/ML Developer');
  if (requiredSkills.includes('IoT') || requiredSkills.includes('Arduino')) suggestedRoles.push('IoT Engineer');
  if (suggestedRoles.length === 0) suggestedRoles.push('Full Stack Developer', 'Product Manager');

  return {
    suggestedDomain,
    requiredSkills: [...new Set(requiredSkills)].slice(0, 5),
    suggestedRoles: [...new Set(suggestedRoles)].slice(0, 3),
    summary: description.slice(0, 150) + (description.length > 150 ? '...' : '')
  };
}

/**
 * 15.2 Skill Normalization
 */
export async function normalizeSkills(skillNames) {
  if (genAI && apiKey && Array.isArray(skillNames) && skillNames.length > 0) {
    try {
      const prompt = `Normalize the following array of raw skill strings into their standard canonical names.
Raw skills: ${JSON.stringify(skillNames)}

Return valid JSON with schema:
{
  "normalizedSkills": [
    { "input": "ReactJS", "canonical": "React" },
    { "input": "ML", "canonical": "Machine Learning" }
  ]
}`;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text.trim());
      if (Array.isArray(parsed.normalizedSkills)) {
        return parsed;
      }
    } catch (err) {
      console.warn('Gemini skill normalization failed, using fallback:', err.message);
    }
  }

  // Canonical mapping dictionary
  const canonicalMap = {
    'reactjs': 'React',
    'react.js': 'React',
    'react': 'React',
    'ml': 'Machine Learning',
    'machinelearning': 'Machine Learning',
    'machine learning': 'Machine Learning',
    'dl': 'Deep Learning',
    'deeplearning': 'Deep Learning',
    'deep learning': 'Deep Learning',
    'py': 'Python',
    'python3': 'Python',
    'nodejs': 'Node.js',
    'node.js': 'Node.js',
    'node': 'Node.js',
    'postgres': 'PostgreSQL',
    'psql': 'PostgreSQL',
    'postgresql': 'PostgreSQL',
    'mongo': 'MongoDB',
    'mongodb': 'MongoDB',
    'js': 'JavaScript',
    'javascript': 'JavaScript',
    'ts': 'TypeScript',
    'typescript': 'TypeScript',
    'tailwind': 'Tailwind CSS',
    'tailwindcss': 'Tailwind CSS',
    'ui/ux': 'UI/UX Design',
    'ui': 'UI/UX Design',
    'ux': 'UI/UX Design',
    'figma': 'Figma'
  };

  const normalized = (skillNames || []).map(input => {
    const clean = input.trim().toLowerCase();
    const canonical = canonicalMap[clean] || (input.charAt(0).toUpperCase() + input.slice(1).trim());
    return { input, canonical };
  });

  return { normalizedSkills: normalized };
}

/**
 * 15.3 Project Description Generator
 */
export async function generateProjectDescription({ title, domain, keywords }) {
  if (genAI && apiKey) {
    try {
      const prompt = `Write a compelling, professional project short description and detailed overview for a student/hackathon team.
Title: "${title}"
Domain: "${domain || 'Technology'}"
Key aspects/keywords: "${keywords || 'collaborative, innovative, scalable'}"

Return valid JSON with schema:
{
  "shortDescription": "1-2 sentence elevator pitch suitable for cards",
  "description": "2-3 paragraphs describing problem statement, proposed technical architecture, and impact",
  "suggestedRoles": ["role1", "role2", "role3"],
  "suggestedSkills": ["skill1", "skill2", "skill3", "skill4"]
}`;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text.trim());
      if (parsed.shortDescription && parsed.description) {
        return parsed;
      }
    } catch (err) {
      console.warn('Gemini description generation failed, using fallback:', err.message);
    }
  }

  // Heuristic Fallback
  const shortDescription = `${title} is an innovative ${domain || 'technology'} solution designed to solve critical real-world challenges through accessible, modern technology.`;
  const description = `${title} addresses systemic inefficiencies in the ${domain || 'technology'} domain. The platform leverages modern web and cloud architecture to deliver high-reliability, low-latency collaboration and automated intelligence.\n\nThe project focuses on delivering immediate tangible value to end users through clean user experience, robust backend data pipelines, and intelligent automation. Built for rapid deployment in hackathons and academic showcases.`;

  return {
    shortDescription,
    description,
    suggestedRoles: ['Full Stack Developer', 'UI/UX Designer', 'Product Manager'],
    suggestedSkills: ['React', 'Node.js', 'PostgreSQL', 'UI/UX Design']
  };
}

/**
 * 15.4 Team Gap Analysis
 */
export async function analyzeTeamGaps({ project, teamMembers, requiredRoles, requiredSkills }) {
  if (genAI && apiKey) {
    try {
      const prompt = `Analyze this hackathon project's current team against its required roles and skills.
Project: "${project.title}" (${project.domain_name})
Required Roles: ${JSON.stringify(requiredRoles)}
Required Skills: ${JSON.stringify(requiredSkills)}
Current Team Members: ${JSON.stringify(teamMembers.map(m => ({ name: m.name, role: m.role_in_project })))}

Return valid JSON with schema:
{
  "filledRoles": ["string"],
  "missingRoles": ["string"],
  "teamBalanceSummary": "2-3 sentences assessing team interdisciplinarity and readiness",
  "recommendations": ["actionable advice 1", "actionable advice 2"]
}`;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text.trim());
      if (Array.isArray(parsed.missingRoles)) {
        return parsed;
      }
    } catch (err) {
      console.warn('Gemini team gap analysis failed, using fallback:', err.message);
    }
  }

  // Deterministic Analysis Fallback
  const filledRoles = [];
  const assignedLower = teamMembers.map(m => (m.role_in_project || '').toLowerCase());

  const missingRoles = [];
  for (const r of requiredRoles) {
    const rName = typeof r === 'string' ? r : r.name;
    const isFilled = assignedLower.some(a => a.includes(rName.toLowerCase()) || rName.toLowerCase().includes(a));
    if (isFilled) {
      filledRoles.push(rName);
    } else {
      missingRoles.push(rName);
    }
  }

  const recommendations = [];
  if (missingRoles.length > 0) {
    recommendations.push(`Recruit a ${missingRoles[0]} to cover critical technical deliverables.`);
    if (missingRoles.length > 1) {
      recommendations.push(`Find candidates specializing in ${missingRoles.slice(1).join(', ')}.`);
    }
  } else {
    recommendations.push('Core required roles are filled! Focus on sprint milestones and user testing.');
  }

  const teamBalanceSummary = missingRoles.length === 0
    ? `The team has successfully covered all ${requiredRoles.length} required roles with strong interdisciplinary alignment.`
    : `The team has filled ${filledRoles.length}/${requiredRoles.length} target roles. Prioritize onboarding ${missingRoles.join(', ')} before the hackathon kickoff.`;

  return {
    filledRoles,
    missingRoles,
    teamBalanceSummary,
    recommendations
  };
}

export default {
  extractProjectRequirements,
  normalizeSkills,
  generateProjectDescription,
  analyzeTeamGaps
};

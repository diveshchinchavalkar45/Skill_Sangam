import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  userType: z.enum(['student', 'professional', 'organizer']).default('student'),
  instituteOrCompany: z.string().max(150).optional(),
  yearOrExperience: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  country: z.string().max(100).default('India'),
  bio: z.string().max(1000).optional(),
  teamPreference: z.enum(['looking_for_team', 'have_project', 'open_to_both']).default('open_to_both')
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  profileImageUrl: z.string().url().or(z.literal('')).optional(),
  userType: z.enum(['student', 'professional', 'organizer']).optional(),
  instituteOrCompany: z.string().max(150).optional(),
  yearOrExperience: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
  teamPreference: z.enum(['looking_for_team', 'have_project', 'open_to_both']).optional(),
  skills: z.array(z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1),
    proficiency: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate')
  })).optional(),
  domains: z.array(z.string().uuid().or(z.string())).optional(),
  preferredRoles: z.array(z.string().uuid().or(z.string())).optional()
});

export const availabilitySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'),
  hoursPerWeek: z.coerce.number().int().min(1, 'Hours per week must be at least 1').max(100),
  timezone: z.string().default('Asia/Kolkata')
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be on or after start date',
  path: ['endDate']
});

const baseProjectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  shortDescription: z.string().max(300).optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  domainId: z.string().uuid('Please select a valid domain'),
  eventName: z.string().max(150).optional(),
  location: z.string().max(100).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'),
  hoursPerWeek: z.coerce.number().int().min(1).max(100).optional(),
  maxTeamSize: z.coerce.number().int().min(2, 'Team size must be at least 2').max(10, 'Team size cannot exceed 10'),
  requiredSkills: z.array(z.string().uuid().or(z.string())).min(1, 'At least one required skill must be specified'),
  requiredRoles: z.array(z.string().uuid().or(z.string())).min(1, 'At least one required role must be specified')
});

export const projectCreateSchema = baseProjectSchema.refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be on or after start date',
  path: ['endDate']
});

export const projectUpdateSchema = baseProjectSchema.partial().extend({
  status: z.enum(['open', 'full', 'closed']).optional()
});

export const joinRequestSchema = z.object({
  message: z.string().max(500).optional()
});

export const joinRequestUpdateSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'cancelled']),
  roleInProject: z.string().max(100).optional()
});

export const invitationSchema = z.object({
  inviteeId: z.string().uuid('Invalid invitee ID'),
  roleId: z.string().uuid('Invalid role ID').optional(),
  message: z.string().max(500).optional()
});

export const invitationUpdateSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'cancelled'])
});

export const messageSchema = z.object({
  receiverId: z.string().uuid('Invalid receiver ID').optional(),
  message: z.string().min(1, 'Message cannot be empty').max(2000)
});

export const teamRoleUpdateSchema = z.object({
  roleInProject: z.string().min(2).max(100)
});

export const aiExtractSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters')
});

export const aiNormalizeSchema = z.object({
  skills: z.array(z.string()).min(1)
});

export const aiDescriptionSchema = z.object({
  title: z.string().min(2),
  domain: z.string().optional(),
  keywords: z.string().optional()
});

export const aiTeamGapSchema = z.object({
  projectId: z.string().uuid()
});

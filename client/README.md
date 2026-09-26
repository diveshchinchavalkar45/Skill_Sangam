# SkillSangam — Frontend Client

The web client for **SkillSangam**, an AI-powered skill-based team formation platform. Built with React 19, Vite, Tailwind CSS, Lucide Icons, and React Router.

## Features

- **Modern Responsive UI**: Built with Tailwind CSS and Plus Jakarta Sans typography.
- **Explainable Match Scoring**: Interactive SVG radial gauge and transparent 4-pillar score breakdown (Skills, Domain, Availability, Role).
- **AI-Assisted Project Creation**: Auto-extracts required skills, domains, and roles from natural language descriptions via Gemini AI.
- **AI Elevator Pitch Generator**: Generates targeted team recruitment pitches based on project requirements.
- **Team Gap Analyzer**: Real-time evaluation of missing technical roles and skill blind spots with actionable next steps.
- **Candidate Recommendations**: Filter by match score, domain, and experience; invite qualified candidates with custom notes.
- **Requests & Invitations Management**: Review inbound join requests and outgoing team invitations.
- **Real-Time Team Workspace**: Live chat, member directory, team roles, and contact details.
- **Organizer Dashboard**: Platform analytics, user directory, project oversight, and moderation.

## Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6 (`react-router-dom`)
- **Icons**: Lucide React
- **API Client**: Fetch API with JWT Bearer Token interception and custom event bus

## Getting Started

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```
The output will be generated in `client/dist/`.

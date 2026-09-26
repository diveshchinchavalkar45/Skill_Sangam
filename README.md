# SkillSangam — AI-Powered Skill-Based Team Formation Platform

> **"Find the right teammates. Build better projects."**

SkillSangam is an AI-powered, skill-based team formation platform designed for students, developers, researchers, and hackathon participants. It bridges the gap between ambitious project ideas and skilled builders by calculating transparent, multi-factor compatibility scores and facilitating balanced interdisciplinary team formation for hackathons, academic capstones, and startups.

---

## 🌟 Key Capabilities

1. **Deterministic Smart Matching Engine**:
   - **Skills Compatibility (60%)**: Exact overlap between project requirements and candidate skill proficiencies.
   - **Domain Compatibility (20%)**: Mutual interest in AgriTech, FinTech, HealthTech, Smart Cities, AI/ML, etc.
   - **Availability Compatibility (10%)**: Calendar date overlap and weekly hourly commitments.
   - **Role Compatibility (10%)**: Matching preferred roles (Frontend, Backend, AI/ML, UI/UX, Hardware) with unfilled project vacancies.
   - **Transparent Explainability**: Every match card provides a detailed breakdown and human-readable "Why this matches" reasons.

2. **Full-Cycle Team Formation**:
   - **Candidate Recommendations**: Project owners view ranked candidates sorted by match score with one-click role invitations.
   - **Project Discovery**: Filter by domain, event, required skill, location, or sort by match score.
   - **Join Requests & Invitations**: Complete workflow with accept, decline, and automated team membership.
   - **Vacancy & Gap Tracking**: Visual status of required roles (`FILLED` vs `OPEN`) to prevent mono-disciplinary teams.

3. **Server-Side Gemini AI Integration**:
   - **Requirement Extraction**: Automatically extracts suggested domains, technical skills, and roles from project ideas.
   - **Project Pitch Assistant**: Drafts crisp elevator pitches and multi-paragraph overviews.
   - **Skill Normalization**: Canonicalizes non-standard skill variations (e.g. `ReactJS` → `React`).
   - **Team Balance Review**: Analyzes current team roster against target roles and provides advisory next steps.
   - *Safe Fallbacks*: Fully functional deterministic heuristics ensure 100% uptime even if AI API keys are unconfigured.

4. **Organizer Command Center**:
   - Real-time hackathon metrics, event participant lists, skill distribution charts, and team formation progress.

5. **Zero-Friction Local Database & Cloud Ready**:
   - Runs out-of-the-box locally with zero database setup using an embedded persistent PostgreSQL engine (PGlite).
   - Seamlessly switches to production PostgreSQL (Neon, Replit Postgres, Supabase, Render, AWS RDS) by simply setting `DATABASE_URL`.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v7, Lucide Icons, Canvas Confetti
- **Backend**: Node.js, Express.js (RESTful APIs), Zod validation, JWT authentication, Helmet, CORS, Rate Limiting
- **Database**: PostgreSQL with parameterized queries (compatible with Replit Postgres, Neon, Supabase, and local persistent PGlite)
- **AI**: `@google/genai` (Google Gemini SDK) server-side only

---

## 🚀 Quick Start (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/diveshchinchavalkar45/Skill_Sangam.git
cd Skill_Sangam
```

### 2. Install dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm --prefix client install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (or copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SESSION_SECRET=skillsangam_super_secure_jwt_secret_dev_2026_key

# Optional: Production PostgreSQL connection string (defaults to persistent local Postgres if left empty)
DATABASE_URL=

# Optional: Gemini API Key for AI features (graceful heuristic fallbacks active if omitted)
GEMINI_API_KEY=
```

### 4. Seed the Database
Populate realistic Indian hackathon demo data (15+ users, 40+ skills, 16 domains, 10+ projects):
```bash
npm run seed
```

### 5. Launch Development Servers
Run both backend API and Vite client concurrently:
```bash
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **API Health**: `http://localhost:5000/api/health`

---

## 🔑 Demo Evaluator Accounts

All demo accounts use the password: `password123`

| Role | Email | Name | Context |
| :--- | :--- | :--- | :--- |
| **Student** | `student@skillsangam.com` | Aarav Sharma | IIT Delhi • ML/Python specialist looking for a team |
| **Founder** | `founder@skillsangam.com` | Priya Patel | BITS Pilani • Founder of AI Crop Advisory project |
| **Organizer** | `organizer@skillsangam.com` | Dr. Rajesh Nair | SIH Innovation Dean • Accesses Organizer Hub |

> **Pro Tip**: The Login page includes one-click demo login buttons to instantly switch between student, founder, and organizer personas during presentations!

---

## 📐 Matching Formula Architecture

$$\text{FinalScore} = \text{round}\left( (\text{SkillScore} \times 0.60) + (\text{DomainScore} \times 0.20) + (\text{AvailabilityScore} \times 0.10) + (\text{RoleScore} \times 0.10) \right) \times 100$$

- **Skill Compatibility ($60\%$)**: $\frac{|\text{UserSkills} \cap \text{ProjectRequiredSkills}|}{|\text{ProjectRequiredSkills}|}$
- **Domain Compatibility ($20\%$)**: $1.0$ if Project Domain $\in$ User Selected Domains, else $0.0$.
- **Availability Compatibility ($10\%$)**: Ratio of calendar overlap between candidate availability and project timeline + hours/week match.
- **Role Compatibility ($10\%$)**: Ratio of candidate's preferred roles matching unfilled project vacancies.

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Create new student, professional, or organizer account
- `POST /api/auth/login` — Authenticate and receive JWT token
- `POST /api/auth/logout` — Invalidate session
- `GET /api/auth/me` — Get current authenticated user

### Profiles & Availability
- `GET /api/profile/me` — Full profile with completion % and match preferences
- `PUT /api/profile/me` — Update skills with proficiency, domains, and preferred roles
- `GET /api/users/:id` — Public candidate profile and projects
- `GET /api/availability/me` — Get sprint availability
- `PUT /api/availability/me` — Update start date, end date, hours/week, timezone

### Projects & Team Formation
- `GET /api/projects` — Filterable project discovery (search, domain, skill, event, sort by match)
- `POST /api/projects` — Create project with required roles and skills
- `GET /api/projects/:id` — Detailed project requirements and roster
- `PUT /api/projects/:id` — Update project details
- `DELETE /api/projects/:id` — Delete project (owner only)
- `GET /api/projects/:id/team` — View members and filled vs open role breakdown
- `PUT /api/projects/:id/team/:userId` — Assign specific role to team member
- `DELETE /api/projects/:id/team/:userId` — Remove team member

### Smart Matching & Recommendations
- `GET /api/recommendations/projects` — Projects ranked by match score for current user
- `GET /api/projects/:id/recommended-candidates` — Candidates ranked by match score for project owner

### Join Requests & Invitations
- `POST /api/projects/:id/join-request` — Submit application to project
- `GET /api/requests/my` — Get user's outgoing join requests
- `GET /api/projects/:id/requests` — Get applicant requests for a project (owner only)
- `PUT /api/requests/:id` — Accept / decline join request (auto-adds member)
- `POST /api/projects/:id/invitations` — Invite candidate to project
- `GET /api/invitations` — Get received invitations
- `PUT /api/invitations/:id` — Accept / decline invitation (auto-adds member)

### Real-Time Team Collaboration & Chat
- `GET /api/messages/:projectId` — Project team message history
- `POST /api/messages/:projectId` — Send project message

### AI Assistance (Server-Side Gemini)
- `POST /api/ai/extract-requirements` — Auto-extract domain, skills, and roles from text
- `POST /api/ai/normalize-skills` — Canonicalize raw skill names
- `POST /api/ai/generate-description` — Generate pitch description from title
- `POST /api/ai/analyze-gaps` — Team balance review and vacancy recommendations

### Organizer Dashboard
- `GET /api/organizer/dashboard` — Event statistics, skill distributions, and domain counts
- `GET /api/organizer/events` — List of hackathons and competitions
- `GET /api/organizer/events/:eventId/users` — Event participants roster
- `GET /api/organizer/events/:eventId/projects` — Event project submissions

---

## 🚢 Deployment

### 1. Full-Stack Single Service (Render / Railway / Replit)
1. Build client bundle:
   ```bash
   npm run build
   ```
2. Set environment variables on your host (`DATABASE_URL`, `SESSION_SECRET`, `PORT=5000`).
3. Start the application:
   ```bash
   npm start
   ```
   Express automatically serves both the backend REST APIs at `/api/*` and the compiled Vite SPA at `/*`.

### 2. Split Deployment (Vercel Frontend + Render Backend)
- **Frontend (Vercel)**:
  - Root directory: `client`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Set `VITE_API_URL` if customizing backend URL.
- **Backend (Render / Railway)**:
  - Build command: `npm install`
  - Start command: `node server/server.js`

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

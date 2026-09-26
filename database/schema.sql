-- SKILLSANGAM PRODUCTION POSTGRESQL SCHEMA

-- 1. users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    name TEXT NOT NULL,
    profile_image_url TEXT,
    user_type TEXT NOT NULL DEFAULT 'student'
        CHECK (user_type IN ('student', 'professional', 'organizer')),
    institute_or_company TEXT,
    year_or_experience TEXT,
    education_level TEXT DEFAULT 'college'
        CHECK (education_level IN ('school', 'college', 'university', 'not_applicable')),
    location TEXT,
    country TEXT DEFAULT 'India',
    bio TEXT,
    team_preference TEXT DEFAULT 'open_to_both'
        CHECK (
            team_preference IN (
                'looking_for_team',
                'have_project',
                'open_to_both'
            )
        ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. skills
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. user_skills
CREATE TABLE IF NOT EXISTS user_skills (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency TEXT DEFAULT 'intermediate'
        CHECK (
            proficiency IN (
                'beginner',
                'intermediate',
                'advanced'
            )
        ),
    PRIMARY KEY (user_id, skill_id)
);

-- 4. domains
CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. user_domains
CREATE TABLE IF NOT EXISTS user_domains (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, domain_id)
);

-- 6. user_roles
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL
);

-- 7. user_preferred_roles
CREATE TABLE IF NOT EXISTS user_preferred_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 8. availability
CREATE TABLE IF NOT EXISTS availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    hours_per_week INTEGER NOT NULL CHECK (hours_per_week > 0),
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    CHECK (end_date >= start_date)
);

-- 9. projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    short_description TEXT,
    description TEXT NOT NULL,
    domain_id UUID NOT NULL REFERENCES domains(id),
    event_name TEXT,
    location TEXT,
    owner_id UUID NOT NULL REFERENCES users(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    hours_per_week INTEGER,
    max_team_size INTEGER NOT NULL CHECK (max_team_size > 0),
    status TEXT NOT NULL DEFAULT 'open'
        CHECK (
            status IN (
                'open',
                'full',
                'closed'
            )
        ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_date >= start_date)
);

-- 10. project_required_skills
CREATE TABLE IF NOT EXISTS project_required_skills (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id),
    count_needed INTEGER NOT NULL DEFAULT 1
        CHECK (count_needed > 0),
    PRIMARY KEY (project_id, skill_id)
);

-- 11. project_required_roles
CREATE TABLE IF NOT EXISTS project_required_roles (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES user_roles(id),
    count_needed INTEGER NOT NULL DEFAULT 1
        CHECK (count_needed > 0),
    PRIMARY KEY (project_id, role_id)
);

-- 12. project_members
CREATE TABLE IF NOT EXISTS project_members (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_in_project TEXT,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (project_id, user_id)
);

-- 13. join_requests
CREATE TABLE IF NOT EXISTS join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'accepted',
                'rejected',
                'cancelled'
            )
        ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- 14. invitations
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES users(id),
    invitee_id UUID NOT NULL REFERENCES users(id),
    role_id UUID REFERENCES user_roles(id),
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'accepted',
                'rejected',
                'cancelled'
            )
        ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, invitee_id)
);

-- 15. messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. events
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    organizer_id UUID NOT NULL REFERENCES users(id),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. event_participants
CREATE TABLE IF NOT EXISTS event_participants (
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY(event_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_domain_id ON projects(domain_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_event_name ON projects(event_name);
CREATE INDEX IF NOT EXISTS idx_req_skills_skill ON project_required_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_req_roles_role ON project_required_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_join_req_project ON join_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_join_req_user ON join_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_join_req_status ON join_requests(status);
CREATE INDEX IF NOT EXISTS idx_invitations_invitee ON invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_messages_project ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

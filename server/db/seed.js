import { query, initDb } from './index.js';
import dotenv from 'dotenv';

dotenv.config();

const PASSWORD_HASH = '$2b$10$PM8wHNZHH2hiikFLNKkYi.6Cm9.oPEIFwvPtaemMzvEtcWbbAWtjm'; // 'password123'

export async function seed() {
  await initDb();
  console.log('Seeding initial data into SkillSangam database...');

  // 1. SKILLS
  const skillsData = [
    // Programming & Languages
    { name: 'Python', category: 'Programming' },
    { name: 'JavaScript', category: 'Programming' },
    { name: 'TypeScript', category: 'Programming' },
    { name: 'C++', category: 'Programming' },
    { name: 'Java', category: 'Programming' },
    { name: 'Go', category: 'Programming' },
    // Frontend
    { name: 'React', category: 'Frontend' },
    { name: 'Next.js', category: 'Frontend' },
    { name: 'Tailwind CSS', category: 'Frontend' },
    { name: 'Vue.js', category: 'Frontend' },
    // Backend
    { name: 'Node.js', category: 'Backend' },
    { name: 'Express.js', category: 'Backend' },
    { name: 'PostgreSQL', category: 'Backend' },
    { name: 'MongoDB', category: 'Backend' },
    { name: 'FastAPI', category: 'Backend' },
    // AI/ML & Data
    { name: 'Machine Learning', category: 'AI/ML' },
    { name: 'Deep Learning', category: 'AI/ML' },
    { name: 'NLP', category: 'AI/ML' },
    { name: 'Computer Vision', category: 'AI/ML' },
    { name: 'PyTorch', category: 'AI/ML' },
    { name: 'Data Science', category: 'Data Science' },
    // Mobile
    { name: 'Flutter', category: 'Mobile' },
    { name: 'React Native', category: 'Mobile' },
    // UI/UX & Design
    { name: 'Figma', category: 'UI/UX' },
    { name: 'UI/UX Design', category: 'UI/UX' },
    { name: 'Design Systems', category: 'Design' },
    // Hardware & IoT
    { name: 'Arduino', category: 'Hardware' },
    { name: 'Embedded C', category: 'Hardware' },
    { name: 'IoT', category: 'IoT' },
    { name: 'Raspberry Pi', category: 'Hardware' },
    // Cloud & Security
    { name: 'Docker', category: 'DevOps' },
    { name: 'DevOps', category: 'DevOps' },
    { name: 'Cybersecurity', category: 'Cybersecurity' },
    // Business & Soft skills
    { name: 'Product Management', category: 'Management' },
    { name: 'Marketing', category: 'Marketing' },
    { name: 'Business Development', category: 'Business' },
    { name: 'Content Writing', category: 'Content' },
    { name: 'Video Editing', category: 'Video' },
    { name: 'Research', category: 'Research' },
    { name: 'Public Speaking', category: 'Presentation' },
    { name: 'Pitch & Presentation', category: 'Presentation' }
  ];

  for (const s of skillsData) {
    await query(
      `INSERT INTO skills (name, category)
       VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET category = EXCLUDED.category`,
      [s.name, s.category]
    );
  }
  console.log(`✓ Seeded ${skillsData.length} skills`);

  // 2. DOMAINS
  const domainsData = [
    'EdTech', 'AgriTech', 'HealthTech', 'FinTech',
    'Smart City', 'ClimateTech', 'AI/ML', 'Cybersecurity',
    'IoT', 'SaaS', 'Social Impact', 'E-Commerce',
    'Mobility', 'Gaming', 'Developer Tools', 'Web3'
  ];

  for (const d of domainsData) {
    await query(
      `INSERT INTO domains (name)
       VALUES ($1)
       ON CONFLICT (name) DO NOTHING`,
      [d]
    );
  }
  console.log(`✓ Seeded ${domainsData.length} domains`);

  // 3. USER ROLES
  const rolesData = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'AI/ML Developer',
    'Data Scientist',
    'UI/UX Designer',
    'Mobile Developer',
    'Hardware Engineer',
    'IoT Engineer',
    'Product Manager',
    'Business/Marketing',
    'Content Creator',
    'Pitch/Presentation Lead',
    'Researcher'
  ];

  for (const r of rolesData) {
    await query(
      `INSERT INTO user_roles (name)
       VALUES ($1)
       ON CONFLICT (name) DO NOTHING`,
      [r]
    );
  }
  console.log(`✓ Seeded ${rolesData.length} user roles`);

  // Lookup maps for easy foreign key linking
  const skillRes = await query('SELECT id, name FROM skills');
  const skillMap = Object.fromEntries(skillRes.rows.map(r => [r.name, r.id]));

  const domainRes = await query('SELECT id, name FROM domains');
  const domainMap = Object.fromEntries(domainRes.rows.map(r => [r.name, r.id]));

  const roleRes = await query('SELECT id, name FROM user_roles');
  const roleMap = Object.fromEntries(roleRes.rows.map(r => [r.name, r.id]));

  // 4. USERS (At least 16 realistic profiles)
  const usersData = [
    {
      email: 'student@skillsangam.com',
      name: 'Aarav Sharma',
      user_type: 'student',
      institute_or_company: 'IIT Delhi',
      year_or_experience: '3rd Year B.Tech CSE',
      location: 'New Delhi',
      country: 'India',
      bio: 'Deeply passionate about Applied Machine Learning and computer vision. Looking for a high-energy hackathon team building in AgriTech or HealthTech.',
      team_preference: 'looking_for_team',
      skills: [
        { name: 'Python', proficiency: 'advanced' },
        { name: 'Machine Learning', proficiency: 'advanced' },
        { name: 'PyTorch', proficiency: 'intermediate' },
        { name: 'Computer Vision', proficiency: 'intermediate' },
        { name: 'FastAPI', proficiency: 'intermediate' }
      ],
      domains: ['AgriTech', 'HealthTech', 'AI/ML'],
      roles: ['AI/ML Developer', 'Data Scientist'],
      availability: { start_date: '2026-09-20', end_date: '2026-10-30', hours_per_week: 15, timezone: 'Asia/Kolkata' }
    },
    {
      email: 'founder@skillsangam.com',
      name: 'Priya Patel',
      user_type: 'student',
      institute_or_company: 'BITS Pilani',
      year_or_experience: '4th Year Computer Science',
      location: 'Pilani / Bengaluru',
      country: 'India',
      bio: 'Frontend engineer & product designer. Founder of AI Crop Advisory project for SIH 2026. Looking for ML and backend teammates!',
      team_preference: 'have_project',
      skills: [
        { name: 'React', proficiency: 'advanced' },
        { name: 'TypeScript', proficiency: 'advanced' },
        { name: 'Figma', proficiency: 'advanced' },
        { name: 'UI/UX Design', proficiency: 'advanced' },
        { name: 'Tailwind CSS', proficiency: 'advanced' }
      ],
      domains: ['AgriTech', 'FinTech', 'SaaS'],
      roles: ['Frontend Developer', 'UI/UX Designer', 'Product Manager'],
      availability: { start_date: '2026-09-15', end_date: '2026-11-15', hours_per_week: 20, timezone: 'Asia/Kolkata' }
    },
    {
      email: 'organizer@skillsangam.com',
      name: 'Dr. Rajesh Nair',
      user_type: 'organizer',
      institute_or_company: 'Smart India Hackathon / AICTE',
      year_or_experience: 'Dean of Innovation & Hackathon Lead',
      location: 'New Delhi',
      country: 'India',
      bio: 'National coordinator and jury chair for university hackathons and student tech incubators.',
      team_preference: 'open_to_both',
      skills: [
        { name: 'Product Management', proficiency: 'advanced' },
        { name: 'Public Speaking', proficiency: 'advanced' },
        { name: 'Research', proficiency: 'advanced' }
      ],
      domains: ['EdTech', 'Social Impact', 'Smart City'],
      roles: ['Product Manager', 'Researcher'],
      availability: { start_date: '2026-09-01', end_date: '2026-12-31', hours_per_week: 10, timezone: 'Asia/Kolkata' }
    },
    {
      email: 'rohan.verma@nit.ac.in',
      name: 'Rohan Verma',
      user_type: 'student',
      institute_or_company: 'NIT Trichy',
      year_or_experience: '3rd Year B.Tech IT',
      location: 'Tiruchirappalli',
      country: 'India',
      bio: 'High-concurrency backend builder. Love architecting Node.js and PostgreSQL backends with Docker.',
      team_preference: 'looking_for_team',
      skills: [
        { name: 'Node.js', proficiency: 'advanced' },
        { name: 'PostgreSQL', proficiency: 'advanced' },
        { name: 'Express.js', proficiency: 'advanced' },
        { name: 'Docker', proficiency: 'intermediate' },
        { name: 'Python', proficiency: 'intermediate' }
      ],
      domains: ['FinTech', 'AgriTech', 'Developer Tools'],
      roles: ['Backend Developer', 'Full Stack Developer'],
      availability: { start_date: '2026-09-15', end_date: '2026-10-31', hours_per_week: 15, timezone: 'Asia/Kolkata' }
    },
    {
      email: 'ananya.iyer@iiit.ac.in',
      name: 'Ananya Iyer',
      user_type: 'student',
      institute_or_company: 'IIIT Hyderabad',
      year_or_experience: '2nd Year B.Tech',
      location: 'Hyderabad',
      country: 'India',
      bio: 'Design fanatic and interactive frontend developer. Built 4 hackathon award-winning interfaces.',
      team_preference: 'looking_for_team',
      skills: [
        { name: 'React', proficiency: 'advanced' },
        { name: 'Figma', proficiency: 'advanced' },
        { name: 'UI/UX Design', proficiency: 'advanced' },
        { name: 'JavaScript', proficiency: 'advanced' },
        { name: 'Tailwind CSS', proficiency: 'advanced' }
      ],
      domains: ['EdTech', 'HealthTech', 'FinTech'],
      roles: ['UI/UX Designer', 'Frontend Developer'],
      availability: { start_date: '2026-09-10', end_date: '2026-10-25', hours_per_week: 18, timezone: 'Asia/Kolkata' }
    },
    {
      email: 'vikram.aditya@dtu.ac.in',
      name: 'Vikram Aditya',
      user_type: 'student',
      institute_or_company: 'DTU Delhi',
      year_or_experience: '4th Year Mechanical & Mechatronics',
      location: 'New Delhi',
      country: 'India',
      bio: 'Smart Mobility innovator. Working on transit fleet tracking and bus stop IoT telemetry.',
      team_preference: 'have_project',
      skills: [
        { name: 'IoT', proficiency: 'advanced' },
        { name: 'Arduino', proficiency: 'advanced' },
        { name: 'Embedded C', proficiency: 'intermediate' },
        { name: 'Python', proficiency: 'intermediate' }
      ],
      domains: ['Smart City', 'Mobility', 'IoT'],
      roles: ['IoT Engineer', 'Hardware Engineer'],
      availability: { start_date: '2026-09-15', end_date: '2026-11-01', hours_per_week: 12, timezone: 'Asia/Kolkata' }
    },
    {
      email: 'neha.gupta@vit.ac.in',
      name: 'Neha Gupta',
      user_type: 'student',
      institute_or_company: 'VIT Vellore',
      year_or_experience: '3rd Year Data Science',
      location: 'Vellore / Chennai',
      country: 'India',
      bio: 'NLP & LLM enthusiast. Experienced in multilingual model fine-tuning and sentiment pipelines.',
      team_preference: 'looking_for_team',
      skills: [
        { name: 'NLP', proficiency: 'advanced' },
        { name: 'Python', proficiency: 'advanced' },
        { name: 'Machine Learning', proficiency: 'advanced' },
        { name: 'Data Science', proficiency: 'intermediate' }
      ],
      domains: ['EdTech', 'FinTech', 'AI/ML'],
      roles: ['AI/ML Developer', 'Data Scientist'],
      availability: { start_date: '2026-09-20', end_date: '2026-10-31', hours_per_week: 14, timezone: 'Asia/Kolkata' }
    },
    {
      email: 'kabir.singh@iitb.ac.in',
      name: 'Kabir Singh',
      user_type: 'student',
      institute_or_company: 'IIT Bombay',
      year_or_experience: '3rd Year Electrical Eng.',
      location: 'Mumbai',
      country: 'India',
      bio: 'Hardware engineer with custom sensor PCB fabrication skills. Building AgriDrone sensor hubs.',
      team_preference: 'have_project',
      skills: [
        { name: 'Hardware', proficiency: 'advanced' },
        { name: 'IoT', proficiency: 'advanced' },
        { name: 'Embedded C', proficiency: 'advanced' },
        { name: 'Raspberry Pi', proficiency: 'intermediate' }
      ],
      domains: ['AgriTech', 'IoT', 'Hardware'],
      roles: ['Hardware Engineer', 'IoT Engineer'],
      availability: { start_date: '2026-09-10', end_date: '2026-10-30', hours_per_week: 16, timezone: 'Asia/Kolkata' }
    },
    {
      email: 'sneha.kulkarni@coep.ac.in',
      name: 'Sneha Kulkarni',
      user_type: 'student',
      institute_or_company: 'COEP Pune',
      year_or_experience: '4th Year Tech & Business',
      location: 'Pune',
      country: 'India',
      bio: 'Product manager and pitch lead. Winner of 3 national business plan & pitch competitions.',
      team_preference: 'open_to_both',
      skills: [
        { name: 'Product Management', proficiency: 'advanced' },
        { name: 'Pitch & Presentation', proficiency: 'advanced' },
        { name: 'Marketing', proficiency: 'intermediate' },
        { name: 'Business Development', proficiency: 'intermediate' }
      ],
      domains: ['SaaS', 'EdTech', 'FinTech', 'Social Impact'],
      roles: ['Product Manager', 'Pitch/Presentation Lead', 'Business/Marketing'],
      availability: { start_date: '2026-09-15', end_date: '2026-11-15', hours_per_week: 12, timezone: 'Asia/Kolkata' }
    },
    {
      email: 'dev.mehta@manipal.edu',
      name: 'Dev Mehta',
      user_type: 'student',
      institute_or_company: 'Manipal Institute of Tech',
      year_or_experience: '3rd Year CSE',
      location: 'Udupi / Bengaluru',
      country: 'India',
      bio: 'Flutter developer with 5 published cross-platform apps on Google Play Store.',
      team_preference: 'looking_for_team',
      skills: [
        { name: 'Flutter', proficiency: 'advanced' },
        { name: 'JavaScript', proficiency: 'intermediate' },
        { name: 'Node.js', proficiency: 'intermediate' },
        { name: 'UI/UX Design', proficiency: 'intermediate' }
      ],
      domains: ['HealthTech', 'E-Commerce', 'Mobility'],
      roles: ['Mobile Developer', 'Frontend Developer'],
      availability: { start_date: '2026-09-20', end_date: '2026-10-30', hours_per_week: 15, timezone: 'Asia/Kolkata' }
    },
    {
      email: 'ritu.sen@jadavpur.ac.in',
      name: 'Ritu Sen',
      user_type: 'student',
      institute_or_company: 'Jadavpur University',
      year_or_experience: '4th Year IT',
      location: 'Kolkata',
      country: 'India',
      bio: 'Cybersecurity researcher & CTF player. Experienced in vulnerability analysis and authentication protocols.',
      team_preference: 'looking_for_team',
      skills: [
        { name: 'Cybersecurity', proficiency: 'advanced' },
        { name: 'Python', proficiency: 'advanced' },
        { name: 'Docker', proficiency: 'intermediate' },
        { name: 'Research', proficiency: 'intermediate' }
      ],
      domains: ['Cybersecurity', 'Web3', 'Developer Tools'],
      roles: ['Backend Developer', 'Researcher'],
      availability: { start_date: '2026-09-18', end_date: '2026-10-28', hours_per_week: 14, timezone: 'Asia/Kolkata' }
    },
    {
      email: 'siddharth.rao@techcorp.in',
      name: 'Siddharth Rao',
      user_type: 'professional',
      institute_or_company: 'Bengaluru Tech Labs',
      year_or_experience: '5 Years Experience',
      location: 'Bengaluru',
      country: 'India',
      bio: 'Senior backend and distributed systems engineer. Mentoring hackathon teams on cloud and architecture.',
      team_preference: 'open_to_both',
      skills: [
        { name: 'Node.js', proficiency: 'advanced' },
        { name: 'TypeScript', proficiency: 'advanced' },
        { name: 'PostgreSQL', proficiency: 'advanced' },
        { name: 'Docker', proficiency: 'advanced' },
        { name: 'DevOps', proficiency: 'intermediate' }
      ],
      domains: ['FinTech', 'SaaS', 'ClimateTech'],
      roles: ['Backend Developer', 'Full Stack Developer'],
      availability: { start_date: '2026-09-15', end_date: '2026-11-30', hours_per_week: 10, timezone: 'Asia/Kolkata' }
    },
    {
      email: 'tanya.choudhury@designstudio.in',
      name: 'Tanya Choudhury',
      user_type: 'professional',
      institute_or_company: 'Gurugram Product Collective',
      year_or_experience: '4 Years Experience',
      location: 'Gurugram',
      country: 'India',
      bio: 'Staff Product Designer focusing on accessibility, micro-interactions, and design systems.',
      team_preference: 'looking_for_team',
      skills: [
        { name: 'Figma', proficiency: 'advanced' },
        { name: 'UI/UX Design', proficiency: 'advanced' },
        { name: 'Design Systems', proficiency: 'advanced' },
        { name: 'Content Writing', proficiency: 'intermediate' }
      ],
      domains: ['EdTech', 'HealthTech', 'E-Commerce'],
      roles: ['UI/UX Designer', 'Product Manager'],
      availability: { start_date: '2026-09-20', end_date: '2026-10-31', hours_per_week: 12, timezone: 'Asia/Kolkata' }
    },
    {
      email: 'amit.joshi@ailabs.org',
      name: 'Amit Joshi',
      user_type: 'professional',
      institute_or_company: 'Hyderabad AI Research Labs',
      year_or_experience: '6 Years Experience',
      location: 'Hyderabad',
      country: 'India',
      bio: 'Applied AI researcher focusing on offline clinical intelligence and low-latency edge models.',
      team_preference: 'have_project',
      skills: [
        { name: 'Machine Learning', proficiency: 'advanced' },
        { name: 'Deep Learning', proficiency: 'advanced' },
        { name: 'Python', proficiency: 'advanced' },
        { name: 'PyTorch', proficiency: 'advanced' }
      ],
      domains: ['HealthTech', 'AI/ML', 'Social Impact'],
      roles: ['AI/ML Developer', 'Data Scientist'],
      availability: { start_date: '2026-09-15', end_date: '2026-11-20', hours_per_week: 14, timezone: 'Asia/Kolkata' }
    },
    {
      email: 'sunita.deshmukh@hackindia.org',
      name: 'Sunita Deshmukh',
      user_type: 'organizer',
      institute_or_company: 'HackIndia Innovation Council',
      year_or_experience: 'Lead Hackathon Program Director',
      location: 'Mumbai / Pune',
      country: 'India',
      bio: 'Organizing pan-India student hackathons, mentorship tracks, and angel investment showcases.',
      team_preference: 'open_to_both',
      skills: [
        { name: 'Product Management', proficiency: 'advanced' },
        { name: 'Public Speaking', proficiency: 'advanced' },
        { name: 'Business Development', proficiency: 'advanced' }
      ],
      domains: ['Smart City', 'AgriTech', 'FinTech'],
      roles: ['Product Manager', 'Pitch/Presentation Lead'],
      availability: { start_date: '2026-09-01', end_date: '2026-12-31', hours_per_week: 15, timezone: 'Asia/Kolkata' }
    }
  ];

  const userIds = {};

  for (const u of usersData) {
    const existing = await query('SELECT id FROM users WHERE email = $1', [u.email]);
    let uid;
    if (existing.rows.length > 0) {
      uid = existing.rows[0].id;
      await query(
        `UPDATE users SET
          name = $2,
          password_hash = $3,
          user_type = $4,
          institute_or_company = $5,
          year_or_experience = $6,
          location = $7,
          country = $8,
          bio = $9,
          team_preference = $10,
          updated_at = NOW()
        WHERE id = $1`,
        [uid, u.name, PASSWORD_HASH, u.user_type, u.institute_or_company, u.year_or_experience, u.location, u.country, u.bio, u.team_preference]
      );
    } else {
      const ins = await query(
        `INSERT INTO users (email, password_hash, name, user_type, institute_or_company, year_or_experience, location, country, bio, team_preference)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [u.email, PASSWORD_HASH, u.name, u.user_type, u.institute_or_company, u.year_or_experience, u.location, u.country, u.bio, u.team_preference]
      );
      uid = ins.rows[0].id;
    }
    userIds[u.email] = uid;

    // Link skills
    await query('DELETE FROM user_skills WHERE user_id = $1', [uid]);
    for (const sk of u.skills) {
      const sId = skillMap[sk.name];
      if (sId) {
        await query(
          `INSERT INTO user_skills (user_id, skill_id, proficiency)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING`,
          [uid, sId, sk.proficiency]
        );
      }
    }

    // Link domains
    await query('DELETE FROM user_domains WHERE user_id = $1', [uid]);
    for (const dm of u.domains) {
      const dId = domainMap[dm];
      if (dId) {
        await query(
          `INSERT INTO user_domains (user_id, domain_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [uid, dId]
        );
      }
    }

    // Link roles
    await query('DELETE FROM user_preferred_roles WHERE user_id = $1', [uid]);
    for (const rl of u.roles) {
      const rId = roleMap[rl];
      if (rId) {
        await query(
          `INSERT INTO user_preferred_roles (user_id, role_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [uid, rId]
        );
      }
    }

    // Availability
    if (u.availability) {
      await query(
        `INSERT INTO availability (user_id, start_date, end_date, hours_per_week, timezone)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id) DO UPDATE SET
           start_date = EXCLUDED.start_date,
           end_date = EXCLUDED.end_date,
           hours_per_week = EXCLUDED.hours_per_week,
           timezone = EXCLUDED.timezone`,
        [uid, u.availability.start_date, u.availability.end_date, u.availability.hours_per_week, u.availability.timezone]
      );
    }
  }
  console.log(`✓ Seeded ${usersData.length} users with complete profiles & availability`);

  // 5. EVENTS
  const organizerId = userIds['organizer@skillsangam.com'];
  const eventsData = [
    {
      name: 'Smart India Hackathon 2026',
      description: 'National innovation competition addressing real-world challenges across agriculture, smart cities, and healthcare.',
      start_date: '2026-09-20',
      end_date: '2026-10-31',
    },
    {
      name: 'HackIndia 2026',
      description: 'Premier national university hackathon promoting interdisciplinary AI, Web3, and Hardware teams.',
      start_date: '2026-09-15',
      end_date: '2026-10-25',
    },
    {
      name: 'GreenTech Summit 2026',
      description: 'Global climate-action hackathon building SaaS and IoT tools for sustainable industry practices.',
      start_date: '2026-10-01',
      end_date: '2026-11-15',
    }
  ];

  const eventMap = {};
  for (const ev of eventsData) {
    const existing = await query('SELECT id FROM events WHERE name = $1', [ev.name]);
    let evId;
    if (existing.rows.length > 0) {
      evId = existing.rows[0].id;
    } else {
      const res = await query(
        `INSERT INTO events (name, description, organizer_id, start_date, end_date)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [ev.name, ev.description, organizerId, ev.start_date, ev.end_date]
      );
      evId = res.rows[0].id;
    }
    eventMap[ev.name] = evId;
  }
  console.log(`✓ Seeded ${eventsData.length} events`);

  // 6. PROJECTS (10 complete realistic projects)
  const projectsData = [
    {
      title: 'AI Crop Advisory Assistant',
      short_description: 'Empowering smallholder farmers with vision-based crop disease diagnosis and vernacular voice advisory.',
      description: 'An AI-powered mobile and web advisory assistant that analyzes smartphone photos of crop foliage to detect pests, fungal blight, and nutrient deficiencies. Supports audio explanations in regional languages (Hindi, Marathi, Telugu) with offline caching for rural connectivity.',
      domain: 'AgriTech',
      event_name: 'Smart India Hackathon 2026',
      location: 'New Delhi / Hybrid',
      owner_email: 'founder@skillsangam.com',
      start_date: '2026-09-20',
      end_date: '2026-10-30',
      hours_per_week: 16,
      max_team_size: 4,
      status: 'open',
      required_skills: ['Python', 'Machine Learning', 'React', 'UI/UX Design'],
      required_roles: ['AI/ML Developer', 'Backend Developer', 'UI/UX Designer'],
      members: [
        { email: 'founder@skillsangam.com', role: 'Frontend Developer & Lead' }
      ]
    },
    {
      title: 'FinLit AI — Vernacular Financial Literacy for Bharat',
      short_description: 'Gamified conversational financial literacy platform for first-time digital banking users.',
      description: 'A multi-turn conversational AI guide that explains savings, UPI fraud protection, micro-insurance, and government subsidies using interactive voice scenarios and interactive comic stories in 10 Indian languages.',
      domain: 'FinTech',
      event_name: 'HackIndia 2026',
      location: 'Bengaluru',
      owner_email: 'siddharth.rao@techcorp.in',
      start_date: '2026-09-18',
      end_date: '2026-10-25',
      hours_per_week: 14,
      max_team_size: 4,
      status: 'open',
      required_skills: ['NLP', 'Python', 'React', 'Figma'],
      required_roles: ['AI/ML Developer', 'Frontend Developer', 'UI/UX Designer'],
      members: [
        { email: 'siddharth.rao@techcorp.in', role: 'Backend Lead' }
      ]
    },
    {
      title: 'SmartTransit IoT — Real-Time Bus Fleet Optimization',
      short_description: 'Low-cost GPS & passenger density estimation sensors for city public bus transport.',
      description: 'Hardware telemetry modules with LoRaWAN and 4G connectivity deployed across public transit fleets. Automatically calculates real-time ETA, bus crowdedness, and alerts commuters via digital bus stop boards.',
      domain: 'Smart City',
      event_name: 'Smart India Hackathon 2026',
      location: 'Delhi NCR',
      owner_email: 'vikram.aditya@dtu.ac.in',
      start_date: '2026-09-15',
      end_date: '2026-10-31',
      hours_per_week: 15,
      max_team_size: 4,
      status: 'open',
      required_skills: ['IoT', 'Arduino', 'Node.js', 'React', 'Docker'],
      required_roles: ['IoT Engineer', 'Backend Developer', 'Frontend Developer'],
      members: [
        { email: 'vikram.aditya@dtu.ac.in', role: 'Hardware & IoT Lead' }
      ]
    },
    {
      title: 'CareAssist — Offline Clinical Decision Support',
      short_description: 'Edge-AI clinical triage assistant for rural primary healthcare centers.',
      description: 'A lightweight mobile tablet solution with quantized ML models that aids rural nursing officers with patient symptom triage, vital sign risk indicators, and medication interaction flags without requiring 24/7 internet.',
      domain: 'HealthTech',
      event_name: 'HackIndia 2026',
      location: 'Hyderabad',
      owner_email: 'amit.joshi@ailabs.org',
      start_date: '2026-09-15',
      end_date: '2026-11-15',
      hours_per_week: 18,
      max_team_size: 4,
      status: 'open',
      required_skills: ['Machine Learning', 'Python', 'Flutter', 'UI/UX Design'],
      required_roles: ['AI/ML Developer', 'Mobile Developer', 'UI/UX Designer'],
      members: [
        { email: 'amit.joshi@ailabs.org', role: 'AI Research Lead' }
      ]
    },
    {
      title: 'AgriDrone Sensor Hub & Multispectral Crop Health',
      short_description: 'Custom drone payload sensor computing NDVI index maps for precision fertilizer spray.',
      description: 'Integrating multispectral camera sensors and embedded microcontrollers onto agricultural drones to generate localized vegetative index maps and pinpoint water stress zones.',
      domain: 'AgriTech',
      event_name: 'Smart India Hackathon 2026',
      location: 'Mumbai',
      owner_email: 'kabir.singh@iitb.ac.in',
      start_date: '2026-09-10',
      end_date: '2026-10-30',
      hours_per_week: 16,
      max_team_size: 3,
      status: 'open',
      required_skills: ['Hardware', 'IoT', 'Embedded C', 'Python'],
      required_roles: ['Hardware Engineer', 'AI/ML Developer'],
      members: [
        { email: 'kabir.singh@iitb.ac.in', role: 'Hardware Architect' }
      ]
    },
    {
      title: 'EcoTrace — Supply Chain Carbon Accounting SaaS',
      short_description: 'Automating Scope 1, 2, and 3 emission audits for mid-sized manufacturers.',
      description: 'A clean B2B SaaS platform that ingests utility invoices, logistics manifests, and fuel consumption receipts to calculate verified GHG emissions with exportable ESG audit sheets.',
      domain: 'ClimateTech',
      event_name: 'GreenTech Summit 2026',
      location: 'Pune / Remote',
      owner_email: 'sneha.kulkarni@coep.ac.in',
      start_date: '2026-10-01',
      end_date: '2026-11-15',
      hours_per_week: 12,
      max_team_size: 4,
      status: 'open',
      required_skills: ['React', 'Node.js', 'PostgreSQL', 'Product Management'],
      required_roles: ['Full Stack Developer', 'Backend Developer', 'Product Manager'],
      members: [
        { email: 'sneha.kulkarni@coep.ac.in', role: 'Product Manager' }
      ]
    },
    {
      title: 'SecureSentinel — Cloud Infrastructure Policy Auditor',
      short_description: 'Automated policy-as-code linter and least-privilege checker for multi-cloud setups.',
      description: 'CLI and web dashboard scanning AWS, GCP, and Azure Terraform scripts for security misconfigurations, overly permissive IAM roles, and publicly exposed storage buckets.',
      domain: 'Cybersecurity',
      event_name: 'HackIndia 2026',
      location: 'Kolkata',
      owner_email: 'ritu.sen@jadavpur.ac.in',
      start_date: '2026-09-18',
      end_date: '2026-10-28',
      hours_per_week: 14,
      max_team_size: 3,
      status: 'open',
      required_skills: ['Cybersecurity', 'Python', 'Docker', 'DevOps'],
      required_roles: ['Backend Developer', 'Full Stack Developer'],
      members: [
        { email: 'ritu.sen@jadavpur.ac.in', role: 'Security Architect' }
      ]
    },
    {
      title: 'EduPulse — Multilingual Adaptive Learning Tutor',
      short_description: 'Personalized generative learning companion for state-board STEM curricula.',
      description: 'An interactive study companion that translates complex NCERT science and math concepts into conversational bilingual examples with automated diagnostic quizzes.',
      domain: 'EdTech',
      event_name: 'Smart India Hackathon 2026',
      location: 'Bengaluru',
      owner_email: 'tanya.choudhury@designstudio.in',
      start_date: '2026-09-20',
      end_date: '2026-10-31',
      hours_per_week: 14,
      max_team_size: 4,
      status: 'open',
      required_skills: ['React', 'Python', 'NLP', 'UI/UX Design', 'Content Writing'],
      required_roles: ['Frontend Developer', 'AI/ML Developer', 'UI/UX Designer'],
      members: [
        { email: 'tanya.choudhury@designstudio.in', role: 'Design Lead' }
      ]
    },
    {
      title: 'FarmToFork — Hyperlocal Agri Marketplace',
      short_description: 'Direct farm-to-restaurant produce pooling and shared freight booking app.',
      description: 'Connecting peri-urban vegetable farmers directly with restaurant collectives, enabling bulk aggregation, demand forecasting, and shared temperature-controlled delivery slots.',
      domain: 'E-Commerce',
      event_name: 'Smart India Hackathon 2026',
      location: 'Pune / Mumbai',
      owner_email: 'founder@skillsangam.com',
      start_date: '2026-09-25',
      end_date: '2026-11-05',
      hours_per_week: 12,
      max_team_size: 4,
      status: 'open',
      required_skills: ['Flutter', 'Node.js', 'PostgreSQL', 'Marketing'],
      required_roles: ['Mobile Developer', 'Backend Developer', 'Business/Marketing'],
      members: [
        { email: 'founder@skillsangam.com', role: 'Product & Frontend' }
      ]
    },
    {
      title: 'AuraSpace — Cognitive Behavioral Therapy Mood Journal',
      short_description: 'Private on-device mental health journal with voice mood detection and CBT exercises.',
      description: 'A student-friendly wellness application providing guided CBT journaling, acoustic sentiment reflection, and emergency helpline routing with end-to-end client encryption.',
      domain: 'HealthTech',
      event_name: 'HackIndia 2026',
      location: 'New Delhi',
      owner_email: 'student@skillsangam.com',
      start_date: '2026-09-22',
      end_date: '2026-10-30',
      hours_per_week: 15,
      max_team_size: 3,
      status: 'open',
      required_skills: ['React', 'Machine Learning', 'UI/UX Design', 'Figma'],
      required_roles: ['AI/ML Developer', 'UI/UX Designer', 'Frontend Developer'],
      members: [
        { email: 'student@skillsangam.com', role: 'ML & Research Lead' }
      ]
    }
  ];

  const projectIds = {};

  for (const p of projectsData) {
    const ownerId = userIds[p.owner_email];
    const domainId = domainMap[p.domain];

    const existing = await query('SELECT id FROM projects WHERE title = $1', [p.title]);
    let pid;
    if (existing.rows.length > 0) {
      pid = existing.rows[0].id;
      await query(
        `UPDATE projects SET
          short_description = $2,
          description = $3,
          domain_id = $4,
          event_name = $5,
          location = $6,
          owner_id = $7,
          start_date = $8,
          end_date = $9,
          hours_per_week = $10,
          max_team_size = $11,
          status = $12,
          updated_at = NOW()
        WHERE id = $1`,
        [pid, p.short_description, p.description, domainId, p.event_name, p.location, ownerId, p.start_date, p.end_date, p.hours_per_week, p.max_team_size, p.status]
      );
    } else {
      const ins = await query(
        `INSERT INTO projects (title, short_description, description, domain_id, event_name, location, owner_id, start_date, end_date, hours_per_week, max_team_size, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [p.title, p.short_description, p.description, domainId, p.event_name, p.location, ownerId, p.start_date, p.end_date, p.hours_per_week, p.max_team_size, p.status]
      );
      pid = ins.rows[0].id;
    }
    projectIds[p.title] = pid;

    // Required skills
    await query('DELETE FROM project_required_skills WHERE project_id = $1', [pid]);
    for (const skName of p.required_skills) {
      const sId = skillMap[skName];
      if (sId) {
        await query(
          `INSERT INTO project_required_skills (project_id, skill_id, count_needed)
           VALUES ($1, $2, 1)
           ON CONFLICT DO NOTHING`,
          [pid, sId]
        );
      }
    }

    // Required roles
    await query('DELETE FROM project_required_roles WHERE project_id = $1', [pid]);
    for (const rName of p.required_roles) {
      const rId = roleMap[rName];
      if (rId) {
        await query(
          `INSERT INTO project_required_roles (project_id, role_id, count_needed)
           VALUES ($1, $2, 1)
           ON CONFLICT DO NOTHING`,
          [pid, rId]
        );
      }
    }

    // Members
    await query('DELETE FROM project_members WHERE project_id = $1', [pid]);
    for (const m of p.members) {
      const memId = userIds[m.email];
      if (memId) {
        await query(
          `INSERT INTO project_members (project_id, user_id, role_in_project)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING`,
          [pid, memId, m.role]
        );
      }
    }
  }
  console.log(`✓ Seeded ${projectsData.length} projects with required skills, roles, and members`);

  // 7. JOIN REQUESTS & INVITATIONS (Demo interactions)
  const cropProjectId = projectIds['AI Crop Advisory Assistant'];
  const finlitProjectId = projectIds['FinLit AI — Vernacular Financial Literacy for Bharat'];
  const transitProjectId = projectIds['SmartTransit IoT — Real-Time Bus Fleet Optimization'];

  // Aarav requests to join AI Crop Advisory Assistant
  const aaravId = userIds['student@skillsangam.com'];
  if (cropProjectId && aaravId) {
    await query(
      `INSERT INTO join_requests (project_id, user_id, message, status)
       VALUES ($1, $2, 'Hi Priya! I have extensive experience in computer vision and PyTorch from IIT Delhi. I would love to build the disease diagnosis engine for AI Crop Advisory.', 'pending')
       ON CONFLICT (project_id, user_id) DO UPDATE SET message = EXCLUDED.message, status = 'pending'`,
      [cropProjectId, aaravId]
    );
  }

  // Rohan requests to join AI Crop Advisory Assistant (accepted)
  const rohanId = userIds['rohan.verma@nit.ac.in'];
  if (cropProjectId && rohanId) {
    await query(
      `INSERT INTO join_requests (project_id, user_id, message, status)
       VALUES ($1, $2, 'Hey! I can build the high-speed Node.js + PostgreSQL API and Docker deployment for this project.', 'accepted')
       ON CONFLICT (project_id, user_id) DO UPDATE SET status = 'accepted'`,
      [cropProjectId, rohanId]
    );
    // Also add Rohan as member
    await query(
      `INSERT INTO project_members (project_id, user_id, role_in_project)
       VALUES ($1, $2, 'Backend Developer')
       ON CONFLICT (project_id, user_id) DO NOTHING`,
      [cropProjectId, rohanId]
    );
  }

  // Ananya requests to join FinLit AI
  const ananyaId = userIds['ananya.iyer@iiit.ac.in'];
  if (finlitProjectId && ananyaId) {
    await query(
      `INSERT INTO join_requests (project_id, user_id, message, status)
       VALUES ($1, $2, 'Hello Siddharth! I love UI/UX for fintech and would love to design the vernacular onboarding flow in Figma & React.', 'pending')
       ON CONFLICT (project_id, user_id) DO UPDATE SET status = 'pending'`,
      [finlitProjectId, ananyaId]
    );
  }

  // Invitations: Priya invites Neha Gupta to AI Crop Advisory Assistant
  const priyaId = userIds['founder@skillsangam.com'];
  const nehaId = userIds['neha.gupta@vit.ac.in'];
  if (cropProjectId && priyaId && nehaId) {
    await query(
      `INSERT INTO invitations (project_id, inviter_id, invitee_id, role_id, message, status)
       VALUES ($1, $2, $3, $4, 'Hey Neha! We reviewed your profile and your NLP experience would be perfect for our vernacular voice assistant module.', 'pending')
       ON CONFLICT (project_id, invitee_id) DO UPDATE SET status = 'pending'`,
      [cropProjectId, priyaId, nehaId, roleMap['AI/ML Developer']]
    );
  }

  // Vikram invites Kabir to SmartTransit IoT
  const vikramId = userIds['vikram.aditya@dtu.ac.in'];
  const kabirId = userIds['kabir.singh@iitb.ac.in'];
  if (transitProjectId && vikramId && kabirId) {
    await query(
      `INSERT INTO invitations (project_id, inviter_id, invitee_id, role_id, message, status)
       VALUES ($1, $2, $3, $4, 'Hi Kabir, your embedded hardware experience with microcontrollers is exactly what we need for our transit sensors.', 'accepted')
       ON CONFLICT (project_id, invitee_id) DO UPDATE SET status = 'accepted'`,
      [transitProjectId, vikramId, kabirId, roleMap['Hardware Engineer']]
    );
    await query(
      `INSERT INTO project_members (project_id, user_id, role_in_project)
       VALUES ($1, $2, 'Hardware Engineer')
       ON CONFLICT (project_id, user_id) DO NOTHING`,
      [transitProjectId, kabirId]
    );
  }

  // 8. MESSAGES (Project collaboration chat)
  if (cropProjectId && priyaId && rohanId) {
    await query(
      `INSERT INTO messages (project_id, sender_id, receiver_id, message, created_at)
       VALUES
       ($1, $2, $3, 'Welcome to the AI Crop Advisory team Rohan! Excited to have you handle our backend.', NOW() - INTERVAL '2 hours'),
       ($1, $3, $2, 'Thanks Priya! I checked out the schema requirements. Setting up the PostgreSQL models and REST endpoints right away.', NOW() - INTERVAL '1 hour 45 minutes'),
       ($1, $2, $3, 'Awesome. I will finalize the Figma UI tokens and connect the React components.', NOW() - INTERVAL '30 minutes')`,
      [cropProjectId, priyaId, rohanId]
    );
  }

  // 9. EVENT PARTICIPANTS
  const sihEventId = eventMap['Smart India Hackathon 2026'];
  if (sihEventId) {
    for (const em of ['student@skillsangam.com', 'founder@skillsangam.com', 'rohan.verma@nit.ac.in', 'vikram.aditya@dtu.ac.in', 'kabir.singh@iitb.ac.in']) {
      const uId = userIds[em];
      if (uId) {
        await query(
          `INSERT INTO event_participants (event_id, user_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [sihEventId, uId]
        );
      }
    }
  }

  // 10. ACADEMIC COURSE GROUP ASSIGNMENTS & COMMUNITIES
  const asgn1Res = await query(`
    INSERT INTO assignments (
      title, course_name, teacher_name, institution_name, education_level,
      description, due_date, min_team_size, max_team_size, total_students_enrolled
    ) VALUES (
      'Distributed Cloud Microservices & Scalable Caching Architecture',
      'CS402: Cloud Computing & Systems',
      'Prof. Sneha Deshmukh',
      'IIT Delhi / Engineering Campuses',
      'college',
      'Build a high-throughput microservices architecture with automated failover, PostgreSQL connection pooling, Redis caching, and rate limiting. Teams of 2-4 must submit a production GitHub repository with architecture diagrams, Docker Compose configuration, and benchmark results.',
      NOW() + INTERVAL '12 days',
      2, 4, 45
    ) RETURNING id
  `);
  const asgn1Id = asgn1Res.rows[0].id;

  const asgn2Res = await query(`
    INSERT INTO assignments (
      title, course_name, teacher_name, institution_name, education_level,
      description, due_date, min_team_size, max_team_size, total_students_enrolled
    ) VALUES (
      'Computer Vision & Neural Network Defect Detection',
      'AI301: Deep Learning & Machine Perception',
      'Dr. Arvind Kulkarni',
      'IIT Bombay & Partner Institutions',
      'college',
      'Train a convolutional neural network or YOLO architecture for visual quality defect inspection. Deliverables include model checkpoint, comparative F1-score evaluation metrics, and an interactive Gradio/Streamlit inference demo.',
      NOW() + INTERVAL '8 days',
      2, 3, 38
    ) RETURNING id
  `);
  const asgn2Id = asgn2Res.rows[0].id;

  const asgn3Res = await query(`
    INSERT INTO assignments (
      title, course_name, teacher_name, institution_name, education_level,
      description, due_date, min_team_size, max_team_size, total_students_enrolled
    ) VALUES (
      'Full-Stack Collaborative Team Kanban & Sprint Manager',
      'SE201: Agile Software Engineering',
      'Dr. Rajesh Nair',
      'National Universities & Colleges',
      'college',
      'Construct a full-stack real-time collaboration tool featuring optimistic UI updates, JWT authentication, and automated GitHub Actions CI/CD workflows.',
      NOW() + INTERVAL '18 days',
      2, 4, 52
    ) RETURNING id
  `);
  const asgn3Id = asgn3Res.rows[0].id;

  // Groups for Assignment 1
  const rohanUser = userIds['rohan.verma@nit.ac.in'] || userIds['student@skillsangam.com'];
  const vikramUser = userIds['vikram.aditya@dtu.ac.in'];
  const aaravUser = userIds['student@skillsangam.com'];
  const priyaUser = userIds['founder@skillsangam.com'];
  const nehaUser = userIds['neha.gupta@vit.ac.in'];
  const poojaUser = userIds['pooja.patel@vjti.ac.in'] || userIds['ananya.sen@iiit.ac.in'];
  const kabirUser = userIds['kabir.singh@iitb.ac.in'];
  const snehaUser = userIds['sneha.kulkarni@coep.ac.in'];

  if (rohanUser && vikramUser) {
    // Group 1: Forming (3/4 members)
    const grp1Res = await query(`
      INSERT INTO assignment_groups (assignment_id, name, leader_id, status)
      VALUES ($1, 'Team CloudNinjas', $2, 'forming')
      RETURNING id
    `, [asgn1Id, rohanUser]);
    const grp1Id = grp1Res.rows[0].id;

    await query(`
      INSERT INTO assignment_group_members (group_id, assignment_id, user_id, role_in_group)
      VALUES ($1, $2, $3, 'Architecture & Backend'),
             ($1, $2, $4, 'Docker & DevOps')
    `, [grp1Id, asgn1Id, rohanUser, vikramUser]);

    if (poojaUser) {
      await query(`
        INSERT INTO assignment_group_members (group_id, assignment_id, user_id, role_in_group)
        VALUES ($1, $2, $3, 'Frontend Integration')
      `, [grp1Id, asgn1Id, poojaUser]);
    }
  }

  if (priyaUser && kabirUser) {
    // Group 2: Submitted (Full 4/4 members)
    const grp2Res = await query(`
      INSERT INTO assignment_groups (
        assignment_id, name, leader_id, status, submission_url, submission_notes, submitted_at
      )
      VALUES (
        $1, 'Team ByteForce', $2, 'submitted',
        'https://github.com/byteforce/distributed-cloud-system',
        'Completed full rubric including Redis cluster caching and Locust load testing report with 10k req/sec.',
        NOW() - INTERVAL '1 day'
      )
      RETURNING id
    `, [asgn1Id, priyaUser]);
    const grp2Id = grp2Res.rows[0].id;

    await query(`
      INSERT INTO assignment_group_members (group_id, assignment_id, user_id, role_in_group)
      VALUES ($1, $2, $3, 'Team Lead & API Design'),
             ($1, $2, $4, 'Database Specialist')
    `, [grp2Id, asgn1Id, priyaUser, kabirUser]);
  }

  // Groups for Assignment 2
  if (aaravUser && nehaUser) {
    // Group 3: Forming (Aarav is leader)
    const grp3Res = await query(`
      INSERT INTO assignment_groups (assignment_id, name, leader_id, status)
      VALUES ($1, 'NeuralVision Pioneers', $2, 'forming')
      RETURNING id
    `, [asgn2Id, aaravUser]);
    const grp3Id = grp3Res.rows[0].id;

    await query(`
      INSERT INTO assignment_group_members (group_id, assignment_id, user_id, role_in_group)
      VALUES ($1, $2, $3, 'Model Training & ML Pipeline'),
             ($1, $2, $4, 'Dataset Preprocessing')
    `, [grp3Id, asgn2Id, aaravUser, nehaUser]);
  }

  // Groups for Assignment 3
  if (snehaUser && vikramUser) {
    const grp4Res = await query(`
      INSERT INTO assignment_groups (assignment_id, name, leader_id, status)
      VALUES ($1, 'AgileDev Squad', $2, 'forming')
      RETURNING id
    `, [asgn3Id, snehaUser]);
    const grp4Id = grp4Res.rows[0].id;

    await query(`
      INSERT INTO assignment_group_members (group_id, assignment_id, user_id, role_in_group)
      VALUES ($1, $2, $3, 'Scrum Master & Full Stack'),
             ($1, $2, $4, 'CI/CD Pipeline Lead')
    `, [grp4Id, asgn3Id, snehaUser, vikramUser]);
  }

  // Community discussion posts for Assignment 1
  if (rohanUser) {
    await query(`
      INSERT INTO assignment_community_posts (assignment_id, user_id, post_type, content, created_at)
      VALUES ($1, $2, 'teammate_search', 'Hey everyone! We have 1 open spot in Team CloudNinjas for someone experienced with Redis caching or load testing. Reach out if interested!', NOW() - INTERVAL '2 days')
    `, [asgn1Id, rohanUser]);
  }
  if (aaravUser) {
    await query(`
      INSERT INTO assignment_community_posts (assignment_id, user_id, post_type, content, created_at)
      VALUES ($1, $2, 'doubt', 'Does the rubric require Docker Compose v2 syntax, or is Helm / Kubernetes deployment acceptable for bonus credit?', NOW() - INTERVAL '1 day')
    `, [asgn1Id, aaravUser]);
  }
  if (vikramUser) {
    await query(`
      INSERT INTO assignment_community_posts (assignment_id, user_id, post_type, content, created_at)
      VALUES ($1, $2, 'discussion', 'Prof. Deshmukh confirmed in office hours that Helm charts qualify for the 5-point bonus!', NOW() - INTERVAL '18 hours')
    `, [asgn1Id, vikramUser]);
  }

  console.log('✓ Seeded join requests, invitations, project members, messages, and event participants.');
  console.log('✓ Seeded academic group assignments, groups, submissions, and assignment communities.');
  console.log('========================================================================');
  console.log('SkillSangam database seeded successfully!');
  console.log('Demo accounts (Password: password123):');
  console.log('  1. Student:     student@skillsangam.com   (Aarav Sharma - Looking for team)');
  console.log('  2. Founder:     founder@skillsangam.com   (Priya Patel - Has project)');
  console.log('  3. Organizer:   organizer@skillsangam.com (Dr. Rajesh Nair - Hackathon lead)');
  console.log('========================================================================');
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}

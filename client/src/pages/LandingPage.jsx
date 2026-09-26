import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Compass,
  Sparkles,
  ArrowRight,
  Trophy,
  CheckCircle2,
  Cpu,
  Layers,
  Clock,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import RoleSelectionGateway from '../components/common/RoleSelectionGateway';

export default function LandingPage() {
  const { isAuthenticated, login, showToast } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (email) => {
    try {
      await login(email, 'password123');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* HERO SECTION */}
      <section className="relative pt-6 sm:pt-12 pb-8 text-center max-w-4xl mx-auto px-4">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-6 animate-in fade-in duration-300">
          <Trophy className="w-3.5 h-3.5 text-brand-600" />
          <span>Smart India Hackathon • HackIndia • Academic Capstones</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
          Find the right teammates.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600">
            Build better projects.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
          SkillSangam connects project requirements with real student skills, domains, roles, and availability. Form balanced interdisciplinary teams without searching randomly in chat groups.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02]"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/projects"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-base transition-all"
              >
                <Compass className="w-4 h-4 text-slate-500" />
                <span>Explore Projects</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02]"
              >
                <span>Find My Team</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/projects"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-base transition-all"
              >
                <Compass className="w-4 h-4 text-slate-500" />
                <span>Explore Projects</span>
              </Link>
              <Link
                to="/projects/new"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-base transition-all"
              >
                <span>Create Project</span>
              </Link>
            </>
          )}
        </div>

        {/* HERO VISUAL BANNER WITH JUGGLING SKILLS ILLUSTRATION */}
        <div className="relative mx-auto max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 bg-gradient-to-tr from-slate-900 via-[#105f74] to-slate-900 group my-8">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden flex items-center justify-center">
            <img 
              src="/skill-bg.png" 
              alt="SkillSangam - Multi-skill Balancing and Team Synergy" 
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-6 sm:right-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-white">
              <div className="text-left">
                <span className="text-[10px] sm:text-xs uppercase font-black tracking-widest text-teal-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                  <span>Interdisciplinary Skill Balance</span>
                </span>
                <h3 className="text-sm sm:text-base font-black text-white">
                  Balance Every Talent. Build Championship Teams.
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white border border-white/30">
                12+ Skills & Roles
              </span>
            </div>
          </div>
        </div>

        {/* DEMO FAST-SWITCH PANEL */}
        {!isAuthenticated && (
          <div className="bg-slate-100/80 border border-slate-200 p-4 rounded-2xl max-w-2xl mx-auto shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>One-Click Demo Evaluator Logins (Password: password123)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickLogin('student@skillsangam.com')}
                className="px-3 py-2 rounded-xl bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-xs font-semibold text-slate-800 transition-all text-left flex flex-col"
              >
                <span className="font-bold text-brand-700">Aarav Sharma</span>
                <span className="text-[10px] text-slate-500">Student • ML & AI (Looking)</span>
              </button>
              <button
                onClick={() => handleQuickLogin('founder@skillsangam.com')}
                className="px-3 py-2 rounded-xl bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-xs font-semibold text-slate-800 transition-all text-left flex flex-col"
              >
                <span className="font-bold text-indigo-700">Priya Patel</span>
                <span className="text-[10px] text-slate-500">Founder • Crop Advisory Lead</span>
              </button>
              <button
                onClick={() => handleQuickLogin('organizer@skillsangam.com')}
                className="px-3 py-2 rounded-xl bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-xs font-semibold text-slate-800 transition-all text-left flex flex-col"
              >
                <span className="font-bold text-purple-700">Dr. Rajesh Nair</span>
                <span className="text-[10px] text-slate-500">Organizer • SIH Innovation Lead</span>
              </button>
            </div>
          </div>
        )}

        {/* ROLE SELECTION GATEWAY: STUDENT VS OFFICE WORKER */}
        {!isAuthenticated && (
          <div className="mt-12 text-left">
            <RoleSelectionGateway title="Choose How You Want to Join SkillSangam" />
          </div>
        )}
      </section>

      {/* CORE VALUE PROPOSITIONS */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Random Team Searches Fail
          </h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto mt-2">
            Most hackathon teams form through random WhatsApp messages, resulting in skill duplication, missing designers, and mismatched timelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Interdisciplinary Balance</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Ensure projects don't end up with four backend engineers. Match AI specialists with UI/UX designers, mobile developers, and pitch leads.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Transparent Match Score</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Every percentage score is mathematically derived from skills (60%), domain (20%), availability (10%), and role compatibility (10%).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Availability Overlap</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Match only with teammates whose sprint availability, calendar dates, and weekly hours align with your competition schedule.
            </p>
          </div>
        </div>
      </section>

      {/* HOW THE MATCHING ALGORITHM WORKS */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 max-w-6xl mx-auto shadow-sm">
        <div className="max-w-2xl mb-8">
          <Badge variant="brand" className="mb-2">Deterministic Engine</Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Transparent Matching Formula
          </h2>
          <p className="text-slate-600 text-sm mt-2 leading-relaxed">
            SkillSangam never fabricates AI numbers. Every score explains exactly why candidates and projects match with verifiable criteria:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-3xl font-black text-brand-600 mb-1">60%</div>
            <div className="font-bold text-sm text-slate-800">Skill Overlap</div>
            <p className="text-xs text-slate-500 mt-1">
              Required vs candidate skills with proficiency level weighting.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-3xl font-black text-indigo-600 mb-1">20%</div>
            <div className="font-bold text-sm text-slate-800">Domain Alignment</div>
            <p className="text-xs text-slate-500 mt-1">
              Mutual interest in AgriTech, FinTech, HealthTech, Smart City, etc.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-3xl font-black text-emerald-600 mb-1">10%</div>
            <div className="font-bold text-sm text-slate-800">Availability Fit</div>
            <p className="text-xs text-slate-500 mt-1">
              Date timeline overlap and expected hours per week commitment.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-3xl font-black text-purple-600 mb-1">10%</div>
            <div className="font-bold text-sm text-slate-800">Role Compatibility</div>
            <p className="text-xs text-slate-500 mt-1">
              Candidate's preferred role matches open project vacancies.
            </p>
          </div>
        </div>
      </section>

      {/* AI CAPABILITIES SECTION */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white">
          <div className="space-y-4 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-brand-300 text-xs font-semibold backdrop-blur-sm">
              <Bot className="w-3.5 h-3.5" />
              <span>Powered by Gemini</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Intelligent Assistance without Black-Box Bias
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              We leverage Google Gemini strictly where generative AI excels: automatically extracting project requirements, normalizing messy skill names, drafting pitch descriptions, and performing team gap analysis.
            </p>
            <div className="space-y-2 text-xs text-slate-300 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Automatic requirement extraction from raw ideas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Live team balance and missing-role gap reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Deterministic matching remains 100% auditable and unbiased</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0 flex flex-col gap-3">
            <Link
              to="/signup"
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-center text-sm shadow transition-all"
            >
              Get Started Free
            </Link>
            <Link
              to="/about"
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-center text-sm border border-white/10 transition-all"
            >
              Read Architecture & FAQ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

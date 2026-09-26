import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Target,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';
import Badge from '../components/common/Badge';
import RoleSelectionGateway from '../components/common/RoleSelectionGateway';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="brand">Our Core Mission</Badge>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Find the right teammates. Build better projects.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          SkillSangam is an AI-powered skill-based team formation platform designed for students and professionals participating in hackathons, academic projects, startups, and innovation sprints.
        </p>
      </div>

      {/* DIRECT ACCESS ROLE SELECTOR GATEWAY */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 shadow-sm">
        <RoleSelectionGateway title="Get Started: Select Your Role to Enter Your Profile" />
      </div>

      {/* Visual Showcase: Balancing Skills */}
      <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200/90 bg-gradient-to-tr from-slate-900 via-[#105f74] to-slate-900">
        <div className="relative aspect-[16/9] sm:aspect-[24/9] w-full overflow-hidden flex items-center justify-center">
          <img 
            src="/skill-bg.png" 
            alt="The Balancing Act of Interdisciplinary Skills" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-teal-300">The Power of Skill Synthesis</span>
              <h3 className="text-base sm:text-lg font-black text-white">From Juggling Solo to Assembling an Unbeatable Team</h3>
            </div>
          </div>
        </div>
      </div>

      {/* The Problem & Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            ✗
          </div>
          <h3 className="font-bold text-lg text-slate-900">The Problem Today</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Most hackathon teams are formed through random messaging in large discord channels or WhatsApp groups. This leads to imbalanced teams (e.g. four frontend developers with zero backend or design experience), timezone misalignment, and high dropout rates.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            ✓
          </div>
          <h3 className="font-bold text-lg text-slate-900">The SkillSangam Solution</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            SkillSangam computes a transparent, explainable compatibility score based on actual skills, target domains, required roles, and weekly calendar availability. Project owners discover qualified candidates, and students discover open projects that match their aspirations.
          </p>
        </div>
      </div>

      {/* Algorithm Deep Dive */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
        <div>
          <Badge variant="brand" className="mb-2">Deterministic Scoring Engine</Badge>
          <h2 className="text-2xl font-black text-slate-900">How the Match Score is Calculated</h2>
          <p className="text-slate-600 text-sm mt-1">
            SkillSangam strictly avoids arbitrary black-box AI scores. The match engine is 100% deterministic and derived from database facts:
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-black">1</span>
                <span>Skills Compatibility (60% weight)</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 pl-8">
                Calculates the proportion of project required skills possessed by the candidate (matching skills / total required skills).
              </p>
            </div>
            <code className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded border border-slate-200 text-brand-700">
              skillScore = matched / total
            </code>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">2</span>
                <span>Domain Compatibility (20% weight)</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 pl-8">
                1.0 if the candidate's selected domains include the project domain (e.g. AgriTech, FinTech, HealthTech); 0.0 otherwise.
              </p>
            </div>
            <code className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded border border-slate-200 text-indigo-700">
              domainScore = 1.0 or 0.0
            </code>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">3</span>
                <span>Availability Compatibility (10% weight)</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 pl-8">
                Evaluates date range overlap between user calendar and project sprint timeline, factoring in hours/week capacity.
              </p>
            </div>
            <code className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded border border-slate-200 text-emerald-700">
              dateOverlap × hoursRatio
            </code>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-black">4</span>
                <span>Role Compatibility (10% weight)</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 pl-8">
                Evaluates whether candidate's preferred roles correspond to unfilled project roles (Frontend Developer, UI/UX, AI/ML, etc.).
              </p>
            </div>
            <code className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded border border-slate-200 text-purple-700">
              matchedRoles / requiredRoles
            </code>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-100 text-xs text-slate-700 space-y-1">
          <div className="font-bold text-brand-900">Final Match Formula:</div>
          <div className="font-mono text-slate-800">
            finalScore = Math.round(((skillScore × 0.60) + (domainScore × 0.20) + (availabilityScore × 0.10) + (roleScore × 0.10)) × 100)
          </div>
        </div>
      </div>

      {/* Ethical AI & Privacy */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-600" />
          <h3 className="font-bold text-base text-slate-900">Ethical AI & Non-Discrimination Policy</h3>
        </div>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          SkillSangam enforces strict non-discriminatory matching. The algorithm does not consider gender, religion, caste, race, disability, political beliefs, or other sensitive personal attributes. Matching focuses exclusively on verified technical qualifications, project requirements, role compatibility, and availability.
        </p>
      </div>

      {/* CTA Bottom */}
      <div className="text-center pt-4">
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-lg shadow-brand-500/25 transition-all"
        >
          <span>Join SkillSangam Today</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

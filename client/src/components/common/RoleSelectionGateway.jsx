import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Briefcase, Trophy, School, Building2, Landmark, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RoleSelectionGateway({ className = '', title = "Choose How You Want to Join SkillSangam" }) {
  const navigate = useNavigate();
  const [selectedStudentLevel, setSelectedStudentLevel] = useState('college');

  const handleSelectRole = (type, level = null) => {
    const params = new URLSearchParams();
    params.set('type', type);
    if (level) {
      params.set('level', level);
    }
    navigate(`/signup?${params.toString()}`);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <div className="text-center mb-8 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          Tailor your profile, match algorithm, and team recommendations based on your background.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* STUDENT TRACK */}
        <div className="bg-white rounded-3xl border-2 border-brand-200 hover:border-brand-500 shadow-lg shadow-brand-500/5 transition-all p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />

          <div className="relative z-10 space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/30">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-brand-600">Track 1</span>
                <h3 className="text-xl font-black text-slate-900">I am a Student</h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Find teammates for hackathons (SIH, HackIndia), capstone projects, coding competitions, or study groups.
            </p>

            {/* Sub-selection for School / College / University */}
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Select Your Education Level:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentLevel('school')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    selectedStudentLevel === 'school'
                      ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <School className="w-4 h-4 text-brand-600" />
                  <span>School</span>
                  <span className="text-[9px] font-normal text-slate-500">Grades 9-12</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStudentLevel('college')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    selectedStudentLevel === 'college'
                      ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-brand-600" />
                  <span>College</span>
                  <span className="text-[9px] font-normal text-slate-500">Undergrad</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStudentLevel('university')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    selectedStudentLevel === 'university'
                      ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Landmark className="w-4 h-4 text-brand-600" />
                  <span>University</span>
                  <span className="text-[9px] font-normal text-slate-500">Postgrad / PhD</span>
                </button>
              </div>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-500 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Smart skill matching across Frontend, Backend, AI & UI</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Aligned with student hackathons & academic calendars</span>
              </li>
            </ul>
          </div>

          <div className="relative z-10 pt-6">
            <button
              type="button"
              onClick={() => handleSelectRole('student', selectedStudentLevel)}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition-all hover:scale-[1.01]"
            >
              <span>Continue as {selectedStudentLevel === 'school' ? 'School' : selectedStudentLevel === 'college' ? 'College' : 'University'} Student</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* OFFICE WORKER / PROFESSIONAL TRACK */}
        <div className="bg-white rounded-3xl border-2 border-indigo-200 hover:border-indigo-500 shadow-lg shadow-indigo-500/5 transition-all p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />

          <div className="relative z-10 space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600">Track 2</span>
                <h3 className="text-xl font-black text-slate-900">I am an Office Worker / Pro</h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Working in tech, design, marketing, or management? Build innovative side-projects, mentor hackathon teams, or partner with ambitious builders.
            </p>

            <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-700 space-y-1.5">
              <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                <span>Tailored for Working Professionals</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Highlight your company experience, industry specialization, flexible weekend hours, and leadership or mentorship capabilities.
              </p>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-500 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Weekend & part-time sprint availability matching</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Showcase corporate or startup production experience</span>
              </li>
            </ul>
          </div>

          <div className="relative z-10 pt-6">
            <button
              type="button"
              onClick={() => handleSelectRole('professional')}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01]"
            >
              <span>Continue as Office Worker / Pro</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ORGANIZER CALLOUT */}
      <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Hosting a Hackathon or Innovation Challenge?</div>
            <div className="text-[11px] text-slate-500">Manage participant signups, monitor team formation, and track live statistics.</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleSelectRole('organizer')}
          className="text-xs font-bold text-purple-700 hover:text-purple-800 bg-white hover:bg-purple-50 px-3.5 py-1.5 rounded-xl border border-purple-200 transition-all shrink-0"
        >
          Organizer Signup →
        </button>
      </div>
    </div>
  );
}

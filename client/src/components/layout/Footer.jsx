import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
                <Users className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-slate-900">
                Skill<span className="text-brand-600">Sangam</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              Find the right teammates. Build better projects. Intelligent, transparent skill-based matchmaking for hackathons, academic capstones, and student innovation teams.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Smart India Hackathon • HackIndia • Campus Innovation</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/projects" className="hover:text-brand-600 transition-colors">
                  Explore Projects
                </Link>
              </li>
              <li>
                <Link to="/projects/new" className="hover:text-brand-600 transition-colors">
                  Create a Project
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-600 transition-colors">
                  Matching Algorithm
                </Link>
              </li>
              <li>
                <Link to="/organizer" className="hover:text-brand-600 transition-colors">
                  Organizer Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Target Domains */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Popular Domains</h4>
            <div className="flex flex-wrap gap-1.5">
              {['AgriTech', 'FinTech', 'HealthTech', 'AI/ML', 'Smart City', 'Cybersecurity', 'EdTech', 'ClimateTech'].map(
                (d) => (
                  <span
                    key={d}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200"
                  >
                    {d}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SkillSangam. Built for high-impact interdisciplinary collaboration.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Indian Hackathons
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

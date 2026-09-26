import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, Trophy, ArrowRight, Check } from 'lucide-react';
import Badge from '../common/Badge';
import MatchScoreGauge from '../common/MatchScoreGauge';
import JoinRequestModal from './JoinRequestModal';
import { useAuth } from '../../context/AuthContext';

export default function ProjectCard({ project, onUpdate }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  const isOwner = project.is_owner || project.owner_id === user?.id;
  const isMember = project.is_member;
  const hasRequested = project.has_pending_request;
  const isFull = Number(project.current_team_size) >= Number(project.max_team_size);

  const handleJoinClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setRequestModalOpen(true);
  };

  return (
    <>
      <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between p-5 sm:p-6">
        <div>
          {/* Header Row: Domain, Event, Match Score */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="brand">{project.domain_name || 'General'}</Badge>
              {project.event_name && (
                <Badge variant="purple" className="flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-purple-600" />
                  <span className="truncate max-w-[150px]">{project.event_name}</span>
                </Badge>
              )}
            </div>

            {project.match && (
              <MatchScoreGauge match={project.match} compact={true} />
            )}
          </div>

          {/* Project Title */}
          <Link to={`/projects/${project.id}`} className="block group-hover:text-brand-600 transition-colors">
            <h3 className="font-extrabold text-lg text-slate-900 leading-snug line-clamp-1 mb-2">
              {project.title}
            </h3>
          </Link>

          {/* Short description */}
          <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed">
            {project.short_description || project.description}
          </p>

          {/* Required Roles & Skills */}
          <div className="space-y-2.5 mb-5">
            {/* Required Roles */}
            {Array.isArray(project.required_roles) && project.required_roles.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Looking for:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.required_roles.map((r, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {typeof r === 'string' ? r : r.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Required Skills */}
            {Array.isArray(project.required_skills) && project.required_skills.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Skills:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.required_skills.slice(0, 5).map((sk, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-brand-50/60 text-brand-700 border border-brand-100"
                    >
                      {typeof sk === 'string' ? sk : sk.name}
                    </span>
                  ))}
                  {project.required_skills.length > 5 && (
                    <span className="text-[11px] text-slate-400 font-medium self-center">
                      +{project.required_skills.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Meta & Action */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Team: {project.current_team_size ?? 1} / {project.max_team_size}
              </span>
            </span>

            {project.start_date && (
              <span className="hidden sm:flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </span>
            )}
          </div>

          {/* Action button */}
          <div className="w-full sm:w-auto">
            {isOwner ? (
              <Link
                to={`/projects/${project.id}/team`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
              >
                <span>Manage Team</span>
              </Link>
            ) : isMember ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs">
                <Check className="w-3.5 h-3.5" />
                <span>Joined</span>
              </span>
            ) : hasRequested ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-xs">
                <span>Request Pending</span>
              </span>
            ) : isFull ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 text-slate-500 font-semibold text-xs">
                <span>Team Full</span>
              </span>
            ) : (
              <button
                onClick={handleJoinClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm shadow-brand-500/20 transition-all hover:shadow"
              >
                <span>Request to Join</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Join Request Modal */}
      <JoinRequestModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        project={project}
        onSuccess={() => {
          setRequestModalOpen(false);
          if (onUpdate) onUpdate();
        }}
      />
    </>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, Clock, MapPin, Sparkles, Send, Check } from 'lucide-react';
import Badge from '../common/Badge';
import MatchScoreGauge from '../common/MatchScoreGauge';
import InviteModal from './InviteModal';

export default function CandidateCard({ candidate, projectId, projectRoles = [], onUpdate }) {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const hasPendingInvitation = candidate.hasPendingInvitation;
  const hasPendingRequest = candidate.hasPendingRequest;

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-sm p-5 sm:p-6 flex flex-col justify-between transition-all duration-200">
        <div>
          {/* Top Row: User Avatar, Name, Institute, Match Score */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-100 to-indigo-100 text-brand-700 border border-brand-200 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                {candidate.profile_image_url ? (
                  <img src={candidate.profile_image_url} alt={candidate.name} className="w-full h-full object-cover" />
                ) : (
                  candidate.name?.charAt(0) || 'U'
                )}
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900 leading-snug">
                  {candidate.name}
                </h4>
                <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
                  {candidate.institute_or_company || candidate.location || 'Student'}
                </p>
                {candidate.year_or_experience && (
                  <span className="text-[11px] text-slate-400 block">
                    {candidate.year_or_experience}
                  </span>
                )}
              </div>
            </div>

            {candidate.match && (
              <MatchScoreGauge match={candidate.match} compact={true} />
            )}
          </div>

          {/* Bio */}
          {candidate.bio && (
            <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              "{candidate.bio}"
            </p>
          )}

          {/* Preferred Roles & Skills */}
          <div className="space-y-3 mb-4">
            {/* Preferred Roles */}
            {Array.isArray(candidate.preferred_roles) && candidate.preferred_roles.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Preferred Roles
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.preferred_roles.map((r, i) => (
                    <Badge key={i} variant="purple" size="xs">
                      {typeof r === 'string' ? r : r.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Skills with proficiency */}
            {Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Skills & Proficiency
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.slice(0, 6).map((sk, i) => {
                    const skName = typeof sk === 'string' ? sk : sk.name;
                    const isMatched = candidate.match?.matchedSkills?.some(
                      m => m.toLowerCase() === skName.toLowerCase()
                    );
                    return (
                      <span
                        key={i}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                          isMatched
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {isMatched ? '✓ ' : ''}{skName}
                        {sk.proficiency && (
                          <span className="text-[9px] text-slate-400 ml-1">
                            ({sk.proficiency.charAt(0)})
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Meta & Action */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            {candidate.availability ? (
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{candidate.availability.hours_per_week}h/week</span>
              </span>
            ) : (
              <span className="text-slate-400">Flexible availability</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/users/${candidate.id}`}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 transition-colors"
            >
              View Profile
            </Link>

            {hasPendingInvitation ? (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 font-semibold text-xs">
                <Check className="w-3.5 h-3.5" />
                <span>Invited</span>
              </span>
            ) : hasPendingRequest ? (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-xs">
                <span>Applied to Join</span>
              </span>
            ) : (
              <button
                onClick={() => setInviteModalOpen(true)}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition-all"
              >
                <Send className="w-3 h-3" />
                <span>Invite</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        candidate={candidate}
        projectId={projectId}
        projectRoles={projectRoles}
        onSuccess={() => {
          setInviteModalOpen(false);
          if (onUpdate) onUpdate();
        }}
      />
    </>
  );
}

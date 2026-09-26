import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import Modal from './Modal';

export default function MatchScoreGauge({ match, compact = false, showBreakdownButton = true }) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!match) return null;

  const score = match.matchScore ?? 0;

  // Determine badge color gradient based on score tier
  let colorBadge = 'bg-slate-100 text-slate-700 border-slate-200';
  let pillColor = 'text-slate-600 bg-slate-50 border-slate-200';
  let barColor = 'bg-slate-400';

  if (score >= 80) {
    colorBadge = 'bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-500/20';
    pillColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    barColor = 'bg-emerald-500';
  } else if (score >= 60) {
    colorBadge = 'bg-brand-600 text-white border-brand-700 shadow-sm shadow-brand-500/20';
    pillColor = 'text-brand-700 bg-brand-50 border-brand-200';
    barColor = 'bg-brand-500';
  } else if (score >= 40) {
    colorBadge = 'bg-amber-500 text-white border-amber-600';
    pillColor = 'text-amber-700 bg-amber-50 border-amber-200';
    barColor = 'bg-amber-500';
  }

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-1.5">
          <span
            onClick={(e) => {
              if (showBreakdownButton) {
                e.stopPropagation();
                setModalOpen(true);
              }
            }}
            title="Click to view transparent match breakdown"
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer hover:opacity-90 ${pillColor}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{score}% Match</span>
          </span>
        </div>

        {/* Match Breakdown Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Match Compatibility Breakdown"
        >
          <MatchBreakdownContent match={match} />
        </Modal>
      </>
    );
  }

  // Expanded View
  return (
    <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`px-3 py-1.5 rounded-xl font-extrabold text-base border flex items-center gap-1.5 ${colorBadge}`}>
            <Sparkles className="w-4 h-4" />
            <span>{score}% Match</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">Deterministic Score</span>
        </div>
      </div>

      <MatchBreakdownContent match={match} />
    </div>
  );
}

function MatchBreakdownContent({ match }) {
  const score = match.matchScore ?? 0;

  return (
    <div className="space-y-4 text-left">
      {/* Percentage Bar */}
      <div>
        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <span>Overall Compatibility</span>
          <span>{score}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-brand-500' : 'bg-amber-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* 4 Weights Breakdown Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-slate-400 font-medium">Skills (60% weight)</div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">{match.skillScore ?? 0}%</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-slate-400 font-medium">Domain (20% weight)</div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">{match.domainScore ?? 0}%</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-slate-400 font-medium">Availability (10%)</div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">{match.availabilityScore ?? 0}%</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-slate-400 font-medium">Role Fit (10%)</div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">{match.roleScore ?? 0}%</div>
        </div>
      </div>

      {/* Explainable Reasons */}
      {Array.isArray(match.reasons) && match.reasons.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-brand-600" />
            <span>Why this matches</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {match.reasons.map((r, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Matched skills pill list */}
      {Array.isArray(match.matchedSkills) && match.matchedSkills.length > 0 && (
        <div className="pt-1">
          <div className="text-[11px] font-semibold text-slate-500 mb-1.5">Matched Required Skills:</div>
          <div className="flex flex-wrap gap-1.5">
            {match.matchedSkills.map((sk) => (
              <span
                key={sk}
                className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium"
              >
                ✓ {sk}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import {
  Users,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Bot,
  Trash2,
  Edit2,
  ArrowLeft,
  Lock,
  Unlock,
  MessageSquare
} from 'lucide-react';

export default function TeamManagementPage() {
  const { id: projectId } = useParams();
  const { user, showToast } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiGapAnalysis, setAiGapAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Edit role modal state
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [activeMember, setActiveMember] = useState(null);
  const [newRoleName, setNewRoleName] = useState('');

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/${projectId}/team`);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load team data:', err);
      showToast('Failed to load project team', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [projectId]);

  const isOwner = data?.project?.owner_id === user?.id;

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!activeMember || !newRoleName.trim()) return;

    try {
      await api.put(`/projects/${projectId}/team/${activeMember.user_id}`, {
        roleInProject: newRoleName.trim()
      });
      showToast(`Updated role for ${activeMember.name}!`);
      setRoleModalOpen(false);
      fetchTeamData();
    } catch (err) {
      showToast(err.message || 'Failed to update member role', 'error');
    }
  };

  const handleRemoveMember = async (userId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this team?`)) {
      return;
    }

    try {
      await api.delete(`/projects/${projectId}/team/${userId}`);
      showToast(`${memberName} removed from project`, 'info');
      fetchTeamData();
    } catch (err) {
      showToast(err.message || 'Failed to remove member', 'error');
    }
  };

  const handleToggleRecruitment = async () => {
    const currentStatus = data?.project?.status;
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';

    try {
      await api.put(`/projects/${projectId}`, { status: newStatus });
      showToast(`Project recruitment is now ${newStatus.toUpperCase()}`);
      fetchTeamData();
    } catch (err) {
      showToast(err.message || 'Failed to toggle status', 'error');
    }
  };

  // AI Team Gap Analysis
  const handleRunAiGapAnalysis = async () => {
    setAiLoading(true);
    try {
      const res = await api.post('/ai/analyze-gaps', { projectId });
      if (res.success && res.data) {
        setAiGapAnalysis(res.data);
        showToast('AI team balance analysis complete!');
      }
    } catch (err) {
      showToast(err.message || 'Failed to run gap analysis', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading team members and role statuses..." />;

  const { project, members = [], roleBreakdown = [], totalMembers = 0, maxTeamSize = 4 } = data || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to={`/projects/${projectId}`}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Project Overview</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-brand-600" />
              <span>Team Roster & Vacancies</span>
            </h1>
            <Badge variant={project?.status === 'open' ? 'success' : 'default'}>
              {project?.status?.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Project: <strong>{project?.title}</strong> ({totalMembers} / {maxTeamSize} members filled)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              onClick={handleToggleRecruitment}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                project?.status === 'open'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
            >
              {project?.status === 'open' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{project?.status === 'open' ? 'Close Recruitment' : 'Re-open Recruitment'}</span>
            </button>
          )}

          <Link
            to="/messages"
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs font-bold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Project Chat</span>
          </Link>
        </div>
      </div>

      {/* REQUIRED ROLES STATUS (FILLED VS OPEN) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-600" />
              <span>Required Role Vacancy Status</span>
            </h2>
            <p className="text-xs text-slate-500">Track which discipline spots have been claimed</p>
          </div>

          <button
            onClick={handleRunAiGapAnalysis}
            disabled={aiLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs border border-purple-200 transition-colors"
          >
            <Bot className="w-3.5 h-3.5 text-purple-600" />
            <span>{aiLoading ? 'Reviewing...' : '✨ Run AI Team Balance Review'}</span>
          </button>
        </div>

        {/* Roles Status List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {roleBreakdown.map((r) => {
            const isFilled = r.status === 'FILLED';
            return (
              <div
                key={r.roleId}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                  isFilled
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50/60 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isFilled ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{r.roleName}</div>
                    <div className="text-[11px] text-slate-500">
                      {r.filled} of {r.needed} needed filled
                    </div>
                  </div>
                </div>

                <span
                  className={`font-black uppercase tracking-wider text-[11px] px-2.5 py-1 rounded-full border ${
                    isFilled
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {r.status}
                </span>
              </div>
            );
          })}
        </div>

        {/* AI GAP ANALYSIS CARD (IF RUN) */}
        {aiGapAnalysis && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-brand-50 border border-purple-200 text-xs space-y-2.5 mt-4">
            <div className="flex items-center gap-2 font-bold text-purple-900 text-sm">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>SkillSangam AI Team Balance Assessment</span>
            </div>
            <p className="text-slate-700 leading-relaxed">{aiGapAnalysis.teamBalanceSummary}</p>

            {aiGapAnalysis.recommendations?.length > 0 && (
              <div className="pt-2 border-t border-purple-200/50">
                <span className="font-bold text-purple-900 block mb-1">Recommended Next Steps:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {aiGapAnalysis.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MEMBERS ROSTER */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-600" />
          <span>Active Teammates ({members.length})</span>
        </h2>

        <div className="divide-y divide-slate-100">
          {members.map((m) => {
            const isMemberOwner = m.is_owner || m.user_id === project?.owner_id;
            return (
              <div
                key={m.user_id}
                className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-100 to-indigo-100 text-brand-700 border border-brand-200 flex items-center justify-center font-bold text-sm uppercase">
                    {m.profile_image_url ? (
                      <img src={m.profile_image_url} alt={m.name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      m.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/users/${m.user_id}`}
                        className="font-bold text-slate-900 hover:text-brand-600 transition-colors"
                      >
                        {m.name}
                      </Link>
                      {isMemberOwner && (
                        <Badge variant="brand" size="xs">
                          Project Owner
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">{m.institute_or_company || m.email}</div>
                    <div className="text-xs font-semibold text-purple-700 mt-0.5">
                      Role in Project: <span className="font-bold">{m.role_in_project || 'Team Member'}</span>
                    </div>
                  </div>
                </div>

                {/* Owner Actions */}
                {isOwner && (
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        setActiveMember(m);
                        setNewRoleName(m.role_in_project || '');
                        setRoleModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Assign Role</span>
                    </button>

                    {!isMemberOwner && (
                      <button
                        onClick={() => handleRemoveMember(m.user_id, m.name)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                        title="Remove member from team"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Role Assignment Modal */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title={`Assign Project Role: ${activeMember?.name}`}
      >
        <form onSubmit={handleUpdateRole} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Project Position Title
            </label>
            <input
              type="text"
              required
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g. Lead Backend Engineer, UI/UX Designer, AI Specialist..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm font-semibold"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRoleModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm"
            >
              Save Role
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

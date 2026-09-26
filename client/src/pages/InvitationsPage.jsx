import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import confetti from 'canvas-confetti';
import { Send, CheckCircle2, XCircle, ArrowRight, Clock, Trophy, Sparkles } from 'lucide-react';

export default function InvitationsPage() {
  const { user, showToast } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState([]);

  const loadInvitations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/invitations');
      if (res.success && res.data) {
        setInvitations(res.data.invitations || []);
      }
    } catch (err) {
      console.error('Failed to load invitations:', err);
      showToast('Failed to load invitations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, [user?.id]);

  const handleUpdateStatus = async (invitationId, status) => {
    try {
      await api.put(`/invitations/${invitationId}`, { status });
      if (status === 'accepted') {
        showToast('Invitation accepted! You are now a team member.');
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } else {
        showToast(`Invitation ${status}`, 'info');
      }
      loadInvitations();
    } catch (err) {
      showToast(err.message || 'Failed to update invitation', 'error');
    }
  };

  if (loading) return <LoadingSpinner message="Loading team invitations..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Send className="w-6 h-6 text-brand-600" />
          <span>Team Invitations</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Invitations extended to you by project founders seeking your specific skills
        </p>
      </div>

      {invitations.length > 0 ? (
        <div className="space-y-3">
          {invitations.map((inv) => {
            const isPending = inv.status === 'pending';
            return (
              <div
                key={inv.id}
                className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/projects/${inv.project_id}`}
                      className="font-extrabold text-slate-900 text-base hover:text-brand-600"
                    >
                      {inv.project_title}
                    </Link>
                    <Badge variant="brand">{inv.domain_name}</Badge>
                    <Badge
                      variant={
                        inv.status === 'accepted'
                          ? 'success'
                          : inv.status === 'rejected'
                          ? 'danger'
                          : 'purple'
                      }
                      size="xs"
                    >
                      {inv.status}
                    </Badge>
                  </div>

                  <div className="text-xs text-slate-600">
                    Invited to join as <span className="font-bold text-purple-700">{inv.role_name || 'Team Member'}</span> by{' '}
                    <span className="font-semibold text-slate-800">{inv.inviter_name}</span> ({inv.inviter_email})
                  </div>

                  {inv.message && (
                    <p className="text-xs text-slate-700 bg-purple-50/50 p-2.5 rounded-xl border border-purple-100 italic">
                      "{inv.message}"
                    </p>
                  )}

                  <div className="text-[11px] text-slate-400">
                    Received {new Date(inv.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link
                    to={`/projects/${inv.project_id}`}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-700"
                  >
                    View Project
                  </Link>

                  {isPending ? (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(inv.id, 'accepted')}
                        className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept & Join</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(inv.id, 'rejected')}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                      >
                        Decline
                      </button>
                    </>
                  ) : inv.status === 'accepted' ? (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Joined Team</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Declined</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Send}
          title="No invitations received yet"
          description="When project owners discover your profile and invite you to join their hackathon teams, invitations will show up here."
          actionText="Explore Projects to Apply"
          actionLink="/projects"
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import { Inbox, CheckCircle2, XCircle, ArrowRight, Clock, User, Sparkles } from 'lucide-react';

export default function RequestsPage() {
  const { user, showToast } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent'

  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // 1. Fetch requests sent by current user
      const sentRes = await api.get('/requests/my');
      setSentRequests(sentRes.data?.requests || []);

      // 2. Fetch projects owned by current user to fetch requests received
      const myProjectsRes = await api.get(`/users/${user.id}/projects`);
      const owned = (myProjectsRes.data?.projects || []).filter((p) => p.is_owner);

      let allReceived = [];
      for (const p of owned) {
        const reqs = await api.get(`/projects/${p.id}/requests`).catch(() => ({ data: { requests: [] } }));
        if (reqs.data?.requests) {
          allReceived.push(
            ...reqs.data.requests.map((r) => ({
              ...r,
              project_title: p.title,
            }))
          );
        }
      }
      setReceivedRequests(allReceived);

      // If user has no received requests but has sent requests, default to sent tab
      if (allReceived.length === 0 && (sentRes.data?.requests || []).length > 0) {
        setActiveTab('sent');
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
      showToast('Failed to load join requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user?.id]);

  const handleUpdateStatus = async (requestId, status) => {
    try {
      await api.put(`/requests/${requestId}`, { status });
      showToast(`Request ${status} successfully!`);
      loadRequests();
    } catch (err) {
      showToast(err.message || `Failed to update request`, 'error');
    }
  };

  if (loading) return <LoadingSpinner message="Loading join requests..." />;

  const pendingReceivedCount = receivedRequests.filter((r) => r.status === 'pending').length;
  const pendingSentCount = sentRequests.filter((r) => r.status === 'pending').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Inbox className="w-6 h-6 text-brand-600" />
          <span>Join Requests</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage applicant join requests for your projects and track your outgoing applications
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('received')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'received'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Requests for My Projects</span>
          {pendingReceivedCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs font-black">
              {pendingReceivedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'sent'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>My Applications to Projects</span>
          {pendingSentCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-black">
              {pendingSentCount}
            </span>
          )}
        </button>
      </div>

      {/* RECEIVED REQUESTS TAB */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          {receivedRequests.length > 0 ? (
            <div className="space-y-3">
              {receivedRequests.map((req) => {
                const isPending = req.status === 'pending';
                return (
                  <div
                    key={req.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/users/${req.user_id}`}
                          className="font-extrabold text-slate-900 text-base hover:text-brand-600"
                        >
                          {req.applicant_name}
                        </Link>
                        <span className="text-xs text-slate-400">• {req.institute_or_company || 'Candidate'}</span>
                        <Badge
                          variant={
                            req.status === 'accepted'
                              ? 'success'
                              : req.status === 'rejected'
                              ? 'danger'
                              : 'warning'
                          }
                          size="xs"
                        >
                          {req.status}
                        </Badge>
                      </div>

                      <div className="text-xs text-slate-600 font-medium">
                        Applied to join: <span className="font-bold text-slate-800">{req.project_title}</span>
                      </div>

                      {req.message && (
                        <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                          "{req.message}"
                        </p>
                      )}

                      <div className="text-[11px] text-slate-400">
                        Received {new Date(req.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Link
                        to={`/users/${req.user_id}`}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                      >
                        Profile
                      </Link>

                      {isPending && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'accepted')}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'rejected')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                          >
                            <span>Decline</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No join requests received"
              description="When other students or professionals apply to join your projects, their applications will appear here."
            />
          )}
        </div>
      )}

      {/* SENT REQUESTS TAB */}
      {activeTab === 'sent' && (
        <div className="space-y-4">
          {sentRequests.length > 0 ? (
            <div className="space-y-3">
              {sentRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/projects/${req.project_id}`}
                        className="font-extrabold text-slate-900 text-base hover:text-brand-600"
                      >
                        {req.project_title}
                      </Link>
                      <Badge
                        variant={
                          req.status === 'accepted'
                            ? 'success'
                            : req.status === 'rejected'
                            ? 'danger'
                            : 'warning'
                        }
                        size="xs"
                      >
                        {req.status}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-500">
                      Project Owner: <span className="font-bold text-slate-700">{req.owner_name}</span> ({req.owner_email})
                    </div>

                    {req.message && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                        Your message: "{req.message}"
                      </p>
                    )}

                    <div className="text-[11px] text-slate-400">
                      Submitted on {new Date(req.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Link
                      to={`/projects/${req.project_id}`}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700"
                    >
                      <span>View Project</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {req.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'cancelled')}
                        className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="You haven't requested to join any projects"
              description="Explore open projects seeking your skills and submit a join request to start collaborating."
              actionText="Explore Projects"
              actionLink="/projects"
            />
          )}
        </div>
      )}
    </div>
  );
}

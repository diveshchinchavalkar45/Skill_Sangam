import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import ProjectCard from '../components/projects/ProjectCard';
import CandidateCard from '../components/candidates/CandidateCard';
import EmptyState from '../components/common/EmptyState';
import {
  Sparkles,
  Compass,
  PlusCircle,
  Inbox,
  Send,
  Users,
  Trophy,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Layers
} from 'lucide-react';

export default function DashboardPage() {
  const { user, showToast } = useAuth();
  const [loading, setLoading] = useState(true);

  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [recommendedCandidates, setRecommendedCandidates] = useState([]);
  const [selectedOwnerProject, setSelectedOwnerProject] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [recProjRes, myProjRes, reqRes, invRes] = await Promise.all([
        api.get('/recommendations/projects?limit=4').catch(() => ({ data: { projects: [] } })),
        api.get(`/users/${user.id}/projects`).catch(() => ({ data: { projects: [] } })),
        api.get('/requests/my').catch(() => ({ data: { requests: [] } })),
        api.get('/invitations').catch(() => ({ data: { invitations: [] } }))
      ]);

      const myProjs = myProjRes.data?.projects || [];
      setRecommendedProjects(recProjRes.data?.projects || []);
      setMyProjects(myProjs);
      setPendingRequests(reqRes.data?.requests || []);
      setPendingInvitations(invRes.data?.invitations || []);

      // If user owns a project, fetch candidate recommendations for their first project
      const ownedProject = myProjs.find((p) => p.is_owner);
      if (ownedProject) {
        setSelectedOwnerProject(ownedProject);
        const candRes = await api.get(`/projects/${ownedProject.id}/recommended-candidates?limit=3`).catch(() => null);
        setRecommendedCandidates(candRes?.data?.candidates || []);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const handleAcceptRequest = async (requestId) => {
    try {
      await api.put(`/requests/${requestId}`, { status: 'accepted' });
      showToast('Join request accepted! New member added to your team.');
      loadDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to accept request', 'error');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.put(`/requests/${requestId}`, { status: 'rejected' });
      showToast('Request rejected', 'info');
      loadDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to reject request', 'error');
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      await api.put(`/invitations/${invitationId}`, { status: 'accepted' });
      showToast('Invitation accepted! You have joined the project team.');
      loadDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to accept invitation', 'error');
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    try {
      await api.put(`/invitations/${invitationId}`, { status: 'rejected' });
      showToast('Invitation declined', 'info');
      loadDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to decline invitation', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Assembling your personalized dashboard..." />;
  }

  const completion = user?.completionPercentage ?? 50;

  return (
    <div className="space-y-8 pb-12">
      {/* WELCOME BANNER & STATS */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-brand-500/30 text-brand-200 border border-brand-400/20">
                {user?.user_type}
              </span>
              <span className="text-xs text-slate-300">• {user?.institute_or_company || 'Active Builder'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              SkillSangam has analyzed your skills and matched you with compatible projects and interdisciplinary teammates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/projects"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow transition-all"
            >
              <Compass className="w-4 h-4 text-brand-600" />
              <span>Explore Projects</span>
            </Link>
            <Link
              to="/projects/new"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Project</span>
            </Link>
          </div>
        </div>

        {/* Profile Completion indicator */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-28 sm:w-36 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="text-slate-200 font-bold">Profile Strength: {completion}%</span>
          </div>
          {completion < 100 && (
            <Link to="/profile/edit" className="text-brand-300 hover:text-white font-semibold underline text-xs">
              Complete your profile to unlock higher accuracy matches →
            </Link>
          )}
        </div>
      </div>

      {/* PENDING NOTIFICATIONS (Invitations & Requests) */}
      {(pendingInvitations.some((i) => i.status === 'pending') || pendingRequests.some((r) => r.status === 'pending')) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Incoming Invitations */}
          {pendingInvitations.filter((i) => i.status === 'pending').length > 0 && (
            <div className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-purple-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-purple-600" />
                  <span>Project Invitations Received</span>
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-800">
                  {pendingInvitations.filter((i) => i.status === 'pending').length}
                </span>
              </div>

              <div className="space-y-2">
                {pendingInvitations
                  .filter((i) => i.status === 'pending')
                  .slice(0, 2)
                  .map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 bg-white rounded-xl border border-purple-100 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{inv.project_title}</div>
                        <div className="text-slate-500">
                          Role: <span className="font-semibold text-purple-700">{inv.role_name || 'Member'}</span> • from {inv.inviter_name}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleAcceptInvitation(inv.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectInvitation(inv.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Pending Requests sent by me */}
          {pendingRequests.filter((r) => r.status === 'pending').length > 0 && (
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-amber-900 flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-amber-600" />
                  <span>My Active Join Requests</span>
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                  {pendingRequests.filter((r) => r.status === 'pending').length}
                </span>
              </div>

              <div className="space-y-2">
                {pendingRequests
                  .filter((r) => r.status === 'pending')
                  .slice(0, 2)
                  .map((req) => (
                    <div
                      key={req.id}
                      className="p-3 bg-white rounded-xl border border-amber-100 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{req.project_title}</div>
                        <div className="text-slate-500">
                          Owner: {req.owner_name} • Submitted {new Date(req.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant="warning" size="xs">
                        Pending Review
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RECOMMENDED PROJECTS FOR USER */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <span>Recommended Projects for You</span>
            </h2>
            <p className="text-xs text-slate-500">Sorted by transparent 4-pillar compatibility score</p>
          </div>
          <Link
            to="/projects"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedProjects.map((proj) => (
              <ProjectCard key={proj.id} project={proj} onUpdate={loadDashboardData} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No recommended projects yet"
            description="Add your skills and domains in your profile to see instant project matches."
            actionText="Setup Skills"
            actionLink="/profile/edit"
          />
        )}
      </section>

      {/* RECOMMENDED CANDIDATES (IF OWNER HAS PROJECTS) */}
      {selectedOwnerProject && (
        <section className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Recommended Candidates for "{selectedOwnerProject.title}"</span>
              </h2>
              <p className="text-xs text-slate-500">Candidates with the highest skill & domain overlap</p>
            </div>
            <Link
              to={`/projects/${selectedOwnerProject.id}/candidates`}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Explore All Candidates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recommendedCandidates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedCandidates.map((cand) => (
                <CandidateCard
                  key={cand.id}
                  candidate={cand}
                  projectId={selectedOwnerProject.id}
                  onUpdate={loadDashboardData}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">All registered candidates have already joined or been invited.</p>
          )}
        </section>
      )}

      {/* MY PROJECTS & TEAMS */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Projects & Teams</h2>
          <Link
            to="/projects/new"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>+ Create Another Project</span>
          </Link>
        </div>

        {myProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myProjects.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="brand">{p.domain_name}</Badge>
                    <Badge variant={p.status === 'open' ? 'success' : 'default'} size="xs">
                      {p.status}
                    </Badge>
                  </div>
                  <h4 className="font-extrabold text-base text-slate-900 line-clamp-1">{p.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{p.short_description || p.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">
                    {p.is_owner ? 'Owner' : p.role_in_project || 'Member'}
                  </span>
                  <Link
                    to={`/projects/${p.id}/team`}
                    className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <span>Manage Team</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="You haven't joined or created any projects"
            description="Explore open projects looking for teammates or post your own project idea."
            actionText="Explore Projects"
            actionLink="/projects"
          />
        )}
      </section>
    </div>
  );
}

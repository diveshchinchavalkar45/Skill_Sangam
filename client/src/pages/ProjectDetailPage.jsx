import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import MatchScoreGauge from '../components/common/MatchScoreGauge';
import JoinRequestModal from '../components/projects/JoinRequestModal';
import {
  Calendar,
  Users,
  MapPin,
  Trophy,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Briefcase,
  Edit,
  Send,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/${id}`);
      if (res.success && res.data?.project) {
        setProject(res.data.project);
      }
    } catch (err) {
      console.error('Failed to fetch project:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id, user?.id]);

  if (loading) return <LoadingSpinner message="Loading project requirements..." />;

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-slate-800">Project Not Found</h2>
        <Link to="/projects" className="mt-4 inline-block font-semibold text-brand-600">
          Return to Projects
        </Link>
      </div>
    );
  }

  const isOwner = project.is_owner || project.owner_id === user?.id;
  const isMember = project.is_member;
  const hasRequested = project.has_pending_request;
  const isFull = Number(project.current_team_size) >= Number(project.max_team_size);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          <span>← Back to Explore Projects</span>
        </Link>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Link
              to={`/projects/${id}/edit`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </Link>
            <Link
              to={`/projects/${id}/candidates`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recommended Candidates</span>
            </Link>
            <Link
              to={`/projects/${id}/team`}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Manage Team</span>
            </Link>
          </div>
        )}
      </div>

      {/* Main Project Card Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">{project.domain_name}</Badge>
              {project.event_name && (
                <Badge variant="purple" className="flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-purple-600" />
                  <span>{project.event_name}</span>
                </Badge>
              )}
              <Badge variant={project.status === 'open' ? 'success' : 'default'}>
                Status: {project.status.toUpperCase()}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">
              {project.title}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Led by <span className="font-bold text-slate-700">{project.owner_name}</span> • Posted {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Match Score Gauge Header */}
          {project.match && !isOwner && (
            <div className="shrink-0">
              <MatchScoreGauge match={project.match} compact={false} />
            </div>
          )}
        </div>

        {/* Short & Detailed Descriptions */}
        <div className="space-y-4 pt-2">
          {project.short_description && (
            <p className="text-base font-semibold text-slate-800 leading-relaxed bg-brand-50/40 p-4 rounded-2xl border border-brand-100">
              {project.short_description}
            </p>
          )}

          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {project.description}
          </div>
        </div>

        {/* Key Logistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-400 font-medium mb-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </div>
            <div className="font-bold text-slate-800">
              {new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' → '}
              {new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-400 font-medium mb-0.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>Team Capacity</span>
            </div>
            <div className="font-bold text-slate-800">
              {project.current_team_size} / {project.max_team_size} Members
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-400 font-medium mb-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Commitment</span>
            </div>
            <div className="font-bold text-slate-800">
              {project.hours_per_week || 15} hours / week
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-400 font-medium mb-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Location / Mode</span>
            </div>
            <div className="font-bold text-slate-800 truncate">
              {project.location || 'Hybrid / Remote'}
            </div>
          </div>
        </div>

        {/* Join CTA Row */}
        {!isOwner && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              {isFull ? 'This project has reached capacity.' : 'Positions are currently open for application.'}
            </div>

            {isMember ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>You are a Member of this Project</span>
              </span>
            ) : hasRequested ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Join Request Pending Approval</span>
              </span>
            ) : isFull ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs">
                <span>Team Full</span>
              </span>
            ) : (
              <button
                onClick={() => {
                  if (!isAuthenticated) navigate('/login');
                  else setRequestModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Request to Join Team</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid: Required Skills & Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Required Skills */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Required Skills</span>
          </h3>

          <div className="flex flex-wrap gap-2">
            {project.required_skills?.map((sk, i) => {
              const name = typeof sk === 'string' ? sk : sk.name;
              const isMatched = project.match?.matchedSkills?.includes(name);

              return (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                    isMatched
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {isMatched && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Required Roles & Vacancies */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-purple-600" />
            <span>Target Roles</span>
          </h3>

          <div className="space-y-2">
            {project.required_roles?.map((r, i) => {
              const rName = typeof r === 'string' ? r : r.name;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <span className="font-bold text-slate-800">{rName}</span>
                  <Badge variant="purple" size="xs">
                    Needed
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CURRENT TEAM MEMBERS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-600" />
            <span>Current Team Roster ({project.members?.length || 1} members)</span>
          </h3>
          {(isOwner || isMember) && (
            <Link to="/messages" className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Open Project Chat</span>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {project.members?.map((m) => (
            <div
              key={m.user_id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs uppercase">
                  {m.profile_image_url ? (
                    <img src={m.profile_image_url} alt={m.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    m.name?.charAt(0) || 'U'
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{m.name}</div>
                  <div className="text-[11px] font-semibold text-purple-700">{m.role_in_project || 'Member'}</div>
                </div>
              </div>

              {m.user_id === project.owner_id && (
                <Badge variant="brand" size="xs">
                  Owner
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Join Request Modal */}
      <JoinRequestModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        project={project}
        onSuccess={() => {
          setRequestModalOpen(false);
          fetchProject();
        }}
      />
    </div>
  );
}

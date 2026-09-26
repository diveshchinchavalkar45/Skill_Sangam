import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import CandidateCard from '../components/candidates/CandidateCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { Sparkles, ArrowLeft, Users, Trophy } from 'lucide-react';
import Badge from '../components/common/Badge';

export default function CandidateRecommendationsPage() {
  const { id: projectId } = useParams();
  const { user, showToast } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const [projRes, candRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/recommended-candidates?limit=30`)
      ]);

      if (projRes.success && projRes.data?.project) {
        const p = projRes.data.project;
        if (p.owner_id !== user?.id) {
          showToast('Only the project owner can view recommended candidates', 'error');
          navigate(`/projects/${projectId}`);
          return;
        }
        setProject(p);
      }

      if (candRes.success && candRes.data) {
        setCandidates(candRes.data.candidates || []);
      }
    } catch (err) {
      console.error('Failed to load candidate recommendations:', err);
      showToast('Failed to load candidate recommendations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [projectId, user?.id]);

  if (loading) return <LoadingSpinner message="Calculating candidate match scores..." />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
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
              <Sparkles className="w-6 h-6 text-brand-600" />
              <span>Recommended Teammates</span>
            </h1>
            <Badge variant="brand">{project?.domain_name}</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Candidates for <strong>"{project?.title}"</strong> ranked by skill overlap, domain interest, and availability.
          </p>
        </div>

        <Link
          to={`/projects/${projectId}/team`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors shrink-0"
        >
          <Users className="w-4 h-4" />
          <span>View Team Status</span>
        </Link>
      </div>

      {/* Candidate Cards Grid */}
      {candidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {candidates.map((cand) => (
            <CandidateCard
              key={cand.id}
              candidate={cand}
              projectId={projectId}
              projectRoles={project?.required_roles || []}
              onUpdate={fetchRecommendations}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No candidates available right now"
          description="All active candidates who match this project's requirements have already been invited or joined your team."
          actionText="Manage Current Team"
          actionLink={`/projects/${projectId}/team`}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  User,
  MapPin,
  Building,
  Calendar,
  Clock,
  Edit3,
  Briefcase,
  Layers,
  Sparkles,
  Trophy,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const isMyProfile = !id || id === currentUser?.id;

  const fetchProfile = async () => {
    setLoading(true);
    try {
      if (isMyProfile) {
        const res = await api.get('/profile/me');
        if (res.success) {
          setProfile(res.data.profile);
        }
        const projRes = await api.get(`/users/${currentUser.id}/projects`).catch(() => null);
        setProjects(projRes?.data?.projects || []);
      } else {
        const res = await api.get(`/users/${id}`);
        if (res.success) {
          setProfile(res.data.profile);
          setProjects(res.data.projects || []);
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id, currentUser?.id]);

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-slate-800">Profile Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The requested user profile does not exist.</p>
        <Link to="/dashboard" className="mt-4 inline-block font-semibold text-brand-600">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const preferenceLabels = {
    looking_for_team: 'Looking for a Team',
    have_project: 'Has a Project Idea',
    open_to_both: 'Open to Both',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-brand-500/20 overflow-hidden shrink-0">
              {profile.profile_image_url ? (
                <img src={profile.profile_image_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                profile.name?.charAt(0) || 'U'
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{profile.name}</h1>
                <Badge variant={profile.user_type === 'professional' ? 'indigo' : 'brand'} size="xs" className="font-bold">
                  {profile.user_type === 'student'
                    ? (profile.education_level === 'school'
                        ? '🏫 School Student'
                        : profile.education_level === 'university'
                        ? '🏛️ University Student'
                        : '🎓 College Student')
                    : profile.user_type === 'professional'
                    ? '💼 Office Worker / Pro'
                    : '⚡ Hackathon Organizer'}
                </Badge>
                <Badge variant="purple" size="xs">
                  {preferenceLabels[profile.team_preference] || 'Open to Both'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                {profile.institute_or_company && (
                  <span className="flex items-center gap-1 text-slate-700">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{profile.institute_or_company}</span>
                  </span>
                )}
                {profile.year_or_experience && (
                  <span>{profile.year_or_experience}</span>
                )}
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{profile.location}, {profile.country || 'India'}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit Profile CTA */}
          {isMyProfile && (
            <Link
              to="/profile/edit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Link>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">About Me</h4>
            <p className="text-sm text-slate-700 leading-relaxed max-w-2xl">{profile.bio}</p>
          </div>
        )}

        {/* Profile Completion Bar (Only for current user) */}
        {isMyProfile && profile.completionPercentage !== undefined && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Profile Strength</span>
              <span>{profile.completionPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-500"
                style={{ width: `${profile.completionPercentage}%` }}
              />
            </div>
            {profile.completionPercentage < 100 && (
              <p className="text-[11px] text-slate-400 mt-1.5">
                Tip: Add your skills, target domains, and availability dates to get the most accurate match recommendations!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Grid: Skills & Domains & Availability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SKILLS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Skills & Proficiency</span>
            </h3>
            {isMyProfile && (
              <Link to="/profile/edit" className="text-xs font-bold text-brand-600 hover:underline">
                + Manage Skills
              </Link>
            )}
          </div>

          {Array.isArray(profile.skills) && profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((sk, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
                >
                  <span className="font-bold">{typeof sk === 'string' ? sk : sk.name}</span>
                  {sk.proficiency && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-brand-700">
                      {sk.proficiency}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No skills added yet.</p>
          )}
        </div>

        {/* DOMAINS & ROLES */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          {/* Domains */}
          <div>
            <h3 className="font-extrabold text-base text-slate-900 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Target Domains</span>
            </h3>
            {Array.isArray(profile.domains) && profile.domains.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.domains.map((d, i) => (
                  <Badge key={i} variant="brand">
                    {typeof d === 'string' ? d : d.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No domains selected.</p>
            )}
          </div>

          {/* Preferred Roles */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900 mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-600" />
              <span>Preferred Roles</span>
            </h3>
            {Array.isArray(profile.preferred_roles) && profile.preferred_roles.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.preferred_roles.map((r, i) => (
                  <Badge key={i} variant="purple">
                    {typeof r === 'string' ? r : r.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No preferred roles defined.</p>
            )}
          </div>
        </div>
      </div>

      {/* AVAILABILITY CALENDAR & HOURS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>Sprint Availability</span>
        </h3>

        {profile.availability ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                Calendar Timeline
              </span>
              <div className="text-sm font-black text-slate-800">
                {new Date(profile.availability.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                {' → '}
                {new Date(profile.availability.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Weekly Commitment
              </span>
              <div className="text-sm font-black text-slate-800">
                {profile.availability.hours_per_week} hours / week
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Timezone
              </span>
              <div className="text-sm font-black text-slate-800">
                {profile.availability.timezone || 'Asia/Kolkata'}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            Availability has not been configured yet.
            {isMyProfile && (
              <Link to="/profile/edit" className="ml-2 font-bold text-brand-600 hover:underline">
                Set availability
              </Link>
            )}
          </div>
        )}
      </div>

      {/* USER'S PROJECTS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-brand-600" />
          <span>Projects & Teams</span>
        </h3>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className="p-4 rounded-2xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Badge variant="brand">{p.domain_name}</Badge>
                    <Badge variant={p.status === 'open' ? 'success' : 'default'} size="xs">
                      {p.status}
                    </Badge>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">{p.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{p.short_description || p.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{p.is_owner ? 'Project Owner' : p.role_in_project || 'Team Member'}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No active projects or teams to display.</p>
        )}
      </div>
    </div>
  );
}

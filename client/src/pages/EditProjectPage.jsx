import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ArrowLeft, Save, Trash2, Plus } from 'lucide-react';

export default function EditProjectPage() {
  const { id } = useParams();
  const { user, showToast } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('open');
  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [hoursPerWeek, setHoursPerWeek] = useState(15);
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [requiredRoles, setRequiredRoles] = useState([]);

  const [skillInput, setSkillInput] = useState('');
  const [roleInput, setRoleInput] = useState('');

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await api.get(`/projects/${id}`);
        if (res.success && res.data?.project) {
          const p = res.data.project;
          if (p.owner_id !== user?.id) {
            showToast('Only project owners can edit project details', 'error');
            navigate(`/projects/${id}`);
            return;
          }

          setTitle(p.title || '');
          setShortDescription(p.short_description || '');
          setDescription(p.description || '');
          setEventName(p.event_name || '');
          setLocation(p.location || '');
          setStatus(p.status || 'open');
          setMaxTeamSize(p.max_team_size || 4);
          setHoursPerWeek(p.hours_per_week || 15);
          setRequiredSkills(p.required_skills?.map(s => typeof s === 'string' ? s : s.name) || []);
          setRequiredRoles(p.required_roles?.map(r => typeof r === 'string' ? r : r.name) || []);
        }
      } catch (err) {
        showToast('Failed to load project details', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id, user?.id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/projects/${id}`, {
        title,
        shortDescription,
        description,
        eventName,
        location,
        status,
        maxTeamSize: Number(maxTeamSize),
        hoursPerWeek: Number(hoursPerWeek),
        requiredSkills,
        requiredRoles
      });
      showToast('Project updated successfully!');
      navigate(`/projects/${id}`);
    } catch (err) {
      showToast(err.message || 'Failed to update project', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/projects/${id}`);
      showToast('Project deleted successfully', 'info');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Failed to delete project', 'error');
    }
  };

  if (loading) return <LoadingSpinner message="Loading project details..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/projects/${id}`}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Project</h1>
            <p className="text-xs text-slate-500">Update project details, vacancies, and status</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Project</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Recruitment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white font-bold"
              >
                <option value="open">Open (Recruiting Teammates)</option>
                <option value="full">Full (Team Filled)</option>
                <option value="closed">Closed (Recruitment Finished)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Event / Hackathon Name
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Detailed Description *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Short Description / Elevator Pitch
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Max Team Size
              </label>
              <input
                type="number"
                min={2}
                max={10}
                value={maxTeamSize}
                onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Hours / Week Commitment
              </label>
              <input
                type="number"
                min={5}
                max={60}
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>
          </div>
        </div>

        {/* Roles & Skills */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
            Required Roles & Skills
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Required Roles</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                placeholder="Add role (e.g. UI/UX Designer)..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (roleInput.trim() && !requiredRoles.includes(roleInput.trim())) {
                    setRequiredRoles([...requiredRoles, roleInput.trim()]);
                    setRoleInput('');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {requiredRoles.map((r, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold"
                >
                  <span>{r}</span>
                  <button
                    type="button"
                    onClick={() => setRequiredRoles(requiredRoles.filter((_, idx) => idx !== i))}
                    className="font-bold hover:text-purple-950"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1">Required Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add skill (e.g. Python)..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (skillInput.trim() && !requiredSkills.includes(skillInput.trim())) {
                    setRequiredSkills([...requiredSkills, skillInput.trim()]);
                    setSkillInput('');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-brand-600 text-white font-bold text-xs"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {requiredSkills.map((sk, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 text-brand-800 border border-brand-200 text-xs font-bold"
                >
                  <span>{sk}</span>
                  <button
                    type="button"
                    onClick={() => setRequiredSkills(requiredSkills.filter((_, idx) => idx !== i))}
                    className="font-bold hover:text-brand-950"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to={`/projects/${id}`}
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

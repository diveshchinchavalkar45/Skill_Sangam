import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  PlusCircle,
  Sparkles,
  Layers,
  Users,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Bot,
  ArrowRight,
  Check
} from 'lucide-react';

export default function CreateProjectPage() {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Reference lists
  const [domains, setDomains] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [allRoles, setAllRoles] = useState([]);

  // Form inputs
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [domainId, setDomainId] = useState('');
  const [eventName, setEventName] = useState('Smart India Hackathon 2026');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState(15);
  const [maxTeamSize, setMaxTeamSize] = useState(4);

  // Selected Skills & Roles
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [requiredRoles, setRequiredRoles] = useState([]);

  const [skillInput, setSkillInput] = useState('');
  const [roleInput, setRoleInput] = useState('');

  useEffect(() => {
    async function loadMeta() {
      try {
        const [domRes, skRes, rolRes] = await Promise.all([
          api.get('/domains'),
          api.get('/skills'),
          api.get('/roles')
        ]);
        const domList = domRes.data?.domains || [];
        setDomains(domList);
        if (domList.length > 0) setDomainId(domList[0].id);

        setAllSkills(skRes.data?.skills || []);
        setAllRoles(rolRes.data?.roles || []);

        // Default dates: today to +30 days
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setDate(today.getDate() + 35);
        setStartDate(today.toISOString().split('T')[0]);
        setEndDate(nextMonth.toISOString().split('T')[0]);
      } catch (err) {
        showToast('Failed to load project requirements form', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadMeta();
  }, []);

  // AI Assistant: Extract requirements from description
  const handleAiExtract = async () => {
    if (!description || description.trim().length < 15) {
      showToast('Please write a brief description first before asking AI to extract requirements', 'info');
      return;
    }

    setAiLoading(true);
    try {
      const res = await api.post('/ai/extract-requirements', { description });
      if (res.success && res.data) {
        const { suggestedDomain, requiredSkills: aiSkills, suggestedRoles: aiRoles, summary } = res.data;

        // Match suggested domain to existing domain ID
        const matchedDom = domains.find(
          d => d.name.toLowerCase() === suggestedDomain?.toLowerCase()
        );
        if (matchedDom) setDomainId(matchedDom.id);

        if (summary && !shortDescription) setShortDescription(summary);

        if (Array.isArray(aiSkills)) {
          setRequiredSkills(prev => [...new Set([...prev, ...aiSkills])]);
        }

        if (Array.isArray(aiRoles)) {
          setRequiredRoles(prev => [...new Set([...prev, ...aiRoles])]);
        }

        showToast('AI successfully extracted domain, skills, and suggested roles!');
      }
    } catch (err) {
      showToast(err.message || 'AI extraction failed', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  // AI Assistant: Generate project pitch from title
  const handleAiGeneratePitch = async () => {
    if (!title || title.trim().length < 3) {
      showToast('Please enter a project title first', 'info');
      return;
    }

    setAiLoading(true);
    try {
      const currentDom = domains.find(d => d.id === domainId)?.name;
      const res = await api.post('/ai/generate-description', {
        title,
        domain: currentDom,
        keywords: 'collaborative, high-impact, modern architecture'
      });

      if (res.success && res.data) {
        setShortDescription(res.data.shortDescription);
        setDescription(res.data.description);
        if (Array.isArray(res.data.suggestedSkills)) {
          setRequiredSkills(prev => [...new Set([...prev, ...res.data.suggestedSkills])]);
        }
        if (Array.isArray(res.data.suggestedRoles)) {
          setRequiredRoles(prev => [...new Set([...prev, ...res.data.suggestedRoles])]);
        }
        showToast('AI drafted project description and suggested requirements!');
      }
    } catch (err) {
      showToast(err.message || 'AI generation failed', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    if (!requiredSkills.includes(skillInput.trim())) {
      setRequiredSkills(prev => [...prev, skillInput.trim()]);
    }
    setSkillInput('');
  };

  const handleAddRole = () => {
    if (!roleInput.trim()) return;
    if (!requiredRoles.includes(roleInput.trim())) {
      setRequiredRoles(prev => [...prev, roleInput.trim()]);
    }
    setRoleInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requiredSkills.length === 0) {
      showToast('Please specify at least 1 required skill', 'error');
      return;
    }
    if (requiredRoles.length === 0) {
      showToast('Please specify at least 1 required role', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/projects', {
        title,
        shortDescription: shortDescription || description.slice(0, 150),
        description,
        domainId,
        eventName: eventName || undefined,
        location: location || undefined,
        startDate,
        endDate,
        hoursPerWeek: Number(hoursPerWeek),
        maxTeamSize: Number(maxTeamSize),
        requiredSkills,
        requiredRoles
      });

      if (res.success && res.data?.project) {
        showToast('Project created successfully! Viewing recommended candidates...');
        navigate(`/projects/${res.data.project.id}/candidates`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to create project', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading project creation wizard..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-brand-600" />
            <span>Create a New Project</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Define requirements to discover and match with compatible teammates
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
              Project Concept & Overview
            </h2>
            <button
              type="button"
              onClick={handleAiGeneratePitch}
              disabled={aiLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs border border-brand-200 transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-brand-600" />
              <span>{aiLoading ? 'Generating...' : '✨ AI Generate Pitch'}</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI Crop Advisory Assistant"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm font-bold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Domain / Track *
              </label>
              <select
                required
                value={domainId}
                onChange={(e) => setDomainId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm bg-white font-medium"
              >
                {domains.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
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
                placeholder="e.g. Smart India Hackathon 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Detailed Description *
              </label>
              <button
                type="button"
                onClick={handleAiExtract}
                disabled={aiLoading}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>✨ Auto-Extract Skills & Roles from Description</span>
              </button>
            </div>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem, proposed solution, technology stack, and goals..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Elevator Pitch / Short Description
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="1-2 sentences summarizing the core idea for project cards..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-xs text-slate-700"
            />
          </div>
        </div>

        {/* REQUIRED ROLES */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                Required Team Roles *
              </h2>
              <p className="text-xs text-slate-500">What role specialties are needed for your team?</p>
            </div>
            <span className="text-xs font-bold text-purple-700">{requiredRoles.length} roles</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              list="role-list-suggestions"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddRole();
                }
              }}
              placeholder="e.g. AI/ML Developer, UI/UX Designer, Backend Developer..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <datalist id="role-list-suggestions">
              {allRoles.map((r) => (
                <option key={r.id} value={r.name} />
              ))}
            </datalist>
            <button
              type="button"
              onClick={handleAddRole}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
            >
              Add Role
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {requiredRoles.map((r, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 font-bold text-xs"
              >
                <span>{r}</span>
                <button
                  type="button"
                  onClick={() => setRequiredRoles(prev => prev.filter((_, idx) => idx !== i))}
                  className="hover:text-purple-950 font-bold"
                >
                  ✕
                </button>
              </span>
            ))}
            {requiredRoles.length === 0 && (
              <p className="text-xs text-slate-400 italic">No roles selected yet. Add at least one.</p>
            )}
          </div>
        </div>

        {/* REQUIRED SKILLS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                Required Technical & Soft Skills *
              </h2>
              <p className="text-xs text-slate-500">Skills candidates must have to calculate match scores</p>
            </div>
            <span className="text-xs font-bold text-brand-700">{requiredSkills.length} skills</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              list="skill-list-suggestions"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="e.g. Python, React, PyTorch, Node.js..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <datalist id="skill-list-suggestions">
              {allSkills.map((s) => (
                <option key={s.id} value={s.name} />
              ))}
            </datalist>
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
            >
              Add Skill
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {requiredSkills.map((sk, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-800 border border-brand-200 font-bold text-xs"
              >
                <span>{sk}</span>
                <button
                  type="button"
                  onClick={() => setRequiredSkills(prev => prev.filter((_, idx) => idx !== i))}
                  className="hover:text-brand-950 font-bold"
                >
                  ✕
                </button>
              </span>
            ))}
            {requiredSkills.length === 0 && (
              <p className="text-xs text-slate-400 italic">No skills selected yet. Add at least one.</p>
            )}
          </div>
        </div>

        {/* TIMELINE, CAPACITY, AVAILABILITY */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Timeline, Capacity & Commitment</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Maximum Team Size ({maxTeamSize} members) *
              </label>
              <input
                type="number"
                min={2}
                max={10}
                required
                value={maxTeamSize}
                onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Expected Weekly Commitment ({hoursPerWeek} hrs/week)
              </label>
              <input
                type="number"
                min={5}
                max={60}
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Project Location / Mode
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Remote / New Delhi / Hybrid"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/projects"
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 font-bold text-xs text-slate-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all disabled:opacity-50"
          >
            <span>{submitting ? 'Creating Project...' : 'Publish Project & Discover Candidates'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  User,
  Building,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Save,
  ArrowLeft
} from 'lucide-react';

export default function EditProfilePage() {
  const { user, refreshUser, showToast } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Reference lists from backend
  const [allSkills, setAllSkills] = useState([]);
  const [allDomains, setAllDomains] = useState([]);
  const [allRoles, setAllRoles] = useState([]);

  // Form states
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    profileImageUrl: '',
    userType: 'student',
    instituteOrCompany: '',
    yearOrExperience: '',
    location: '',
    country: 'India',
    bio: '',
    teamPreference: 'looking_for_team',
  });

  const [skills, setSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState('intermediate');

  const [selectedDomains, setSelectedDomains] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const [availability, setAvailability] = useState({
    startDate: '',
    endDate: '',
    hoursPerWeek: 15,
    timezone: 'Asia/Kolkata',
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [profRes, skRes, domRes, rolRes, availRes] = await Promise.all([
          api.get('/profile/me'),
          api.get('/skills'),
          api.get('/domains'),
          api.get('/roles'),
          api.get('/availability/me').catch(() => ({ data: { availability: null } }))
        ]);

        if (profRes.success && profRes.data.profile) {
          const p = profRes.data.profile;
          setBasicInfo({
            name: p.name || '',
            profileImageUrl: p.profile_image_url || '',
            userType: p.user_type || 'student',
            instituteOrCompany: p.institute_or_company || '',
            yearOrExperience: p.year_or_experience || '',
            location: p.location || '',
            country: p.country || 'India',
            bio: p.bio || '',
            teamPreference: p.team_preference || 'looking_for_team',
          });

          if (Array.isArray(p.skills)) {
            setSkills(p.skills.map((s) => ({
              id: s.id,
              name: typeof s === 'string' ? s : s.name,
              proficiency: s.proficiency || 'intermediate',
            })));
          }

          if (Array.isArray(p.domains)) {
            setSelectedDomains(p.domains.map((d) => (typeof d === 'string' ? d : d.id || d.name)));
          }

          if (Array.isArray(p.preferred_roles)) {
            setSelectedRoles(p.preferred_roles.map((r) => (typeof r === 'string' ? r : r.id || r.name)));
          }
        }

        if (availRes.data?.availability) {
          const a = availRes.data.availability;
          setAvailability({
            startDate: a.start_date ? a.start_date.split('T')[0] : '',
            endDate: a.end_date ? a.end_date.split('T')[0] : '',
            hoursPerWeek: a.hours_per_week || 15,
            timezone: a.timezone || 'Asia/Kolkata',
          });
        } else {
          // Defaults: start today, end in 30 days
          const today = new Date();
          const nextMonth = new Date();
          nextMonth.setDate(today.getDate() + 35);
          setAvailability({
            startDate: today.toISOString().split('T')[0],
            endDate: nextMonth.toISOString().split('T')[0],
            hoursPerWeek: 15,
            timezone: 'Asia/Kolkata',
          });
        }

        setAllSkills(skRes.data?.skills || []);
        setAllDomains(domRes.data?.domains || []);
        setAllRoles(rolRes.data?.roles || []);
      } catch (err) {
        console.error('Failed to load profile for editing:', err);
        showToast('Failed to load existing profile', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const exists = skills.some((s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase());
    if (exists) {
      showToast('Skill already added', 'info');
      return;
    }

    setSkills((prev) => [
      ...prev,
      {
        name: newSkillName.trim(),
        proficiency: newSkillProficiency,
      },
    ]);
    setNewSkillName('');
    setNewSkillProficiency('intermediate');
  };

  const handleRemoveSkill = (index) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSkillProficiencyChange = (index, newProf) => {
    setSkills((prev) =>
      prev.map((s, i) => (i === index ? { ...s, proficiency: newProf } : s))
    );
  };

  const toggleDomain = (domainId) => {
    setSelectedDomains((prev) =>
      prev.includes(domainId) ? prev.filter((d) => d !== domainId) : [...prev, domainId]
    );
  };

  const toggleRole = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Update Profile
      await api.put('/profile/me', {
        ...basicInfo,
        skills,
        domains: selectedDomains,
        preferredRoles: selectedRoles,
      });

      // 2. Update Availability
      if (availability.startDate && availability.endDate) {
        await api.put('/availability/me', availability);
      }

      await refreshUser();
      showToast('Profile updated successfully!');
      navigate('/profile');
    } catch (err) {
      showToast(err.message || 'Failed to save profile changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading profile editor..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Profile</h1>
            <p className="text-xs text-slate-500">Update your qualifications and matching parameters</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* BASIC INFO */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            <span>Basic Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={basicInfo.name}
                onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Profile Photo URL
              </label>
              <input
                type="url"
                value={basicInfo.profileImageUrl}
                onChange={(e) => setBasicInfo({ ...basicInfo, profileImageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                User Type
              </label>
              <select
                value={basicInfo.userType}
                onChange={(e) => setBasicInfo({ ...basicInfo, userType: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm bg-white"
              >
                <option value="student">Student</option>
                <option value="professional">Professional / Mentor</option>
                <option value="organizer">Organizer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Team Preference
              </label>
              <select
                value={basicInfo.teamPreference}
                onChange={(e) => setBasicInfo({ ...basicInfo, teamPreference: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm bg-white"
              >
                <option value="looking_for_team">Looking for a Team</option>
                <option value="have_project">Have a Project Idea</option>
                <option value="open_to_both">Open to Both</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Institute / Company
              </label>
              <input
                type="text"
                value={basicInfo.instituteOrCompany}
                onChange={(e) => setBasicInfo({ ...basicInfo, instituteOrCompany: e.target.value })}
                placeholder="e.g. IIT Delhi / BITS Pilani"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Academic Year / Exp
              </label>
              <input
                type="text"
                value={basicInfo.yearOrExperience}
                onChange={(e) => setBasicInfo({ ...basicInfo, yearOrExperience: e.target.value })}
                placeholder="e.g. 3rd Year B.Tech CSE"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                City / Location
              </label>
              <input
                type="text"
                value={basicInfo.location}
                onChange={(e) => setBasicInfo({ ...basicInfo, location: e.target.value })}
                placeholder="e.g. New Delhi / Bengaluru"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={basicInfo.country}
                onChange={(e) => setBasicInfo({ ...basicInfo, country: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Short Bio
            </label>
            <textarea
              rows={3}
              value={basicInfo.bio}
              onChange={(e) => setBasicInfo({ ...basicInfo, bio: e.target.value })}
              placeholder="Tell others what you love building, your favorite tech stack, and what problems excite you..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
            />
          </div>
        </div>

        {/* SKILLS SECTION */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Skills & Proficiencies</span>
            </h2>
            <span className="text-xs text-slate-400">{skills.length} skills added</span>
          </div>

          {/* Add Skill Bar */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-2 items-center">
            <div className="w-full sm:flex-1 relative">
              <input
                type="text"
                list="skills-suggestions"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Type or select skill (e.g. Python, React, PyTorch, Figma)..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
              />
              <datalist id="skills-suggestions">
                {allSkills.map((sk) => (
                  <option key={sk.id} value={sk.name} />
                ))}
              </datalist>
            </div>

            <select
              value={newSkillProficiency}
              onChange={(e) => setNewSkillProficiency(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <button
              type="button"
              onClick={handleAddSkill}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          {/* Current Skills Table / Chips */}
          <div className="space-y-2 pt-2">
            {skills.map((sk, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs"
              >
                <div className="font-bold text-slate-800 text-sm">{sk.name}</div>
                <div className="flex items-center gap-2">
                  <select
                    value={sk.proficiency}
                    onChange={(e) => handleSkillProficiencyChange(index, e.target.value)}
                    className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-700"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(index)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {skills.length === 0 && (
              <p className="text-xs text-slate-400 italic">No skills added yet. Add at least 2-3 skills to increase your project match compatibility.</p>
            )}
          </div>
        </div>

        {/* DOMAINS MULTI-SELECT */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
            Target Hackathon / Project Domains
          </h2>
          <p className="text-xs text-slate-500">Select domains you are enthusiastic about building in:</p>

          <div className="flex flex-wrap gap-2">
            {allDomains.map((d) => {
              const isSelected = selectedDomains.includes(d.id) || selectedDomains.includes(d.name);
              return (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => toggleDomain(d.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-brand-600 text-white border-brand-700 shadow-sm shadow-brand-500/20'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {isSelected ? '✓ ' : ''}{d.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* PREFERRED ROLES MULTI-SELECT */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
            Preferred Project Roles
          </h2>
          <p className="text-xs text-slate-500">What positions would you like to take on in a team?</p>

          <div className="flex flex-wrap gap-2">
            {allRoles.map((r) => {
              const isSelected = selectedRoles.includes(r.id) || selectedRoles.includes(r.name);
              return (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => toggleRole(r.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-700 shadow-sm shadow-purple-500/20'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {isSelected ? '✓ ' : ''}{r.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* AVAILABILITY CALENDAR & HOURS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Sprint Availability & Timeline</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Available From *
              </label>
              <input
                type="date"
                required
                value={availability.startDate}
                onChange={(e) => setAvailability({ ...availability, startDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Available Until *
              </label>
              <input
                type="date"
                required
                value={availability.endDate}
                onChange={(e) => setAvailability({ ...availability, endDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Hours per Week ({availability.hoursPerWeek} hrs)
              </label>
              <input
                type="range"
                min={5}
                max={50}
                step={1}
                value={availability.hoursPerWeek}
                onChange={(e) => setAvailability({ ...availability, hoursPerWeek: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Timezone
              </label>
              <input
                type="text"
                value={availability.timezone}
                onChange={(e) => setAvailability({ ...availability, timezone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/profile"
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 font-bold text-xs text-slate-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

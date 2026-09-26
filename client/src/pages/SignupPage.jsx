import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Lock,
  Mail,
  User,
  Building,
  MapPin,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Trophy,
  School,
  Building2,
  Landmark,
  BadgeCheck
} from 'lucide-react';

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialType = searchParams.get('type') || 'student';
  const initialLevel = searchParams.get('level') || 'college';

  const [userType, setUserType] = useState(
    ['student', 'professional', 'organizer'].includes(initialType) ? initialType : 'student'
  );

  const [educationLevel, setEducationLevel] = useState(
    ['school', 'college', 'university'].includes(initialLevel) ? initialLevel : 'college'
  );

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    instituteOrCompany: '',
    yearOrExperience: '',
    location: '',
    country: 'India',
    teamPreference: 'looking_for_team',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync if URL search params change
  useEffect(() => {
    const qType = searchParams.get('type');
    const qLevel = searchParams.get('level');
    if (qType && ['student', 'professional', 'organizer'].includes(qType)) {
      setUserType(qType);
    }
    if (qLevel && ['school', 'college', 'university'].includes(qLevel)) {
      setEducationLevel(qLevel);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        userType,
        educationLevel: userType === 'student' ? educationLevel : 'not_applicable',
      };

      await register(payload);
      // Direct new user to setup profile with skills & domains
      navigate('/profile/edit');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/30">
            <Users className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Create Your Account</h1>
          <p className="text-xs sm:text-sm text-slate-500">Join SkillSangam to match with teammates and projects</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* PRIMARY ROLE SELECTOR: STUDENT VS OFFICE WORKER VS ORGANIZER */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-600">
            Select Your Role on SkillSangam *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setUserType('student')}
              className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all ${
                userType === 'student'
                  ? 'border-brand-600 bg-brand-50/70 text-brand-950 shadow-sm ring-1 ring-brand-500/30'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${userType === 'student' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <GraduationCap className="w-4 h-4" />
                </div>
                {userType === 'student' && <BadgeCheck className="w-4 h-4 text-brand-600" />}
              </div>
              <div>
                <div className="font-black text-sm">Student</div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">School, College, or University</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setUserType('professional')}
              className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all ${
                userType === 'professional'
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-sm ring-1 ring-indigo-500/30'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${userType === 'professional' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Briefcase className="w-4 h-4" />
                </div>
                {userType === 'professional' && <BadgeCheck className="w-4 h-4 text-indigo-600" />}
              </div>
              <div>
                <div className="font-black text-sm">Office Worker</div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Working Pro / Tech / Designer</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setUserType('organizer')}
              className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all ${
                userType === 'organizer'
                  ? 'border-purple-600 bg-purple-50/70 text-purple-950 shadow-sm ring-1 ring-purple-500/30'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${userType === 'organizer' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Trophy className="w-4 h-4" />
                </div>
                {userType === 'organizer' && <BadgeCheck className="w-4 h-4 text-purple-600" />}
              </div>
              <div>
                <div className="font-black text-sm">Organizer</div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Hosting Hackathons / Contests</div>
              </div>
            </button>
          </div>
        </div>

        {/* IF STUDENT: SUB-SELECTOR FOR SCHOOL, COLLEGE, OR UNIVERSITY */}
        {userType === 'student' && (
          <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100 space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-900">
                Education Level *
              </label>
              <span className="text-[10px] font-semibold text-brand-600">
                Select your current level of study
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEducationLevel('school')}
                className={`py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  educationLevel === 'school'
                    ? 'border-brand-600 bg-white text-brand-700 shadow-sm ring-1 ring-brand-500/30'
                    : 'border-brand-200/70 hover:bg-white/70 text-slate-700'
                }`}
              >
                <School className="w-4 h-4 text-brand-600" />
                <span>School</span>
                <span className="text-[9px] font-normal text-slate-500">Grades 9-12</span>
              </button>

              <button
                type="button"
                onClick={() => setEducationLevel('college')}
                className={`py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  educationLevel === 'college'
                    ? 'border-brand-600 bg-white text-brand-700 shadow-sm ring-1 ring-brand-500/30'
                    : 'border-brand-200/70 hover:bg-white/70 text-slate-700'
                }`}
              >
                <Building2 className="w-4 h-4 text-brand-600" />
                <span>College</span>
                <span className="text-[9px] font-normal text-slate-500">Undergrad / B.Tech</span>
              </button>

              <button
                type="button"
                onClick={() => setEducationLevel('university')}
                className={`py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  educationLevel === 'university'
                    ? 'border-brand-600 bg-white text-brand-700 shadow-sm ring-1 ring-brand-500/30'
                    : 'border-brand-200/70 hover:bg-white/70 text-slate-700'
                }`}
              >
                <Landmark className="w-4 h-4 text-brand-600" />
                <span>University</span>
                <span className="text-[9px] font-normal text-slate-500">Postgrad / PhD</span>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Aarav Sharma"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={userType === 'student' ? 'aarav@iitd.ac.in' : 'aarav@company.com'}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password (min. 8 characters) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* DYNAMIC INSTITUTION / COMPANY FIELDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {userType === 'student' && educationLevel === 'school' && 'School Name'}
                {userType === 'student' && educationLevel === 'college' && 'College / Institute'}
                {userType === 'student' && educationLevel === 'university' && 'University Name'}
                {userType === 'professional' && 'Company / Workplace'}
                {userType === 'organizer' && 'Organization / Club'}
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="instituteOrCompany"
                  value={formData.instituteOrCompany}
                  onChange={handleChange}
                  placeholder={
                    userType === 'student' && educationLevel === 'school'
                      ? 'e.g. Delhi Public School'
                      : userType === 'student' && educationLevel === 'college'
                      ? 'e.g. IIT Delhi / VIT'
                      : userType === 'student' && educationLevel === 'university'
                      ? 'e.g. University of Delhi'
                      : userType === 'professional'
                      ? 'e.g. Google / Infosys'
                      : 'e.g. Hackathon Organizing Team'
                  }
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {userType === 'student' && educationLevel === 'school' && 'Class / Grade'}
                {userType === 'student' && educationLevel === 'college' && 'Degree & Year'}
                {userType === 'student' && educationLevel === 'university' && 'Program & Year'}
                {userType === 'professional' && 'Designation & Experience'}
                {userType === 'organizer' && 'Organizer Designation'}
              </label>
              <input
                type="text"
                name="yearOrExperience"
                value={formData.yearOrExperience}
                onChange={handleChange}
                placeholder={
                  userType === 'student' && educationLevel === 'school'
                    ? 'e.g. Class 11 / Class 12'
                    : userType === 'student' && educationLevel === 'college'
                    ? 'e.g. 3rd Year B.Tech'
                    : userType === 'student' && educationLevel === 'university'
                    ? 'e.g. 1st Year M.Tech / PhD'
                    : userType === 'professional'
                    ? 'e.g. Full Stack Dev (3 yrs)'
                    : 'e.g. Lead Organizer'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Goal & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Current Goal
              </label>
              <select
                name="teamPreference"
                value={formData.teamPreference}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm text-slate-800 bg-white"
              >
                <option value="looking_for_team">Looking for a Team</option>
                <option value="have_project">Have a Project Idea</option>
                <option value="open_to_both">Open to Both</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                City / Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. New Delhi / Bengaluru"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all disabled:opacity-50 mt-2 hover:scale-[1.01]"
          >
            <span>{loading ? 'Creating Account...' : 'Continue to Skills Setup'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}

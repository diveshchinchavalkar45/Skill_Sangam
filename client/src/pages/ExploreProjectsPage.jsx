import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import ProjectCard from '../components/projects/ProjectCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Compass,
  Trophy,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ExploreProjectsPage() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter options loaded from backend
  const [domains, setDomains] = useState([]);
  const [skills, setSkills] = useState([]);

  // Active filter state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedDomain, setSelectedDomain] = useState(searchParams.get('domain') || '');
  const [selectedSkill, setSelectedSkill] = useState(searchParams.get('skill') || '');
  const [selectedEvent, setSelectedEvent] = useState(searchParams.get('event') || '');
  const [selectedStatus, setSelectedStatus] = useState('open');
  const [sortBy, setSortBy] = useState(isAuthenticated ? 'match' : 'newest');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch domains & skills for dropdowns
  useEffect(() => {
    Promise.all([
      api.get('/domains').catch(() => ({ data: { domains: [] } })),
      api.get('/skills').catch(() => ({ data: { skills: [] } })),
    ]).then(([domRes, skRes]) => {
      setDomains(domRes.data?.domains || []);
      setSkills(skRes.data?.skills || []);
    });
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedDomain) params.append('domain', selectedDomain);
      if (selectedSkill) params.append('skill', selectedSkill);
      if (selectedEvent) params.append('event', selectedEvent);
      if (selectedStatus) params.append('status', selectedStatus);
      params.append('sort', sortBy);
      params.append('limit', '50');

      const res = await api.get(`/projects?${params.toString()}`);
      if (res.success && res.data) {
        setProjects(res.data.projects || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchTerm, selectedDomain, selectedSkill, selectedEvent, selectedStatus, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDomain('');
    setSelectedSkill('');
    setSelectedEvent('');
    setSelectedStatus('open');
    setSortBy(isAuthenticated ? 'match' : 'newest');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-brand-600" />
            <span>Explore Projects & Teams</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Discover hackathons and startup ideas seeking your specific skills
          </p>
        </div>

        {/* Search input */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects by title, keywords..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Domain Dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filters:</span>
            </div>

            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none"
            >
              <option value="">All Domains</option>
              {domains.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Skill Dropdown */}
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none"
            >
              <option value="">All Required Skills</option>
              {skills.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Event Dropdown */}
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none"
            >
              <option value="">All Events / Hackathons</option>
              <option value="Smart India Hackathon">Smart India Hackathon 2026</option>
              <option value="HackIndia">HackIndia 2026</option>
              <option value="GreenTech">GreenTech Summit 2026</option>
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none"
            >
              <option value="open">Open Roles Only</option>
              <option value="all">All Projects</option>
            </select>

            {(selectedDomain || selectedSkill || selectedEvent || searchTerm) && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 underline ml-2"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:outline-none"
            >
              {isAuthenticated && <option value="match">Match Score (Highest)</option>}
              <option value="newest">Newest First</option>
              <option value="team_size">Team Size</option>
            </select>
          </div>
        </div>
      </div>

      {/* PROJECTS LIST GRID */}
      {loading ? (
        <LoadingSpinner message="Filtering matched projects..." />
      ) : projects.length > 0 ? (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-500">
            Showing {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onUpdate={fetchProjects} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No matching projects found"
          description="Try broadening your search keywords or clearing selected domain and skill filters."
          actionText="Reset Filters"
          onAction={handleResetFilters}
        />
      )}
    </div>
  );
}

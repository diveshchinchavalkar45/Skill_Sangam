import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import {
  Shield,
  Users,
  Trophy,
  Inbox,
  ArrowRight,
  BarChart3,
  Layers,
  Sparkles
} from 'lucide-react';

export default function OrganizerDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState('');

  const loadOrganizerData = async (evId = '') => {
    setLoading(true);
    try {
      const url = evId ? `/organizer/dashboard?eventId=${evId}` : '/organizer/dashboard';
      const res = await api.get(url);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load organizer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizerData(selectedEventId);
  }, [selectedEventId]);

  if (loading) return <LoadingSpinner message="Calculating hackathon ecosystem statistics..." />;

  const { stats, skillDistribution = [], domainDistribution = [], events = [], recentProjects = [] } = data || {};

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Shield className="w-7 h-7 text-indigo-600" />
              <span>Hackathon Organizer Hub</span>
            </h1>
            <Badge variant="purple">ADMIN VIEW</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time participant analytics, interdisciplinary team progress, and skill supply metrics
          </p>
        </div>

        {/* Event selector */}
        {events.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="">All Hackathons & Events</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* STATS COUNTERS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-1">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-brand-600" />
            <span>Participants</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats?.totalParticipants ?? 0}</div>
          <span className="text-[11px] text-emerald-600 font-bold">Registered builders</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-1">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-indigo-600" />
            <span>Projects Created</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats?.totalProjects ?? 0}</div>
          <span className="text-[11px] text-indigo-600 font-bold">Innovation teams</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-1">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Team Memberships</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats?.totalTeamMemberships ?? 0}</div>
          <span className="text-[11px] text-slate-500 font-medium">Spots claimed</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-1">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Inbox className="w-4 h-4 text-amber-600" />
            <span>Pending Requests</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats?.pendingRequests ?? 0}</div>
          <span className="text-[11px] text-amber-600 font-bold">Awaiting team match</span>
        </div>
      </div>

      {/* CHARTS / DISTRIBUTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skill Supply Distribution */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-600" />
              <span>Participant Skill Distribution</span>
            </h3>
            <span className="text-xs text-slate-400">Top 10 skills</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {skillDistribution.map((sk) => {
              const maxCount = Math.max(...skillDistribution.map((s) => Number(s.count)), 1);
              const percentage = Math.round((Number(sk.count) / maxCount) * 100);
              return (
                <div key={sk.name} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>{sk.name}</span>
                    <span>{sk.count} builders</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Domain Distribution */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Projects by Domain / Track</span>
            </h3>
            <span className="text-xs text-slate-400">{domainDistribution.length} domains</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {domainDistribution.slice(0, 10).map((dom) => {
              const maxCount = Math.max(...domainDistribution.map((d) => Number(d.count)), 1);
              const percentage = Math.round((Number(dom.count) / maxCount) * 100);
              return (
                <div key={dom.name} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>{dom.name}</span>
                    <span>{dom.count} projects</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* EVENT PROJECTS ROSTER TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
            Registered Projects & Team Filling Progress
          </h3>
          <span className="text-xs text-slate-400">{recentProjects.length} projects</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Project Title</th>
                <th className="pb-3">Domain</th>
                <th className="pb-3">Lead Owner</th>
                <th className="pb-3">Team Capacity</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentProjects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="py-3 font-bold text-slate-900 max-w-[200px] truncate">
                    {p.title}
                  </td>
                  <td className="py-3">
                    <Badge variant="brand" size="xs">
                      {p.domain_name}
                    </Badge>
                  </td>
                  <td className="py-3 font-medium text-slate-700">{p.owner_name}</td>
                  <td className="py-3 font-bold text-slate-800">
                    {p.current_members} / {p.max_team_size} members
                  </td>
                  <td className="py-3">
                    <Badge variant={p.status === 'open' ? 'success' : 'default'} size="xs">
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      to={`/projects/${p.id}`}
                      className="font-bold text-brand-600 hover:text-brand-700"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

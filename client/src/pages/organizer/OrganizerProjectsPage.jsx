import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { Trophy, ArrowLeft, Search } from 'lucide-react';

export default function OrganizerProjectsPage() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await api.get('/organizer/events');
        const evList = res.data?.events || [];
        setEvents(evList);
        if (evList.length > 0) {
          setSelectedEventId(evList[0].id);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  useEffect(() => {
    async function loadProjects() {
      if (!selectedEventId) return;
      setLoading(true);
      try {
        const res = await api.get(`/organizer/events/${selectedEventId}/projects`);
        setProjects(res.data?.projects || []);
      } catch (err) {
        console.error('Failed to load event projects:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [selectedEventId]);

  const filteredProjects = projects.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.domain_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.owner_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/organizer"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Organizer Dashboard</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-brand-600" />
            <span>Event Project Submissions</span>
          </h1>
          <p className="text-xs text-slate-500">Innovation projects and team formation status</p>
        </div>

        {events.length > 0 && (
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
          />
        </div>

        {loading ? (
          <LoadingSpinner message="Loading event projects..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Domain</th>
                  <th className="pb-3">Founder</th>
                  <th className="pb-3">Capacity</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-bold text-slate-900 max-w-[200px] truncate">
                      {p.title}
                    </td>
                    <td className="py-3">
                      <Badge variant="brand" size="xs">
                        {p.domain_name}
                      </Badge>
                    </td>
                    <td className="py-3 text-slate-700">{p.owner_name}</td>
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
        )}
      </div>
    </div>
  );
}

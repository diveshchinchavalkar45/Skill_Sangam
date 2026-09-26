import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { Users, ArrowLeft, Search, Filter } from 'lucide-react';

export default function OrganizerUsersPage() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [users, setUsers] = useState([]);
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
    async function loadUsers() {
      if (!selectedEventId) return;
      setLoading(true);
      try {
        const res = await api.get(`/organizer/events/${selectedEventId}/users`);
        setUsers(res.data?.users || []);
      } catch (err) {
        console.error('Failed to load event participants:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, [selectedEventId]);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.institute_or_company?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Users className="w-6 h-6 text-brand-600" />
            <span>Event Participants</span>
          </h1>
          <p className="text-xs text-slate-500">Registered builders and interdisciplinary candidates</p>
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
            placeholder="Search participants..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
          />
        </div>

        {loading ? (
          <LoadingSpinner message="Loading participant roster..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Role / Year</th>
                  <th className="pb-3">Institute</th>
                  <th className="pb-3">Goal</th>
                  <th className="pb-3">Skills</th>
                  <th className="pb-3 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-bold text-slate-900">
                      <div>{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{u.email}</div>
                    </td>
                    <td className="py-3 text-slate-700">{u.year_or_experience || u.user_type}</td>
                    <td className="py-3 text-slate-700">{u.institute_or_company || 'Independent'}</td>
                    <td className="py-3">
                      <Badge variant="purple" size="xs">
                        {u.team_preference?.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {u.skills?.slice(0, 3).map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/users/${u.id}`}
                        className="font-bold text-brand-600 hover:text-brand-700"
                      >
                        View
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

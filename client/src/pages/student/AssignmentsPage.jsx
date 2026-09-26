import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import {
  BookOpen,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  MessageSquare,
  GraduationCap
} from 'lucide-react';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'need_group', 'my_groups', 'submitted'

  useEffect(() => {
    async function loadAssignments() {
      setLoading(true);
      try {
        const res = await api.get('/assignments');
        if (res.success) {
          setAssignments(res.data.assignments || []);
        }
      } catch (err) {
        console.error('Failed to load assignments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAssignments();
  }, []);

  const filteredAssignments = assignments.filter((a) => {
    if (filter === 'need_group') return !a.user_group;
    if (filter === 'my_groups') return !!a.user_group;
    if (filter === 'submitted') return a.has_submitted;
    return true;
  });

  if (loading) {
    return <LoadingSpinner message="Loading course assignments and group communities..." />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Academic Course Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Course Group Assignments & Communities
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Track teacher assignments, monitor class submission percentages, form balanced student teams, and discuss questions in the assignment community.
          </p>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-3 rounded-2xl shrink-0">
          <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">{assignments.length} Course Assignments</div>
            <div className="text-[11px] text-slate-500">Live Team Allocation Active</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            filter === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Assignments ({assignments.length})
        </button>

        <button
          onClick={() => setFilter('need_group')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            filter === 'need_group'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Need a Group ({assignments.filter((a) => !a.user_group).length})
        </button>

        <button
          onClick={() => setFilter('my_groups')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            filter === 'my_groups'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          My Groups ({assignments.filter((a) => !!a.user_group).length})
        </button>

        <button
          onClick={() => setFilter('submitted')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            filter === 'submitted'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Submitted ({assignments.filter((a) => a.has_submitted).length})
        </button>
      </div>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No assignments found"
          description="There are currently no assignments matching your selected filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAssignments.map((assignment) => {
            const dueDate = new Date(assignment.due_date);
            const isDueSoon = dueDate - new Date() < 5 * 24 * 60 * 60 * 1000;

            return (
              <div
                key={assignment.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-brand-300 shadow-sm hover:shadow-md transition-all p-6 sm:p-7 flex flex-col justify-between space-y-6"
              >
                {/* Header Meta */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200/60">
                      {assignment.course_name}
                    </span>

                    {assignment.has_submitted ? (
                      <Badge variant="emerald" size="xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Submitted
                      </Badge>
                    ) : assignment.user_group ? (
                      <Badge variant="brand" size="xs">
                        <Users className="w-3 h-3 mr-1" />
                        In: {assignment.user_group.name}
                      </Badge>
                    ) : (
                      <Badge variant="amber" size="xs">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Need Group
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 hover:text-brand-600 transition-colors">
                      <Link to={`/student/assignments/${assignment.id}`}>
                        {assignment.title}
                      </Link>
                    </h3>
                    <div className="text-xs text-slate-500 mt-1 font-medium">
                      Teacher: <span className="font-semibold text-slate-700">{assignment.teacher_name}</span> • {assignment.institution_name}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {assignment.description}
                  </p>
                </div>

                {/* Live Community & Submission Metrics */}
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  {/* Submission Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Class Submissions</span>
                      </span>
                      <span className="font-black text-slate-900">
                        {assignment.submitted_students_count} / {assignment.total_students_enrolled || 40} ({assignment.submission_percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${assignment.submission_percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Groups Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-2xl border border-slate-200/70">
                    <div>
                      <div className="text-base font-black text-slate-900">{assignment.total_groups}</div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Total Groups</div>
                    </div>
                    <div>
                      <div className="text-base font-black text-amber-600">{assignment.open_groups}</div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Open Teams</div>
                    </div>
                    <div>
                      <div className="text-base font-black text-brand-600">{assignment.min_team_size}-{assignment.max_team_size}</div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Group Size</div>
                    </div>
                  </div>

                  {/* Bottom Footer Info */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className={isDueSoon ? 'text-rose-600 font-bold' : ''}>
                        Due: {dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>{assignment.community_posts_count} community posts</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/student/assignments/${assignment.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-brand-600 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <span>View Allotted Groups & Community</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

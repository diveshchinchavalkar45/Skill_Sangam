import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  BookOpen,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  MessageSquare,
  HelpCircle,
  LogOut,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  FileCheck,
  UserPlus
} from 'lucide-react';

export default function AssignmentDetailPage() {
  const { id } = useParams();
  const { user, showToast } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [groups, setGroups] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('groups'); // 'groups', 'community', 'guidelines'
  const [groupFilter, setGroupFilter] = useState('all'); // 'all', 'open', 'full', 'submitted'
  const [postFilter, setPostFilter] = useState('all');

  // Modals
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupRole, setNewGroupRole] = useState('Team Lead');
  const [creatingGroup, setCreatingGroup] = useState(false);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedGroupToJoin, setSelectedGroupToJoin] = useState(null);
  const [joinRole, setJoinRole] = useState('Frontend & API');
  const [joiningGroup, setJoiningGroup] = useState(false);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // New community post state
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState('discussion');
  const [posting, setPosting] = useState(false);

  const loadAssignment = async () => {
    try {
      const res = await api.get(`/assignments/${id}`);
      if (res.success) {
        setAssignment(res.data.assignment);
        setGroups(res.data.groups || []);
        setCommunityPosts(res.data.community_posts || []);
      }
    } catch (err) {
      console.error('Failed to load assignment:', err);
      showToast(err.message || 'Failed to load assignment', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignment();
  }, [id]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setCreatingGroup(true);
    try {
      await api.post(`/assignments/${id}/groups`, {
        name: newGroupName.trim(),
        role: newGroupRole.trim()
      });
      showToast('Group created! You are now the team leader.');
      setShowCreateGroupModal(false);
      setNewGroupName('');
      loadAssignment();
    } catch (err) {
      showToast(err.message || 'Failed to create group', 'error');
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!selectedGroupToJoin) return;

    setJoiningGroup(true);
    try {
      await api.post(`/assignments/${id}/groups/${selectedGroupToJoin.id}/join`, {
        role: joinRole.trim()
      });
      showToast(`Joined ${selectedGroupToJoin.name}!`);
      setShowJoinModal(false);
      setSelectedGroupToJoin(null);
      loadAssignment();
    } catch (err) {
      showToast(err.message || 'Failed to join group', 'error');
    } finally {
      setJoiningGroup(false);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    try {
      await api.post(`/assignments/${id}/groups/${groupId}/leave`);
      showToast('You have left the group.', 'info');
      loadAssignment();
    } catch (err) {
      showToast(err.message || 'Failed to leave group', 'error');
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!assignment?.current_user_group) return;

    setSubmitting(true);
    try {
      await api.post(`/assignments/${id}/groups/${assignment.current_user_group.id}/submit`, {
        submissionUrl,
        submissionNotes
      });
      showToast('Assignment submitted successfully!');
      setShowSubmitModal(false);
      loadAssignment();
    } catch (err) {
      showToast(err.message || 'Failed to submit assignment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCommunityPost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setPosting(true);
    try {
      await api.post(`/assignments/${id}/community`, {
        content: newPostContent.trim(),
        postType: newPostType
      });
      showToast('Message posted to assignment community!');
      setNewPostContent('');
      loadAssignment();
    } catch (err) {
      showToast(err.message || 'Failed to post message', 'error');
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading assignment community and group allocations..." />;
  }

  if (!assignment) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-slate-800">Assignment Not Found</h2>
        <Link to="/student/assignments" className="mt-4 inline-block font-semibold text-brand-600">
          Back to Course Assignments
        </Link>
      </div>
    );
  }

  const dueDate = new Date(assignment.due_date);
  const userInGroup = !!assignment.current_user_group;

  const filteredGroups = groups.filter((g) => {
    if (groupFilter === 'open') return g.status === 'forming' && !g.is_full;
    if (groupFilter === 'full') return g.is_full;
    if (groupFilter === 'submitted') return g.status === 'submitted';
    return true;
  });

  const filteredPosts = communityPosts.filter((p) => {
    if (postFilter === 'all') return true;
    return p.post_type === postFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/assignments"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Course Assignments</span>
        </Link>

        {userInGroup && !assignment.has_submitted && (
          <button
            onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <FileCheck className="w-4 h-4" />
            <span>Submit for {assignment.current_user_group.name}</span>
          </button>
        )}
      </div>

      {/* Main Assignment Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-xl border border-brand-200">
              {assignment.course_name}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Instructor: <strong className="text-slate-800">{assignment.teacher_name}</strong>
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {assignment.institution_name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {assignment.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1 font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Due: <strong className="text-slate-900">{dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              <span>Team Size: <strong className="text-slate-900">{assignment.min_team_size} to {assignment.max_team_size} Students</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Mandatory Group Capstone</span>
            </div>
          </div>
        </div>

        {/* 3 LIVE ANALYTIC KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* KPI 1: Class Submissions */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800">Class Submissions</span>
              <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {assignment.stats.submission_percentage}% Done
              </span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {assignment.stats.submitted_students_count} <span className="text-sm font-semibold text-slate-500">/ {assignment.stats.total_students_enrolled} students</span>
              </div>
              <div className="text-[11px] text-emerald-700 mt-1 font-medium">
                {assignment.stats.submitted_groups_count} completed team submissions verified
              </div>
            </div>
            <div className="w-full bg-emerald-200/60 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${assignment.stats.submission_percentage}%` }}
              />
            </div>
          </div>

          {/* KPI 2: Group Allocation */}
          <div className="p-5 rounded-2xl bg-brand-50/60 border border-brand-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-brand-800">Allotted Groups</span>
              <span className="text-xs font-black text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
                {assignment.stats.open_groups_count} Open
              </span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {assignment.stats.total_groups_count} <span className="text-sm font-semibold text-slate-500">groups formed</span>
              </div>
              <div className="text-[11px] text-brand-700 mt-1 font-medium">
                {assignment.stats.open_groups_count} looking for members • {assignment.stats.full_groups_count} locked
              </div>
            </div>
            <div className="w-full bg-brand-200/60 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((assignment.stats.total_groups_count / (assignment.stats.total_students_enrolled / 3)) * 100))}%` }}
              />
            </div>
          </div>

          {/* KPI 3: Your Group Status */}
          <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-800">Your Group Status</span>
              {assignment.has_submitted ? (
                <Badge variant="emerald" size="xs">Submitted</Badge>
              ) : userInGroup ? (
                <Badge variant="brand" size="xs">Active</Badge>
              ) : (
                <Badge variant="amber" size="xs">Need Group</Badge>
              )}
            </div>

            <div>
              {userInGroup ? (
                <div>
                  <div className="text-lg font-black text-slate-900 truncate">
                    {assignment.current_user_group.name}
                  </div>
                  <div className="text-xs text-indigo-700 font-semibold mt-0.5">
                    Role: {assignment.current_user_group.role_in_group}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-sm font-bold text-slate-900">Not in a group yet</div>
                  <div className="text-xs text-amber-700 mt-0.5">
                    Browse open groups or create your team below.
                  </div>
                </div>
              )}
            </div>

            {userInGroup ? (
              <button
                onClick={() => handleLeaveGroup(assignment.current_user_group.id)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-600 hover:text-rose-700"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave this group</span>
              </button>
            ) : (
              <button
                onClick={() => setShowCreateGroupModal(true)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 hover:text-indigo-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create a new group</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'groups'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Allotted Groups ({groups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('community')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'community'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Assignment Community ({communityPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('guidelines')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'guidelines'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Rubric & Guidelines</span>
        </button>
      </div>

      {/* TAB 1: ALLOTTED GROUPS */}
      {activeTab === 'groups' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setGroupFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  groupFilter === 'all'
                    ? 'bg-slate-200 text-slate-900'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Groups ({groups.length})
              </button>
              <button
                onClick={() => setGroupFilter('open')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  groupFilter === 'open'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Open for Members ({groups.filter(g => g.status === 'forming' && !g.is_full).length})
              </button>
              <button
                onClick={() => setGroupFilter('full')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  groupFilter === 'full'
                    ? 'bg-slate-200 text-slate-900'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Full Groups ({groups.filter(g => g.is_full).length})
              </button>
              <button
                onClick={() => setGroupFilter('submitted')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  groupFilter === 'submitted'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Submitted ({groups.filter(g => g.status === 'submitted').length})
              </button>
            </div>

            {!userInGroup && (
              <button
                onClick={() => setShowCreateGroupModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Group for Assignment</span>
              </button>
            )}
          </div>

          {/* Groups Grid */}
          {filteredGroups.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800">No groups in this filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Be the first to form a group for this assignment!
              </p>
              {!userInGroup && (
                <button
                  onClick={() => setShowCreateGroupModal(true)}
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-sm inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Team Now</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredGroups.map((grp) => {
                const spotsLeft = grp.max_size - grp.current_member_count;

                return (
                  <div
                    key={grp.id}
                    className={`bg-white rounded-3xl border transition-all p-6 space-y-5 flex flex-col justify-between ${
                      grp.is_member
                        ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md'
                        : 'border-slate-200 shadow-sm hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Group Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-lg text-slate-900">{grp.name}</h3>
                            {grp.is_member && (
                              <Badge variant="brand" size="xs">Your Team</Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Leader: <strong className="text-slate-700">{grp.leader_name}</strong>
                          </div>
                        </div>

                        {grp.status === 'submitted' ? (
                          <Badge variant="emerald" size="xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Submitted
                          </Badge>
                        ) : grp.is_full ? (
                          <Badge variant="slate" size="xs">Full ({grp.max_size}/{grp.max_size})</Badge>
                        ) : (
                          <Badge variant="amber" size="xs">
                            {spotsLeft} spot{spotsLeft > 1 ? 's' : ''} left
                          </Badge>
                        )}
                      </div>

                      {/* Members List */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Team Members ({grp.current_member_count} / {grp.max_size})
                        </label>
                        <div className="space-y-1.5">
                          {grp.members.map((mem) => (
                            <div
                              key={mem.user_id}
                              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                                  {mem.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <span>{mem.name}</span>
                                    {mem.user_id === grp.leader_id && (
                                      <span className="text-[9px] font-black uppercase text-brand-600 bg-brand-100 px-1.5 py-0.2 rounded">Lead</span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    {mem.institute_or_company || 'Student'} • {mem.role_in_group}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* If group has submitted, show submission info */}
                      {grp.status === 'submitted' && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                          <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Work Submitted</span>
                          </div>
                          {grp.submission_url && (
                            <a
                              href={grp.submission_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-600 hover:underline flex items-center gap-1 text-[11px] truncate font-medium"
                            >
                              <span>{grp.submission_url}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          )}
                          {grp.submission_notes && (
                            <p className="text-[11px] text-slate-600 italic">"{grp.submission_notes}"</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      {grp.is_member ? (
                        <>
                          <button
                            onClick={() => handleLeaveGroup(grp.id)}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700"
                          >
                            Leave Group
                          </button>
                          {grp.status !== 'submitted' && (
                            <button
                              onClick={() => setShowSubmitModal(true)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                            >
                              Submit Project
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {spotsLeft > 0 ? `${spotsLeft} vacancy available` : 'Group is complete'}
                          </div>
                          {!userInGroup && spotsLeft > 0 && grp.status !== 'submitted' && (
                            <button
                              onClick={() => {
                                setSelectedGroupToJoin(grp);
                                setShowJoinModal(true);
                              }}
                              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all"
                            >
                              Join Group
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ASSIGNMENT COMMUNITY */}
      {activeTab === 'community' && (
        <div className="space-y-6">
          {/* Post Message Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              <span>Assignment Community Discussion</span>
            </h3>
            <p className="text-xs text-slate-500">
              Ask questions about the rubric, search for teammates with specific skills, or discuss implementation ideas.
            </p>

            <form onSubmit={handleAddCommunityPost} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Category:</span>
                <select
                  value={newPostType}
                  onChange={(e) => setNewPostType(e.target.value)}
                  className="px-3 py-1 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold"
                >
                  <option value="discussion">General Discussion</option>
                  <option value="teammate_search">Looking for Teammates</option>
                  <option value="doubt">Doubt / Question</option>
                </select>
              </div>

              <textarea
                required
                rows={3}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Ask a question or post a teammate request..."
                className="w-full p-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-xs text-slate-800 placeholder:text-slate-400"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={posting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{posting ? 'Posting...' : 'Post to Community'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPostFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                postFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-600'
              }`}
            >
              All Posts ({communityPosts.length})
            </button>
            <button
              onClick={() => setPostFilter('teammate_search')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                postFilter === 'teammate_search' ? 'bg-brand-600 text-white' : 'bg-white border text-slate-600'
              }`}
            >
              Teammate Requests
            </button>
            <button
              onClick={() => setPostFilter('doubt')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                postFilter === 'doubt' ? 'bg-amber-600 text-white' : 'bg-white border text-slate-600'
              }`}
            >
              Doubts & Questions
            </button>
          </div>

          {/* Posts Feed */}
          {filteredPosts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-3xl border border-slate-200">
              No community posts in this category yet. Start the conversation above!
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                        {post.author_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{post.author_name}</div>
                        <div className="text-[10px] text-slate-500">
                          {post.author_institute || 'Student'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        post.post_type === 'teammate_search'
                          ? 'bg-brand-100 text-brand-800'
                          : post.post_type === 'doubt'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {post.post_type === 'teammate_search' ? 'Looking for Team' : post.post_type === 'doubt' ? 'Doubt' : 'Discussion'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed pl-10 whitespace-pre-line">
                    {post.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GUIDELINES & RUBRIC */}
      {activeTab === 'guidelines' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-900">Assignment Rubric & Submission Guidelines</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Read all requirements carefully before starting group formation.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="font-bold text-slate-900">Problem Statement:</div>
            <p className="text-slate-700 leading-relaxed">{assignment.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900">Team Constraints:</div>
              <ul className="space-y-1 text-slate-600 list-disc list-inside">
                <li>Minimum Team Members: {assignment.min_team_size}</li>
                <li>Maximum Team Members: {assignment.max_team_size}</li>
                <li>All members must participate in coding and documentation.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900">Deliverables Required:</div>
              <ul className="space-y-1 text-slate-600 list-disc list-inside">
                <li>Public or Classroom GitHub repository link</li>
                <li>Comprehensive README with architecture diagram</li>
                <li>Test coverage or live deployment URL</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      {showCreateGroupModal && (
        <Modal
          isOpen={showCreateGroupModal}
          onClose={() => setShowCreateGroupModal(false)}
          title="Create a Group for this Assignment"
        >
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Group Name *
              </label>
              <input
                type="text"
                required
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g. Team CloudNinjas"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Your Role in the Group
              </label>
              <input
                type="text"
                value={newGroupRole}
                onChange={(e) => setNewGroupRole(e.target.value)}
                placeholder="e.g. Team Lead & Backend"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateGroupModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingGroup}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm disabled:opacity-50"
              >
                {creatingGroup ? 'Creating...' : 'Create Team Group'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* JOIN GROUP MODAL */}
      {showJoinModal && selectedGroupToJoin && (
        <Modal
          isOpen={showJoinModal}
          onClose={() => {
            setShowJoinModal(false);
            setSelectedGroupToJoin(null);
          }}
          title={`Join ${selectedGroupToJoin.name}`}
        >
          <form onSubmit={handleJoinGroup} className="space-y-4">
            <p className="text-xs text-slate-600">
              You are joining <strong>{selectedGroupToJoin.name}</strong> for {assignment.course_name}. Specify your contribution role.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Your Target Role
              </label>
              <input
                type="text"
                required
                value={joinRole}
                onChange={(e) => setJoinRole(e.target.value)}
                placeholder="e.g. Frontend Developer, ML Engineer, Tester"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowJoinModal(false);
                  setSelectedGroupToJoin(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={joiningGroup}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm disabled:opacity-50"
              >
                {joiningGroup ? 'Joining...' : 'Confirm Join'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* SUBMIT ASSIGNMENT MODAL */}
      {showSubmitModal && assignment.current_user_group && (
        <Modal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          title={`Submit Work for ${assignment.current_user_group.name}`}
        >
          <form onSubmit={handleSubmitAssignment} className="space-y-4">
            <p className="text-xs text-slate-600">
              Submit your team's code repository or project link. This will mark the assignment as <strong>Submitted</strong> for all members of your group.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Project / GitHub Repository Link *
              </label>
              <input
                type="url"
                required
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                placeholder="https://github.com/myteam/assignment-code"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Submission Notes / Live Demo URL
              </label>
              <textarea
                rows={3}
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder="Describe key features implemented, Docker instructions, or bonus credits..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

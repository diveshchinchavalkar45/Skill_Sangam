import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import {
  MessageSquare,
  Send,
  Users,
  Compass,
  ArrowRight,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react';

export default function MessagesPage() {
  const { user, showToast } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load user's projects
  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      try {
        const res = await api.get(`/users/${user.id}/projects`);
        const userProjects = res.data?.projects || [];
        setProjects(userProjects);

        const paramProjectId = searchParams.get('projectId');
        if (paramProjectId) {
          const matched = userProjects.find((p) => p.id === paramProjectId);
          if (matched) setActiveProject(matched);
          else if (userProjects.length > 0) setActiveProject(userProjects[0]);
        } else if (userProjects.length > 0) {
          setActiveProject(userProjects[0]);
        }
      } catch (err) {
        console.error('Failed to load messaging projects:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) loadProjects();
  }, [user?.id, searchParams]);

  // Load messages for active project
  const loadMessages = async () => {
    if (!activeProject?.id) return;
    try {
      const res = await api.get(`/messages/${activeProject.id}`);
      if (res.success && res.data) {
        setMessages(res.data.messages || []);
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      console.error('Failed to load project messages:', err);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Polling for new messages
    return () => clearInterval(interval);
  }, [activeProject?.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeProject?.id) return;

    setSending(true);
    const textToSend = messageText.trim();
    setMessageText('');

    try {
      const res = await api.post(`/messages/${activeProject.id}`, {
        message: textToSend,
      });

      if (res.success && res.data?.message) {
        setMessages((prev) => [...prev, res.data.message]);
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      showToast(err.message || 'Failed to send message', 'error');
      setMessageText(textToSend); // Restore if error
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner message="Opening project discussions..." />;

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No Project Conversations"
        description="Project discussions are created automatically when you create a project or join a team."
        actionText="Explore Projects"
        actionLink="/projects"
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-brand-600" />
          <span>Project Team Collaboration</span>
        </h1>
        <p className="text-xs text-slate-500">Communicate directly with teammates and project leads</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[580px]">
        {/* LEFT: Project List Sidebar */}
        <div className="border-r border-slate-100 bg-slate-50/50 flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Project Teams ({projects.length})
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1 max-h-[500px]">
            {projects.map((p) => {
              const isSelected = activeProject?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveProject(p);
                    setSearchParams({ projectId: p.id });
                  }}
                  className={`w-full text-left p-4 transition-colors flex flex-col gap-1 ${
                    isSelected ? 'bg-white border-l-4 border-brand-600 shadow-sm' : 'hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900 line-clamp-1">{p.title}</span>
                    <Badge variant="brand" size="xs">
                      {p.domain_name}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500 line-clamp-1">
                    {p.is_owner ? '👑 Project Owner' : `Role: ${p.role_in_project || 'Member'}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Active Chat Conversation */}
        <div className="md:col-span-2 flex flex-col justify-between bg-white h-[580px]">
          {/* Conversation Header */}
          {activeProject && (
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 line-clamp-1">
                  {activeProject.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {activeProject.is_owner ? 'Your Project' : 'Team Workspace'} • {activeProject.event_name || 'Hackathon Sprint'}
                </p>
              </div>

              <Link
                to={`/projects/${activeProject.id}`}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>Project Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/30">
            {messages.length > 0 ? (
              messages.map((m) => {
                const isMine = m.is_mine || m.sender_id === user?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-end gap-2 max-w-[80%]">
                      {!isMine && (
                        <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {m.sender_image ? (
                            <img src={m.sender_image} alt={m.sender_name} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            m.sender_name?.charAt(0) || 'U'
                          )}
                        </div>
                      )}

                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                          isMine
                            ? 'bg-brand-600 text-white rounded-br-sm'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-sm'
                        }`}
                      >
                        {!isMine && (
                          <div className="text-[11px] font-bold text-brand-700 mb-1">
                            {m.sender_name}
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{m.message}</p>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                      <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMine && <CheckCheck className="w-3 h-3 text-slate-400" />}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <MessageSquare className="w-8 h-8 mb-2 text-slate-300" />
                <p className="text-xs font-semibold">No messages in this project yet.</p>
                <p className="text-[11px] text-slate-400">Say hello and introduce yourself to the team!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Message ${activeProject?.title || 'team'}...`}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <button
              type="submit"
              disabled={sending || !messageText.trim()}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

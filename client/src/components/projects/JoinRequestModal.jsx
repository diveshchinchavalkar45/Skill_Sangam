import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import Modal from '../common/Modal';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Send, Sparkles } from 'lucide-react';

export default function JoinRequestModal({ isOpen, onClose, project, onSuccess }) {
  const { user, showToast } = useAuth();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!project) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post(`/projects/${project.id}/join-request`, {
        message: message.trim() || undefined,
      });

      if (res.success) {
        showToast('Join request submitted to project owner!');
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Request to Join: ${project.title}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Introductory Note for Project Owner
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Hi! I noticed you are building ${project.title}. I have relevant skills in ${project.required_skills?.slice(0, 2).map(s => typeof s === 'string' ? s : s.name).join(', ')} and would love to collaborate.`}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm text-slate-800 placeholder:text-slate-400"
          />
          <p className="text-xs text-slate-400 mt-1">
            Briefly describe why your skills and experience are a great fit for this project.
          </p>
        </div>

        {project.match && (
          <div className="p-3 rounded-xl bg-brand-50/70 border border-brand-100 flex items-center gap-2 text-xs text-brand-800">
            <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
            <span>
              Your profile has a <strong>{project.match.matchScore}% Match</strong> with this project!
            </span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Sending...' : 'Send Join Request'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

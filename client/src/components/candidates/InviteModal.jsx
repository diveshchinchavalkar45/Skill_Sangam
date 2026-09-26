import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import Modal from '../common/Modal';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Send, Sparkles } from 'lucide-react';

export default function InviteModal({ isOpen, onClose, candidate, projectId, projectRoles = [], onSuccess }) {
  const { showToast } = useAuth();
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!candidate) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post(`/projects/${projectId}/invitations`, {
        inviteeId: candidate.id,
        roleId: selectedRoleId || undefined,
        message: message.trim() || undefined,
      });

      if (res.success) {
        showToast(`Invitation sent to ${candidate.name}!`);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      showToast(err.message || 'Failed to send invitation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Invite ${candidate.name} to Team`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Suggested Project Role
          </label>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm text-slate-800 bg-white"
          >
            <option value="">Select a role (or general member)...</option>
            {projectRoles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Invitation Message
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Hey ${candidate.name}, we reviewed your profile and your skills would make a huge impact on our project!`}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {candidate.match && (
          <div className="p-3 rounded-xl bg-brand-50/70 border border-brand-100 flex items-center gap-2 text-xs text-brand-800">
            <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
            <span>
              <strong>{candidate.match.matchScore}% Match!</strong> {candidate.match.reasons?.[0]}
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
            <span>{submitting ? 'Sending...' : 'Send Invitation'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

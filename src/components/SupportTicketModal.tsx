import React, { useState } from 'react';
import { X, HelpCircle, Send } from 'lucide-react';
import { submitSupportTicket } from '../lib/emailService';
import { useAuth } from '../context/AuthContext';

interface SupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportTicketModal: React.FC<SupportTicketModalProps> = ({ isOpen, onClose }) => {
  const { user, userProfile } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [category, setCategory] = useState('General Support');
  const [priority, setPriority] = useState('Normal');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await submitSupportTicket({
        senderEmail: email,
        senderUsername: userProfile?.username || '',
        isUsernameVerified: Boolean(userProfile?.isVerified),
        category,
        priority,
        subject,
        message,
      });

      if (res.success) {
        setSuccessMsg(`Ticket #${res.ticketId} created! An acknowledgement has been sent to your email.`);
        setTimeout(() => {
          setSuccessMsg('');
          setSubject('');
          setMessage('');
          onClose();
        }, 2000);
      } else {
        setErrorMsg(res.error || 'Failed to submit ticket');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with support gateway');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#131c2e] border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <HelpCircle className="w-6 h-6 text-indigo-400" />
          <div>
            <h3 className="text-base font-bold text-white">Contact RezSocials Support</h3>
            <p className="text-xs text-slate-400">Official inquiries to rezsocials.support@gmail.com</p>
          </div>
        </div>

        {successMsg ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl text-center">
            {successMsg}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {errorMsg && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-300 mb-1">Your Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="General Support">General Support</option>
                  <option value="Badge Requests">Badge Requests</option>
                  <option value="Account Appeals">Account Appeals</option>
                  <option value="Bug Reports">Bug Reports</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Brief summary of your request"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Please describe your inquiry or issue..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-2.5 rounded-lg text-xs transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Send Inquiry'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

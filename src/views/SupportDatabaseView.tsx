import React, { useState, useEffect } from 'react';
import { LifeBuoy, Search, Filter, Send, User, Clock, CheckCircle, FileText } from 'lucide-react';
import { fetchSupportMailbox, replyToSupportTicket, updateTicketStatus, assignTicketStaff, addTicketNote } from '../lib/emailService';
import { SUPPORT_TEMPLATES } from '../lib/supportTemplates';
import { useAuth } from '../context/AuthContext';
import { SupportTicket, SupportAuditLog } from '../types';

export const SupportDatabaseView: React.FC = () => {
  const { isFounder, isAdmin, isModerator } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [auditLogs, setAuditLogs] = useState<SupportAuditLog[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const canAccess = isFounder || isAdmin || isModerator;

  const loadData = async () => {
    try {
      const data = await fetchSupportMailbox();
      if (data.success) {
        setTickets(data.tickets || []);
        setAuditLogs(data.auditLogs || []);
        if (selectedTicket) {
          const updated = (data.tickets || []).find((t: SupportTicket) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canAccess) {
      setLoading(false);
      return;
    }
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [canAccess]);

  if (!canAccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <p className="text-rose-400">Access Restricted: Staff credentials required.</p>
      </div>
    );
  }

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    try {
      await replyToSupportTicket({
        ticketId: selectedTicket.id,
        category: selectedTicket.category,
        subject: `Re: ${selectedTicket.subject}`,
        message: replyText.trim(),
        newStatus: 'Awaiting User',
      });
      setReplyText('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedTicket) return;
    try {
      await updateTicketStatus(selectedTicket.id, status);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyTemplate = (tmpl: any) => {
    let replaced = tmpl.content.replace('{{username}}', selectedTicket?.senderUsername || selectedTicket?.senderEmail.split('@')[0] || 'User');
    setReplyText(replaced);
  };

  const filteredTickets = tickets.filter(t => {
    const matchesCat = filterCategory === 'ALL' || t.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const matchesSearch = !searchTerm ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.senderEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.senderUsername && t.senderUsername.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LifeBuoy className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Support Mailbox & CRM</h2>
        </div>
        <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          rezsocials.support@gmail.com
        </span>
      </div>

      {/* Main Support Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tickets List */}
        <div className="lg:col-span-5 bg-[#131c2e] border border-slate-800 rounded-2xl p-4 flex flex-col h-[700px]">
          {/* Filter Toolbar */}
          <div className="space-y-2 mb-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticket #, email, subject..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="General Support">General Support</option>
                <option value="Badge Requests">Badge Requests</option>
                <option value="Account Appeals">Account Appeals</option>
                <option value="Bug Reports">Bug Reports</option>
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="New">New</option>
                <option value="Awaiting User">Awaiting User</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Ticket Items Scroll */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="text-center py-12 text-xs text-slate-500">Loading tickets...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">No support tickets found.</div>
            ) : (
              filteredTickets.map(t => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedTicket?.id === t.id
                      ? 'bg-indigo-950/40 border-indigo-500/50 text-white'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-indigo-400">#{t.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                      {t.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold truncate">{t.subject}</h4>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                    <span className="truncate max-w-[150px]">{t.senderEmail}</span>
                    <span>{new Date(t.updatedAt || t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Selected Ticket Detail */}
        <div className="lg:col-span-7 bg-[#131c2e] border border-slate-800 rounded-2xl p-6 flex flex-col h-[700px]">
          {selectedTicket ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs text-indigo-400 font-bold">Ticket #{selectedTicket.id}</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{selectedTicket.subject}</h3>
                  </div>
                  <select
                    value={selectedTicket.status}
                    onChange={e => handleStatusChange(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2 py-1 font-medium focus:outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Awaiting User">Awaiting User</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>From: <strong className="text-slate-200">{selectedTicket.senderEmail}</strong></span>
                  {selectedTicket.senderUsername && (
                    <span>Username: <strong className="text-slate-200">@{selectedTicket.senderUsername}</strong></span>
                  )}
                  <span>Category: <strong className="text-slate-200">{selectedTicket.category}</strong></span>
                </div>
              </div>

              {/* Thread History */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                {(selectedTicket.history || []).map((h, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs ${
                      h.senderType === 'staff_reply'
                        ? 'bg-indigo-950/30 border-indigo-500/30 ml-4 text-indigo-100'
                        : 'bg-slate-900/70 border-slate-800 mr-4 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 font-semibold text-[11px] text-slate-400">
                      <span>{h.senderName}</span>
                      <span>{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">{h.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Box & Quick Templates */}
              <div className="border-t border-slate-800 pt-3">
                {/* Template Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 shrink-0">
                    <FileText className="w-3 h-3" /> Templates:
                  </span>
                  {SUPPORT_TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleApplyTemplate(t)}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md text-[10px] text-slate-300 shrink-0"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Dispatch official response to user..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none mb-2"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Staff Response</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs text-center">
              <LifeBuoy className="w-8 h-8 mb-2 opacity-50" />
              <span>Select a support ticket from the list to view history and respond.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

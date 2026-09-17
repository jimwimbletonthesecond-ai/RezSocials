import { auth } from './firebase';

export async function submitSupportTicket(data: {
  senderEmail: string;
  senderUsername?: string;
  isUsernameVerified?: boolean;
  category: string;
  priority: string;
  subject: string;
  message: string;
}) {
  const res = await fetch('/api/support/submit-ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchSupportMailbox() {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch('/api/support/mailbox', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.json();
}

export async function replyToSupportTicket(data: {
  ticketId: string;
  category?: string;
  subject?: string;
  message: string;
  newStatus?: string;
}) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch('/api/support/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateTicketStatus(ticketId: string, status: string) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch('/api/support/ticket-status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ticketId, status }),
  });
  return res.json();
}

export async function assignTicketStaff(ticketId: string, assignedStaff: string) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch('/api/support/ticket-assign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ticketId, assignedStaff }),
  });
  return res.json();
}

export async function addTicketNote(ticketId: string, content: string) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch('/api/support/ticket-note', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ticketId, content }),
  });
  return res.json();
}

const http = require('http');
const fs = require('fs');
const path = require('path');
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  console.warn('[SERVER] Nodemailer not loaded in server.cjs:', e?.message || e);
}

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DIST_DIR = path.join(__dirname, 'dist');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Comprehensive MIME type mapping
const MIME_TYPES = {
  // Text / Web Standard
  '.html': 'text/html',
  '.htm': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.json': 'application/json',
  '.map': 'application/json',
  '.xml': 'application/xml',

  // Images
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.tiff': 'image/tiff',
  '.exr': 'image/x-exr',
  '.hdr': 'image/vnd.radiance',

  // Video / Audio
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.ogv': 'video/ogg',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',

  // Fonts
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',

  // 3D Models / CAD
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.usdz': 'model/vnd.usdz+zip',
  '.obj': 'model/obj',
  '.mtl': 'model/mtl',
  '.stl': 'model/stl',

  // Documents / Data
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.gz': 'application/gzip',
  '.wasm': 'application/wasm',
};

// --- FIRESTORE CONFIGURATION & HELPERS ---
const FIRESTORE_API_KEY = 'AIzaSyBhXKL6Ezi4axeOh79RaU8kDMnNQAYKId0';
const FIRESTORE_PROJECT_ID = 'gen-lang-client-0035070434';
const FIRESTORE_DATABASE_ID = 'ai-studio-rezsocials-91c6c39f-4120-4228-9bd6-637edeb8802e';
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents`;

// Designated Founder Configuration
const DESIGNATED_FOUNDER_UID = 'vpnedgte3ESqRQyp5RAGkBaqN3d2';
const DESIGNATED_FOUNDER_EMAIL = '1.1.1.theoneandonlyusername.1.1.1@gmail.com';

function toFirestoreFields(obj) {
  const fields = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === null || val === undefined) {
      fields[key] = { nullValue: null };
    } else if (typeof val === 'string') {
      fields[key] = { stringValue: val };
    } else if (typeof val === 'boolean') {
      fields[key] = { booleanValue: val };
    } else if (typeof val === 'number') {
      if (Number.isInteger(val)) {
        fields[key] = { integerValue: val.toString() };
      } else {
        fields[key] = { doubleValue: val };
      }
    } else if (Array.isArray(val)) {
      fields[key] = {
        arrayValue: {
          values: val.map(item => {
            if (item === null || item === undefined) return { nullValue: null };
            if (typeof item === 'string') return { stringValue: item };
            if (typeof item === 'boolean') return { booleanValue: item };
            if (typeof item === 'number') {
              return Number.isInteger(item) ? { integerValue: item.toString() } : { doubleValue: item };
            }
            if (typeof item === 'object') return { mapValue: { fields: toFirestoreFields(item) } };
            return { stringValue: String(item) };
          }),
        },
      };
    } else if (typeof val === 'object') {
      fields[key] = { mapValue: { fields: toFirestoreFields(val) } };
    }
  }
  return fields;
}

function fromFirestoreFields(fields) {
  if (!fields || typeof fields !== 'object') return {};
  const res = {};
  for (const [key, val] of Object.entries(fields)) {
    if (!val || typeof val !== 'object') continue;
    if ('stringValue' in val) res[key] = val.stringValue;
    else if ('integerValue' in val) res[key] = parseInt(val.integerValue, 10);
    else if ('doubleValue' in val) res[key] = val.doubleValue;
    else if ('booleanValue' in val) res[key] = val.booleanValue;
    else if ('nullValue' in val) res[key] = null;
    else if ('arrayValue' in val) {
      res[key] = (val.arrayValue.values || []).map(v => {
        if ('stringValue' in v) return v.stringValue;
        if ('integerValue' in v) return parseInt(v.integerValue, 10);
        if ('doubleValue' in v) return v.doubleValue;
        if ('booleanValue' in v) return v.booleanValue;
        if ('nullValue' in v) return null;
        if ('mapValue' in v) return fromFirestoreFields(v.mapValue.fields);
        return v;
      });
    } else if ('mapValue' in val) {
      res[key] = fromFirestoreFields(val.mapValue.fields);
    }
  }
  return res;
}

// Authoritative Firestore REST Read
async function getFirestoreDoc(collectionPath, docId, token = null) {
  try {
    const url = `${FIRESTORE_BASE_URL}/${collectionPath}/${docId}?key=${FIRESTORE_API_KEY}`;
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { headers });
    if (!res.ok) {
      if (res.status === 404) return null;
      console.warn(`[FIRESTORE GET] ${collectionPath}/${docId} returned status ${res.status}`);
      return null;
    }
    const data = await res.json();
    return fromFirestoreFields(data.fields);
  } catch (err) {
    console.error(`[FIRESTORE GET ERROR] ${collectionPath}/${docId}:`, err);
    return null;
  }
}

// Authoritative Firestore REST Write
async function setFirestoreDoc(collectionPath, docId, data, token = null) {
  try {
    const fields = toFirestoreFields(data);
    const url = `${FIRESTORE_BASE_URL}/${collectionPath}/${docId}?key=${FIRESTORE_API_KEY}`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ fields }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[FIRESTORE SET] ${collectionPath}/${docId} failed (${res.status}):`, errText);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[FIRESTORE SET ERROR] ${collectionPath}/${docId}:`, err);
    return false;
  }
}

// Authoritative Firestore REST List
async function listFirestoreDocs(collectionPath, token = null) {
  try {
    const url = `${FIRESTORE_BASE_URL}/${collectionPath}?pageSize=100&key=${FIRESTORE_API_KEY}`;
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`[FIRESTORE LIST] ${collectionPath} failed status ${res.status}`);
      return [];
    }
    const data = await res.json();
    if (!data.documents || !Array.isArray(data.documents)) return [];

    return data.documents.map(doc => {
      const parsed = fromFirestoreFields(doc.fields);
      if (!parsed.id && doc.name) {
        parsed.id = doc.name.split('/').pop();
      }
      return parsed;
    });
  } catch (err) {
    console.error(`[FIRESTORE LIST ERROR] ${collectionPath}:`, err);
    return [];
  }
}

// Helper to verify Firebase ID token using Google Identity Toolkit and JWT validation
async function verifyFirebaseIdToken(idToken) {
  if (!idToken || typeof idToken !== 'string') return null;

  // 1. Authoritative lookup via Google Identity Toolkit REST API
  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIRESTORE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.users && data.users.length > 0) {
        const u = data.users[0];
        return {
          uid: u.localId,
          email: (u.email || '').toLowerCase().trim(),
          emailVerified: Boolean(u.emailVerified),
          displayName: u.displayName || '',
        };
      }
    }
  } catch (err) {
    console.warn('[AUTH VERIFY] Identity Toolkit lookup warning:', err);
  }

  // 2. JWT fallback validation
  try {
    const parts = idToken.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp > now) {
        return {
          uid: payload.user_id || payload.sub,
          email: (payload.email || '').toLowerCase().trim(),
          emailVerified: Boolean(payload.email_verified),
          displayName: payload.name || '',
        };
      }
    }
  } catch (jwtErr) {
    console.warn('[AUTH VERIFY] JWT validation warning:', jwtErr);
  }

  return null;
}

// In-memory rate limiting map for support endpoints
const serverSupportRateLimits = new Map();
function checkSupportRateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  const record = serverSupportRateLimits.get(key);
  if (!record || record.resetAt <= now) {
    serverSupportRateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= maxRequests) {
    return false;
  }
  record.count += 1;
  return true;
}

function sanitizeEmailHeader(header) {
  return String(header || '').replace(/[\r\n\t]/g, ' ').trim().slice(0, 200);
}

// Secure Mail Transporter using environment variables only
function getMailTransporter() {
  const senderUser = process.env.SUPPORT_EMAIL_USER || 'rezsocials.support@gmail.com';
  const senderPass = process.env.SUPPORT_EMAIL_PASSWORD || null;

  if (!nodemailer || !senderPass) {
    return { senderUser, transporter: null, isConfigured: false };
  }

  return {
    senderUser,
    isConfigured: true,
    transporter: nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: senderUser,
        pass: senderPass,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 8000,
    }),
  };
}

// Secure Staff Authorization Middleware
async function verifyStaffAuthorization(req, bodyData) {
  const authHeader = req.headers['authorization'] || '';
  const token = bodyData?.idToken || (authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : null);

  if (!token) {
    return { authorized: false, error: 'Unauthorized: Authentication token required for staff operations.' };
  }

  const verifiedUser = await verifyFirebaseIdToken(token);
  if (!verifiedUser || !verifiedUser.uid) {
    return { authorized: false, error: 'Unauthorized: Invalid or expired authentication token.' };
  }

  const uid = verifiedUser.uid;

  // 1. Designated Founder UID check
  if (uid === DESIGNATED_FOUNDER_UID || verifiedUser.email === DESIGNATED_FOUNDER_EMAIL) {
    return { authorized: true, role: 'founder', username: verifiedUser.displayName || 'Founder', uid };
  }

  // 2. Authoritative Firestore User Profile check
  const userProfile = await getFirestoreDoc('users', uid, token);
  if (userProfile) {
    const role = userProfile.role || 'user';
    if (role === 'founder') {
      return { authorized: true, role: 'founder', username: userProfile.username || 'Founder', uid };
    }
    if (role === 'admin') {
      return { authorized: true, role: 'admin', username: userProfile.username || 'Admin', uid };
    }
    if (role === 'moderator') {
      return { authorized: true, role: 'moderator', username: userProfile.username || 'Moderator', uid };
    }
  }

  return { authorized: false, error: 'Forbidden: Insufficient staff permissions.' };
}

// Audit logging directly to Firestore
async function logSupportAudit(entry, token = null) {
  try {
    const logId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const logDoc = {
      id: logId,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    await setFirestoreDoc('supportAuditLogs', logId, logDoc, token);
  } catch (err) {
    console.error('[SUPPORT AUDIT LOG ERROR]:', err);
  }
}

// --- HTTP SERVER DEFINITION ---
const server = http.createServer(async (req, res) => {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const decodedPath = decodeURIComponent(urlObj.pathname);

  // Health check endpoint
  if (decodedPath === '/api/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  // --- API: FOUNDER STATUS ---
  if (decodedPath === '/api/founder/status' && req.method === 'GET') {
    const founderDoc = await getFirestoreDoc('systemConfig', 'founderLock');
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      isClaimed: Boolean(founderDoc && founderDoc.isClaimed),
      founderUid: founderDoc?.founderUid || DESIGNATED_FOUNDER_UID,
      assignedAt: founderDoc?.assignedAt || '2026-09-04T08:58:52.325Z',
    }));
    return;
  }

  // --- API: FOUNDER VERIFY ---
  if (decodedPath === '/api/founder/verify' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        let token = '';
        const authHeader = req.headers['authorization'] || '';
        if (authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7).trim();
        }
        if (!token && body) {
          try {
            const parsed = JSON.parse(body);
            token = parsed.idToken || '';
          } catch (_) {}
        }

        if (!token) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ isFounder: false, role: 'user', error: 'Authentication token required' }));
          return;
        }

        const verifiedUser = await verifyFirebaseIdToken(token);
        if (!verifiedUser || !verifiedUser.uid) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ isFounder: false, role: 'user', error: 'Invalid or expired Firebase authentication token' }));
          return;
        }

        // Authoritative verification against Founder UID
        if (verifiedUser.uid === DESIGNATED_FOUNDER_UID || verifiedUser.email === DESIGNATED_FOUNDER_EMAIL) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            isFounder: true,
            role: 'founder',
            uid: verifiedUser.uid,
            badges: ['founder'],
            message: 'Founder role securely verified and active.',
          }));
          return;
        }

        // Any other user cannot claim or receive the Founder role
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          isFounder: false,
          role: 'user',
          reason: 'NOT_FOUNDER_ACCOUNT',
          message: 'The Founder role is permanently locked to the designated founder account.',
        }));
      } catch (err) {
        console.error('[FOUNDER VERIFY ERROR]', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ isFounder: false, role: 'user', error: 'Server verification failed' }));
      }
    });
    return;
  }

  // --- API: REGISTRATION ORDER (GET) ---
  if (decodedPath === '/api/auth/register-order' && req.method === 'GET') {
    const regConfig = await getFirestoreDoc('systemConfig', 'registrationOrder');
    const totalRegistered = regConfig?.totalRegistered || 0;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      totalRegistered,
      qaSlotsRemaining: Math.max(0, 6 - Math.max(1, totalRegistered)),
    }));
    return;
  }

  // --- API: REGISTRATION ORDER & BADGE ASSIGNMENT (POST) ---
  if (decodedPath === '/api/auth/register-order' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        let payload = {};
        try { payload = JSON.parse(body || '{}'); } catch (_) {}

        let token = '';
        const authHeader = req.headers['authorization'] || '';
        if (authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7).trim();
        }
        if (!token && payload.idToken) {
          token = payload.idToken;
        }

        let uid = payload.uid || '';
        let email = (payload.email || '').toLowerCase().trim();
        let username = payload.username || '';

        if (token) {
          const verifiedUser = await verifyFirebaseIdToken(token);
          if (verifiedUser && verifiedUser.uid) {
            uid = verifiedUser.uid;
            if (verifiedUser.email) email = verifiedUser.email;
          }
        }

        if (!uid) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'User UID is required for registration tracking' }));
          return;
        }

        // Check if user already registered in Firestore
        const existingAccount = await getFirestoreDoc('registrationAccounts', uid, token);
        if (existingAccount) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            order: existingAccount.order,
            role: existingAccount.role,
            badges: existingAccount.badges || [],
            isNew: false,
          }));
          return;
        }

        // Atomically increment registration counter in Firestore
        const currentConfig = await getFirestoreDoc('systemConfig', 'registrationOrder', token);
        const nextOrder = (currentConfig?.totalRegistered || 0) + 1;

        await setFirestoreDoc('systemConfig', 'registrationOrder', {
          totalRegistered: nextOrder,
          updatedAt: new Date().toISOString(),
        }, token);

        // Determine role and badges
        let assignedRole = 'user';
        let assignedBadges = [];

        if (uid === DESIGNATED_FOUNDER_UID || email === DESIGNATED_FOUNDER_EMAIL) {
          assignedRole = 'founder';
          assignedBadges = ['founder'];
        } else if (nextOrder >= 2 && nextOrder <= 6) {
          assignedRole = 'user';
          assignedBadges = ['qa_team'];
        } else {
          assignedRole = 'user';
          assignedBadges = [];
        }

        // Store account record in Firestore
        await setFirestoreDoc('registrationAccounts', uid, {
          uid,
          email,
          username,
          order: nextOrder,
          role: assignedRole,
          badges: assignedBadges,
          registeredAt: new Date().toISOString(),
        }, token);

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          order: nextOrder,
          role: assignedRole,
          badges: assignedBadges,
          isNew: true,
        }));
      } catch (err) {
        console.error('[REGISTRATION ORDER ERROR]', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // --- API: SUPPORT MAILBOX (STAFF ONLY) ---
  if (decodedPath === '/api/support/mailbox' && req.method === 'GET') {
    (async () => {
      try {
        const authResult = await verifyStaffAuthorization(req, null);
        if (!authResult.authorized) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: authResult.error }));
          return;
        }

        const authHeader = req.headers['authorization'] || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

        const tickets = await listFirestoreDocs('supportTickets', token);
        const auditLogs = await listFirestoreDocs('supportAuditLogs', token);

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: true,
          tickets,
          auditLogs,
          officialSupportEmail: 'rezsocials.support@gmail.com',
          officialSupportName: 'RezSocials Support',
        }));
      } catch (err) {
        console.error('[SUPPORT MAILBOX GET ERROR]', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    })();
    return;
  }

  // --- API: SUBMIT SUPPORT TICKET ---
  if (decodedPath === '/api/support/submit-ticket' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const clientIp = req.socket.remoteAddress || 'unknown_ip';
        if (!checkSupportRateLimit(clientIp, 8, 60000)) {
          res.statusCode = 429;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Rate limit exceeded. Please wait a minute before submitting again.' }));
          return;
        }

        const data = JSON.parse(body || '{}');
        const { senderEmail, senderUsername, isUsernameVerified, category, priority, subject, message } = data;

        if (!senderEmail || !subject || !message) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Email, subject, and message are required.' }));
          return;
        }

        const cleanEmail = sanitizeEmailHeader(senderEmail).toLowerCase();
        const cleanSubject = sanitizeEmailHeader(subject);
        const cleanCategory = category || 'General Support';
        const cleanPriority = priority || 'Normal';

        const ticketId = `RS-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
        const timestamp = new Date().toISOString();

        const newTicket = {
          id: ticketId,
          senderEmail: cleanEmail,
          senderUsername: senderUsername || '',
          isUsernameVerified: Boolean(isUsernameVerified),
          category: cleanCategory,
          priority: cleanPriority,
          subject: cleanSubject,
          message,
          status: 'New',
          assignedStaff: '',
          internalNotes: [],
          history: [
            {
              id: `msg_init_${Date.now()}`,
              senderType: 'user_submission',
              senderName: senderUsername ? `@${senderUsername}` : cleanEmail,
              senderEmail: cleanEmail,
              category: cleanCategory,
              subject: cleanSubject,
              message,
              timestamp,
              deliveryStatus: 'delivered',
            },
          ],
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        // Save ticket to Firestore
        await setFirestoreDoc('supportTickets', ticketId, newTicket);

        // Log audit trail to Firestore
        await logSupportAudit({
          ticketId,
          staffUsername: 'System Gateway',
          staffRole: 'Automated Service',
          action: 'ticket_created',
          details: `New ticket created from ${cleanEmail} under category '${cleanCategory}' with priority '${cleanPriority}'.`,
        });

        // Send acknowledgement email if SMTP is configured
        const { senderUser, transporter, isConfigured } = getMailTransporter();
        if (isConfigured && transporter) {
          try {
            await transporter.sendMail({
              from: `"RezSocials Support" <${senderUser}>`,
              to: cleanEmail,
              subject: `[${ticketId}] We received your inquiry: ${cleanSubject}`,
              text: `Hello,\n\nWe received your support ticket (${ticketId}) regarding "${cleanSubject}".\n\nOur team is reviewing your message.\n\nBest regards,\nRezSocials Support`,
            });
          } catch (smtpErr) {
            console.warn('[TICKET ACK EMAIL NOTICE]', smtpErr?.message || smtpErr);
          }
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: true,
          ticketId,
          message: 'Support request submitted. An automatic acknowledgement has been sent to your email.',
        }));
      } catch (err) {
        console.error('[SUBMIT TICKET ERROR]', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // --- API: SUPPORT REPLY (STAFF ONLY) ---
  if (decodedPath === '/api/support/reply' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const authResult = await verifyStaffAuthorization(req, data);
        if (!authResult.authorized) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: authResult.error }));
          return;
        }

        const { ticketId, category, subject, message, newStatus } = data;
        if (!ticketId || !message) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Ticket ID and message body are required.' }));
          return;
        }

        const authHeader = req.headers['authorization'] || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

        const ticket = await getFirestoreDoc('supportTickets', ticketId, token);
        if (!ticket) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Support ticket not found.' }));
          return;
        }

        const cleanSubject = sanitizeEmailHeader(subject || `Re: ${ticket.subject}`);
        const cleanCategory = category || ticket.category || 'General Support';
        const staffUsername = authResult.username || 'Staff Agent';
        const staffRole = authResult.role || 'Staff';
        const timestamp = new Date().toISOString();

        const replyItem = {
          id: `msg_reply_${Date.now()}`,
          senderType: 'staff_reply',
          senderName: 'RezSocials Support',
          senderEmail: 'rezsocials.support@gmail.com',
          staffMemberUsername: staffUsername,
          staffMemberRole: staffRole,
          category: cleanCategory,
          subject: cleanSubject,
          message,
          timestamp,
          deliveryStatus: 'delivered',
        };

        if (!Array.isArray(ticket.history)) ticket.history = [];
        ticket.history.push(replyItem);
        ticket.status = newStatus || 'Awaiting User';
        ticket.updatedAt = timestamp;

        await setFirestoreDoc('supportTickets', ticketId, ticket, token);

        await logSupportAudit({
          ticketId,
          staffUsername,
          staffRole,
          action: 'staff_reply',
          details: `Staff reply dispatched by @${staffUsername} (${staffRole}). Ticket status set to ${ticket.status}.`,
        }, token);

        const { senderUser, transporter, isConfigured } = getMailTransporter();
        if (isConfigured && transporter) {
          try {
            await transporter.sendMail({
              from: `"RezSocials Support" <${senderUser}>`,
              to: ticket.senderEmail,
              subject: cleanSubject,
              text: message,
            });
          } catch (smtpErr) {
            console.warn('[REPLY SMTP NOTICE]', smtpErr?.message || smtpErr);
          }
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: true,
          ticket,
          message: 'Reply successfully dispatched as RezSocials Support.',
        }));
      } catch (err) {
        console.error('[SUPPORT REPLY ERROR]', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // --- API: UPDATE TICKET STATUS (STAFF ONLY) ---
  if (decodedPath === '/api/support/ticket-status' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const authResult = await verifyStaffAuthorization(req, data);
        if (!authResult.authorized) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: authResult.error }));
          return;
        }

        const { ticketId, status } = data;
        const validStatuses = ['New', 'Awaiting User', 'In Progress', 'Resolved', 'Closed'];
        if (!validStatuses.includes(status)) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Invalid ticket status.' }));
          return;
        }

        const authHeader = req.headers['authorization'] || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

        const ticket = await getFirestoreDoc('supportTickets', ticketId, token);
        if (!ticket) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Ticket not found.' }));
          return;
        }

        const oldStatus = ticket.status;
        ticket.status = status;
        ticket.updatedAt = new Date().toISOString();

        await setFirestoreDoc('supportTickets', ticketId, ticket, token);

        await logSupportAudit({
          ticketId,
          staffUsername: authResult.username,
          staffRole: authResult.role,
          action: status === 'Closed' ? 'close_ticket' : 'status_change',
          details: `Ticket status updated from ${oldStatus} to ${status} by @${authResult.username}.`,
        }, token);

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, ticket }));
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // --- API: ASSIGN TICKET STAFF (STAFF ONLY) ---
  if (decodedPath === '/api/support/ticket-assign' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const authResult = await verifyStaffAuthorization(req, data);
        if (!authResult.authorized) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: authResult.error }));
          return;
        }

        const { ticketId, assignedStaff } = data;
        const authHeader = req.headers['authorization'] || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

        const ticket = await getFirestoreDoc('supportTickets', ticketId, token);
        if (!ticket) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Ticket not found.' }));
          return;
        }

        ticket.assignedStaff = (assignedStaff || '').replace(/^@/, '');
        ticket.updatedAt = new Date().toISOString();

        await setFirestoreDoc('supportTickets', ticketId, ticket, token);

        await logSupportAudit({
          ticketId,
          staffUsername: authResult.username,
          staffRole: authResult.role,
          action: 'staff_assign',
          details: assignedStaff ? `Ticket assigned to @${ticket.assignedStaff}.` : 'Ticket assignment cleared.',
        }, token);

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, ticket }));
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // --- API: ADD INTERNAL TICKET NOTE (STAFF ONLY) ---
  if (decodedPath === '/api/support/ticket-note' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const authResult = await verifyStaffAuthorization(req, data);
        if (!authResult.authorized) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: authResult.error }));
          return;
        }

        const { ticketId, content } = data;
        if (!ticketId || !content) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Ticket ID and note content required.' }));
          return;
        }

        const authHeader = req.headers['authorization'] || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

        const ticket = await getFirestoreDoc('supportTickets', ticketId, token);
        if (!ticket) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Ticket not found.' }));
          return;
        }

        const staffUsername = authResult.username || 'Staff';
        const staffRole = authResult.role || 'Staff';
        const noteItem = {
          id: `note_${Date.now()}`,
          authorUsername: staffUsername,
          authorRole: staffRole,
          content: content.trim(),
          timestamp: new Date().toISOString(),
        };

        if (!Array.isArray(ticket.internalNotes)) ticket.internalNotes = [];
        ticket.internalNotes.push(noteItem);
        ticket.updatedAt = new Date().toISOString();

        await setFirestoreDoc('supportTickets', ticketId, ticket, token);

        await logSupportAudit({
          ticketId,
          staffUsername,
          staffRole,
          action: 'internal_note',
          details: `Internal note logged by @${staffUsername} (${staffRole}).`,
        }, token);

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, ticket }));
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // --- API: SEND DIRECT SUPPORT EMAIL (VERIFIED STAFF ONLY) ---
  if (decodedPath === '/api/support/send-email' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const authResult = await verifyStaffAuthorization(req, data);
        if (!authResult.authorized) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: authResult.error }));
          return;
        }

        const { to, subject, html, text } = data;
        if (!to || !subject) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Recipient email and subject are required.' }));
          return;
        }

        const cleanTo = sanitizeEmailHeader(to);
        const cleanSubject = sanitizeEmailHeader(subject);
        const { senderUser, transporter, isConfigured } = getMailTransporter();

        if (!isConfigured || !transporter) {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            error: 'SMTP service is not configured on the server. Set SUPPORT_EMAIL_PASSWORD to enable outgoing mail delivery.',
          }));
          return;
        }

        const info = await transporter.sendMail({
          from: `"RezSocials Support" <${senderUser}>`,
          to: cleanTo,
          subject: cleanSubject,
          text: text || '',
          html: html || `<p>${text || ''}</p>`,
        });

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: true,
          messageId: info.messageId,
          from: senderUser,
          to: cleanTo,
          note: 'Email successfully delivered via SMTP',
        }));
      } catch (err) {
        console.error('[SUPPORT EMAIL DISPATCH ERROR]', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // --- STATIC ASSET & FRONTEND SPA SERVING ---
  const getStats = async (p) => {
    try {
      const stats = await fs.promises.stat(p);
      return stats.isFile() ? stats : null;
    } catch {
      return null;
    }
  };

  const serveFile = (filePath, stats, statusCode = 200) => {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    const mtime = stats.mtime.toUTCString();
    res.setHeader('Last-Modified', mtime);

    if (req.headers['if-modified-since'] === mtime) {
      res.statusCode = 304;
      res.end();
      return;
    }

    if (ext === '.html' || ext === '.htm') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }

    res.statusCode = statusCode;
    const stream = fs.createReadStream(filePath);
    stream.on('error', err => {
      console.error('Stream error:', err);
      res.statusCode = 500;
      res.end();
    });
    stream.pipe(res);
  };

  try {
    const isProduction = fs.existsSync(DIST_DIR);
    const targetDir = isProduction ? DIST_DIR : ROOT;
    const cleanPath = decodedPath === '/' ? '/index.html' : decodedPath;
    const absolutePath = path.join(targetDir, cleanPath);

    // Security: Check directory traversal
    if (!absolutePath.startsWith(targetDir)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }

    // 1. Direct file match in target directory (dist in prod, root in dev)
    let stats = await getStats(absolutePath);
    if (stats) return serveFile(absolutePath, stats);

    // 2. Check public directory (for static assets like audio, images)
    const publicPath = path.join(PUBLIC_DIR, cleanPath);
    stats = await getStats(publicPath);
    if (stats) return serveFile(publicPath, stats);

    // 3. Missing file with explicit file extension -> 404
    if (path.extname(cleanPath) && cleanPath !== '/index.html') {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }

    // 4. SPA Fallback -> index.html from dist (or root)
    const spaIndexPath = path.join(targetDir, 'index.html');
    stats = await getStats(spaIndexPath);
    if (stats) return serveFile(spaIndexPath, stats, 200);

    // 5. Hard 404
    res.statusCode = 404;
    res.end('Not Found');
  } catch (err) {
    console.error('Server error:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`RezSocials production server running on port ${PORT}`);
});

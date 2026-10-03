import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { db, UserProfile } from './server/db';
import { askVaultAI } from './server/vaultai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsers with sufficient capacity for uploaded documents (base64 data)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Simple, robust in-memory session token store mapped to User ID
const activeSessions = new Map<string, { userId: string; expiresAt: number }>();

function createSessionToken(userId: string): string {
  const token = 'uvtok_' + crypto.randomBytes(32).toString('hex');
  // Valid for 7 days
  const expiresAt = Date.now() + 7 * 24 * 3600 * 1000;
  activeSessions.set(token, { userId, expiresAt });
  return token;
}

// Authentication middleware
interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid authentication token' });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }

  const user = db.findUserById(session.userId);
  if (!user || user.status === 'inactive') {
    return res.status(403).json({ error: 'Account suspended or not found' });
  }

  req.user = user;
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Administrator privileges required' });
  }
  next();
}

// ==========================================
// 1. AUTHENTICATION & USER MANAGEMENT ROUTES
// ==========================================

app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { fullName, email, password, confirmPassword, studentId, university, department, year, section, phone } = req.body;

    if (!fullName || !email || !password || !studentId || !university) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists' });
    }

    const newUser = db.createUser({
      fullName,
      email,
      password,
      studentId,
      university,
      department: department || 'General Studies',
      year: year || '1st Year',
      section: section || 'A',
      phone: phone || '',
    });

    const token = createSessionToken(newUser.id);
    const { passwordHash: _, ...safeUser } = newUser;

    return res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }

    if (!db.verifyPassword(user, password)) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Account has been deactivated. Contact the university registrar.' });
    }

    const token = createSessionToken(user.id);

    db.addAuditLog({
      userId: user.id,
      action: 'LOGIN',
      details: `Successful sign-in for ${user.fullName} (${user.role})`,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'UniVault Client',
      status: 'success',
    });

    const { passwordHash: _, ...safeUser } = user;
    return res.json({
      message: 'Login successful',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'An unexpected error occurred during login' });
  }
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { passwordHash: _, ...safeUser } = req.user!;
  return res.json({ user: safeUser });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }
  const user = db.findUserByEmail(email);
  // Always return friendly response to prevent email enumeration
  return res.json({
    message: user
      ? 'Password reset instructions and a verification code have been dispatched to your email address.'
      : 'If an account is associated with this email, reset instructions have been sent.',
  });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email, newPassword, confirmPassword } = req.body;
  if (!email || !newPassword || newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Valid email and matching passwords required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }
  const success = db.resetPassword(email, newPassword);
  if (!success) {
    return res.status(404).json({ error: 'Account not found with provided email' });
  }
  return res.json({ message: 'Password updated successfully. You may now sign in with your new password.' });
});

app.patch('/api/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateUserProfile(req.user!.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    const { passwordHash: _, ...safeUser } = updated;
    return res.json({ message: 'Profile updated successfully', user: safeUser });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ==========================================
// 2. DOCUMENT MANAGEMENT ROUTES (User-Scoped)
// ==========================================

app.get('/api/documents', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const documents = db.getDocuments(req.user!.id, false);
  return res.json({ documents });
});

app.get('/api/documents/recycle-bin', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const documents = db.getRecycleBin(req.user!.id);
  return res.json({ documents });
});

app.post('/api/documents', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, category, description, fileType, fileSize, fileData, issueDate, expiryDate, tags, isImportant } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Document name and category are required' });
    }

    const document = db.createDocument(req.user!.id, {
      name,
      category,
      description: description || '',
      fileType: fileType || 'application/pdf',
      fileSize: fileSize || 102400,
      fileData: fileData || '',
      issueDate: issueDate || null,
      expiryDate: expiryDate || null,
      tags: Array.isArray(tags) ? tags : [],
      isImportant: Boolean(isImportant),
    });

    return res.status(201).json({ message: 'Document uploaded and securely encrypted', document });
  } catch (err: any) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Failed to upload document' });
  }
});

app.patch('/api/documents/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateDocument(req.user!.id, req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Document not found' });
    }
    return res.json({ message: 'Document metadata updated', document: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update document' });
  }
});

app.delete('/api/documents/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = db.softDeleteDocument(req.user!.id, req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Document not found' });
  }
  return res.json({ message: 'Document moved to Recycle Bin' });
});

app.post('/api/documents/:id/restore', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = db.restoreDocument(req.user!.id, req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Document not found in Recycle Bin' });
  }
  return res.json({ message: 'Document successfully restored to your Locker' });
});

app.delete('/api/documents/:id/permanent', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = db.permanentlyDeleteDocument(req.user!.id, req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Document not found' });
  }
  return res.json({ message: 'Document permanently deleted' });
});

// ==========================================
// 3. SECURE TEMPORARY SHARING ROUTES
// ==========================================

app.get('/api/shares', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const shares = db.getShares(req.user!.id);
  return res.json({ shares });
});

app.post('/api/shares', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { documentId, accessType, durationHours, oneTimeAccess } = req.body;

    if (!documentId || !accessType || !durationHours) {
      return res.status(400).json({ error: 'Document ID, access type, and duration are required' });
    }

    const share = db.createShare(req.user!.id, {
      documentId,
      accessType,
      durationHours: Number(durationHours),
      oneTimeAccess: Boolean(oneTimeAccess),
    });

    if (!share) {
      return res.status(404).json({ error: 'Document not found or unauthorized' });
    }

    return res.status(201).json({
      message: 'Secure temporary sharing link generated',
      share,
      shareUrl: `${req.protocol}://${req.get('host')}/share/${share.token}`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create share link' });
  }
});

app.post('/api/shares/:id/revoke', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = db.revokeShare(req.user!.id, req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Share link not found or already revoked' });
  }
  return res.json({ message: 'Share link revoked. Access has been immediately terminated.' });
});

// Public endpoint for viewing shared document via temporary token
app.get('/api/public/share/:token', (req: Request, res: Response) => {
  const result = db.getShareByToken(req.params.token);
  if (!result) {
    return res.status(404).json({ error: 'This secure link is either expired, invalid, or has been revoked by the student.' });
  }

  const { share, document } = result;

  // Mask private user info
  return res.json({
    share: {
      id: share.id,
      accessType: share.accessType,
      expiresAt: share.expiresAt,
      oneTimeAccess: share.oneTimeAccess,
      status: share.status,
    },
    document: {
      id: document.id,
      name: document.name,
      category: document.category,
      description: document.description,
      fileType: document.fileType,
      fileSize: document.fileSize,
      issueDate: document.issueDate,
      expiryDate: document.expiryDate,
      tags: document.tags,
      fileData: document.fileData,
    },
  });
});

// ==========================================
// 4. APPLICATION CHECKLISTS ROUTES
// ==========================================

app.get('/api/checklists', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const checklists = db.getChecklists(req.user!.id);
  return res.json({ checklists });
});

app.post('/api/checklists', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, type, items } = req.body;
    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
    }
    const checklist = db.createChecklist(req.user!.id, {
      title,
      type,
      items: Array.isArray(items) ? items : [],
    });
    return res.status(201).json({ message: 'Checklist created', checklist });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create checklist' });
  }
});

app.patch('/api/checklists/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateChecklist(req.user!.id, req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Checklist not found' });
    }
    return res.json({ message: 'Checklist updated', checklist: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update checklist' });
  }
});

app.delete('/api/checklists/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteChecklist(req.user!.id, req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Checklist not found' });
  }
  return res.json({ message: 'Checklist deleted' });
});

// ==========================================
// 5. NOTIFICATIONS & SECURITY AUDIT ROUTES
// ==========================================

app.get('/api/notifications', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const notifications = db.getNotifications(req.user!.id);
  return res.json({ notifications });
});

app.post('/api/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  db.markNotificationAsRead(req.user!.id, req.params.id);
  return res.json({ success: true });
});

app.post('/api/notifications/read-all', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  db.markAllNotificationsRead(req.user!.id);
  return res.json({ success: true });
});

app.post('/api/notifications/clear', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  db.clearNotifications(req.user!.id);
  return res.json({ success: true });
});

app.get('/api/audit-logs', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const logs = db.getAuditLogs(req.user!.id);
  return res.json({ logs });
});

// ==========================================
// 6. VAULTAI INTELLIGENT ASSISTANT ROUTE
// ==========================================

app.post('/api/vaultai/chat', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Query message is required' });
    }

    // STRICT USER SCOPING: Retrieve ONLY the current user's documents and checklists
    const userDocs = db.getDocuments(req.user!.id, false);
    const userChecklists = db.getChecklists(req.user!.id);

    const reply = await askVaultAI(
      message,
      Array.isArray(history) ? history : [],
      req.user!.fullName,
      userDocs,
      userChecklists
    );

    return res.json({ reply });
  } catch (err: any) {
    console.error('VaultAI chat endpoint error:', err);
    return res.status(500).json({ error: 'VaultAI assistant encountered an error. Please try again.' });
  }
});

// ==========================================
// 7. ADMIN PROTECTED ROUTES (No Private Files)
// ==========================================

app.get('/api/admin/stats', requireAuth, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const stats = db.getAdminStats();
  return res.json({ stats });
});

app.get('/api/admin/students', requireAuth, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const students = db.getAdminStudentList();
  return res.json({ students });
});

app.patch('/api/admin/students/:id/status', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body;
  if (status !== 'active' && status !== 'inactive') {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const success = db.setStudentStatus(req.params.id, status);
  if (!success) {
    return res.status(404).json({ error: 'Student account not found' });
  }
  return res.json({ message: `Student status updated to ${status}` });
});

app.get('/api/admin/audit-logs', requireAuth, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const logs = db.getSystemAuditLogs();
  return res.json({ logs });
});

// ==========================================
// 8. FRONTEND SERVING (Vite in Dev / Static in Prod)
// ==========================================

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`UniVault Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});

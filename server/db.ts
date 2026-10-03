import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserProfile {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  studentId: string;
  university: string;
  department: string;
  year: string;
  section: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  role: 'student' | 'admin';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  userId: string;
  name: string;
  category: 'Academic' | 'Identity' | 'Achievements' | 'Career' | 'Financial' | 'Personal' | 'Other';
  description: string;
  fileType: string;
  fileSize: number; // in bytes
  fileData?: string; // base64 or preview data
  issueDate?: string | null;
  expiryDate?: string | null;
  tags: string[];
  isImportant: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentShare {
  id: string;
  documentId: string;
  userId: string;
  token: string;
  accessType: 'view' | 'download';
  expiresAt: string;
  oneTimeAccess: boolean;
  viewCount: number;
  status: 'active' | 'expired' | 'revoked';
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  linkedDocumentId?: string;
  required: boolean;
}

export interface Checklist {
  id: string;
  userId: string;
  title: string;
  type: 'scholarship' | 'internship' | 'placement' | 'admission' | 'examination' | 'government' | 'custom';
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'expiry' | 'upload' | 'share' | 'security' | 'system';
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'warning' | 'alert';
  createdAt: string;
}

export interface DatabaseSchema {
  users: UserProfile[];
  documents: DocumentItem[];
  shares: DocumentShare[];
  checklists: Checklist[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_univault_salt_2026').digest('hex');
}

export class Database {
  private data: DatabaseSchema = {
    users: [],
    documents: [],
    shares: [],
    checklists: [],
    notifications: [],
    auditLogs: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        return;
      } catch (err) {
        console.error('Error loading database.json, re-initializing seed data:', err);
      }
    }

    this.seedInitialData();
    this.save();
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  private seedInitialData() {
    const studentId = 'stu-sarah-chen-001';
    const adminId = 'adm-marcus-vance-002';
    const now = new Date();

    const pastDate = (daysAgo: number) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString();
    };

    const futureDate = (daysAhead: number) => {
      const d = new Date();
      d.setDate(d.getDate() + daysAhead);
      return d.toISOString().split('T')[0];
    };

    // 1. Initial Users
    const studentUser: UserProfile = {
      id: studentId,
      email: 'sarah.chen@stanford.edu',
      passwordHash: hashPassword('Password123!'),
      fullName: 'Sarah Chen',
      studentId: 'STU-2024-8849',
      university: 'Stanford University',
      department: 'Computer Science & Engineering',
      year: '3rd Year',
      section: 'CS-A',
      phone: '+1 (650) 492-3891',
      bio: 'Junior CS student specializing in Distributed Systems and Cloud Architecture. Vice President of Collegiate ACM.',
      avatarUrl: '/src/assets/images/avatar_student_sarah_1791018751353.jpg',
      role: 'student',
      status: 'active',
      createdAt: pastDate(90),
      updatedAt: pastDate(2),
    };

    const adminUser: UserProfile = {
      id: adminId,
      email: 'admin@univault.edu',
      passwordHash: hashPassword('AdminSecure2026!'),
      fullName: 'Dr. Marcus Vance',
      studentId: 'FAC-REG-9011',
      university: 'Stanford University',
      department: 'Office of Academic Records & Registrar',
      year: 'Faculty / Staff',
      section: 'Registrar Admin',
      phone: '+1 (650) 723-2000',
      bio: 'Dean of Student Records & University Registrar. Administering digital credentials and compliance.',
      avatarUrl: '/src/assets/images/avatar_admin_marcus_1791018767335.jpg',
      role: 'admin',
      status: 'active',
      createdAt: pastDate(180),
      updatedAt: pastDate(10),
    };

    this.data.users = [studentUser, adminUser];

    // 2. Initial Documents for Sarah Chen
    const doc1: DocumentItem = {
      id: 'doc-001',
      userId: studentId,
      name: 'Semester 5 Official Grade Transcript',
      category: 'Academic',
      description: 'Verified official university grade report with 3.94 GPA and Dean’s Honors List endorsement.',
      fileType: 'application/pdf',
      fileSize: 420000,
      issueDate: '2026-01-15',
      expiryDate: null,
      tags: ['Transcript', 'GPA', 'Dean List', 'Official'],
      isImportant: true,
      isDeleted: false,
      createdAt: pastDate(40),
      updatedAt: pastDate(40),
    };

    const doc2: DocumentItem = {
      id: 'doc-002',
      userId: studentId,
      name: 'Annual Family Income Certificate 2025-26',
      category: 'Financial',
      description: 'Official revenue department income declaration certificate for scholarship eligibility.',
      fileType: 'application/pdf',
      fileSize: 312000,
      issueDate: '2025-10-20',
      expiryDate: futureDate(18), // Expiring in 18 days!
      tags: ['Income', 'Revenue', 'Scholarship', 'Eligibility'],
      isImportant: true,
      isDeleted: false,
      createdAt: pastDate(30),
      updatedAt: pastDate(30),
    };

    const doc3: DocumentItem = {
      id: 'doc-003',
      userId: studentId,
      name: 'University Student Photo ID Card (2024-2026)',
      category: 'Identity',
      description: 'Biometric student campus card granting library, laboratory, and residence hall access.',
      fileType: 'image/png',
      fileSize: 185000,
      issueDate: '2024-09-01',
      expiryDate: futureDate(85), // Expiring in 85 days (under 90 day threshold)
      tags: ['Campus ID', 'Biometrics', 'SmartCard'],
      isImportant: true,
      isDeleted: false,
      createdAt: pastDate(80),
      updatedAt: pastDate(80),
    };

    const doc4: DocumentItem = {
      id: 'doc-004',
      userId: studentId,
      name: 'Global Collegiate Hackathon Winner Certificate',
      category: 'Achievements',
      description: '1st Place Grand Winner Award in AI & Decentralized Systems track amongst 400 collegiate teams.',
      fileType: 'application/pdf',
      fileSize: 580000,
      issueDate: '2025-11-12',
      expiryDate: null,
      tags: ['Hackathon', 'Award', 'AI', 'Winner'],
      isImportant: true,
      isDeleted: false,
      createdAt: pastDate(50),
      updatedAt: pastDate(50),
    };

    const doc5: DocumentItem = {
      id: 'doc-005',
      userId: studentId,
      name: 'Summer Software Engineering Internship Offer Letter',
      category: 'Career',
      description: 'Accepted offer letter for Summer 2026 Systems Software Intern at Vertex Cloud Labs.',
      fileType: 'application/pdf',
      fileSize: 245000,
      issueDate: '2026-02-01',
      expiryDate: null,
      tags: ['Internship', 'Offer Letter', 'Career', '2026'],
      isImportant: true,
      isDeleted: false,
      createdAt: pastDate(25),
      updatedAt: pastDate(25),
    };

    const doc6: DocumentItem = {
      id: 'doc-006',
      userId: studentId,
      name: 'State Driver License & Identity Proof',
      category: 'Identity',
      description: 'State DMV identification and legal residential proof.',
      fileType: 'image/jpeg',
      fileSize: 320000,
      issueDate: '2023-05-14',
      expiryDate: futureDate(420),
      tags: ['Govt ID', 'Driver License', 'Address Proof'],
      isImportant: false,
      isDeleted: false,
      createdAt: pastDate(60),
      updatedAt: pastDate(60),
    };

    const doc7: DocumentItem = {
      id: 'doc-007',
      userId: studentId,
      name: 'Secondary Education Board Diploma (10th Standard)',
      category: 'Academic',
      description: 'Certified secondary school completion certificate with mathematics and sciences distinction.',
      fileType: 'application/pdf',
      fileSize: 490000,
      issueDate: '2022-06-10',
      expiryDate: null,
      tags: ['High School', '10th Board', 'Distinction'],
      isImportant: false,
      isDeleted: false,
      createdAt: pastDate(85),
      updatedAt: pastDate(85),
    };

    // Soft-deleted document in Recycle Bin
    const docDeleted: DocumentItem = {
      id: 'doc-del-001',
      userId: studentId,
      name: 'Temporary Campus Parking Permit 2025',
      category: 'Other',
      description: 'Temporary parking pass for North Campus Lot B.',
      fileType: 'application/pdf',
      fileSize: 110000,
      issueDate: '2025-08-20',
      expiryDate: '2025-12-31',
      tags: ['Parking', 'Transit'],
      isImportant: false,
      isDeleted: true,
      deletedAt: pastDate(3),
      createdAt: pastDate(120),
      updatedAt: pastDate(3),
    };

    this.data.documents = [doc1, doc2, doc3, doc4, doc5, doc6, doc7, docDeleted];

    // 3. Document Shares
    const share1: DocumentShare = {
      id: 'share-001',
      documentId: 'doc-005',
      userId: studentId,
      token: 'shr_vtx_' + crypto.randomBytes(8).toString('hex'),
      accessType: 'view',
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      oneTimeAccess: false,
      viewCount: 3,
      status: 'active',
      createdAt: pastDate(1),
    };

    this.data.shares = [share1];

    // 4. Checklists
    const cl1: Checklist = {
      id: 'cl-001',
      userId: studentId,
      title: 'Merit-Based Scholarship Application 2026',
      type: 'scholarship',
      createdAt: pastDate(14),
      updatedAt: pastDate(1),
      items: [
        { id: 'cli-1', label: 'University Student ID', completed: true, linkedDocumentId: 'doc-003', required: true },
        { id: 'cli-2', label: 'Previous Semester Marks Transcript', completed: true, linkedDocumentId: 'doc-001', required: true },
        { id: 'cli-3', label: 'Income Certificate (Valid for FY26)', completed: true, linkedDocumentId: 'doc-002', required: true },
        { id: 'cli-4', label: 'Academic Achievement or Award Proof', completed: true, linkedDocumentId: 'doc-004', required: false },
        { id: 'cli-5', label: 'Bonafide Student Certificate from Registrar', completed: false, required: true },
      ],
    };

    const cl2: Checklist = {
      id: 'cl-002',
      userId: studentId,
      title: 'Summer 2026 Internship Onboarding Package',
      type: 'internship',
      createdAt: pastDate(7),
      updatedAt: pastDate(2),
      items: [
        { id: 'cli-201', label: 'Signed Offer Letter', completed: true, linkedDocumentId: 'doc-005', required: true },
        { id: 'cli-202', label: 'Government Photo Identity Proof', completed: true, linkedDocumentId: 'doc-006', required: true },
        { id: 'cli-203', label: 'Official University Transcripts', completed: true, linkedDocumentId: 'doc-001', required: true },
        { id: 'cli-204', label: 'Direct Deposit Bank Information & Void Cheque', completed: false, required: true },
      ],
    };

    this.data.checklists = [cl1, cl2];

    // 5. Notifications
    this.data.notifications = [
      {
        id: 'notif-001',
        userId: studentId,
        title: 'Document Expiring Soon',
        message: 'Your "Annual Family Income Certificate 2025-26" expires in 18 days. Please obtain a renewal from the revenue department.',
        type: 'expiry',
        read: false,
        createdAt: pastDate(1),
      },
      {
        id: 'notif-002',
        userId: studentId,
        title: 'Secure Link Created',
        message: 'A temporary 24-hour viewing link was generated for "Summer Software Engineering Internship Offer Letter".',
        type: 'share',
        read: false,
        createdAt: pastDate(1),
      },
      {
        id: 'notif-003',
        userId: studentId,
        title: 'Document Encrypted & Backed Up',
        message: '"Semester 5 Official Grade Transcript" was verified and safely cataloged under Academic.',
        type: 'upload',
        read: true,
        createdAt: pastDate(12),
      },
    ];

    // 6. Audit & Security logs
    this.data.auditLogs = [
      {
        id: 'log-001',
        userId: studentId,
        action: 'LOGIN',
        details: 'Successful biometric / session authentication from Chrome macOS (104.28.19.42)',
        ipAddress: '104.28.19.42',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        status: 'success',
        createdAt: pastDate(0.1),
      },
      {
        id: 'log-002',
        userId: studentId,
        action: 'SHARE_GENERATED',
        details: 'Created 24-hr view link for "Summer Software Engineering Internship Offer Letter"',
        ipAddress: '104.28.19.42',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        status: 'success',
        createdAt: pastDate(1),
      },
      {
        id: 'log-003',
        userId: studentId,
        action: 'DOCUMENT_UPLOAD',
        details: 'Uploaded and encrypted document: "Annual Family Income Certificate 2025-26" (312 KB)',
        ipAddress: '104.28.19.42',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        status: 'success',
        createdAt: pastDate(30),
      },
      {
        id: 'log-004',
        userId: studentId,
        action: 'DOCUMENT_SOFT_DELETE',
        details: 'Moved "Temporary Campus Parking Permit 2025" to Recycle Bin',
        ipAddress: '104.28.19.42',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        status: 'warning',
        createdAt: pastDate(3),
      },
    ];
  }

  // --- User / Auth methods ---
  public findUserByEmail(email: string): UserProfile | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): UserProfile | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public verifyPassword(user: UserProfile, passwordAttempt: string): boolean {
    return user.passwordHash === hashPassword(passwordAttempt);
  }

  public createUser(userData: {
    email: string;
    password: string;
    fullName: string;
    studentId: string;
    university: string;
    department: string;
    year: string;
    section: string;
    phone?: string;
  }): UserProfile {
    const newUser: UserProfile = {
      id: 'stu-' + crypto.randomUUID(),
      email: userData.email,
      passwordHash: hashPassword(userData.password),
      fullName: userData.fullName,
      studentId: userData.studentId,
      university: userData.university,
      department: userData.department,
      year: userData.year,
      section: userData.section,
      phone: userData.phone || '',
      bio: `Student at ${userData.university}, ${userData.department}.`,
      role: 'student',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);

    // Initial welcome notification
    this.createNotification({
      userId: newUser.id,
      title: 'Welcome to UniVault!',
      message: 'Your secure student digital locker has been provisioned. Upload your first document to get started.',
      type: 'system',
    });

    // Initial audit log
    this.addAuditLog({
      userId: newUser.id,
      action: 'ACCOUNT_CREATED',
      details: `New student registration completed: ${newUser.fullName} (${newUser.studentId})`,
      ipAddress: '127.0.0.1',
      userAgent: 'UniVault Web Client',
      status: 'success',
    });

    this.save();
    return newUser;
  }

  public updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile | null {
    const user = this.findUserById(userId);
    if (!user) return null;

    if (updates.fullName !== undefined) user.fullName = updates.fullName;
    if (updates.studentId !== undefined) user.studentId = updates.studentId;
    if (updates.university !== undefined) user.university = updates.university;
    if (updates.department !== undefined) user.department = updates.department;
    if (updates.year !== undefined) user.year = updates.year;
    if (updates.section !== undefined) user.section = updates.section;
    if (updates.phone !== undefined) user.phone = updates.phone;
    if (updates.bio !== undefined) user.bio = updates.bio;
    if (updates.avatarUrl !== undefined) user.avatarUrl = updates.avatarUrl;
    user.updatedAt = new Date().toISOString();

    this.addAuditLog({
      userId,
      action: 'PROFILE_UPDATED',
      details: 'Updated student profile information and bio',
      ipAddress: '127.0.0.1',
      userAgent: 'UniVault Web Client',
      status: 'success',
    });

    this.save();
    return user;
  }

  public resetPassword(email: string, newPass: string): boolean {
    const user = this.findUserByEmail(email);
    if (!user) return false;
    user.passwordHash = hashPassword(newPass);
    user.updatedAt = new Date().toISOString();

    this.addAuditLog({
      userId: user.id,
      action: 'PASSWORD_RESET',
      details: 'Student credential password reset verified',
      ipAddress: '127.0.0.1',
      userAgent: 'UniVault Web Client',
      status: 'warning',
    });

    this.save();
    return true;
  }

  // --- Document methods (Strictly Scoped by userId) ---
  public getDocuments(userId: string, includeDeleted = false): DocumentItem[] {
    return this.data.documents.filter(doc => doc.userId === userId && (includeDeleted ? true : !doc.isDeleted));
  }

  public getRecycleBin(userId: string): DocumentItem[] {
    return this.data.documents.filter(doc => doc.userId === userId && doc.isDeleted);
  }

  public getDocumentById(userId: string, docId: string): DocumentItem | undefined {
    return this.data.documents.find(doc => doc.id === docId && doc.userId === userId);
  }

  public createDocument(userId: string, doc: Omit<DocumentItem, 'id' | 'userId' | 'isDeleted' | 'deletedAt' | 'createdAt' | 'updatedAt'>): DocumentItem {
    const newDoc: DocumentItem = {
      ...doc,
      id: 'doc-' + crypto.randomUUID(),
      userId,
      isDeleted: false,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.documents.unshift(newDoc);

    this.createNotification({
      userId,
      title: 'Document Stored Securely',
      message: `"${newDoc.name}" has been categorized under ${newDoc.category} and encrypted.`,
      type: 'upload',
    });

    this.addAuditLog({
      userId,
      action: 'DOCUMENT_UPLOAD',
      details: `Uploaded document: "${newDoc.name}" (${(newDoc.fileSize / 1024).toFixed(1)} KB)`,
      ipAddress: '127.0.0.1',
      userAgent: 'UniVault Web Client',
      status: 'success',
    });

    this.save();
    return newDoc;
  }

  public updateDocument(userId: string, docId: string, updates: Partial<DocumentItem>): DocumentItem | null {
    const doc = this.getDocumentById(userId, docId);
    if (!doc) return null;

    if (updates.name !== undefined) doc.name = updates.name;
    if (updates.category !== undefined) doc.category = updates.category;
    if (updates.description !== undefined) doc.description = updates.description;
    if (updates.issueDate !== undefined) doc.issueDate = updates.issueDate;
    if (updates.expiryDate !== undefined) doc.expiryDate = updates.expiryDate;
    if (updates.tags !== undefined) doc.tags = updates.tags;
    if (updates.isImportant !== undefined) doc.isImportant = updates.isImportant;
    doc.updatedAt = new Date().toISOString();

    this.save();
    return doc;
  }

  public softDeleteDocument(userId: string, docId: string): boolean {
    const doc = this.getDocumentById(userId, docId);
    if (!doc) return false;
    doc.isDeleted = true;
    doc.deletedAt = new Date().toISOString();
    doc.updatedAt = new Date().toISOString();

    this.createNotification({
      userId,
      title: 'Moved to Recycle Bin',
      message: `"${doc.name}" was moved to the Recycle Bin. You can restore it anytime.`,
      type: 'system',
    });

    this.addAuditLog({
      userId,
      action: 'DOCUMENT_SOFT_DELETE',
      details: `Moved "${doc.name}" to Recycle Bin`,
      ipAddress: '127.0.0.1',
      userAgent: 'UniVault Web Client',
      status: 'warning',
    });

    this.save();
    return true;
  }

  public restoreDocument(userId: string, docId: string): boolean {
    const doc = this.data.documents.find(d => d.id === docId && d.userId === userId && d.isDeleted);
    if (!doc) return false;
    doc.isDeleted = false;
    doc.deletedAt = null;
    doc.updatedAt = new Date().toISOString();

    this.createNotification({
      userId,
      title: 'Document Restored',
      message: `"${doc.name}" has been successfully restored to ${doc.category}.`,
      type: 'system',
    });

    this.addAuditLog({
      userId,
      action: 'DOCUMENT_RESTORED',
      details: `Restored document "${doc.name}" from Recycle Bin`,
      ipAddress: '127.0.0.1',
      userAgent: 'UniVault Web Client',
      status: 'success',
    });

    this.save();
    return true;
  }

  public permanentlyDeleteDocument(userId: string, docId: string): boolean {
    const index = this.data.documents.findIndex(d => d.id === docId && d.userId === userId);
    if (index === -1) return false;
    const [deleted] = this.data.documents.splice(index, 1);

    // Also remove associated shares
    this.data.shares = this.data.shares.filter(s => s.documentId !== docId);

    this.addAuditLog({
      userId,
      action: 'DOCUMENT_PERMANENT_DELETE',
      details: `Permanently destroyed encrypted record: "${deleted.name}"`,
      ipAddress: '127.0.0.1',
      userAgent: 'UniVault Web Client',
      status: 'alert',
    });

    this.save();
    return true;
  }

  // --- Shares ---
  public getShares(userId: string): Array<DocumentShare & { documentName: string; documentCategory: string }> {
    const userShares = this.data.shares.filter(s => s.userId === userId);
    return userShares.map(s => {
      const doc = this.data.documents.find(d => d.id === s.documentId);
      return {
        ...s,
        documentName: doc?.name || 'Unknown Document',
        documentCategory: doc?.category || 'General',
      };
    });
  }

  public createShare(userId: string, params: {
    documentId: string;
    accessType: 'view' | 'download';
    durationHours: number;
    oneTimeAccess?: boolean;
  }): DocumentShare | null {
    const doc = this.getDocumentById(userId, params.documentId);
    if (!doc) return null;

    const expiresAt = new Date(Date.now() + params.durationHours * 3600 * 1000).toISOString();
    const token = 'shr_' + crypto.randomBytes(16).toString('hex');

    const share: DocumentShare = {
      id: 'share-' + crypto.randomUUID(),
      documentId: params.documentId,
      userId,
      token,
      accessType: params.accessType,
      expiresAt,
      oneTimeAccess: params.oneTimeAccess || false,
      viewCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    this.data.shares.unshift(share);

    this.createNotification({
      userId,
      title: 'Secure Share Generated',
      message: `A temporary link for "${doc.name}" valid for ${params.durationHours} hours was created.`,
      type: 'share',
    });

    this.addAuditLog({
      userId,
      action: 'SHARE_GENERATED',
      details: `Generated temporary ${params.accessType} link for "${doc.name}" (Expires in ${params.durationHours}h)`,
      ipAddress: '127.0.0.1',
      userAgent: 'UniVault Web Client',
      status: 'success',
    });

    this.save();
    return share;
  }

  public revokeShare(userId: string, shareId: string): boolean {
    const share = this.data.shares.find(s => s.id === shareId && s.userId === userId);
    if (!share) return false;
    share.status = 'revoked';

    const doc = this.data.documents.find(d => d.id === share.documentId);
    this.addAuditLog({
      userId,
      action: 'SHARE_REVOKED',
      details: `Revoked access token for document "${doc?.name || 'Document'}"`,
      ipAddress: '127.0.0.1',
      userAgent: 'UniVault Web Client',
      status: 'warning',
    });

    this.save();
    return true;
  }

  public getShareByToken(token: string): { share: DocumentShare; document: DocumentItem } | null {
    const share = this.data.shares.find(s => s.token === token);
    if (!share) return null;

    // Check expiry
    if (new Date(share.expiresAt).getTime() < Date.now()) {
      share.status = 'expired';
      this.save();
      return null;
    }

    if (share.status !== 'active') return null;

    const doc = this.data.documents.find(d => d.id === share.documentId && !d.isDeleted);
    if (!doc) return null;

    share.viewCount += 1;
    if (share.oneTimeAccess && share.viewCount >= 1) {
      share.status = 'expired';
    }
    this.save();

    return { share, document: doc };
  }

  // --- Checklists ---
  public getChecklists(userId: string): Checklist[] {
    return this.data.checklists.filter(c => c.userId === userId);
  }

  public createChecklist(userId: string, checklist: { title: string; type: Checklist['type']; items: ChecklistItem[] }): Checklist {
    const newCl: Checklist = {
      id: 'cl-' + crypto.randomUUID(),
      userId,
      title: checklist.title,
      type: checklist.type,
      items: checklist.items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.checklists.push(newCl);
    this.save();
    return newCl;
  }

  public updateChecklist(userId: string, checklistId: string, updates: Partial<Checklist>): Checklist | null {
    const cl = this.data.checklists.find(c => c.id === checklistId && c.userId === userId);
    if (!cl) return null;
    if (updates.title) cl.title = updates.title;
    if (updates.items) cl.items = updates.items;
    cl.updatedAt = new Date().toISOString();
    this.save();
    return cl;
  }

  public deleteChecklist(userId: string, checklistId: string): boolean {
    const index = this.data.checklists.findIndex(c => c.id === checklistId && c.userId === userId);
    if (index === -1) return false;
    this.data.checklists.splice(index, 1);
    this.save();
    return true;
  }

  // --- Notifications ---
  public getNotifications(userId: string): NotificationItem[] {
    return this.data.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(data: { userId: string; title: string; message: string; type: NotificationItem['type'] }): NotificationItem {
    const n: NotificationItem = {
      id: 'notif-' + crypto.randomUUID(),
      ...data,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(n);
    this.save();
    return n;
  }

  public markNotificationAsRead(userId: string, notifId: string): boolean {
    const n = this.data.notifications.find(item => item.id === notifId && item.userId === userId);
    if (!n) return false;
    n.read = true;
    this.save();
    return true;
  }

  public markAllNotificationsRead(userId: string): void {
    this.data.notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    this.save();
  }

  public clearNotifications(userId: string): void {
    this.data.notifications = this.data.notifications.filter(n => n.userId !== userId);
    this.save();
  }

  // --- Audit Logs ---
  public getAuditLogs(userId: string): AuditLog[] {
    return this.data.auditLogs
      .filter(l => l.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): AuditLog {
    const newLog: AuditLog = {
      id: 'log-' + crypto.randomUUID(),
      ...log,
      createdAt: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(newLog);
    // Keep max 1000 logs
    if (this.data.auditLogs.length > 1000) {
      this.data.auditLogs.pop();
    }
    this.save();
    return newLog;
  }

  // --- Admin Specific Operations (NO direct private file viewing) ---
  public getAdminStats() {
    const totalStudents = this.data.users.filter(u => u.role === 'student').length;
    const activeStudents = this.data.users.filter(u => u.role === 'student' && u.status === 'active').length;
    const totalDocuments = this.data.documents.filter(d => !d.isDeleted).length;
    
    const today = new Date().toISOString().split('T')[0];
    const uploadedToday = this.data.documents.filter(d => d.createdAt.startsWith(today)).length;

    // Expiring within 30 days
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 3600 * 1000;
    const expiringSoon = this.data.documents.filter(d => {
      if (d.isDeleted || !d.expiryDate) return false;
      const expiryTime = new Date(d.expiryDate).getTime();
      return expiryTime >= now && expiryTime <= now + thirtyDaysMs;
    }).length;

    const totalStorageBytes = this.data.documents.reduce((acc, d) => acc + (d.fileSize || 0), 0);
    const activeShares = this.data.shares.filter(s => s.status === 'active').length;

    return {
      totalStudents,
      activeStudents,
      totalDocuments,
      uploadedToday,
      expiringSoon,
      totalStorageBytes,
      activeShares,
    };
  }

  public getAdminStudentList() {
    // Returns students WITHOUT document contents, preserving privacy
    return this.data.users
      .filter(u => u.role === 'student')
      .map(u => {
        const studentDocs = this.data.documents.filter(d => d.userId === u.id && !d.isDeleted);
        return {
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          studentId: u.studentId,
          university: u.university,
          department: u.department,
          year: u.year,
          section: u.section,
          status: u.status,
          documentCount: studentDocs.length,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        };
      });
  }

  public setStudentStatus(studentId: string, status: 'active' | 'inactive'): boolean {
    const student = this.data.users.find(u => u.id === studentId && u.role === 'student');
    if (!student) return false;
    student.status = status;
    student.updatedAt = new Date().toISOString();
    this.save();
    return true;
  }

  public getSystemAuditLogs(): AuditLog[] {
    return this.data.auditLogs.slice(0, 100);
  }
}

export const db = new Database();

export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  studentId: string;
  university: string;
  department: string;
  year: string;
  section: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  role: UserRole;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export type DocumentCategory =
  | 'Academic'
  | 'Identity'
  | 'Achievements'
  | 'Career'
  | 'Financial'
  | 'Personal'
  | 'Other';

export interface DocumentItem {
  id: string;
  userId: string;
  name: string;
  category: DocumentCategory;
  description: string;
  fileType: string;
  fileSize: number;
  fileData?: string;
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
  documentName?: string;
  documentCategory?: string;
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

export interface AdminStats {
  totalStudents: number;
  activeStudents: number;
  totalDocuments: number;
  uploadedToday: number;
  expiringSoon: number;
  totalStorageBytes: number;
  activeShares: number;
}

export interface AdminStudentItem {
  id: string;
  fullName: string;
  email: string;
  studentId: string;
  university: string;
  department: string;
  year: string;
  section: string;
  status: 'active' | 'inactive';
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

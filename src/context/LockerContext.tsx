import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DocumentItem, DocumentCategory, DocumentShare, Checklist, NotificationItem, AuditLog } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface LockerContextType {
  documents: DocumentItem[];
  recycleBin: DocumentItem[];
  shares: DocumentShare[];
  checklists: Checklist[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: DocumentCategory | 'All';
  setSelectedCategory: (cat: DocumentCategory | 'All') => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  previewDoc: DocumentItem | null;
  setPreviewDoc: (doc: DocumentItem | null) => void;
  shareDoc: DocumentItem | null;
  setShareDoc: (doc: DocumentItem | null) => void;
  editDoc: DocumentItem | null;
  setEditDoc: (doc: DocumentItem | null) => void;
  // Actions
  refreshAll: () => Promise<void>;
  uploadDocument: (data: Partial<DocumentItem>) => Promise<DocumentItem>;
  updateDocument: (id: string, updates: Partial<DocumentItem>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  restoreDocument: (id: string) => Promise<void>;
  permanentDelete: (id: string) => Promise<void>;
  createShare: (params: { documentId: string; accessType: 'view' | 'download'; durationHours: number; oneTimeAccess?: boolean }) => Promise<{ share: DocumentShare; shareUrl: string }>;
  revokeShare: (shareId: string) => Promise<void>;
  createChecklist: (data: { title: string; type: Checklist['type']; items: any[] }) => Promise<Checklist>;
  updateChecklist: (id: string, updates: Partial<Checklist>) => Promise<void>;
  deleteChecklist: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  // Stats
  stats: {
    total: number;
    academic: number;
    personal: number;
    certificates: number;
    expiringSoon: number;
    expired: number;
  };
}

const LockerContext = createContext<LockerContextType | undefined>(undefined);

export const LockerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [recycleBin, setRecycleBin] = useState<DocumentItem[]>([]);
  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'All'>('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [shareDoc, setShareDoc] = useState<DocumentItem | null>(null);
  const [editDoc, setEditDoc] = useState<DocumentItem | null>(null);

  const refreshAll = useCallback(async () => {
    if (!user) {
      setDocuments([]);
      setRecycleBin([]);
      setShares([]);
      setChecklists([]);
      setNotifications([]);
      setAuditLogs([]);
      return;
    }

    setLoading(true);
    try {
      const [docsRes, binRes, sharesRes, clRes, notifRes, logsRes] = await Promise.all([
        api.getDocuments().catch(() => ({ documents: [] })),
        api.getRecycleBin().catch(() => ({ documents: [] })),
        api.getShares().catch(() => ({ shares: [] })),
        api.getChecklists().catch(() => ({ checklists: [] })),
        api.getNotifications().catch(() => ({ notifications: [] })),
        api.getAuditLogs().catch(() => ({ logs: [] })),
      ]);

      setDocuments(docsRes.documents || []);
      setRecycleBin(binRes.documents || []);
      setShares(sharesRes.shares || []);
      setChecklists(clRes.checklists || []);
      setNotifications(notifRes.notifications || []);
      setAuditLogs(logsRes.logs || []);
    } catch (err) {
      console.error('Failed to load locker data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const uploadDocument = async (data: Partial<DocumentItem>): Promise<DocumentItem> => {
    const res = await api.uploadDocument(data);
    await refreshAll();
    return res.document;
  };

  const updateDocument = async (id: string, updates: Partial<DocumentItem>) => {
    await api.updateDocument(id, updates);
    await refreshAll();
  };

  const deleteDocument = async (id: string) => {
    await api.deleteDocument(id);
    await refreshAll();
  };

  const restoreDocument = async (id: string) => {
    await api.restoreDocument(id);
    await refreshAll();
  };

  const permanentDelete = async (id: string) => {
    await api.permanentlyDeleteDocument(id);
    await refreshAll();
  };

  const createShare = async (params: {
    documentId: string;
    accessType: 'view' | 'download';
    durationHours: number;
    oneTimeAccess?: boolean;
  }) => {
    const res = await api.createShare(params);
    await refreshAll();
    return res;
  };

  const revokeShare = async (shareId: string) => {
    await api.revokeShare(shareId);
    await refreshAll();
  };

  const createChecklist = async (data: { title: string; type: Checklist['type']; items: any[] }) => {
    const res = await api.createChecklist(data);
    await refreshAll();
    return res.checklist;
  };

  const updateChecklist = async (id: string, updates: Partial<Checklist>) => {
    await api.updateChecklist(id, updates);
    await refreshAll();
  };

  const deleteChecklist = async (id: string) => {
    await api.deleteChecklist(id);
    await refreshAll();
  };

  const markNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = async () => {
    await api.clearNotifications();
    setNotifications([]);
  };

  // Compute calculated metrics
  const now = Date.now();
  const ninetyDaysMs = 90 * 24 * 3600 * 1000;

  const expiringSoonDocs = documents.filter(d => {
    if (!d.expiryDate) return false;
    const exp = new Date(d.expiryDate).getTime();
    return exp >= now && exp <= now + ninetyDaysMs;
  });

  const expiredDocs = documents.filter(d => {
    if (!d.expiryDate) return false;
    return new Date(d.expiryDate).getTime() < now;
  });

  const stats = {
    total: documents.length,
    academic: documents.filter(d => d.category === 'Academic').length,
    personal: documents.filter(d => d.category === 'Personal' || d.category === 'Identity').length,
    certificates: documents.filter(d => d.category === 'Achievements' || d.tags.some(t => t.toLowerCase().includes('certificate'))).length,
    expiringSoon: expiringSoonDocs.length,
    expired: expiredDocs.length,
  };

  return (
    <LockerContext.Provider
      value={{
        documents,
        recycleBin,
        shares,
        checklists,
        notifications,
        auditLogs,
        loading,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedTag,
        setSelectedTag,
        previewDoc,
        setPreviewDoc,
        shareDoc,
        setShareDoc,
        editDoc,
        setEditDoc,
        refreshAll,
        uploadDocument,
        updateDocument,
        deleteDocument,
        restoreDocument,
        permanentDelete,
        createShare,
        revokeShare,
        createChecklist,
        updateChecklist,
        deleteChecklist,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        stats,
      }}
    >
      {children}
    </LockerContext.Provider>
  );
};

export const useLocker = (): LockerContextType => {
  const context = useContext(LockerContext);
  if (!context) {
    throw new Error('useLocker must be used within a LockerProvider');
  }
  return context;
};

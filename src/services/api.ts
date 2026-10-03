import { User, DocumentItem, DocumentShare, Checklist, NotificationItem, AuditLog, AdminStats, AdminStudentItem } from '../types';

const TOKEN_KEY = 'univault_auth_token';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `HTTP error ${response.status}`);
    }

    return data as T;
  },

  // Auth
  async register(payload: any): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    return res;
  },

  async login(payload: { email: string; password: string }): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/api/auth/me');
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(payload: { email: string; newPassword: string; confirmPassword: string }): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateProfile(updates: Partial<User>): Promise<{ user: User }> {
    return this.request<{ user: User }>('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Documents
  async getDocuments(): Promise<{ documents: DocumentItem[] }> {
    return this.request<{ documents: DocumentItem[] }>('/api/documents');
  },

  async getRecycleBin(): Promise<{ documents: DocumentItem[] }> {
    return this.request<{ documents: DocumentItem[] }>('/api/documents/recycle-bin');
  },

  async uploadDocument(docData: Partial<DocumentItem>): Promise<{ document: DocumentItem }> {
    return this.request<{ document: DocumentItem }>('/api/documents', {
      method: 'POST',
      body: JSON.stringify(docData),
    });
  },

  async updateDocument(id: string, updates: Partial<DocumentItem>): Promise<{ document: DocumentItem }> {
    return this.request<{ document: DocumentItem }>(`/api/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteDocument(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/documents/${id}`, {
      method: 'DELETE',
    });
  },

  async restoreDocument(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/documents/${id}/restore`, {
      method: 'POST',
    });
  },

  async permanentlyDeleteDocument(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/documents/${id}/permanent`, {
      method: 'DELETE',
    });
  },

  // Shares
  async getShares(): Promise<{ shares: DocumentShare[] }> {
    return this.request<{ shares: DocumentShare[] }>('/api/shares');
  },

  async createShare(params: {
    documentId: string;
    accessType: 'view' | 'download';
    durationHours: number;
    oneTimeAccess?: boolean;
  }): Promise<{ share: DocumentShare; shareUrl: string }> {
    return this.request<{ share: DocumentShare; shareUrl: string }>('/api/shares', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async revokeShare(shareId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/shares/${shareId}/revoke`, {
      method: 'POST',
    });
  },

  async getPublicShare(token: string): Promise<{ share: Partial<DocumentShare>; document: DocumentItem }> {
    return this.request<{ share: Partial<DocumentShare>; document: DocumentItem }>(`/api/public/share/${token}`);
  },

  // Checklists
  async getChecklists(): Promise<{ checklists: Checklist[] }> {
    return this.request<{ checklists: Checklist[] }>('/api/checklists');
  },

  async createChecklist(data: { title: string; type: Checklist['type']; items: any[] }): Promise<{ checklist: Checklist }> {
    return this.request<{ checklist: Checklist }>('/api/checklists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateChecklist(id: string, updates: Partial<Checklist>): Promise<{ checklist: Checklist }> {
    return this.request<{ checklist: Checklist }>(`/api/checklists/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteChecklist(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/checklists/${id}`, {
      method: 'DELETE',
    });
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[] }> {
    return this.request<{ notifications: NotificationItem[] }>('/api/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'POST',
    });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/notifications/read-all', {
      method: 'POST',
    });
  },

  async clearNotifications(): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/notifications/clear', {
      method: 'POST',
    });
  },

  // Audit Logs
  async getAuditLogs(): Promise<{ logs: AuditLog[] }> {
    return this.request<{ logs: AuditLog[] }>('/api/audit-logs');
  },

  // VaultAI
  async askVaultAI(message: string, history: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<{ reply: string }> {
    return this.request<{ reply: string }>('/api/vaultai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  },

  // Admin
  async getAdminStats(): Promise<{ stats: AdminStats }> {
    return this.request<{ stats: AdminStats }>('/api/admin/stats');
  },

  async getAdminStudents(): Promise<{ students: AdminStudentItem[] }> {
    return this.request<{ students: AdminStudentItem[] }>('/api/admin/students');
  },

  async updateStudentStatus(id: string, status: 'active' | 'inactive'): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/admin/students/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getAdminAuditLogs(): Promise<{ logs: AuditLog[] }> {
    return this.request<{ logs: AuditLog[] }>('/api/admin/audit-logs');
  },
};

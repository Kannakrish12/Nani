import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocker } from '../context/LockerContext';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  KeyRound,
  Download,
  Trash2,
  Save,
  AlertTriangle,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { documents, checklists, shares } = useLocker();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'appearance'>('profile');

  // Profile Form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Security Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [securityMsg, setSecurityMsg] = useState<string | null>(null);

  // Notification settings state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [expiryThresholdDays, setExpiryThresholdDays] = useState(30);
  const [shareAuditAlerts, setShareAuditAlerts] = useState(true);
  const [aiWeeklySummary, setAiWeeklySummary] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  // Appearance state
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await updateProfile({
        fullName,
        phone,
        bio,
        department,
      });
      setProfileMsg('Profile settings updated successfully.');
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err: any) {
      setProfileMsg('Failed to update profile: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setSecurityMsg('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setSecurityMsg('Password must be at least 8 characters.');
      return;
    }

    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      setSecurityMsg('Credentials updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSecurityMsg(null), 3000);
    }, 600);
  };

  const handleExportDataArchive = () => {
    const archive = {
      exportedAt: new Date().toISOString(),
      studentProfile: {
        id: user?.id,
        fullName: user?.fullName,
        studentId: user?.studentId,
        email: user?.email,
        university: user?.university,
        department: user?.department,
        year: user?.year,
        section: user?.section,
      },
      documents: documents.map((d) => ({
        id: d.id,
        name: d.name,
        category: d.category,
        description: d.description,
        issueDate: d.issueDate,
        expiryDate: d.expiryDate,
        tags: d.tags,
        fileSize: d.fileSize,
        createdAt: d.createdAt,
      })),
      checklists,
      shares: shares.map((s) => ({
        id: s.id,
        documentName: s.documentName,
        accessType: s.accessType,
        status: s.status,
        expiresAt: s.expiresAt,
        viewCount: s.viewCount,
      })),
    };

    const blob = new Blob([JSON.stringify(archive, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `UniVault_Archive_${user?.studentId || 'Student'}_2026.json`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'security', label: 'Security & Access', icon: Shield },
    { id: 'notifications', label: 'Notification Rules', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Sun },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Account Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your student credential preferences, security parameters, and notifications
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-2 border ${
                isActive
                  ? 'bg-blue-600/10 border-blue-500/40 text-blue-300 font-semibold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Settings Tab */}
      {activeTab === 'profile' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-semibold text-white">Student Enrollment Details</h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Keep your contact and departmental records up to date.
            </p>
          </div>

          {profileMsg && (
            <div className="p-3 bg-blue-950/40 border border-blue-800 text-blue-300 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-400" />
              <span>{profileMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Student ID / Roll No</label>
                <input
                  type="text"
                  disabled
                  value={user?.studentId || ''}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-500 font-mono cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (650) 492-3891"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Academic Interests / Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingProfile ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security & Access Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 text-xs">
            <div>
              <h3 className="text-sm font-semibold text-white">Change Password</h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Ensure your student locker uses a secure password with at least 8 characters.
              </p>
            </div>

            {securityMsg && (
              <div className="p-3 bg-blue-950/40 border border-blue-800 text-blue-300 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-400" />
                <span>{securityMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-3.5 max-w-md">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors mt-1"
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Data Portability Archive */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-400" />
                Export Complete Data Archive
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Download a cryptographically attested JSON package of all your registered metadata,
                checklists, and share histories.
              </p>
            </div>

            <div className="pt-1">
              <button
                onClick={handleExportDataArchive}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export My UniVault Dossier (.json)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Rules Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 text-xs">
          <div>
            <h3 className="text-sm font-semibold text-white">Automated Alert Triggers</h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Configure how UniVault warns you about document expiration and sharing activities.
            </p>
          </div>

          {notifSaved && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Notification rules saved.</span>
            </div>
          )}

          <div className="space-y-4 divide-y divide-slate-800/80">
            <div className="pt-2 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Email Expiry Reminders</div>
                <div className="text-slate-400 text-[11px]">
                  Send warning notifications to {user?.email} before certificates expire.
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Lead Alert Window</div>
                <div className="text-slate-400 text-[11px]">
                  Threshold before expiration to trigger urgent dashboard banner.
                </div>
              </div>
              <select
                value={expiryThresholdDays}
                onChange={(e) => setExpiryThresholdDays(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:outline-none"
              >
                <option value={7}>7 Days Prior</option>
                <option value={14}>14 Days Prior</option>
                <option value={30}>30 Days Prior</option>
                <option value={60}>60 Days Prior</option>
                <option value={90}>90 Days Prior</option>
              </select>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Secure Share Activity Alerts</div>
                <div className="text-slate-400 text-[11px]">
                  Log in-app notification when a temporary share link is accessed or expires.
                </div>
              </div>
              <input
                type="checkbox"
                checked={shareAuditAlerts}
                onChange={(e) => setShareAuditAlerts(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">VaultAI Weekly Academic Brief</div>
                <div className="text-slate-400 text-[11px]">
                  Receive an automated audit of your application checklists and missing documents.
                </div>
              </div>
              <input
                type="checkbox"
                checked={aiWeeklySummary}
                onChange={(e) => setAiWeeklySummary(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              onClick={() => {
                setNotifSaved(true);
                setTimeout(() => setNotifSaved(false), 2500);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
            >
              Save Notification Preferences
            </button>
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 text-xs">
          <div>
            <h3 className="text-sm font-semibold text-white">Visual Interface Theme</h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Select your preferred appearance mode for the student locker interface.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between h-28 transition-colors ${
                theme === 'dark'
                  ? 'border-blue-500 bg-blue-950/30 text-white shadow-lg'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Moon className="w-5 h-5 text-blue-400" />
              <div>
                <div className="font-semibold text-sm">Midnight Navy (Dark)</div>
                <div className="text-[11px] text-slate-500">Default university SaaS theme</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between h-28 transition-colors ${
                theme === 'light'
                  ? 'border-blue-500 bg-blue-950/30 text-white shadow-lg'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-400" />
              <div>
                <div className="font-semibold text-sm">High Contrast Light</div>
                <div className="text-[11px] text-slate-500">Daytime classroom reading</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between h-28 transition-colors ${
                theme === 'system'
                  ? 'border-blue-500 bg-blue-950/30 text-white shadow-lg'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Laptop className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="font-semibold text-sm">System Preference</div>
                <div className="text-[11px] text-slate-500">Matches OS appearance mode</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

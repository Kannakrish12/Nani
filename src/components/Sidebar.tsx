import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocker } from '../context/LockerContext';
import {
  LayoutDashboard,
  FolderLock,
  UploadCloud,
  Search,
  Sparkles,
  Share2,
  AlertTriangle,
  CheckSquare,
  User,
  ShieldCheck,
  Trash2,
  ShieldAlert,
  Database,
  Lock,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenUpload: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onOpenUpload }) => {
  const { user } = useAuth();
  const { documents, recycleBin, stats } = useLocker();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'locker', label: 'My Locker', icon: FolderLock, badge: stats.total },
    { id: 'upload', label: 'Upload Document', icon: UploadCloud, action: onOpenUpload },
    { id: 'search', label: 'Smart Search', icon: Search },
    { id: 'vaultai', label: 'VaultAI Assistant', icon: Sparkles, highlight: true },
    { id: 'share-manage', label: 'Secure Share', icon: Share2 },
    { id: 'expiry-alerts', label: 'Expiry Alerts', icon: AlertTriangle, alertBadge: stats.expiringSoon + stats.expired },
    { id: 'checklists', label: 'Application Checklists', icon: CheckSquare },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'security', label: 'Security Center', icon: ShieldCheck },
    { id: 'recycle-bin', label: 'Recycle Bin', icon: Trash2, badge: recycleBin.length },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (user?.role === 'admin') {
    navItems.push({
      id: 'admin',
      label: 'Admin Console',
      icon: ShieldAlert,
      badge: 0,
    });
  }

  // Calculate simulated storage used
  const totalBytes = documents.reduce((acc, d) => acc + (d.fileSize || 0), 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none">
      {/* Navigation Links */}
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Student Locker
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  setCurrentView(item.id);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 font-semibold border border-blue-500/30'
                  : item.highlight
                  ? 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-blue-400'
                      : item.highlight
                      ? 'text-blue-400'
                      : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.alertBadge && item.alertBadge > 0 ? (
                <span className="text-[10px] font-mono bg-amber-950 text-amber-400 border border-amber-800/60 px-1.5 py-0.2 rounded">
                  {item.alertBadge}
                </span>
              ) : item.badge !== undefined && item.badge > 0 ? (
                <span className="text-[10px] font-mono text-slate-500">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Storage and Security Guarantee Box */}
      <div className="p-3 m-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2.5 text-xs">
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-[11px] font-medium flex items-center gap-1.5">
            <Database className="w-3 h-3 text-slate-400" />
            Storage Used
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {totalMB} MB / 5 GB
          </span>
        </div>

        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(4, Math.min(100, (Number(totalMB) / 5000) * 100))}%` }}
          />
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] text-emerald-400">
          <Lock className="w-3 h-3 shrink-0" />
          <span className="truncate">Encrypted with RLS Isolation</span>
        </div>
      </div>
    </aside>
  );
};

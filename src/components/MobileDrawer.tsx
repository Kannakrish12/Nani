import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocker } from '../context/LockerContext';
import {
  X,
  Sparkles,
  Share2,
  AlertTriangle,
  CheckSquare,
  ShieldCheck,
  Trash2,
  ShieldAlert,
  LogOut,
  FolderLock,
  LayoutDashboard,
  Search,
  User,
  Settings,
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentView,
  setCurrentView,
}) => {
  const { user, logout } = useAuth();
  const { stats, recycleBin } = useLocker();

  if (!isOpen) return null;

  const navigate = (view: string) => {
    setCurrentView(view);
    onClose();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'locker', label: 'My Locker', icon: FolderLock, badge: stats.total },
    { id: 'search', label: 'Smart Search', icon: Search },
    { id: 'vaultai', label: 'VaultAI Assistant', icon: Sparkles, highlight: true },
    { id: 'share-manage', label: 'Secure Share', icon: Share2 },
    { id: 'expiry-alerts', label: 'Expiry Alerts', icon: AlertTriangle, alertBadge: stats.expiringSoon + stats.expired },
    { id: 'checklists', label: 'Application Checklists', icon: CheckSquare },
    { id: 'profile', label: 'My Profile & Digital ID', icon: User },
    { id: 'security', label: 'Security Center', icon: ShieldCheck },
    { id: 'recycle-bin', label: 'Recycle Bin', icon: Trash2, badge: recycleBin.length },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (user?.role === 'admin') {
    menuItems.push({
      id: 'admin',
      label: 'Admin Console',
      icon: ShieldAlert,
      badge: 0,
    });
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-slate-950 border-r border-slate-800 shadow-2xl p-4 flex flex-col justify-between z-10">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white">UniVault</span>
              <span className="text-xs text-blue-400 font-mono">Mobile</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 active:bg-slate-800 transition-colors cursor-pointer touch-manipulation"
              aria-label="Close Menu"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User badge */}
          <div className="py-3 border-b border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                user?.fullName.charAt(0)
              )}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">{user?.fullName}</div>
              <div className="text-[10px] text-slate-400 font-mono">{user?.studentId}</div>
            </div>
          </div>

          {/* Nav Items */}
          <div className="py-3 space-y-1 max-h-[60vh] overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 font-semibold border border-blue-500/30'
                      : item.highlight
                      ? 'text-slate-200 hover:bg-slate-900'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.alertBadge && item.alertBadge > 0 ? (
                    <span className="text-[10px] font-mono bg-amber-950 text-amber-400 border border-amber-800/60 px-1.5 rounded">
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
        </div>

        {/* Footer Sign out */}
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-950/40"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

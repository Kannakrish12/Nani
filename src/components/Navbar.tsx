import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocker } from '../context/LockerContext';
import {
  Bell,
  Search,
  Plus,
  Shield,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Lock,
  GraduationCap,
  Sparkles,
  Menu,
  CheckCircle2,
  Trash2,
  Clock,
  AlertTriangle,
  Share2,
  FileText,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenMobileMenu: () => void;
  onOpenUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenMobileMenu,
  onOpenUpload,
}) => {
  const { user, logout } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications, searchQuery, setSearchQuery } = useLocker();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = notifFilter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const handleNotificationClick = (n: typeof notifications[0]) => {
    markNotificationRead(n.id);
    setShowNotifs(false);

    if (n.type === 'expiry' || n.title.toLowerCase().includes('expir')) {
      setCurrentView('expiry-alerts');
    } else if (n.type === 'share' || n.title.toLowerCase().includes('share') || n.title.toLowerCase().includes('link')) {
      setCurrentView('share-manage');
    } else if (n.type === 'upload' || n.title.toLowerCase().includes('upload') || n.title.toLowerCase().includes('store')) {
      setCurrentView('locker');
    } else if (n.type === 'security' || n.title.toLowerCase().includes('security') || n.title.toLowerCase().includes('login')) {
      setCurrentView('security');
    } else {
      setCurrentView('dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile trigger & Breadcrumb / App Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-blue-500/30 flex items-center justify-center bg-blue-950/40">
              <img
                src="/src/assets/images/univault_brand_mark_1791018781344.jpg"
                alt="Privora"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <Lock className="w-4 h-4 text-blue-400" />
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-blue-400 transition-colors">
              Privora
            </span>
          </div>

          <span className="hidden sm:inline-block text-slate-600">/</span>

          <span className="hidden sm:inline-block text-xs font-medium text-slate-400 capitalize">
            {currentView === 'dashboard'
              ? 'Dashboard'
              : currentView === 'locker'
              ? 'My Locker'
              : currentView === 'upload'
              ? 'Upload Document'
              : currentView === 'search'
              ? 'Smart Search'
              : currentView === 'vaultai'
              ? 'VaultAI Assistant'
              : currentView === 'share-manage'
              ? 'Secure Sharing'
              : currentView === 'expiry-alerts'
              ? 'Expiry Alerts'
              : currentView === 'checklists'
              ? 'Application Checklists'
              : currentView === 'security'
              ? 'Security Center'
              : currentView === 'recycle-bin'
              ? 'Recycle Bin'
              : currentView === 'profile'
              ? 'Student Profile'
              : currentView === 'admin'
              ? 'Admin Console'
              : currentView}
          </span>
        </div>
      </div>

      {/* Middle: Universal Search Bar (desktop) */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents, tags, transcripts..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentView !== 'search' && currentView !== 'locker') {
                setCurrentView('search');
              }
            }}
            onFocus={() => {
              if (currentView !== 'search' && currentView !== 'locker') {
                setCurrentView('search');
              }
            }}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Right Actions: Upload button, VaultAI quick link, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Upload Button */}
        <button
          onClick={onOpenUpload}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm shadow-blue-500/20 transition-colors whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload</span>
        </button>

        {/* VaultAI Pill button */}
        <button
          onClick={() => setCurrentView('vaultai')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            currentView === 'vaultai'
              ? 'bg-blue-950/60 border-blue-500/50 text-blue-400'
              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
          title="Ask VaultAI about your documents"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">VaultAI</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer touch-manipulation"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
            )}
          </button>

          {showNotifs && (
            <>
              {/* Click-outside backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifs(false)}
              />

              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-md">
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-800 px-1.5 py-0.5 rounded-md font-mono">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => markAllNotificationsRead()}
                      className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Mark all read
                    </button>
                    <span className="text-slate-700">·</span>
                    <button
                      onClick={() => clearNotifications()}
                      className="text-[11px] text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="px-3 py-1.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-1">
                  <button
                    onClick={() => setNotifFilter('all')}
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      notifFilter === 'all'
                        ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    onClick={() => setNotifFilter('unread')}
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      notifFilter === 'unread'
                        ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>

                {/* List Container */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                      <Bell className="w-6 h-6 mx-auto opacity-40 text-slate-400" />
                      <div>No {notifFilter === 'unread' ? 'unread' : ''} notifications</div>
                    </div>
                  ) : (
                    filteredNotifications.map((n) => {
                      const isExpiry = n.type === 'expiry' || n.title.toLowerCase().includes('expir');
                      const isShare = n.type === 'share' || n.title.toLowerCase().includes('share');
                      const isUpload = n.type === 'upload' || n.title.toLowerCase().includes('upload');
                      const isSecurity = n.type === 'security' || n.title.toLowerCase().includes('security');

                      return (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 text-xs cursor-pointer hover:bg-slate-800/50 transition-colors flex items-start gap-2.5 group relative ${
                            !n.read ? 'bg-blue-950/20' : ''
                          }`}
                        >
                          {/* Category Icon */}
                          <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                            isExpiry
                              ? 'bg-amber-950/60 border border-amber-800/60 text-amber-400'
                              : isShare
                              ? 'bg-purple-950/60 border border-purple-800/60 text-purple-400'
                              : isUpload
                              ? 'bg-blue-950/60 border border-blue-800/60 text-blue-400'
                              : isSecurity
                              ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {isExpiry ? (
                              <AlertTriangle className="w-3.5 h-3.5" />
                            ) : isShare ? (
                              <Share2 className="w-3.5 h-3.5" />
                            ) : isUpload ? (
                              <FileText className="w-3.5 h-3.5" />
                            ) : (
                              <Bell className="w-3.5 h-3.5" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-start justify-between gap-1">
                              <div className="font-semibold text-slate-200 group-hover:text-white flex items-center gap-1.5 truncate">
                                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />}
                                <span className="truncate">{n.title}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                            <div className="text-[10px] text-blue-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                              Click to view details →
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-white leading-none truncate max-w-[120px]">
                {user?.fullName}
              </div>
              <div className="text-[10px] text-slate-400 leading-none mt-1">
                {user?.role === 'admin' ? 'Administrator' : user?.studentId || 'Student'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 text-xs">
              <div className="px-3 py-2 border-b border-slate-800">
                <div className="font-semibold text-white truncate">{user?.fullName}</div>
                <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-blue-400 font-mono">
                  <span>{user?.university}</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setCurrentView('profile');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>My Profile & Digital ID</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentView('security');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>Security Center</span>
                </button>

                {user?.role === 'admin' && (
                  <button
                    onClick={() => {
                      setCurrentView('admin');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-md hover:bg-blue-950/40 text-blue-400 flex items-center gap-2"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Admin Console</span>
                  </button>
                )}
              </div>

              <div className="pt-1 mt-1 border-t border-slate-800">
                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-md hover:bg-red-950/40 text-red-400 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

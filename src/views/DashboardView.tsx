import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocker } from '../context/LockerContext';
import { DocumentItem } from '../types';
import {
  FileText,
  GraduationCap,
  Award,
  AlertTriangle,
  UploadCloud,
  Search,
  Share2,
  User,
  Clock,
  ChevronRight,
  ShieldCheck,
  CheckSquare,
  Plus,
  ArrowUpRight,
  Lock,
} from 'lucide-react';

interface DashboardViewProps {
  setCurrentView: (view: string) => void;
  onOpenUpload: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setCurrentView, onOpenUpload }) => {
  const { user } = useAuth();
  const {
    documents,
    stats,
    checklists,
    auditLogs,
    setPreviewDoc,
    setShareDoc,
    setSelectedCategory,
  } = useLocker();

  // Expiration filtering
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 3600 * 1000;
  const urgentExpirations = documents.filter((d) => {
    if (!d.expiryDate) return false;
    const exp = new Date(d.expiryDate).getTime();
    return exp <= now + thirtyDaysMs;
  });

  const recentDocs = documents.slice(0, 4);
  const primaryChecklist = checklists[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Good morning, {user?.fullName || 'Student'}</span>
            <span role="img" aria-label="wave">👋</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {user?.university} · {user?.department} ({user?.studentId})
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenUpload}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
          <button
            onClick={() => setCurrentView('search')}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
          <button
            onClick={() => setCurrentView('vaultai')}
            className="px-3 py-2 bg-blue-950/40 hover:bg-blue-950/70 text-blue-400 border border-blue-800/60 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <span>Ask VaultAI</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div
          onClick={() => {
            setSelectedCategory('All');
            setCurrentView('locker');
          }}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium text-slate-400">Total Documents</span>
            <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {stats.total}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Encrypted in Vault</div>
        </div>

        <div
          onClick={() => {
            setSelectedCategory('Academic');
            setCurrentView('locker');
          }}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium text-slate-400">Academic</span>
            <GraduationCap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {stats.academic}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Transcripts & Memos</div>
        </div>

        <div
          onClick={() => {
            setSelectedCategory('Achievements');
            setCurrentView('locker');
          }}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium text-slate-400">Certificates</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {stats.certificates}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Awards & Credentials</div>
        </div>

        <div
          onClick={() => {
            setSelectedCategory('Identity');
            setCurrentView('locker');
          }}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium text-slate-400">Personal & ID</span>
            <User className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {stats.personal}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Campus & Legal IDs</div>
        </div>

        <div
          onClick={() => setCurrentView('expiry-alerts')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-colors cursor-pointer group col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium text-slate-400">Expiring Soon</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-400">
            {stats.expiringSoon + stats.expired}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Action required</div>
        </div>
      </div>

      {/* Urgent Expiry Banner (if any) */}
      {urgentExpirations.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-950 text-amber-400 border border-amber-800/60 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-white">
                {urgentExpirations[0].name} expires in{' '}
                {Math.max(
                  0,
                  Math.round(
                    (new Date(urgentExpirations[0].expiryDate!).getTime() - Date.now()) /
                      (1000 * 3600 * 24)
                  )
                )}{' '}
                days
              </span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Category: {urgentExpirations[0].category} · Renewal required to maintain scholarship/campus compliance
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('expiry-alerts')}
            className="px-3 py-1.5 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800/80 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
          >
            Review Alerts
          </button>
        </div>
      )}

      {/* Two Column Grid: Recent Documents + Application Checklists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Documents (2 Columns) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent Documents</h2>
            <button
              onClick={() => setCurrentView('locker')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              <span>View all ({documents.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentDocs.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center space-y-3 bg-slate-900/20">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs text-slate-400">Your locker is empty</div>
              <button
                onClick={onOpenUpload}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
              >
                + Upload Document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setPreviewDoc(doc)}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-blue-400 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <h3 className="font-semibold text-xs text-slate-200 group-hover:text-white truncate">
                          {doc.name}
                        </h3>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{doc.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{(doc.fileSize / 1024).toFixed(0)} KB</span>
                      <span aria-hidden="true">·</span>
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono text-[10px]">
                      {doc.expiryDate ? `Exp: ${doc.expiryDate}` : 'Permanent'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShareDoc(doc);
                      }}
                      className="text-slate-400 hover:text-blue-400 p-1 rounded hover:bg-slate-800 transition-colors"
                      title="Share link"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar Widget: Checklist & Security Activity */}
        <div className="space-y-6">
          {/* Checklist Preview Widget */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                Active Checklist
              </h3>
              <button
                onClick={() => setCurrentView('checklists')}
                className="text-[11px] text-blue-400 hover:text-blue-300"
              >
                Manage
              </button>
            </div>

            {primaryChecklist ? (
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="font-semibold text-slate-200 truncate">{primaryChecklist.title}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>
                      {primaryChecklist.items.filter((i) => i.completed).length} of{' '}
                      {primaryChecklist.items.length} completed
                    </span>
                    <span className="font-mono tabular-nums text-blue-400">
                      {Math.round(
                        (primaryChecklist.items.filter((i) => i.completed).length /
                          primaryChecklist.items.length) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (primaryChecklist.items.filter((i) => i.completed).length /
                            primaryChecklist.items.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  {primaryChecklist.items.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 text-[11px] text-slate-300 truncate"
                    >
                      <span className={item.completed ? 'text-emerald-400' : 'text-slate-600'}>
                        {item.completed ? '✓' : '○'}
                      </span>
                      <span className={`truncate ${item.completed ? 'line-through text-slate-500' : ''}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 text-center py-2">
                No active checklist created
              </div>
            )}
          </div>

          {/* Recent Security Activity Stream */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Security Activity
              </h3>
              <button
                onClick={() => setCurrentView('security')}
                className="text-[11px] text-blue-400 hover:text-blue-300"
              >
                Log
              </button>
            </div>

            <div className="space-y-2.5">
              {auditLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="text-[11px] border-b border-slate-800/60 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold">{log.action}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-400 line-clamp-1 mt-0.5 text-[10px]">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

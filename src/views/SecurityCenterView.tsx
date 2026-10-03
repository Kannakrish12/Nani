import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocker } from '../context/LockerContext';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  Server,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Laptop,
} from 'lucide-react';

export const SecurityCenterView: React.FC = () => {
  const { user } = useAuth();
  const { auditLogs } = useLocker();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Security & Privacy Center</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Zero-Trust security posture, active session protection, and audit logs
        </p>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Account Protection</span>
            <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Optimal
            </span>
          </div>
          <div className="text-sm font-bold text-white">PBKDF2 Salted Auth</div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Hashed credentials with session validation on every protected route.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Private Locker</span>
            <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              RLS Active
            </span>
          </div>
          <div className="text-sm font-bold text-white">Strict Row Isolation</div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Database records isolated strictly to user UUID. Zero cross-tenant leakage.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Secure Storage</span>
            <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Encrypted
            </span>
          </div>
          <div className="text-sm font-bold text-white">AES-256 Storage</div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Unrestricted public buckets are disabled; downloads require signed tokens.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Sharing Protection</span>
            <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Time-Locked
            </span>
          </div>
          <div className="text-sm font-bold text-white">Temporary Tokens</div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Automatic countdown expiry, self-destruct on view, and instant revocation.
          </p>
        </div>
      </div>

      {/* Active Sessions Panel */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 text-xs">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Laptop className="w-4 h-4 text-blue-400" />
          Active Device & Authentication Session
        </h3>

        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-semibold text-white">
              <span>Web Browser Session</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full font-mono">
                Current
              </span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Authenticated as {user?.email} · {user?.university}
            </div>
          </div>
          <div className="text-slate-500 font-mono text-[10px]">
            TLS 1.3 / Authenticated Bearer Token
          </div>
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            Security Audit Trail
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {auditLogs.length} events recorded
          </span>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 hidden sm:table-cell">IP Address</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 text-white font-semibold">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-sans max-w-sm truncate">
                    {log.details}
                  </td>
                  <td className="py-3 px-4 text-slate-400 hidden sm:table-cell">
                    {log.ipAddress}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`text-[10px] uppercase font-semibold ${
                        log.status === 'success'
                          ? 'text-emerald-400'
                          : log.status === 'warning'
                          ? 'text-amber-400'
                          : 'text-red-400'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

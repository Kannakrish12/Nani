import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AdminStats, AdminStudentItem, AuditLog } from '../types';
import {
  ShieldAlert,
  Users,
  FileText,
  Clock,
  Database,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Loader2,
  Calendar,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [students, setStudents] = useState<AdminStudentItem[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'students' | 'categories' | 'config' | 'logs'>('students');

  // Institution config state
  const [storageQuotaGB, setStorageQuotaGB] = useState(5);
  const [maxShareDurationDays, setMaxShareDurationDays] = useState(30);
  const [requireEduEmail, setRequireEduEmail] = useState(true);
  const [configSaved, setConfigSaved] = useState(false);

  // Categories config
  const [categoriesList, setCategoriesList] = useState([
    { name: 'Academic', description: 'Transcripts, grade reports, bonafide letters', count: 12, enabled: true },
    { name: 'Identity', description: 'Campus ID cards, driver license, passports', count: 6, enabled: true },
    { name: 'Achievements', description: 'Hackathons, awards, contest certificates', count: 5, enabled: true },
    { name: 'Career', description: 'Internship offer letters, recommendation memos', count: 4, enabled: true },
    { name: 'Financial', description: 'Income certificates, fee receipts, scholarships', count: 3, enabled: true },
    { name: 'Personal', description: 'Medical records, personal declarations', count: 2, enabled: true },
    { name: 'Other', description: 'General miscellaneous student documents', count: 1, enabled: true },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, studentsRes, logsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminStudents(),
        api.getAdminAuditLogs(),
      ]);
      setStats(statsRes.stats);
      setStudents(studentsRes.students);
      setLogs(logsRes.logs);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (studentId: string, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setUpdatingId(studentId);
    try {
      await api.updateStudentStatus(studentId, newStatus);
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, status: newStatus } : s))
      );
    } catch (err) {
      console.error('Failed to update student status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredStudents = students.filter((s) => {
    if (!searchStudent.trim()) return true;
    const q = searchStudent.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>University Administrative Console</span>
          <span className="text-xs bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded-full font-mono">
            Registrar Access
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          System telemetry, student accounts administration, and compliance audit trail
        </p>
      </div>

      {/* Critical Privacy Guarantee Banner */}
      <div className="p-4 bg-blue-950/20 border border-blue-900/60 rounded-xl flex items-start gap-3 text-xs text-slate-300">
        <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Student Privacy Safeguard Enforced:</span>
          <p className="mt-0.5 text-slate-400 leading-relaxed text-[11px]">
            In compliance with student data protection regulations, university administrators can manage
            account statuses and monitor platform statistics, but have{' '}
            <strong className="text-white">zero access to private student document files</strong>.
            Documents remain encrypted and accessible only by the student or authorized share recipients.
          </p>
        </div>
      </div>

      {/* System Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-medium">Total Students</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {stats.totalStudents}
            </div>
            <div className="text-[10px] text-emerald-400 mt-1">
              {stats.activeStudents} active profiles
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-medium">Stored Records</span>
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {stats.totalDocuments}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              +{stats.uploadedToday} added today
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-medium">Expiring Soon (30d)</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {stats.expiringSoon}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Requiring student action
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-medium">Cloud Vault Storage</span>
              <Database className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {(stats.totalStorageBytes / (1024 * 1024)).toFixed(1)} MB
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {stats.activeShares} active temporary shares
            </div>
          </div>
        </div>
      )}

      {/* Admin Tab Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'students', label: 'Students Directory', icon: Users },
          { id: 'categories', label: 'Locker Categories', icon: FileText },
          { id: 'config', label: 'Institutional Policies', icon: Database },
          { id: 'logs', label: 'Compliance Audit Trail', icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors border ${
                isActive
                  ? 'bg-blue-600/10 border-blue-500/40 text-blue-300 font-semibold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Student Directory Table */}
      {activeAdminTab === 'students' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-white">Registered Student Accounts</h2>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                placeholder="Search by name, ID, or email..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Department</th>
                  <th className="py-3 px-4 hidden md:table-cell">Year</th>
                  <th className="py-3 px-4 text-center">Docs</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{s.fullName}</div>
                      <div className="text-[11px] text-slate-500">{s.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{s.studentId}</td>
                    <td className="py-3 px-4 text-slate-300 hidden sm:table-cell">{s.department}</td>
                    <td className="py-3 px-4 text-slate-400 hidden md:table-cell">{s.year}</td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-300">
                      {s.documentCount}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          s.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : 'bg-red-950 text-red-400 border border-red-800/60'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(s.id, s.status)}
                        disabled={updatingId === s.id}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          s.status === 'active'
                            ? 'bg-red-950/40 text-red-300 hover:bg-red-900 border border-red-800/60'
                            : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/60'
                        }`}
                      >
                        {updatingId === s.id
                          ? 'Updating...'
                          : s.status === 'active'
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Categories Management Panel */}
      {activeAdminTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">University Document Categories</h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Standardized categorization taxonomy enforced across student digital lockers
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {categoriesList.map((cat, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white">{cat.name}</span>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 border border-blue-800 px-2 py-0.5 rounded">
                      Standard
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-slate-500">
                  <span>Enforced by Taxonomy Engine</span>
                  <span className="text-emerald-400 font-mono text-[10px]">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Institutional Policies Panel */}
      {activeAdminTab === 'config' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 text-xs">
          <div>
            <h2 className="text-sm font-semibold text-white">Campus Digital Locker Quotas & Rules</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Global institution defaults for student storage capacities and sharing thresholds
            </p>
          </div>

          {configSaved && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Campus policy configuration updated.</span>
            </div>
          )}

          <div className="space-y-4 divide-y divide-slate-800/80">
            <div className="pt-2 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Default Student Storage Quota</div>
                <div className="text-slate-400 text-[11px]">
                  Maximum encrypted volume allocated per registered student locker.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={storageQuotaGB}
                  onChange={(e) => setStorageQuotaGB(Number(e.target.value))}
                  className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none"
                />
                <span className="text-slate-400">GB</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Maximum Share Link Duration</div>
                <div className="text-slate-400 text-[11px]">
                  Upper limit for temporary sharing links before automatic hard expiry.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={maxShareDurationDays}
                  onChange={(e) => setMaxShareDurationDays(Number(e.target.value))}
                  className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none"
                />
                <span className="text-slate-400">Days</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Enforce Academic Domain Email Registration</div>
                <div className="text-slate-400 text-[11px]">
                  Require student registrations to use verified university domains (.edu / .ac).
                </div>
              </div>
              <input
                type="checkbox"
                checked={requireEduEmail}
                onChange={(e) => setRequireEduEmail(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              onClick={() => {
                setConfigSaved(true);
                setTimeout(() => setConfigSaved(false), 2500);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
            >
              Save Campus Policy Defaults
            </button>
          </div>
        </div>
      )}

      {/* 4. System Security Events Log */}
      {activeAdminTab === 'logs' && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-white">System Administrative Audit Trail</h2>

          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold font-sans">
                <tr>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">User Agent</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-[11px]">
                {logs.slice(0, 15).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-4 font-semibold text-white">{log.action}</td>
                    <td className="py-2.5 px-4 text-slate-300 font-sans truncate max-w-sm">
                      {log.details}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 truncate max-w-xs">{log.userAgent}</td>
                    <td className="py-2.5 px-4 text-right text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

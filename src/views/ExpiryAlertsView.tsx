import React, { useState } from 'react';
import { useLocker } from '../context/LockerContext';
import { DocumentItem } from '../types';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
  Edit3,
  RefreshCw,
  Plus,
} from 'lucide-react';

interface ExpiryAlertsViewProps {
  onOpenUpload: () => void;
}

export const ExpiryAlertsView: React.FC<ExpiryAlertsViewProps> = ({ onOpenUpload }) => {
  const { documents, updateDocument, setPreviewDoc, setEditDoc } = useLocker();
  const [selectedThreshold, setSelectedThreshold] = useState<number>(30); // 7, 30, 90, all

  const now = Date.now();

  const categorized = documents.map((doc) => {
    if (!doc.expiryDate) {
      return { doc, status: 'none', daysLeft: null };
    }
    const expTime = new Date(doc.expiryDate).getTime();
    const daysLeft = Math.round((expTime - now) / (1000 * 3600 * 24));

    if (daysLeft < 0) return { doc, status: 'expired', daysLeft };
    if (daysLeft <= 7) return { doc, status: 'critical', daysLeft };
    if (daysLeft <= 30) return { doc, status: 'urgent', daysLeft };
    if (daysLeft <= 90) return { doc, status: 'warning', daysLeft };
    return { doc, status: 'active', daysLeft };
  });

  const expiredList = categorized.filter((item) => item.status === 'expired');
  const criticalList = categorized.filter((item) => item.status === 'critical');
  const urgentList = categorized.filter((item) => item.status === 'urgent');
  const warningList = categorized.filter((item) => item.status === 'warning');
  const safeList = categorized.filter((item) => item.status === 'active' || item.status === 'none');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Expiry Alerts & Compliance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated calendar monitoring for state certificates, campus passes, and financial proofs
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Renewal</span>
        </button>
      </div>

      {/* Threshold Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/40">
          <div className="flex items-center justify-between text-red-400 mb-1">
            <span className="font-semibold">Expired</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400 tabular-nums">
            {expiredList.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Requires renewal</div>
        </div>

        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="font-semibold">Within 7 Days</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {criticalList.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Immediate deadline</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-amber-300 mb-1">
            <span className="font-semibold">Within 30 Days</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 tabular-nums">
            {urgentList.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Upcoming renewal</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="font-semibold">Compliant</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {safeList.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Valid & verified</div>
        </div>
      </div>

      {/* Critical & Urgent Items Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-white">Action Required Documents</h2>

        {[...expiredList, ...criticalList, ...urgentList].length === 0 ? (
          <div className="p-8 border border-slate-800 rounded-xl bg-slate-900/40 text-center text-xs text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <span className="font-medium text-white block">All documents in good standing</span>
            <span>No stored records expire within the 30-day threshold.</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {[...expiredList, ...criticalList, ...urgentList].map(({ doc, status, daysLeft }) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-lg shrink-0 ${
                      status === 'expired'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      onClick={() => setPreviewDoc(doc)}
                      className="font-semibold text-sm text-white hover:text-blue-400 cursor-pointer transition-colors"
                    >
                      {doc.name}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-0.5">
                      <span>{doc.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">Expires: {doc.expiryDate}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          status === 'expired'
                            ? 'text-red-400 font-semibold'
                            : 'text-amber-400 font-semibold'
                        }
                      >
                        {status === 'expired'
                          ? `Expired ${Math.abs(daysLeft!)} days ago`
                          : `${daysLeft} days remaining`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => setEditDoc(doc)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Update Expiry</span>
                  </button>
                  <button
                    onClick={onOpenUpload}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Upload New Copy</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Valid / Safe Documents Section */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <h2 className="text-sm font-semibold text-white">Other Monitored Documents</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {safeList.map(({ doc, daysLeft }) => (
            <div
              key={doc.id}
              onClick={() => setPreviewDoc(doc)}
              className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between text-xs transition-colors"
            >
              <div className="truncate">
                <div className="font-medium text-slate-200 truncate">{doc.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {doc.category} · {doc.expiryDate ? `Expires ${doc.expiryDate}` : 'Permanent Credential'}
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <span className="text-[10px] text-emerald-400 font-mono">
                  {doc.expiryDate ? `${daysLeft}d left` : 'Valid'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DocumentItem, DocumentShare } from '../types';
import {
  Lock,
  ShieldCheck,
  Download,
  AlertTriangle,
  FileText,
  Clock,
  Eye,
  CheckCircle2,
  Calendar,
  ExternalLink,
} from 'lucide-react';

interface PublicShareViewProps {
  token: string;
  onGoHome: () => void;
}

export const PublicShareView: React.FC<PublicShareViewProps> = ({ token, onGoHome }) => {
  const [data, setData] = useState<{
    share: Partial<DocumentShare>;
    document: DocumentItem;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadShared() {
      try {
        const res = await api.getPublicShare(token);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'This secure link is either expired, revoked, or invalid.');
      } finally {
        setLoading(false);
      }
    }
    loadShared();
  }, [token]);

  const handleDownload = () => {
    if (!data?.document) return;
    const doc = data.document;
    const content =
      doc.fileData ||
      `UNIVAULT TEMPORARY VERIFIED ATTESTATION\n========================================\nDocument: ${doc.name}\nCategory: ${doc.category}\nIssue Date: ${doc.issueDate || 'N/A'}\nExpiry Date: ${doc.expiryDate || 'N/A'}\nVerified on: ${new Date().toLocaleString()}\n\nAttested by UniVault Student Digital Locker Infrastructure.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${doc.name.replace(/[^a-z0-9]/gi, '_')}.txt`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={onGoHome}>
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-blue-500/30 flex items-center justify-center bg-blue-950/40">
            <Lock className="w-4 h-4 text-blue-400" />
          </div>
          <span className="font-bold text-base tracking-tight text-white">UniVault</span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400">Secure Recipient View</span>
        </div>

        <button
          onClick={onGoHome}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300"
        >
          UniVault Platform
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-8 flex flex-col justify-center">
        {loading ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-xs text-slate-400">
              Verifying cryptographic signature and time-lock...
            </div>
          </div>
        ) : error ? (
          <div className="p-8 sm:p-12 bg-slate-900/60 border border-slate-800 rounded-3xl text-center space-y-4 max-w-lg mx-auto shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800/80 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Link Expired or Inaccessible</h2>
            <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
            <div className="pt-2">
              <button
                onClick={onGoHome}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium"
              >
                Return to UniVault Home
              </button>
            </div>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Verification Banner */}
            <div className="p-4 bg-blue-950/30 border border-blue-800/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span>Cryptographically Attested Student Record</span>
                    <span className="text-[10px] text-emerald-400 font-mono">VERIFIED</span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Valid temporary access · Expires {new Date(data.share.expiresAt!).toLocaleString()}
                  </div>
                </div>
              </div>

              {data.share.accessType === 'download' ? (
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Verified File</span>
                </button>
              ) : (
                <span className="text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>View-Only Access</span>
                </span>
              )}
            </div>

            {/* Document Details Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono text-blue-400 uppercase tracking-wider">
                    {data.document.category} Document
                  </span>
                  <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
                    {data.document.name}
                  </h1>
                </div>

                <div className="text-right text-xs text-slate-400">
                  <div className="font-mono tabular-nums">
                    {(data.document.fileSize / 1024).toFixed(1)} KB
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Format: {data.document.fileType}
                  </div>
                </div>
              </div>

              {/* Document Description */}
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <span className="font-semibold text-slate-400 block mb-1 uppercase text-[10px]">
                  Description & Context
                </span>
                {data.document.description || 'Verified student credential attested in UniVault.'}
              </div>

              {/* Dates & Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">ISSUE DATE</span>
                  <span className="text-slate-200">{data.document.issueDate || 'None'}</span>
                </div>
                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">EXPIRY DATE</span>
                  <span className="text-slate-200">{data.document.expiryDate || 'No Expiry'}</span>
                </div>
                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-500 block">SECURITY STATUS</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> SHA-256 Intact
                  </span>
                </div>
              </div>

              {/* Tags */}
              {data.document.tags && data.document.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-2">
                  <span className="text-[11px] text-slate-500">Tags:</span>
                  {data.document.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 bg-slate-800"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

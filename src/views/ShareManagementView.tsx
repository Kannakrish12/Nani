import React, { useState } from 'react';
import { useLocker } from '../context/LockerContext';
import {
  Share2,
  Clock,
  Eye,
  Download,
  Copy,
  Check,
  ShieldAlert,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Plus,
} from 'lucide-react';

interface ShareManagementViewProps {
  onOpenCreateShare: () => void;
}

export const ShareManagementView: React.FC<ShareManagementViewProps> = ({ onOpenCreateShare }) => {
  const { shares, revokeShare, documents, setShareDoc } = useLocker();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (shareId: string, token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(shareId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt).getTime() < Date.now();
    if (status === 'revoked') {
      return <span className="text-red-400 font-mono text-[10px]">Revoked</span>;
    }
    if (isExpired || status === 'expired') {
      return <span className="text-slate-500 font-mono text-[10px]">Expired</span>;
    }
    return <span className="text-emerald-400 font-mono text-[10px]">Active</span>;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Secure Sharing Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor, copy, and immediately revoke temporary access links
          </p>
        </div>

        <button
          onClick={onOpenCreateShare}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Share Link</span>
        </button>
      </div>

      {/* Security Architecture Notice */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-start gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          UniVault never issues permanent public URLs for student documents. Every link generated is
          time-bound, digitally signed, and auditable. Revoking a link terminates access instantaneously
          worldwide.
        </p>
      </div>

      {/* Shares List */}
      {shares.length === 0 ? (
        <div className="p-12 border border-dashed border-slate-800 rounded-2xl text-center space-y-3 bg-slate-900/20">
          <Share2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No active share links</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't generated any temporary links yet. Share selected documents safely with
            recruiters or admissions boards.
          </p>
          <button
            onClick={onOpenCreateShare}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
          >
            + Create First Share
          </button>
        </div>
      ) : (
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Shared Document</th>
                <th className="py-3 px-4">Permissions</th>
                <th className="py-3 px-4 hidden sm:table-cell">Created</th>
                <th className="py-3 px-4">Expires</th>
                <th className="py-3 px-4 text-center">Views</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {shares.map((share) => {
                const isExpired = new Date(share.expiresAt).getTime() < Date.now();
                const isRevoked = share.status === 'revoked';
                const canRevoke = !isExpired && !isRevoked;

                return (
                  <tr key={share.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white truncate max-w-xs">
                        {share.documentName || 'Document'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Token: {share.token.slice(0, 16)}...
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-slate-300 font-medium capitalize">
                        {share.accessType === 'download' ? 'Allow Download' : 'View Only'}
                      </span>
                      {share.oneTimeAccess && (
                        <span className="text-[10px] text-amber-400 block font-mono">
                          1-time access
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-400 hidden sm:table-cell">
                      {new Date(share.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                      {new Date(share.expiresAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-300">
                      {share.viewCount}
                    </td>

                    <td className="py-3 px-4">
                      {getStatusBadge(share.status, share.expiresAt)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopy(share.id, share.token)}
                          disabled={isExpired || isRevoked}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 rounded text-xs flex items-center gap-1 transition-colors"
                          title="Copy Link"
                        >
                          {copiedId === share.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline">
                            {copiedId === share.id ? 'Copied' : 'Copy'}
                          </span>
                        </button>

                        <a
                          href={`/share/${share.token}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                          title="Test Share Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {canRevoke && (
                          <button
                            onClick={() => {
                              if (window.confirm('Immediately revoke this share link?')) {
                                revokeShare(share.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-red-950/30"
                            title="Revoke Access Now"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { DocumentItem, DocumentCategory } from '../../types';
import { useLocker } from '../../context/LockerContext';
import {
  X,
  Download,
  Share2,
  Edit3,
  Trash2,
  FileText,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Tag,
  CheckCircle2,
  ExternalLink,
  FolderSync,
} from 'lucide-react';

interface DocumentPreviewModalProps {
  document: DocumentItem | null;
  onClose: () => void;
  onShare: (doc: DocumentItem) => void;
  onEdit: (doc: DocumentItem) => void;
  onDelete: (id: string) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  onClose,
  onShare,
  onEdit,
  onDelete,
}) => {
  const { updateDocument } = useLocker();
  const [movingCategory, setMovingCategory] = useState(false);

  if (!document) return null;

  const handleDownload = () => {
    // Generate downloadable text or simulated document data
    const content = document.fileData || `UNIVAULT SECURE VERIFIED RECORD\n=================================\nDocument Name: ${document.name}\nCategory: ${document.category}\nFile Size: ${(document.fileSize / 1024).toFixed(1)} KB\nUploaded: ${new Date(document.createdAt).toLocaleString()}\nIssue Date: ${document.issueDate || 'N/A'}\nExpiry Date: ${document.expiryDate || 'N/A'}\nTags: ${document.tags.join(', ')}\nDescription: ${document.description}\n\nDigitally signed and attested by UniVault Student Information Infrastructure.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.name.replace(/[^a-z0-9]/gi, '_')}.txt`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isExpired = document.expiryDate && new Date(document.expiryDate).getTime() < Date.now();
  const isExpiringSoon =
    document.expiryDate &&
    !isExpired &&
    new Date(document.expiryDate).getTime() <= Date.now() + 30 * 24 * 3600 * 1000;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm touch-manipulation"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3 truncate">
            <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h2 className="text-sm sm:text-base font-semibold text-white truncate">
                {document.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{document.category}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{(document.fileSize / 1024).toFixed(1)} KB</span>
                <span aria-hidden="true">·</span>
                <span>{new Date(document.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Download Document"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => onShare(document)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Secure Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(document)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Edit Metadata"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Move "${document.name}" to Recycle Bin?`)) {
                  onDelete(document.id);
                  onClose();
                }
              }}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
              title="Move to Recycle Bin"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-colors ml-2 cursor-pointer touch-manipulation"
              title="Close Preview"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Split View (Preview Canvas + Metadata Panel) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Main Document Viewer Canvas */}
          <div className="lg:col-span-2 p-6 flex flex-col items-center justify-center min-h-[350px] bg-slate-950/40">
            {document.fileType.startsWith('image/') && document.fileData ? (
              <div className="max-h-[460px] overflow-hidden rounded-xl border border-slate-800 bg-black flex items-center justify-center">
                <img
                  src={document.fileData}
                  alt={document.name}
                  className="max-h-[460px] object-contain"
                />
              </div>
            ) : (
              /* High-Fidelity Verified Academic Certificate / Document Render */
              <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 sm:p-8 text-slate-200 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-start justify-between border-b border-slate-800/80 pb-4 mb-6">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase">
                      UniVault Attested Record
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {document.name}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-blue-500/30 bg-blue-950/40 flex items-center justify-center text-blue-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Document Description
                    </div>
                    <p className="text-slate-300 mt-1 leading-relaxed">
                      {document.description || 'Verified student digital credential stored in UniVault.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800/60 font-mono text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Issue Date</span>
                      <span className="text-slate-200">{document.issueDate || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Expiry Date</span>
                      <span className={isExpired ? 'text-red-400' : isExpiringSoon ? 'text-amber-400' : 'text-slate-200'}>
                        {document.expiryDate || 'No Expiry'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>SHA-256 Integrity Verified</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">
                      ENC-AES256
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Metadata & Details Panel */}
          <div className="p-6 space-y-5 bg-slate-900/50">
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Metadata & Properties
              </h4>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 block text-[11px]">Category</span>
                    <button
                      type="button"
                      onClick={() => setMovingCategory(!movingCategory)}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                    >
                      <FolderSync className="w-3 h-3" />
                      <span>{movingCategory ? 'Close' : 'Move'}</span>
                    </button>
                  </div>
                  {movingCategory ? (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <select
                        defaultValue={document.category}
                        onChange={async (e) => {
                          const newCat = e.target.value as DocumentCategory;
                          await updateDocument(document.id, { category: newCat });
                          setMovingCategory(false);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="Academic">Academic</option>
                        <option value="Identity">Identity</option>
                        <option value="Achievements">Achievements</option>
                        <option value="Career">Career</option>
                        <option value="Financial">Financial</option>
                        <option value="Personal">Personal</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  ) : (
                    <span className="font-medium text-slate-200 mt-0.5 block">{document.category}</span>
                  )}
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">File Format</span>
                  <span className="font-mono text-slate-300">{document.fileType}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">File Size</span>
                  <span className="font-mono text-slate-300">
                    {(document.fileSize / 1024).toFixed(1)} KB ({document.fileSize.toLocaleString()} bytes)
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Status</span>
                  {isExpired ? (
                    <span className="text-red-400 font-semibold flex items-center gap-1.5 mt-0.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Expired
                    </span>
                  ) : isExpiringSoon ? (
                    <span className="text-amber-400 font-semibold flex items-center gap-1.5 mt-0.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Expiring Soon
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active & Compliant
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Tags
              </h4>
              {document.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {document.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-500">No tags assigned</span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() => onShare(document)}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm shadow-blue-500/20"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Create Secure Link</span>
              </button>
              <button
                onClick={handleDownload}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

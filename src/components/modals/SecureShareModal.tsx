import React, { useState } from 'react';
import { DocumentItem } from '../../types';
import { useLocker } from '../../context/LockerContext';
import { generateQrSvg } from '../../utils/qr';
import {
  X,
  Share2,
  Clock,
  Eye,
  Download,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  QrCode,
} from 'lucide-react';

interface SecureShareModalProps {
  document: DocumentItem | null;
  onClose: () => void;
}

export const SecureShareModal: React.FC<SecureShareModalProps> = ({ document, onClose }) => {
  const { createShare } = useLocker();

  const [accessType, setAccessType] = useState<'view' | 'download'>('view');
  const [durationHours, setDurationHours] = useState<number>(24);
  const [oneTimeAccess, setOneTimeAccess] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!document) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await createShare({
        documentId: document.id,
        accessType,
        durationHours,
        oneTimeAccess,
      });

      // Construct absolute share URL
      const shareUrl = `${window.location.origin}/share/${res.share.token}`;
      setGeneratedUrl(shareUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to generate secure link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm touch-manipulation"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-white">
                Create Secure Share Link
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs sm:max-w-sm">
                {document.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 active:bg-slate-700 transition-colors cursor-pointer touch-manipulation"
            aria-label="Close"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!generatedUrl ? (
            <div className="space-y-4">
              {/* Permission type */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Access Permissions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccessType('view')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors ${
                      accessType === 'view'
                        ? 'border-blue-500 bg-blue-950/40 text-white'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <Eye className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-xs text-white">View Only</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Recipient can inspect but cannot download
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccessType('download')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors ${
                      accessType === 'download'
                        ? 'border-blue-500 bg-blue-950/40 text-white'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <Download className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-xs text-white">Allow Download</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Recipient can save a verified local copy
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Expiry Duration */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Link Expiration Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '1 Hour', hours: 1 },
                    { label: '24 Hours', hours: 24 },
                    { label: '7 Days', hours: 168 },
                    { label: '30 Days', hours: 720 },
                  ].map((dur) => (
                    <button
                      key={dur.hours}
                      type="button"
                      onClick={() => setDurationHours(dur.hours)}
                      className={`py-2 px-1 text-center rounded-lg border text-xs font-medium transition-colors ${
                        durationHours === dur.hours
                          ? 'border-blue-500 bg-blue-950/50 text-blue-300 font-semibold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* One-Time Access Switch */}
              <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div>
                  <div className="font-medium text-slate-200">Self-Destruct on First View</div>
                  <div className="text-[11px] text-slate-500">
                    Immediately deactivates after the recipient opens the link
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={oneTimeAccess}
                  onChange={(e) => setOneTimeAccess(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Security note */}
              <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-xl flex items-start gap-2.5 text-slate-300 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p>
                  Links are secured with temporary cryptographic tokens. You can revoke access at any
                  moment from the <strong>Secure Share</strong> tab in your dashboard.
                </p>
              </div>

              {/* Submit button */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Generate Link</span>
                </button>
              </div>
            </div>
          ) : (
            /* Result Link UI */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/30 border border-emerald-800/80 rounded-xl text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <div>
                  <div className="font-semibold text-xs text-white">Temporary Secure Link Active</div>
                  <div className="text-[11px] text-emerald-400 mt-0.5">
                    Valid for {durationHours >= 24 ? `${durationHours / 24} days` : `${durationHours} hours`} ·{' '}
                    {accessType === 'view' ? 'View Only' : 'Download Permitted'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] uppercase font-semibold tracking-wider mb-1.5">
                  Shareable Temporary URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedUrl}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-blue-400 focus:outline-none select-all"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => setShowQr(!showQr)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg shrink-0 transition-colors"
                    title="Toggle Scannable QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {showQr && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-2">
                  <div
                    className="w-32 h-32 bg-white p-2 rounded-xl shadow-lg"
                    dangerouslySetInnerHTML={{
                      __html: generateQrSvg(generatedUrl, 112),
                    }}
                  />
                  <span className="text-[11px] text-slate-400 font-mono">
                    Scan with camera to open secure view
                  </span>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

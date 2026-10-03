import React, { useState } from 'react';
import { User } from '../../types';
import { generateQrSvg } from '../../utils/qr';
import { X, ShieldCheck, Printer, RefreshCw, GraduationCap } from 'lucide-react';

interface DigitalStudentIdCardProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

export const DigitalStudentIdCard: React.FC<DigitalStudentIdCardProps> = ({ isOpen, user, onClose }) => {
  const [flipped, setFlipped] = useState(false);

  if (!isOpen || !user) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm touch-manipulation"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Digital Student Credential</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] -mr-2 -my-2 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 active:bg-slate-700 transition-colors cursor-pointer touch-manipulation"
            aria-label="Close Digital Credential"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Canvas */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-950/60">
          <div
            onClick={() => setFlipped(!flipped)}
            className="cursor-pointer perspective-1000 w-full max-w-sm transition-transform duration-300 hover:scale-[1.02]"
          >
            {!flipped ? (
              /* Front of Student Card */
              <div className="w-full bg-gradient-to-br from-slate-900 via-blue-950/70 to-slate-950 border border-blue-500/40 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />

                {/* Top University Brand */}
                <div className="flex items-start justify-between border-b border-blue-500/20 pb-3 mb-4">
                  <div>
                    <div className="text-[10px] font-mono tracking-widest text-blue-400 uppercase">
                      Official Student Identity
                    </div>
                    <div className="text-sm font-bold text-white tracking-tight">
                      {user.university}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                </div>

                {/* Photo & Identity details */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-blue-400/60 bg-slate-800 shrink-0 shadow-lg">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-300">
                        {user.fullName.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="truncate">
                    <h4 className="text-base font-bold text-white truncate">{user.fullName}</h4>
                    <div className="text-xs font-mono text-blue-300 font-semibold mt-0.5">
                      {user.studentId}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1 truncate">
                      {user.department}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {user.year} · Sec {user.section}
                    </div>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex gap-0.5 h-6 items-end">
                      {[3, 1, 4, 2, 5, 2, 4, 1, 3, 2, 5, 1, 4, 2, 3, 5, 2, 1, 4, 3, 2, 5, 1, 3].map(
                        (h, i) => (
                          <div
                            key={i}
                            className="bg-slate-300 w-1 rounded-sm"
                            style={{ height: `${h * 4}px` }}
                          />
                        )
                      )}
                    </div>
                    <div className="text-[9px] font-mono text-slate-400">
                      TOKEN: {user.id.slice(0, 16)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Active 2026</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Back of Student Card */
              <div className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 text-white shadow-2xl relative min-h-[240px] flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-2">
                    Cardholder Terms & Emergency Contacts
                  </div>
                  <div className="text-[10px] text-slate-400 space-y-1 leading-relaxed">
                    <p>
                      This card is the property of {user.university} and must be presented upon request
                      by academic or campus security staff.
                    </p>
                    <p>
                      Emergency Security Dispatch: +1 (650) 723-2000
                      <br />
                      Office of the Registrar: records@{user.university.toLowerCase().replace(/[^a-z]/g, '')}.edu
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 bg-white p-1 rounded-lg shrink-0 shadow-sm"
                      dangerouslySetInnerHTML={{
                        __html: generateQrSvg(`UNIVAULT:${user.id}:${user.studentId}:VERIFIED_2026`, 48),
                      }}
                    />
                    <div className="text-[10px] text-slate-400">
                      Scan to verify digital
                      <br />
                      cryptographic signature
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-blue-400">UNIVAULT VERIFIED</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between w-full max-w-sm text-xs text-slate-400">
            <button
              type="button"
              onClick={() => setFlipped(!flipped)}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-1.5 px-2 rounded-lg hover:bg-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Flip Card</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-1.5 px-2 rounded-lg hover:bg-slate-800"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Credential</span>
            </button>
          </div>

          <div className="mt-4 w-full max-w-sm pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer touch-manipulation flex items-center justify-center gap-2"
            >
              <span>Close Credential</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

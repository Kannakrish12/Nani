import React, { useState } from 'react';
import {
  Lock,
  FolderLock,
  ShieldCheck,
  Sparkles,
  Share2,
  AlertTriangle,
  CheckSquare,
  FileText,
  Search,
  ChevronRight,
  GraduationCap,
  ArrowRight,
  Database,
  CheckCircle2,
  HelpCircle,
  Clock,
  Layers,
} from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
  onDemoStudent: () => void;
  onDemoAdmin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLogin,
  onRegister,
  onDemoStudent,
  onDemoAdmin,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does UniVault ensure my documents remain strictly confidential?',
      a: 'UniVault enforces cryptographic database Row-Level Security (RLS) and client-scoped permissions. Even university administrators cannot view your private document contents; administrative access is restricted to audit events and platform telemetry.',
    },
    {
      q: 'How does the VaultAI assistant work with my files?',
      a: 'VaultAI runs server-side and is strictly isolated to your authenticated student profile. It only accesses metadata and document records that belong to you to answer queries about missing certificates, expiry deadlines, and checklist requirements.',
    },
    {
      q: 'What happens when I share a document using a temporary link?',
      a: 'You can configure view-only or download permissions with an automatic expiration period (e.g., 24 hours). Once the countdown expires or if you manually revoke it, the link immediately terminates access.',
    },
    {
      q: 'Can I restore accidentally deleted documents?',
      a: 'Yes. UniVault uses a two-phase deletion workflow. Deleted documents remain safely in your Recycle Bin where they can be restored with a single click before permanent shredding.',
    },
    {
      q: 'What formats and file sizes are supported?',
      a: 'UniVault supports PDF transcripts, scanned IDs (PNG, JPG), Word documents (DOC, DOCX), spreadsheets, and presentation files up to 25MB per record.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. TOP BAR CONTRACT: Single text brand + 4-6 links + 1-2 primary CTAs */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-blue-500/30 flex items-center justify-center bg-blue-950/40">
            <img
              src="/src/assets/images/univault_brand_mark_1791018781344.jpg"
              alt="UniVault"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <Lock className="w-4 h-4 text-blue-400" />
          </div>
          <a href="#" className="text-lg font-bold tracking-tight text-white">
            UniVault
          </a>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-400">
          <a href="#why-univault" className="hover:text-white transition-colors">Why UniVault</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#vaultai" className="hover:text-white transition-colors">VaultAI</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="text-xs font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2"
          >
            Student Login
          </button>
          <button
            onClick={onRegister}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm shadow-blue-500/20 transition-colors whitespace-nowrap"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 px-6 max-w-6xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 text-xs text-blue-400 font-mono bg-blue-950/40 border border-blue-800/60 px-3 py-1 rounded-full mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>University-Grade Digital Locker & AI Assistant</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
          Your Digital Locker. Your Student Life.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
            One Secure Place.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
          Securely store, organize, find and use your academic credentials, marks memos, and personal documents from one intelligent student locker.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            onClick={onRegister}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5"
          >
            <span>Create Student Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onLogin}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
          >
            Sign In with Email
          </button>
        </div>

        {/* 1-Click Demo Quick Starters */}
        <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span className="text-slate-400">Instant Demo Evaluation:</span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onDemoStudent}
              className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-950 border border-blue-800/80 hover:bg-blue-900 text-blue-300 font-medium rounded-lg text-xs transition-colors"
            >
              Student (Sarah)
            </button>
            <button
              onClick={onDemoAdmin}
              className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition-colors"
            >
              Admin (Dr. Marcus)
            </button>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="mt-12 relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/40">
          <div className="aspect-[16/9] max-h-[500px] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
            <img
              src="/src/assets/images/univault_hero_preview_1791018731461.jpg"
              alt="UniVault Dashboard Mockup"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
        </div>
      </section>

      {/* 3. WHY UNIVAULT? */}
      <section id="why-univault" className="py-20 border-t border-slate-800/80 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Designed for Student Mobility and University Compliance
          </h2>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            Stop losing vital academic papers across email threads and cloud drives. UniVault centralizes your scholastic career in a privacy-guaranteed vault.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
              <FolderLock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Automated Organization</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Auto-categorize into Academic, Identity, Financial, and Career with metadata tags, issue dates, and digital checksums.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">VaultAI Private Assistant</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Ask natural language questions about your stored credentials, missing scholarship papers, and upcoming expiration deadlines.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Temporary Secure Links</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Share verified transcripts with recruiters and scholarship boards using self-expiring, time-locked links with instant revocation.
            </p>
          </div>
        </div>
      </section>

      {/* 4. KEY FEATURES */}
      <section id="features" className="py-20 border-t border-slate-800/80 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Engineered as a University SaaS Platform
          </h2>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            Built from first principles to exceed the security and usability expectations of modern collegiate institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-semibold text-white">Smart Expiry Engine</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Track 90, 30, and 7-day deadlines for income certificates, campus IDs, and permits.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-semibold text-white">Application Checklists</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Generate scholarship, internship, and placement packs with direct document linking.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
            <Search className="w-5 h-5 text-blue-400" />
            <h4 className="text-sm font-semibold text-white">Universal Search</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Instant keyword, tag, category, and date filtering across your entire credential locker.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <h4 className="text-sm font-semibold text-white">Digital Student ID</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Interactive 2-sided digital campus card with verified cryptographic barcode and signature.
            </p>
          </div>
        </div>
      </section>

      {/* 5. VAULTAI SPOTLIGHT */}
      <section id="vaultai" className="py-20 border-t border-slate-800/80 px-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-blue-400 bg-blue-950/50 border border-blue-800/80 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>VaultAI Student Intelligence</span>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight leading-snug">
              An AI Assistant That Actually Knows Your Academic Portfolio
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              No generic chatbot answers. VaultAI scans strictly through your authorized certificates, transcripts, and application checklists to provide personalized counsel.
            </p>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Finds documents across semesters and categories in seconds</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Audits application readiness for scholarships and internships</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Privacy-isolated: Never shares context across student accounts</span>
              </li>
            </ul>
          </div>

          {/* Simulated AI Chat Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-white">VaultAI Live Conversation</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">SCOPED TO USER</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white px-3.5 py-2 rounded-xl rounded-tr-none max-w-xs">
                  What documents am I missing for the merit scholarship?
                </div>
              </div>

              <div className="flex justify-start">
                <div className="bg-slate-950 border border-slate-800 text-slate-200 px-3.5 py-2.5 rounded-xl rounded-tl-none max-w-sm space-y-1.5">
                  <p className="font-semibold text-blue-400">VaultAI Analysis:</p>
                  <p className="text-[11px] leading-relaxed">
                    Based on your locker, you have your <strong>Student ID</strong> and <strong>Semester 5 Transcript</strong> ready.
                  </p>
                  <p className="text-[11px] text-amber-300">
                    ⚠️ Your Income Certificate expires in 18 days. Request an updated bonafide letter from the Registrar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECURITY ARCHITECTURE */}
      <section id="security" className="py-20 border-t border-slate-800/80 px-6 max-w-6xl mx-auto w-full">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 via-blue-950/20 to-slate-950 border border-blue-500/20 shadow-2xl text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight max-w-2xl mx-auto">
            Zero-Trust Student Privacy by Architecture
          </h2>

          <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
            UniVault enforces Row-Level Security on every database transaction. Student records cannot be queried or decrypted by other users or unauthorized administrative personnel.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4 text-xs font-mono">
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-emerald-400 block font-bold">RLS ISOLATED</span>
              <span className="text-slate-500 text-[10px]">Row-Level Auth</span>
            </div>
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-emerald-400 block font-bold">AES-256</span>
              <span className="text-slate-500 text-[10px]">Data at Rest</span>
            </div>
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-emerald-400 block font-bold">AUTO-EXPIRE</span>
              <span className="text-slate-500 text-[10px]">Time-Locked Links</span>
            </div>
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-emerald-400 block font-bold">AUDIT TRAIL</span>
              <span className="text-slate-500 text-[10px]">Tamper-Proof Logs</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section id="faq" className="py-20 border-t border-slate-800/80 px-6 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Everything you need to know about UniVault security and operations.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-800 rounded-xl bg-slate-900/30 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-200 hover:text-white"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t border-slate-800/80 py-10 px-6 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-white">UniVault</span>
            <span className="text-slate-600">·</span>
            <span>Smart Student Digital Locker</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onLogin} className="hover:text-slate-300">
              Student Sign In
            </button>
            <button onClick={onRegister} className="hover:text-slate-300">
              New Registration
            </button>
            <button onClick={onDemoAdmin} className="hover:text-slate-300">
              Admin Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

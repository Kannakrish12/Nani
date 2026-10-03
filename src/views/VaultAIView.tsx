import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocker } from '../context/LockerContext';
import {
  Sparkles,
  Send,
  Trash2,
  Lock,
  Loader2,
  FileText,
  ShieldCheck,
  User,
  Bot,
  Check,
  Copy,
  Download,
  Share2,
  Clock,
  GraduationCap,
  Briefcase,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface VaultAIViewProps {
  setCurrentView?: (view: string) => void;
  onOpenUpload?: () => void;
}

export const VaultAIView: React.FC<VaultAIViewProps> = ({ setCurrentView, onOpenUpload }) => {
  const { user } = useAuth();
  const { documents, setPreviewDoc, setShareDoc } = useLocker();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-init',
        role: 'assistant',
        content: `👋 Hello ${user?.fullName || 'there'}! I am **VaultAI Pro**, your intelligent academic credential co-pilot powered by Gemini.

I continuously analyze your encrypted documents, graduation clearance status, upcoming deadlines, and application requirements.

How would you like to proceed today? Select a **Pro Mode** above or choose a prompt below!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'audit' | 'academic' | 'career' | 'expiry' | 'custom'>('audit');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const proModes = [
    {
      id: 'audit',
      label: 'Security & Health Audit',
      icon: ShieldCheck,
      prompt: 'Run a complete Privora Security and Health Audit on my locker documents.',
      desc: 'Overall health score & missing requirements',
    },
    {
      id: 'academic',
      label: 'Academic Clearance',
      icon: GraduationCap,
      prompt: 'Evaluate my documents for graduation degree clearance and semester transcripts.',
      desc: 'GPA, transcripts & degree conferral',
    },
    {
      id: 'career',
      label: 'Career & Internship',
      icon: Briefcase,
      prompt: 'Check my credentials for summer internship and job placement readiness.',
      desc: 'Offer letters, resumes & achievements',
    },
    {
      id: 'expiry',
      label: 'Expiration Sentinel',
      icon: Clock,
      prompt: 'Which of my documents expire in 2026, and what requires urgent renewal?',
      desc: 'Urgent renewal windows & deadlines',
    },
  ];

  const suggestedPrompts = [
    'Audit my locker health score',
    'Which documents expire soon?',
    'What documents are missing for a scholarship application?',
    'Show my academic certificates and transcripts',
    'Do I have an internship offer letter stored?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.askVaultAI(textToSend.trim(), historyPayload);

      const aiMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'assistant',
        content:
          'VaultAI encountered an issue processing your request. Please try asking again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'msg-reset',
        role: 'assistant',
        content: '✨ VaultAI session refreshed. All temporary memory reset. What document or credential question can I assist with?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleExportChat = () => {
    const transcript = messages
      .map(
        (m) =>
          `[${m.timestamp}] ${m.role === 'user' ? user?.fullName || 'Student' : 'VaultAI Pro'}:\n${m.content}\n`
      )
      .join('\n----------------------------------------\n\n');

    const blob = new Blob([transcript], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VaultAI_Consultation_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper to find document referenced in text
  const findReferencedDocs = (text: string) => {
    return documents.filter((doc) =>
      text.toLowerCase().includes(doc.name.toLowerCase())
    );
  };

  return (
    <div className="flex flex-col space-y-3.5 max-w-5xl mx-auto h-[calc(100dvh-7.5rem)] min-h-[500px]">
      {/* Top Pro Banner & Status Header */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-bold text-white tracking-tight">VaultAI Pro</h1>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-400 border border-blue-800/80">
                  Gemini 3.8 Flash
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                  Encrypted & Isolated
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                Authorized for {user?.fullName} ({user?.university}) · {documents.length} verified records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleExportChat}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Download conversation log"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={handleClear}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Clear chat history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Pro Modes Quick Selector Bar */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {proModes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = activeMode === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => {
                  setActiveMode(mode.id as any);
                  handleSend(mode.prompt);
                }}
                disabled={loading}
                className={`p-2 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-950/50 border-blue-500/50 text-white'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                <div className="truncate">
                  <div className="text-[11px] font-semibold text-slate-200 truncate">{mode.label}</div>
                  <div className="text-[9px] text-slate-500 truncate">{mode.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Message Container */}
      <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-3 sm:p-5 overflow-y-auto space-y-4 shadow-inner">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const referencedDocs = !isUser ? findReferencedDocs(msg.content) : [];

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 shadow-sm ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-950 border border-slate-800 text-blue-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-xl sm:max-w-2xl rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-2 shadow-sm ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {/* Content */}
                <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                  {msg.content}
                </div>

                {/* Interactive Clickable Document Badges in AI Responses */}
                {!isUser && referencedDocs.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-1.5">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <FileText className="w-3 h-3 text-blue-400" />
                      <span>Referenced Documents ({referencedDocs.length}):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {referencedDocs.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => setPreviewDoc(doc)}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-blue-500/30 hover:border-blue-400 rounded-lg text-[11px] text-blue-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3 h-3 text-blue-400" />
                          <span className="truncate max-w-[160px] sm:max-w-[200px]">{doc.name}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assistant Action Bar (Copy, Quick Links) */}
                {!isUser && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {setCurrentView && (
                        <>
                          <span>·</span>
                          <button
                            onClick={() => setCurrentView('locker')}
                            className="hover:text-blue-400 transition-colors"
                          >
                            Open Locker
                          </button>
                          <span>·</span>
                          <button
                            onClick={() => setCurrentView('expiry-alerts')}
                            className="hover:text-amber-400 transition-colors"
                          >
                            Expiry Alerts
                          </button>
                        </>
                      )}
                    </div>

                    <span className="font-mono text-slate-500">{msg.timestamp}</span>
                  </div>
                )}

                {isUser && (
                  <div className="text-[9px] font-mono text-blue-200 text-right">
                    {msg.timestamp}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 text-blue-400 flex items-center justify-center text-xs shrink-0 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-300 flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span>VaultAI Pro is evaluating student credentials & encrypted ledger...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider shrink-0">
          Quick Prompts:
        </span>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            disabled={loading}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-full whitespace-nowrap text-[11px] transition-colors shrink-0 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box with mobile touch target */}
      <div className="p-2 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center gap-2 shadow-lg">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask VaultAI about transcripts, missing certificates, or expiration dates..."
          className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="min-h-[40px] px-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium text-xs shadow-md shadow-blue-500/20"
          title="Send query"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </div>
    </div>
  );
};

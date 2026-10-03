import React, { useState } from 'react';
import { useLocker } from '../context/LockerContext';
import { Checklist, ChecklistItem } from '../types';
import {
  CheckSquare,
  Plus,
  Trash2,
  FileText,
  Link,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Award,
  ChevronDown,
  Download,
  Printer,
} from 'lucide-react';

export const ApplicationChecklistsView: React.FC = () => {
  const { checklists, documents, updateChecklist, createChecklist, deleteChecklist, setPreviewDoc } =
    useLocker();

  const [activeChecklistId, setActiveChecklistId] = useState<string>(
    checklists[0]?.id || ''
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<Checklist['type']>('scholarship');

  const activeChecklist =
    checklists.find((c) => c.id === activeChecklistId) || checklists[0];

  const presets: Record<Checklist['type'], string[]> = {
    scholarship: [
      'University Student ID Card',
      'Previous Semester Marks Transcript',
      'Income Certificate (Current FY)',
      'Bonafide Certificate from Registrar',
      'Bank Account Direct Deposit Details',
    ],
    internship: [
      'Signed Offer Letter',
      'Government Photo ID Proof',
      'Official University Transcripts',
      'Faculty Recommendation Letter',
      'Direct Deposit Information',
    ],
    placement: [
      'Master Comprehensive Resume (PDF)',
      'Undergraduate Consolidated Marks Memo',
      '10th & 12th Board Certificates',
      'Hackathon or Project Certifications',
      'Identity & Passport Proof',
    ],
    admission: [
      'Degree Completion Certificate',
      'Official Transcript of Records',
      'Statement of Purpose (SOP)',
      'Letters of Recommendation (LOR)',
      'Standardized Test Score Reports',
    ],
    examination: [
      'Exam Hall Ticket & Admit Card',
      'University Biometric ID Card',
      'Tuition Fee Payment Clearance Receipt',
      'Laboratory Attendance Bonafide',
    ],
    government: [
      'State Driving License / Passport',
      'Proof of Residence / Utility Statement',
      'Income / Caste Verification Certificate',
      'Affidavit / Attested Declaration',
    ],
    custom: [
      'Document Item 1',
      'Document Item 2',
      'Document Item 3',
    ],
  };

  const handleCreateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const templateItems = presets[newType].map((label, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      label,
      completed: false,
      required: true,
    }));

    const created = await createChecklist({
      title: newTitle.trim(),
      type: newType,
      items: templateItems,
    });

    setActiveChecklistId(created.id);
    setShowCreateModal(false);
    setNewTitle('');
  };

  const toggleItemCompleted = async (item: ChecklistItem) => {
    if (!activeChecklist) return;

    const updatedItems = activeChecklist.items.map((i) =>
      i.id === item.id ? { ...i, completed: !i.completed } : i
    );

    await updateChecklist(activeChecklist.id, { items: updatedItems });
  };

  const linkDocumentToItem = async (itemId: string, docId: string) => {
    if (!activeChecklist) return;

    const updatedItems = activeChecklist.items.map((i) =>
      i.id === itemId
        ? {
            ...i,
            linkedDocumentId: docId || undefined,
            completed: docId ? true : i.completed,
          }
        : i
    );

    await updateChecklist(activeChecklist.id, { items: updatedItems });
  };

  const handleAddNewItem = async (label: string) => {
    if (!activeChecklist || !label.trim()) return;

    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      label: label.trim(),
      completed: false,
      required: true,
    };

    await updateChecklist(activeChecklist.id, {
      items: [...activeChecklist.items, newItem],
    });
  };

  const [newItemText, setNewItemText] = useState('');

  const handleExportDossier = () => {
    if (!activeChecklist) return;

    let content = `UNIVAULT VERIFIED APPLICATION DOSSIER REPORT\n`;
    content += `=======================================================\n`;
    content += `Package: ${activeChecklist.title}\n`;
    content += `Category: ${activeChecklist.type.toUpperCase()}\n`;
    content += `Generated Date: ${new Date().toLocaleString()}\n`;
    const completedCount = activeChecklist.items.filter((i) => i.completed).length;
    const pct = Math.round((completedCount / activeChecklist.items.length) * 100);
    content += `Completion Readiness: ${pct}% (${completedCount}/${activeChecklist.items.length} items ready)\n\n`;
    content += `ITEMIZED DOCUMENT VERIFICATION AUDIT:\n`;
    content += `-------------------------------------------------------\n`;

    activeChecklist.items.forEach((item, idx) => {
      const linked = documents.find((d) => d.id === item.linkedDocumentId);
      content += `${idx + 1}. [${item.completed ? 'READY / VERIFIED' : 'PENDING'}] ${item.label}\n`;
      if (linked) {
        content += `   -> Linked Vault Record: ${linked.name} (${linked.category})\n`;
        content += `   -> Expiry Status: ${linked.expiryDate || 'No Expiration / Permanent'}\n`;
      }
    });

    content += `\n-------------------------------------------------------\n`;
    content += `Cryptographically signed and stamped by Privora Digital Student Locker.\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `Privora_Dossier_${activeChecklist.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Application Checklists</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            "What Do I Need?" intelligent requirement checklists linked to your locker
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Application Checklist</span>
        </button>
      </div>

      {/* Checklist Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {checklists.map((cl) => {
          const completedCount = cl.items.filter((i) => i.completed).length;
          const pct = Math.round((completedCount / (cl.items.length || 1)) * 100);
          const isSelected = activeChecklist?.id === cl.id;

          return (
            <button
              key={cl.id}
              onClick={() => setActiveChecklistId(cl.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-3 border ${
                isSelected
                  ? 'bg-blue-600/10 border-blue-500/40 text-blue-300 font-semibold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{cl.title}</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                  pct === 100
                    ? 'bg-emerald-950 text-emerald-400'
                    : isSelected
                    ? 'bg-blue-900/60 text-blue-200'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {pct}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Checklist Details Container */}
      {activeChecklist ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Header & Progress */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-blue-400">
                {activeChecklist.type} Checklist
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {activeChecklist.title}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs font-semibold text-white">
                  {activeChecklist.items.filter((i) => i.completed).length} of{' '}
                  {activeChecklist.items.length} Ready
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {Math.round(
                    (activeChecklist.items.filter((i) => i.completed).length /
                      (activeChecklist.items.length || 1)) *
                      100
                  )}
                  % Completed
                </div>
              </div>

              <button
                onClick={handleExportDossier}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                title="Download Verified Dossier Summary"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export Dossier</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm(`Delete checklist "${activeChecklist.title}"?`)) {
                    deleteChecklist(activeChecklist.id);
                  }
                }}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                title="Delete Checklist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${
                  (activeChecklist.items.filter((i) => i.completed).length /
                    (activeChecklist.items.length || 1)) *
                  100
                }%`,
              }}
            />
          </div>

          {/* Checklist Items list */}
          <div className="space-y-3">
            {activeChecklist.items.map((item) => {
              const linkedDoc = documents.find((d) => d.id === item.linkedDocumentId);

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                    item.completed
                      ? 'bg-slate-950/50 border-slate-800'
                      : 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleItemCompleted(item)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                        item.completed
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'border-slate-700 hover:border-blue-400'
                      }`}
                    >
                      {item.completed && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div>
                      <span
                        className={`font-medium ${
                          item.completed ? 'text-slate-400 line-through' : 'text-slate-200'
                        }`}
                      >
                        {item.label}
                      </span>
                      {linkedDoc && (
                        <div
                          onClick={() => setPreviewDoc(linkedDoc)}
                          className="flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer mt-0.5"
                        >
                          <FileText className="w-3 h-3" />
                          <span className="truncate max-w-xs">{linkedDoc.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Link Document Dropdown */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <select
                      value={item.linkedDocumentId || ''}
                      onChange={(e) => linkDocumentToItem(item.id, e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 text-[11px] focus:outline-none max-w-[200px] truncate"
                    >
                      <option value="">-- Link Document --</option>
                      {documents.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.category})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add custom item form */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddNewItem(newItemText);
                  setNewItemText('');
                }
              }}
              placeholder="Add additional required document (e.g., Parent Signature Affadavit)..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => {
                handleAddNewItem(newItemText);
                setNewItemText('');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Add Item
            </button>
          </div>
        </div>
      ) : null}

      {/* Modal: New Checklist Creator */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Create Application Checklist</h3>

            <form onSubmit={handleCreateChecklist} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Checklist Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Master's University Admission Package"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Application Type Preset</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="scholarship">Scholarship Application</option>
                  <option value="internship">Internship Onboarding</option>
                  <option value="placement">Campus Placement Drive</option>
                  <option value="admission">College / Graduate Admission</option>
                  <option value="examination">Semester Examination</option>
                  <option value="government">Government Program / Grant</option>
                  <option value="custom">Custom Application</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                >
                  Generate Checklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

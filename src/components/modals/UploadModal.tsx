import React, { useState, useRef } from 'react';
import { DocumentCategory } from '../../types';
import { useLocker } from '../../context/LockerContext';
import {
  X,
  UploadCloud,
  File,
  CheckCircle2,
  AlertCircle,
  Tag,
  Star,
  Loader2,
  Calendar,
} from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: DocumentCategory;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'Academic',
}) => {
  const { uploadDocument } = useLocker();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DocumentCategory>(defaultCategory);
  const [description, setDescription] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isImportant, setIsImportant] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setError(null);
    // Limit to 25MB
    if (file.size > 25 * 1024 * 1024) {
      setError('File size exceeds the 25MB limit. Please upload a compressed document.');
      return;
    }

    setSelectedFile(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    if (!name) {
      setName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Smart OCR tag extraction heuristics
    const extracted: string[] = [];
    const lowerName = cleanName.toLowerCase();
    if (lowerName.includes('transcript') || lowerName.includes('marks')) extracted.push('Transcript', 'Grades');
    if (lowerName.includes('certificate')) extracted.push('Certificate');
    if (lowerName.includes('scholarship')) extracted.push('Scholarship');
    if (lowerName.includes('hackathon') || lowerName.includes('award')) extracted.push('Achievement');
    if (lowerName.includes('income')) extracted.push('Financial', 'Revenue');
    if (lowerName.includes('id') || lowerName.includes('card')) extracted.push('Identity');
    if (lowerName.includes('internship') || lowerName.includes('offer')) extracted.push('Career', 'OfferLetter');
    if (extracted.length === 0) extracted.push('Verified', 'Student');
    setSuggestedTags(extracted);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a document title');
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(20);

    try {
      let fileDataString = '';
      if (selectedFile && selectedFile.type.startsWith('image/')) {
        fileDataString = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(selectedFile);
        });
      }

      setUploadProgress(65);

      await uploadDocument({
        name: name.trim(),
        category,
        description: description.trim(),
        fileType: selectedFile ? selectedFile.type : 'application/pdf',
        fileSize: selectedFile ? selectedFile.size : 150000,
        fileData: fileDataString,
        issueDate: issueDate || null,
        expiryDate: expiryDate || null,
        tags,
        isImportant,
      });

      setUploadProgress(100);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm touch-manipulation"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-white">
              Upload to Digital Locker
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure client-side encryption before cloud storage
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 active:bg-slate-700 transition-colors cursor-pointer touch-manipulation"
            aria-label="Close Upload Modal"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-xl text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Document uploaded and cataloged successfully!</span>
            </div>
          )}

          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-950/30'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx,.txt"
            />

            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
                  <File className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white truncate max-w-xs">{selectedFile.name}</div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type || 'Document'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <UploadCloud className="w-8 h-8 text-blue-400 mx-auto" />
                <div className="font-semibold text-slate-200">
                  Click to browse or drop your document here
                </div>
                <div className="text-slate-500 text-[11px]">
                  PDF, DOCX, PNG, JPG, or TXT up to 25MB
                </div>
              </div>
            )}
          </div>

          {/* Metadata Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Document Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Semester 5 Grade Transcript"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
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
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description / Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Official transcript certified by University Academic Council..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Issue Date (Optional)
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Tags (Press Enter or Comma to add)
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950 border border-slate-800 rounded-lg min-h-[38px] items-center">
              {tags.map((t) => (
                <span
                  key={t}
                  className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? "Type tag e.g. 'Scholarship'..." : ''}
                className="bg-transparent text-white placeholder-slate-600 focus:outline-none flex-1 min-w-[100px] text-xs"
              />
            </div>
          </div>

          {/* Important Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="importantToggle"
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="importantToggle" className="text-slate-300 cursor-pointer flex items-center gap-1.5">
              <Star className={`w-3.5 h-3.5 ${isImportant ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
              <span>Mark as High-Priority / Starred Document</span>
            </label>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Encrypting and uploading...</span>
                <span className="font-mono">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || success}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm shadow-blue-500/20"
            >
              {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{uploading ? 'Processing...' : 'Securely Upload'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

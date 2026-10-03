import React, { useState } from 'react';
import { useLocker } from '../context/LockerContext';
import { DocumentCategory, DocumentItem } from '../types';
import {
  FolderLock,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  FileText,
  Share2,
  Edit3,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Star,
  GraduationCap,
  Award,
  Briefcase,
  DollarSign,
  User,
  MoreVertical,
} from 'lucide-react';

interface LockerViewProps {
  onOpenUpload: () => void;
}

export const LockerView: React.FC<LockerViewProps> = ({ onOpenUpload }) => {
  const {
    documents,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    setPreviewDoc,
    setShareDoc,
    setEditDoc,
    deleteDocument,
  } = useLocker();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeSort, setActiveSort] = useState<'date' | 'name' | 'expiry' | 'size'>('date');
  const [filterStarredOnly, setFilterStarredOnly] = useState(false);

  const categories: Array<{ id: DocumentCategory | 'All'; label: string; icon: any }> = [
    { id: 'All', label: 'All Documents', icon: FolderLock },
    { id: 'Academic', label: 'Academic', icon: GraduationCap },
    { id: 'Identity', label: 'Identity', icon: User },
    { id: 'Achievements', label: 'Achievements', icon: Award },
    { id: 'Career', label: 'Career', icon: Briefcase },
    { id: 'Financial', label: 'Financial', icon: DollarSign },
    { id: 'Personal', label: 'Personal', icon: User },
    { id: 'Other', label: 'Other', icon: FileText },
  ];

  // Filtering & Sorting
  const filteredDocs = documents
    .filter((doc) => {
      if (selectedCategory !== 'All' && doc.category !== selectedCategory) return false;
      if (filterStarredOnly && !doc.isImportant) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = doc.name.toLowerCase().includes(q);
        const matchCat = doc.category.toLowerCase().includes(q);
        const matchDesc = doc.description?.toLowerCase().includes(q);
        const matchTags = doc.tags?.some((t) => t.toLowerCase().includes(q));
        return matchName || matchCat || matchDesc || matchTags;
      }
      return true;
    })
    .sort((a, b) => {
      if (activeSort === 'name') return a.name.localeCompare(b.name);
      if (activeSort === 'size') return b.fileSize - a.fileSize;
      if (activeSort === 'expiry') {
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      }
      // default: date desc
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const getDocStatus = (doc: DocumentItem) => {
    if (!doc.expiryDate) return { text: 'No Expiry', color: 'text-slate-500' };
    const diffDays = Math.round(
      (new Date(doc.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24)
    );
    if (diffDays < 0) return { text: 'Expired', color: 'text-red-400 font-semibold' };
    if (diffDays <= 30) return { text: `${diffDays}d left`, color: 'text-amber-400 font-semibold' };
    return { text: doc.expiryDate, color: 'text-slate-400 font-mono' };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>My Locker</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organized student repository with client-isolated access control
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Category Horizontal Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const count =
            cat.id === 'All'
              ? documents.length
              : documents.filter((d) => d.category === cat.id).length;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded ${
                  isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Search input */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter within locker..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Sort & View Switches */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setFilterStarredOnly(!filterStarredOnly)}
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
              filterStarredOnly
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filterStarredOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Starred</span>
          </button>

          <select
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none text-xs"
          >
            <option value="date">Newest First</option>
            <option value="name">Name (A-Z)</option>
            <option value="expiry">Expiration Date</option>
            <option value="size">File Size</option>
          </select>

          <div className="flex items-center border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 ${viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Documents Display */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 border border-dashed border-slate-800 rounded-2xl text-center space-y-3 bg-slate-900/20">
          <FolderLock className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No documents found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `No documents matched "${searchQuery}". Try adjusting your search query or category filter.`
              : 'Your locker is empty in this category. Upload your first document to get started.'}
          </p>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm shadow-blue-500/20"
          >
            + Upload Document
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const status = getDocStatus(doc);

            return (
              <div
                key={doc.id}
                onClick={() => setPreviewDoc(doc)}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group flex flex-col justify-between hover:shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-blue-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <h3 className="font-semibold text-xs text-slate-200 group-hover:text-white truncate">
                          {doc.name}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{doc.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{(doc.fileSize / 1024).toFixed(0)} KB</span>
                        </div>
                      </div>
                    </div>

                    {doc.isImportant && (
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                    )}
                  </div>

                  {doc.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-2.5 leading-relaxed">
                      {doc.description}
                    </p>
                  )}

                  {/* Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {doc.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer status & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                  <span className={`text-[10px] ${status.color}`}>
                    {status.text}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShareDoc(doc);
                      }}
                      className="p-1 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-800 transition-colors"
                      title="Share link"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditDoc(doc);
                      }}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                      title="Edit metadata"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Move "${doc.name}" to Recycle Bin?`)) {
                          deleteDocument(doc.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-red-950/30 transition-colors"
                      title="Move to Recycle Bin"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="border border-slate-800 rounded-xl overflow-x-auto bg-slate-900/60">
          <table className="w-full text-left text-xs min-w-[560px]">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Document</th>
                <th className="py-3 px-4 hidden sm:table-cell">Category</th>
                <th className="py-3 px-4 hidden md:table-cell">Size</th>
                <th className="py-3 px-4 hidden lg:table-cell">Uploaded</th>
                <th className="py-3 px-4">Expiry</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDocs.map((doc) => {
                const status = getDocStatus(doc);

                return (
                  <tr
                    key={doc.id}
                    onClick={() => setPreviewDoc(doc)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5 truncate max-w-xs sm:max-w-md">
                        <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="font-semibold text-white truncate">{doc.name}</span>
                        {doc.isImportant && (
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 hidden sm:table-cell">
                      {doc.category}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono tabular-nums hidden md:table-cell">
                      {(doc.fileSize / 1024).toFixed(0)} KB
                    </td>
                    <td className="py-3 px-4 text-slate-400 hidden lg:table-cell">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className={`py-3 px-4 ${status.color}`}>
                      {status.text}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setShareDoc(doc)}
                          className="p-1 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-800 transition-colors"
                          title="Share"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditDoc(doc)}
                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Move "${doc.name}" to Recycle Bin?`)) {
                              deleteDocument(doc.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-red-950/30 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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

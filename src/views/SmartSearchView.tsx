import React, { useState } from 'react';
import { useLocker } from '../context/LockerContext';
import { Search, Filter, FileText, Calendar, Tag, AlertCircle, Share2 } from 'lucide-react';
import { DocumentCategory } from '../types';

export const SmartSearchView: React.FC = () => {
  const { documents, setPreviewDoc, setShareDoc } = useLocker();

  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState<DocumentCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'expiring' | 'expired'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = Array.from(
    new Set(documents.flatMap((d) => d.tags || []))
  );

  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 3600 * 1000;

  const results = documents.filter((doc) => {
    // category filter
    if (catFilter !== 'All' && doc.category !== catFilter) return false;

    // tag filter
    if (selectedTag && !doc.tags.includes(selectedTag)) return false;

    // status filter
    if (statusFilter === 'expiring') {
      if (!doc.expiryDate) return false;
      const exp = new Date(doc.expiryDate).getTime();
      if (exp < now || exp > now + thirtyDaysMs) return false;
    } else if (statusFilter === 'expired') {
      if (!doc.expiryDate) return false;
      if (new Date(doc.expiryDate).getTime() >= now) return false;
    }

    // query match
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchName = doc.name.toLowerCase().includes(q);
      const matchCategory = doc.category.toLowerCase().includes(q);
      const matchDesc = doc.description?.toLowerCase().includes(q);
      const matchTags = doc.tags?.some((t) => t.toLowerCase().includes(q));
      return matchName || matchCategory || matchDesc || matchTags;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Smart Search</h1>
        <p className="text-xs text-slate-400 mt-1">
          Universal multi-field indexed query across your student credentials
        </p>
      </div>

      {/* Main Search Bar */}
      <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, tag, semester, organization, or category..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner"
            autoFocus
          />
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 text-[11px] font-medium">Category:</span>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Academic">Academic</option>
              <option value="Identity">Identity</option>
              <option value="Achievements">Achievements</option>
              <option value="Career">Career</option>
              <option value="Financial">Financial</option>
              <option value="Personal">Personal</option>
              <option value="Other">Other</option>
            </select>

            <span className="text-slate-400 text-[11px] font-medium ml-2">Expiry:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="expiring">Expiring Soon (30d)</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Quick Clear */}
          {(query || catFilter !== 'All' || statusFilter !== 'all' || selectedTag) && (
            <button
              onClick={() => {
                setQuery('');
                setCatFilter('All');
                setStatusFilter('all');
                setSelectedTag(null);
              }}
              className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Popular Tags cloud */}
        {allTags.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-semibold text-slate-500 mr-1">
              Indexed Tags:
            </span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  selectedTag === tag
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Search Prompts */}
      {!query && results.length === documents.length && (
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
          <span className="text-[11px] text-slate-500">Suggestions:</span>
          {['transcript', 'scholarship', 'hackathon', 'income', 'internship'].map((sug) => (
            <button
              key={sug}
              onClick={() => setQuery(sug)}
              className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              "{sug}"
            </button>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Found <strong className="text-white font-mono">{results.length}</strong> matching record{results.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Results Grid */}
      {results.length === 0 ? (
        <div className="p-12 border border-dashed border-slate-800 rounded-2xl text-center space-y-2 bg-slate-900/20">
          <Search className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No records matched your search</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try searching for broader keywords like "transcript", "award", or clear active tag filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setPreviewDoc(doc)}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-blue-400 shrink-0">
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
                </div>

                {doc.description && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {doc.description}
                  </p>
                )}

                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {doc.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-mono text-[10px]">
                  {doc.expiryDate ? `Exp: ${doc.expiryDate}` : 'No Expiry'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShareDoc(doc);
                  }}
                  className="p-1 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-800"
                  title="Share"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { useLocker } from '../context/LockerContext';
import { Trash2, RotateCcw, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export const RecycleBinView: React.FC = () => {
  const { recycleBin, restoreDocument, permanentDelete } = useLocker();

  const handleRestore = async (id: string, name: string) => {
    await restoreDocument(id);
  };

  const handlePermanentDelete = async (id: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to PERMANENTLY destroy "${name}"?\nThis action cannot be reversed.`
      )
    ) {
      await permanentDelete(id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Recycle Bin</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Two-phase soft deletion recovery buffer. Documents can be restored or shredded permanently.
        </p>
      </div>

      {recycleBin.length === 0 ? (
        <div className="p-16 border border-dashed border-slate-800 rounded-2xl text-center space-y-3 bg-slate-900/20">
          <Trash2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">Recycle Bin is empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Accidentally removed documents will appear here before permanent shredding.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                {recycleBin.length} document{recycleBin.length !== 1 ? 's' : ''} currently in
                staged recovery.
              </span>
            </div>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Original Category</th>
                  <th className="py-3 px-4 hidden md:table-cell">Size</th>
                  <th className="py-3 px-4">Moved to Bin</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recycleBin.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="font-semibold text-white truncate max-w-xs sm:max-w-md">
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 hidden sm:table-cell">
                      {doc.category}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono tabular-nums hidden md:table-cell">
                      {(doc.fileSize / 1024).toFixed(0)} KB
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {doc.deletedAt
                        ? new Date(doc.deletedAt).toLocaleDateString()
                        : 'Recently'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(doc.id, doc.name)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(doc.id, doc.name)}
                          className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-red-950/30 transition-colors"
                          title="Permanently Shred Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

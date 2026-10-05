import React, { useState } from 'react';
import { StoredScanRecord } from '../types/privacy';
import {
  Trash2,
  Eye,
  RotateCw,
  Search,
  ShieldCheck,
  FileText,
  X,
} from 'lucide-react';

interface HistoryPageProps {
  history: StoredScanRecord[];
  onDeleteRecord: (scanId: string) => void;
  onClearHistory: () => void;
  onRescanRecord: (record: StoredScanRecord) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  history,
  onDeleteRecord,
  onClearHistory,
  onRescanRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedRecord, setSelectedRecord] =
    useState<StoredScanRecord | null>(null);

  const filteredHistory = history.filter((item) => {
    const matchesStatus =
      statusFilter === 'ALL' || item.overallStatus === statusFilter;
    const matchesQuery =
      !searchQuery.trim() ||
      item.scanId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.safePrompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoriesDetected.some((c) =>
        c.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      item.entityLabelsDetected.some((l) =>
        l.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesStatus && matchesQuery;
  });

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString([], {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Zero-Trust Scan History
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Stored locally in browser storage. Raw sensitive payloads are never
            persisted—only timestamps, risk scores, detected categories, and
            sanitized prompts.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-4 py-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge All History</span>
          </button>
        )}
      </div>

      {/* Search & Status Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Scan ID, category, or sanitized text…"
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {['ALL', 'BLOCKED', 'SANITIZED', 'ALLOWED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-xl">
        {filteredHistory.length === 0 ? (
          <div className="py-14 text-center">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-300 font-medium">
              No matching scan history records
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Run a scan in the Prompt Scanner or adjust your search filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                  <th className="py-3 pr-4">Scan ID</th>
                  <th className="py-3 px-3">Date &amp; Time</th>
                  <th className="py-3 px-3 text-right">Risk Score</th>
                  <th className="py-3 px-4">Detected Categories</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 pl-3 text-right">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {filteredHistory.map((item) => {
                  const statusColor =
                    item.overallStatus === 'BLOCKED'
                      ? 'text-red-400'
                      : item.overallStatus === 'SANITIZED'
                      ? 'text-amber-400'
                      : 'text-emerald-400';

                  const scoreColor =
                    item.riskScore >= 80
                      ? 'text-red-400'
                      : item.riskScore >= 60
                      ? 'text-orange-400'
                      : item.riskScore >= 30
                      ? 'text-amber-400'
                      : 'text-emerald-400';

                  return (
                    <tr
                      key={item.scanId}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3.5 pr-4 font-mono font-semibold text-slate-200 whitespace-nowrap">
                        {item.scanId}
                      </td>
                      <td className="py-3.5 px-3 font-mono tabular-nums text-slate-400 whitespace-nowrap">
                        {formatDateTime(item.timestamp)}
                      </td>
                      <td
                        className={`py-3.5 px-3 font-mono font-bold tabular-nums text-right ${scoreColor}`}
                      >
                        {item.riskScore}/100
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs">
                        {item.categoriesDetected.length > 0 ? (
                          <span>{item.categoriesDetected.join(' · ')}</span>
                        ) : (
                          <span className="text-slate-500">
                            No sensitive categories
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                        {item.recommendedActionSummary}
                      </td>
                      <td
                        className={`py-3.5 px-3 font-mono font-semibold whitespace-nowrap ${statusColor}`}
                      >
                        {item.overallStatus}
                      </td>
                      <td className="py-3.5 pl-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setSelectedRecord(item)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-medium flex items-center gap-1 transition-colors cursor-pointer"
                            title="View Sanitized Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => onRescanRecord(item)}
                            className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-md font-medium flex items-center gap-1 transition-colors cursor-pointer"
                            title="Load Sanitized Prompt into Scanner"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>Rescan</span>
                          </button>

                          <button
                            onClick={() => {
                              if (selectedRecord?.scanId === item.scanId) {
                                setSelectedRecord(null);
                              }
                              onDeleteRecord(item.scanId);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-md transition-colors cursor-pointer"
                            title="Delete Record"
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

      {/* Inspection Modal / Drawer for Selected History Record */}
      {selectedRecord && (
        <div className="p-6 bg-slate-900 border border-indigo-500/40 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <div>
                <h2 className="text-base font-bold text-slate-100">
                  Sanitized Audit Record · {selectedRecord.scanId}
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  {formatDateTime(selectedRecord.timestamp)} · Risk Score:{' '}
                  {selectedRecord.riskScore}/100 ({selectedRecord.riskLevel}) ·
                  Status: {selectedRecord.overallStatus}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedRecord(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="font-mono text-slate-400 uppercase">
                Explanation &amp; Policy Decision
              </div>
              <p className="text-slate-200 leading-relaxed">
                {selectedRecord.explanationSummary}
              </p>
              <div className="pt-2 text-slate-400">
                <span className="font-semibold text-slate-300">
                  Detected Entities:{' '}
                </span>
                {selectedRecord.entityLabelsDetected.length > 0
                  ? selectedRecord.entityLabelsDetected.join(', ')
                  : 'None'}
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-emerald-500/30 rounded-lg space-y-2">
              <div className="font-mono text-emerald-400 uppercase">
                Stored Sanitized Version (Raw PII Stripped)
              </div>
              <p className="font-mono text-emerald-100 leading-relaxed whitespace-pre-wrap">
                {selectedRecord.safePrompt}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

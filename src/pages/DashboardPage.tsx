import React from 'react';
import {
  NavigationTab,
  ScanResult,
  StoredScanRecord,
} from '../types/privacy';
import { RiskMeter } from '../components/RiskMeter';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Lock,
  Activity,
  ArrowRight,
  Rocket,
  FileText,
  Sliders,
} from 'lucide-react';

interface DashboardPageProps {
  scanHistory: StoredScanRecord[];
  latestScan: ScanResult | null;
  onNavigate: (tab: NavigationTab) => void;
  onTriggerHackathonDemo: () => void;
  onSelectHistoryItem: (record: StoredScanRecord) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  scanHistory,
  latestScan,
  onNavigate,
  onTriggerHackathonDemo,
  onSelectHistoryItem,
}) => {
  const totalScans = scanHistory.length;
  const totalThreatsDetected = scanHistory.reduce((acc, item) => {
    const counts = Object.values(item.entityCounts || {});
    const sum = counts.reduce((a, b) => a + b, 0);
    return acc + (sum > 0 ? sum : item.entityLabelsDetected.length);
  }, 0);

  const highRiskPrompts = scanHistory.filter(
    (s) => s.riskScore >= 60
  ).length;

  const dataProtectedCount = scanHistory.filter(
    (s) => s.overallStatus === 'BLOCKED' || s.overallStatus === 'SANITIZED'
  ).length;

  const currentOverviewScore = latestScan
    ? latestScan.riskScore
    : scanHistory.length > 0
    ? scanHistory[0].riskScore
    : 0;

  const averageRiskScore =
    scanHistory.length > 0
      ? Math.round(
          scanHistory.reduce((acc, s) => acc + s.riskScore, 0) /
            scanHistory.length
        )
      : 0;

  const formatTime = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Privacy Firewall Overview
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Your Privacy Firewall Before AI — Real-time prompt risk telemetry
            and policy enforcement
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onTriggerHackathonDemo}
            className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Rocket className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hackathon Demo Mode</span>
          </button>
          <button
            onClick={() => onNavigate('scanner')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Open Prompt Scanner</span>
          </button>
        </div>
      </div>

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Scans</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 text-3xl font-bold font-mono tabular-nums text-slate-100">
            {totalScans}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            <span>Local pre-LLM inspections</span>
            <span aria-hidden="true"> · </span>
            <span className="text-emerald-400">100% client-side</span>
          </div>
        </div>

        <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Threats Detected</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 text-3xl font-bold font-mono tabular-nums text-amber-400">
            {totalThreatsDetected}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            <span>PII, credentials &amp; secrets flagged</span>
          </div>
        </div>

        <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>High Risk Prompts</span>
            <Lock className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-3 text-3xl font-bold font-mono tabular-nums text-red-400">
            {highRiskPrompts}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            <span>Score ≥ 60/100</span>
            <span aria-hidden="true"> · </span>
            <span>Avg score: {averageRiskScore}/100</span>
          </div>
        </div>

        <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Data Protected</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-bold font-mono tabular-nums text-emerald-400">
            {dataProtectedCount}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            <span>Prompts sanitized or blocked</span>
          </div>
        </div>
      </div>

      {/* Main Split Section: Privacy Risk Overview + Recent Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Privacy Risk Overview (Left 4 cols) */}
        <div className="lg:col-span-4 p-6 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-slate-100">
                  Privacy Risk Overview
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Latest inspected prompt exposure index
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {latestScan
                  ? latestScan.scanId
                  : scanHistory[0]?.scanId || 'IDLE'}
              </span>
            </div>

            <div className="py-2">
              <RiskMeter
                score={currentOverviewScore}
                size="lg"
                showScaleLegend={true}
              />
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-3">
            <div className="text-xs text-slate-300 leading-relaxed">
              {latestScan
                ? latestScan.explanationSummary
                : scanHistory[0]?.explanationSummary ||
                  'Run a prompt scan to evaluate privacy exposure.'}
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => onNavigate('policies')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Adjust Policy Thresholds</span>
              </button>
              <button
                onClick={() => onNavigate('scanner')}
                className="text-xs text-slate-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Inspect in Scanner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Scans Table (Right 8 cols) */}
        <div className="lg:col-span-8 p-6 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-slate-100">
                  Recent Scans
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Zero-trust inspection log (raw sensitive payloads excluded)
                </p>
              </div>
              <button
                onClick={() => onNavigate('history')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>View Full History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {scanHistory.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-800 rounded-lg">
                <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-300 font-medium">
                  No recent scans recorded yet
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Scan a prompt or trigger Hackathon Demo Mode to populate
                  telemetry.
                </p>
                <button
                  onClick={onTriggerHackathonDemo}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Run Demo Scan
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                      <th className="py-2.5 pr-4">Prompt ID</th>
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3 text-right">Risk Score</th>
                      <th className="py-2.5 px-4">Sensitive Data</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 pl-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {scanHistory.slice(0, 6).map((item) => {
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
                          onClick={() => onSelectHistoryItem(item)}
                          className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 pr-4 font-mono font-medium text-slate-200 group-hover:text-indigo-300">
                            {item.scanId}
                          </td>
                          <td className="py-3 px-3 font-mono tabular-nums text-slate-400">
                            {formatTime(item.timestamp)}
                          </td>
                          <td
                            className={`py-3 px-3 font-mono font-semibold tabular-nums text-right ${scoreColor}`}
                          >
                            {item.riskScore}/100
                          </td>
                          <td className="py-3 px-4 text-slate-300 max-w-[220px] truncate">
                            {item.entityLabelsDetected.length > 0
                              ? item.entityLabelsDetected.join(', ')
                              : 'None'}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-300">
                            {item.recommendedActionSummary}
                          </td>
                          <td
                            className={`py-3 pl-3 font-mono font-semibold text-right ${statusColor}`}
                          >
                            {item.overallStatus}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>
              Click any scan row to inspect its sanitized prompt in the scanner
            </span>
            <span className="font-mono">
              RETENTION: SANITIZED METADATA ONLY
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

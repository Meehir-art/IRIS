import React from 'react';
import { StoredScanRecord } from '../types/privacy';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  Activity,
  ShieldAlert,
  Lock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface AnalyticsPageProps {
  history: StoredScanRecord[];
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ history }) => {
  const totalScans = history.length;
  const highRiskScans = history.filter((s) => s.riskScore >= 60).length;
  const blockedPrompts = history.filter(
    (s) => s.overallStatus === 'BLOCKED'
  ).length;
  const sanitizedPrompts = history.filter(
    (s) => s.overallStatus === 'SANITIZED'
  ).length;
  const allowedPrompts = history.filter(
    (s) => s.overallStatus === 'ALLOWED'
  ).length;

  // 1. Risk Distribution Data
  const riskDistributionData = [
    {
      name: 'Low (0–29)',
      count: history.filter((s) => s.riskScore < 30).length,
      fill: '#10b981',
    },
    {
      name: 'Medium (30–59)',
      count: history.filter((s) => s.riskScore >= 30 && s.riskScore < 60)
        .length,
      fill: '#eab308',
    },
    {
      name: 'High (60–79)',
      count: history.filter((s) => s.riskScore >= 60 && s.riskScore < 80)
        .length,
      fill: '#f97316',
    },
    {
      name: 'Critical (80–100)',
      count: history.filter((s) => s.riskScore >= 80).length,
      fill: '#ef4444',
    },
  ];

  // 2. Sensitive Data Categories Breakdown
  const categoryCountMap = new Map<string, number>();
  history.forEach((record) => {
    record.categoriesDetected.forEach((cat) => {
      categoryCountMap.set(cat, (categoryCountMap.get(cat) || 0) + 1);
    });
  });

  const categoryChartData = Array.from(categoryCountMap.entries())
    .map(([name, value]) => ({
      name: name.replace('Information', 'Info').replace('Personally Identifiable Info', 'PII'),
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const PIE_COLORS = [
    '#6366f1',
    '#ef4444',
    '#f59e0b',
    '#10b981',
    '#ec4899',
    '#8b5cf6',
    '#06b6d4',
  ];

  // 3. Actions & Risk Trend Over Scans (Chronological)
  const chronologicalScans = [...history].reverse().map((item, idx) => ({
    scan: item.scanId,
    index: idx + 1,
    riskScore: item.riskScore,
    blocked: item.overallStatus === 'BLOCKED' ? 1 : 0,
    sanitized: item.overallStatus === 'SANITIZED' ? 1 : 0,
    allowed: item.overallStatus === 'ALLOWED' ? 1 : 0,
  }));

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-slate-100">
          Privacy Firewall Analytics
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Quantitative breakdown of prompt exposure levels, detected data
          categories, and enforcement actions.
        </p>
      </div>

      {/* 5 Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Scans</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-100">
            {totalScans}
          </div>
        </div>

        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>High-Risk Scans</span>
            <ShieldAlert className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-orange-400">
            {highRiskScans}
          </div>
        </div>

        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Blocked Prompts</span>
            <Lock className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-red-400">
            {blockedPrompts}
          </div>
        </div>

        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Sanitized Prompts</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-amber-400">
            {sanitizedPrompts}
          </div>
        </div>

        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Allowed Prompts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-400">
            {allowedPrompts}
          </div>
        </div>
      </div>

      {/* Charts Row 1: Risk Distribution + Sensitive Data Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Bar Chart */}
        <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-xl space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Risk Score Distribution
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Prompts segmented by privacy severity tier (Low, Medium, High,
              Critical)
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={riskDistributionData}
                margin={{ top: 10, right: 16, left: -16, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  allowDecimals={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f1f5f9',
                  }}
                />
                <Bar dataKey="count" name="Prompts" radius={[6, 6, 0, 0]}>
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sensitive Data Categories Breakdown */}
        <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-xl space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Sensitive Data Categories Detected
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Frequency of triggered data classification domains across scans
            </p>
          </div>

          {categoryChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">
              No sensitive categories recorded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center h-64">
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={78}
                      paddingAngle={3}
                    >
                      {categoryChartData.map((_, idx) => (
                        <Cell
                          key={`pie-${idx}`}
                          fill={PIE_COLORS[idx % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#f1f5f9',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 text-xs overflow-y-auto max-h-56 pr-2">
                {categoryChartData.map((item, idx) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between py-1 border-b border-slate-800/60"
                  >
                    <span className="flex items-center gap-2 text-slate-300 truncate pr-2">
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{
                          backgroundColor:
                            PIE_COLORS[idx % PIE_COLORS.length],
                        }}
                      />
                      <span className="truncate">{item.name}</span>
                    </span>
                    <span className="font-mono font-semibold tabular-nums text-slate-100">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart Row 2: Actions & Risk Score Trajectory Over Time */}
      <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Actions &amp; Risk Exposure Over Time
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological trajectory of prompt risk scores across firewall
              inspections
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            THRESHOLD: ≥80 CRITICAL BLOCK
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chronologicalScans}
              margin={{ top: 10, right: 16, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <XAxis
                dataKey="scan"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#f1f5f9',
                }}
              />
              <Area
                type="monotone"
                dataKey="riskScore"
                name="Risk Score"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#riskGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

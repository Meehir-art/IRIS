import React, { useState } from 'react';
import {
  EntityType,
  PolicyAction,
  PolicyLevel,
  PolicyRule,
} from '../types/privacy';
import {
  Sliders,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Check,
} from 'lucide-react';

interface PoliciesPageProps {
  policies: PolicyRule[];
  onUpdatePolicy: (
    entityType: EntityType,
    updates: Partial<PolicyRule>
  ) => void;
  onResetPolicies: () => void;
  onApplyPreset: (preset: 'strict' | 'balanced' | 'audit') => void;
}

const AVAILABLE_ACTIONS: PolicyAction[] = [
  'Allow',
  'Warn',
  'Mask',
  'Redact',
  'Anonymize',
  'Tokenize',
  'Block',
];

const AVAILABLE_LEVELS: PolicyLevel[] = [
  'Strict',
  'Protect',
  'Normal',
  'Permissive',
];

export const PoliciesPage: React.FC<PoliciesPageProps> = ({
  policies,
  onUpdatePolicy,
  onResetPolicies,
  onApplyPreset,
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>('ALL');
  const [savedToast, setSavedToast] = useState(false);

  const categories = Array.from(new Set(policies.map((p) => p.category)));

  const filteredPolicies =
    selectedCategoryFilter === 'ALL'
      ? policies
      : policies.filter((p) => p.category === selectedCategoryFilter);

  const triggerSavedFeedback = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1800);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Privacy Policy Engine
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Configure automated enforcement actions, risk weights, and
            sanitization strategies per data type. Changes immediately affect
            the Prompt Scanner.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {savedToast && (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Policy live-updated
            </span>
          )}

          <button
            onClick={() => {
              onApplyPreset('strict');
              triggerSavedFeedback();
            }}
            className="px-3.5 py-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Strict Zero-Trust Preset
          </button>

          <button
            onClick={() => {
              onApplyPreset('balanced');
              triggerSavedFeedback();
            }}
            className="px-3.5 py-2 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Balanced Enterprise Preset
          </button>

          <button
            onClick={() => {
              onResetPolicies();
              triggerSavedFeedback();
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Active Detectors</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-100 mt-1">
              {policies.filter((p) => p.enabled).length} / {policies.length}
            </div>
          </div>
          <Sliders className="w-5 h-5 text-indigo-400" />
        </div>

        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Strict Block Rules</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-red-400 mt-1">
              {
                policies.filter((p) => p.enabled && p.action === 'Block')
                  .length
              }
            </div>
          </div>
          <ShieldAlert className="w-5 h-5 text-red-400" />
        </div>

        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">
              Auto-Sanitize Rules (Mask / Redact / Anonymize)
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
              {
                policies.filter(
                  (p) =>
                    p.enabled &&
                    ['Mask', 'Redact', 'Anonymize', 'Tokenize'].includes(
                      p.action
                    )
                ).length
              }
            </div>
          </div>
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategoryFilter('ALL')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            selectedCategoryFilter === 'ALL'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          All Categories ({policies.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategoryFilter(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategoryFilter === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Policy Configuration Table */}
      <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-3 pr-4">Enabled</th>
                <th className="py-3 px-3">Data Type</th>
                <th className="py-3 px-3">Sensitive Category</th>
                <th className="py-3 px-3">Policy Tier</th>
                <th className="py-3 px-3">Enforcement Action</th>
                <th className="py-3 pl-3 text-right">Risk Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-xs">
              {filteredPolicies.map((rule) => (
                <tr
                  key={rule.entityType}
                  className={`transition-colors ${
                    rule.enabled
                      ? 'hover:bg-slate-800/30'
                      : 'opacity-50 bg-slate-950/40'
                  }`}
                >
                  {/* Toggle Switch */}
                  <td className="py-3.5 pr-4">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={rule.enabled}
                      onClick={() => {
                        onUpdatePolicy(rule.entityType, {
                          enabled: !rule.enabled,
                        });
                        triggerSavedFeedback();
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        rule.enabled ? 'bg-indigo-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                          rule.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>

                  {/* Data Type & Description */}
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-100">
                      {rule.label}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                      {rule.description}
                    </div>
                  </td>

                  {/* Sensitive Category */}
                  <td className="py-3.5 px-3 text-slate-300">
                    {rule.category}
                  </td>

                  {/* Policy Tier Select */}
                  <td className="py-3.5 px-3">
                    <select
                      value={rule.policyLevel}
                      onChange={(e) => {
                        onUpdatePolicy(rule.entityType, {
                          policyLevel: e.target.value as PolicyLevel,
                        });
                        triggerSavedFeedback();
                      }}
                      className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-md px-2.5 py-1.5 text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
                    >
                      {AVAILABLE_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Enforcement Action Select */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={rule.action}
                        onChange={(e) => {
                          onUpdatePolicy(rule.entityType, {
                            action: e.target.value as PolicyAction,
                          });
                          triggerSavedFeedback();
                        }}
                        className={`bg-slate-950 border rounded-md px-2.5 py-1.5 text-xs font-mono font-semibold focus:outline-none cursor-pointer ${
                          rule.action === 'Block'
                            ? 'border-red-500/40 text-red-400'
                            : rule.action === 'Redact' ||
                              rule.action === 'Mask' ||
                              rule.action === 'Anonymize' ||
                              rule.action === 'Tokenize'
                            ? 'border-emerald-500/40 text-emerald-400'
                            : rule.action === 'Warn'
                            ? 'border-amber-500/40 text-amber-400'
                            : 'border-slate-700 text-slate-400'
                        }`}
                      >
                        {AVAILABLE_ACTIONS.map((act) => (
                          <option key={act} value={act}>
                            {act.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Risk Weight Input */}
                  <td className="py-3.5 pl-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="text-slate-500 font-mono">+</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={5}
                        value={rule.baseWeight}
                        onChange={(e) => {
                          const val = Math.max(
                            0,
                            Math.min(100, Number(e.target.value) || 0)
                          );
                          onUpdatePolicy(rule.entityType, { baseWeight: val });
                          triggerSavedFeedback();
                        }}
                        className="w-16 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-md px-2 py-1 text-right font-mono tabular-nums text-xs text-slate-100 focus:outline-none"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            Policy rules are persisted in local storage and applied before any
            prompt reaches an AI endpoint.
          </span>
          <span className="font-mono">
            ACTIONS: ALLOW · WARN · MASK · REDACT · ANONYMIZE · TOKENIZE · BLOCK
          </span>
        </div>
      </div>
    </div>
  );
};

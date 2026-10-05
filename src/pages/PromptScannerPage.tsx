import React, { useState } from 'react';
import {
  PolicyRule,
  ScanResult,
  TestScenario,
} from '../types/privacy';
import {
  SCANNER_PLACEHOLDER_PROMPT,
  TEST_SCENARIOS,
} from '../data/defaultData';
import { HighlightedPrompt } from '../components/HighlightedPrompt';
import { RiskMeter } from '../components/RiskMeter';
import {
  Search,
  Rocket,
  Copy,
  Check,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Lock,
  Sparkles,
  Info,
  Loader2,
  Bot,
} from 'lucide-react';

interface PromptScannerPageProps {
  promptText: string;
  onPromptChange: (text: string) => void;
  currentScan: ScanResult | null;
  onRunScan: (customPrompt?: string) => void;
  onTriggerHackathonDemo: () => void;
  policies: PolicyRule[];
}

export const PromptScannerPage: React.FC<PromptScannerPageProps> = ({
  promptText,
  onPromptChange,
  currentScan,
  onRunScan,
  onTriggerHackathonDemo,
  policies,
}) => {
  const [copiedSafe, setCopiedSafe] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<{
    text: string;
    model: string;
    timestamp: string;
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleCopySafePrompt = async () => {
    if (!currentScan) return;
    try {
      await navigator.clipboard.writeText(currentScan.safePrompt);
      setCopiedSafe(true);
      setTimeout(() => setCopiedSafe(false), 2000);
    } catch {
      // Fallback copy
    }
  };

  const handleResetScanner = () => {
    onPromptChange('');
    setAiResponse(null);
    setAiError(null);
  };

  const handleLoadScenario = (scenario: TestScenario) => {
    onPromptChange(scenario.prompt);
    setAiResponse(null);
    setAiError(null);
    onRunScan(scenario.prompt);
  };

  const handleSendSafePromptToAI = async () => {
    if (!currentScan || !currentScan.safePrompt.trim()) return;
    setAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch('/api/safe-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          safePrompt: currentScan.safePrompt,
          isSanitizedVerified: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to relay safe prompt to AI.');
      }
      setAiResponse({
        text: data.response,
        model: data.model || 'gemini-3.8-flash',
        timestamp: data.timestamp || new Date().toISOString(),
      });
    } catch (err: any) {
      setAiError(
        err?.message || 'Unable to reach Safe AI endpoint. Please try again.'
      );
    } finally {
      setAiLoading(false);
    }
  };

  const getSeverityIndicator = (riskScore: number) => {
    if (riskScore >= 50) {
      return { dot: 'bg-red-500', text: 'text-red-400', tag: 'CRITICAL' };
    }
    if (riskScore >= 30) {
      return { dot: 'bg-orange-500', text: 'text-orange-400', tag: 'HIGH' };
    }
    if (riskScore >= 15) {
      return { dot: 'bg-amber-400', text: 'text-amber-300', tag: 'MEDIUM' };
    }
    return { dot: 'bg-yellow-400', text: 'text-yellow-300', tag: 'LOW' };
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Security Guarantee Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Pre-LLM Prompt Scanner
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Sensitive information is analyzed locally in this demo and is not
            automatically sent to an external LLM.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setAiResponse(null);
              setAiError(null);
              onTriggerHackathonDemo();
            }}
            className="px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Rocket className="w-4 h-4 text-emerald-400" />
            <span>Hackathon Demo Mode</span>
          </button>
        </div>
      </div>

      {/* Attack / Test Scenarios Bar */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <span>Test Examples (One-Click Attack &amp; Compliance Scenarios)</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            POPULATES &amp; SCANS IMMEDIATELY
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {TEST_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => handleLoadScenario(scenario)}
              className="p-3 text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-lg transition-colors cursor-pointer group"
            >
              <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 truncate">
                {scenario.shortLabel}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between font-mono">
                <span>{scenario.expectedRisk}</span>
                <span>→ {scenario.expectedAction.split(' ')[0]}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input Area */}
      <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <label
            htmlFor="prompt-scanner-textarea"
            className="text-sm font-semibold text-slate-200"
          >
            Paste your prompt here…
          </label>
          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono tabular-nums">
            <span>{promptText.length} chars</span>
            <span>·</span>
            <span>
              {policies.filter((p) => p.enabled).length}/{policies.length}{' '}
              policies active
            </span>
          </div>
        </div>

        <textarea
          id="prompt-scanner-textarea"
          rows={5}
          value={promptText}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder={SCANNER_PLACEHOLDER_PROMPT}
          className="w-full p-4 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-lg text-sm text-slate-100 placeholder:text-slate-600 leading-relaxed font-sans resize-y"
        />

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              Zero-Leakage Guarantee: Original prompt is blocked from direct AI
              transmission.
            </span>
          </div>

          <div className="flex items-center gap-3">
            {promptText && (
              <button
                onClick={handleResetScanner}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}

            <button
              onClick={() => {
                setAiResponse(null);
                setAiError(null);
                onRunScan();
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Scan for Privacy Risks</span>
            </button>
          </div>
        </div>
      </div>

      {/* Split-Screen Scan Results */}
      {currentScan && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT SIDE: Original Prompt with Highlighted Sensitive Tokens */}
            <div className="lg:col-span-6 p-6 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-100">
                      Original Prompt (Intercepted)
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Inline entity classification &amp; boundary detection
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {currentScan.detectedEntities.length} entities flagged
                  </span>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800/90 rounded-lg min-h-[160px]">
                  <HighlightedPrompt
                    prompt={promptText}
                    entities={currentScan.detectedEntities}
                  />
                </div>
              </div>

              {/* Entity Legend & Detailed Table */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <div className="text-xs font-semibold text-slate-300">
                  Detected Sensitive Entities Breakdown
                </div>
                {currentScan.detectedEntities.length === 0 ? (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Zero sensitive entities detected in this prompt.
                    </span>
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-56">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400">
                          <th className="py-2 pr-2">Entity</th>
                          <th className="py-2 px-2">Category</th>
                          <th className="py-2 px-2">Value</th>
                          <th className="py-2 pl-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {currentScan.detectedEntities.map((ent) => (
                          <tr key={ent.id}>
                            <td className="py-2 pr-2 font-medium text-slate-200 whitespace-nowrap">
                              {ent.label}
                            </td>
                            <td className="py-2 px-2 text-slate-400 truncate max-w-[140px]">
                              {ent.category}
                            </td>
                            <td className="py-2 px-2 font-mono text-slate-300">
                              {ent.value}
                            </td>
                            <td className="py-2 pl-2 font-mono font-semibold text-right text-indigo-300">
                              {ent.recommendedAction.toUpperCase()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: Privacy Analysis, Risk Score & Explainability */}
            <div className="lg:col-span-6 p-6 bg-slate-900/70 border border-slate-800 rounded-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-100">
                    Privacy Analysis &amp; Risk Score
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Dynamic risk scoring &amp; policy enforcement engine
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {currentScan.scanId}
                </span>
              </div>

              {/* Score + Recommended Action Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center bg-slate-950 p-4 rounded-lg border border-slate-800">
                <RiskMeter
                  score={currentScan.riskScore}
                  size="md"
                  showScaleLegend={false}
                />

                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] font-mono text-slate-400 uppercase">
                      Risk Level
                    </div>
                    <div
                      className={`text-lg font-bold font-mono ${
                        currentScan.riskLevel === 'CRITICAL'
                          ? 'text-red-400'
                          : currentScan.riskLevel === 'HIGH'
                          ? 'text-orange-400'
                          : currentScan.riskLevel === 'MEDIUM'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {currentScan.riskScore}/100 · {currentScan.riskLevel}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono text-slate-400 uppercase">
                      Recommended Action
                    </div>
                    <div
                      className={`mt-1 inline-flex items-center gap-1.5 font-mono text-sm font-bold ${
                        currentScan.overallStatus === 'BLOCKED'
                          ? 'text-red-400'
                          : currentScan.overallStatus === 'SANITIZED'
                          ? 'text-amber-300'
                          : 'text-emerald-400'
                      }`}
                    >
                      {currentScan.overallStatus === 'BLOCKED' ? (
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                      ) : currentScan.overallStatus === 'SANITIZED' ? (
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                      )}
                      <span>{currentScan.recommendedActionSummary}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detected Information Summary + Why is this prompt risky? */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2.5">
                  <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                    Detected Information
                  </h3>
                  {currentScan.detectedEntities.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No sensitive tokens found.
                    </p>
                  ) : (
                    <ul className="space-y-2 text-xs">
                      {Array.from(
                        new Map(
                          currentScan.detectedEntities.map((item) => [
                            item.type,
                            item,
                          ])
                        ).values()
                      ).map((ent) => {
                        const sev = getSeverityIndicator(ent.riskScore);
                        return (
                          <li
                            key={ent.type}
                            className="flex items-center justify-between"
                          >
                            <span className="flex items-center gap-2 text-slate-200 font-medium">
                              <span
                                className={`w-2 h-2 rounded-full ${sev.dot}`}
                              />
                              <span>{ent.label}</span>
                            </span>
                            <span
                              className={`font-mono text-[11px] ${sev.text}`}
                            >
                              {sev.tag}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2.5">
                  <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                    Why is this prompt risky?
                  </h3>
                  {currentScan.riskContributions.length === 0 ? (
                    <p className="text-xs text-emerald-400 font-mono">
                      +0 Risk Points (Clean Prompt)
                    </p>
                  ) : (
                    <div className="space-y-1.5 text-xs font-mono tabular-nums">
                      {currentScan.riskContributions.map((c) => (
                        <div
                          key={c.entityType}
                          className="flex items-center justify-between text-slate-300"
                        >
                          <span className="truncate pr-2">{c.reason}</span>
                          <span className="text-amber-400 font-semibold shrink-0">
                            +{c.points}
                          </span>
                        </div>
                      ))}
                      <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between font-bold text-slate-100">
                        <span>Total Risk Score:</span>
                        <span>{currentScan.riskScore}/100</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Explainable Privacy Analysis: Why did PrivAI Guard block/sanitize this? */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>
                    {currentScan.overallStatus === 'BLOCKED'
                      ? 'Why did PrivAI Guard block this?'
                      : 'Explainable Policy Enforcement Trace'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentScan.explanationSummary}
                </p>

                {currentScan.detectedEntities.length > 0 && (
                  <div className="pt-2 space-y-1.5">
                    <div className="text-[11px] font-mono text-slate-400">
                      DETECTED DATA → POLICY → ENFORCED ACTION
                    </div>
                    <div className="space-y-1 font-mono text-xs">
                      {Array.from(
                        new Map(
                          currentScan.detectedEntities.map((item) => [
                            item.type,
                            item,
                          ])
                        ).values()
                      ).map((ent) => (
                        <div
                          key={ent.type}
                          className="flex flex-wrap items-center gap-2 py-1 px-2.5 bg-slate-900/90 rounded border border-slate-800/80"
                        >
                          <span className="text-slate-200 font-medium">
                            {ent.label}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="text-slate-400">
                            {ent.policyName}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span
                            className={`font-semibold ${
                              ent.recommendedAction === 'Block'
                                ? 'text-red-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {ent.recommendedAction.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4: SAFE PROMPT GENERATION */}
          <div className="p-6 bg-slate-900/80 border border-emerald-500/30 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h2 className="text-base font-semibold text-slate-100">
                  Safe Version (Sanitized Prompt Ready for AI)
                </h2>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                ALL SENSITIVE TOKENS REDACTED OR ANONYMIZED
              </span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg font-mono text-sm text-emerald-100 leading-relaxed whitespace-pre-wrap">
              {currentScan.safePrompt}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleCopySafePrompt}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {copiedSafe ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">
                        Copied Safe Prompt!
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Safe Prompt</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleResetScanner}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Scan Again</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Original prompt is strictly prevented from being sent */}
                <button
                  onClick={handleSendSafePromptToAI}
                  disabled={aiLoading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Relaying Safe Prompt to AI…</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Safe Prompt to AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Optional Safe AI Response Panel */}
            {aiError && (
              <div className="p-4 bg-red-950/30 border border-red-500/40 rounded-lg text-xs text-red-300">
                {aiError}
              </div>
            )}

            {aiResponse && (
              <div className="mt-4 p-5 bg-slate-950 border border-indigo-500/40 rounded-lg space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                    <Bot className="w-4 h-4 text-indigo-400" />
                    <span>
                      External AI Response (Generated Strictly from Sanitized
                      Safe Prompt)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    MODEL: {aiResponse.model}
                  </span>
                </div>
                <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {aiResponse.text}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

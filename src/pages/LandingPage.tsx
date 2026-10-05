import React from 'react';
import {
  Shield,
  ArrowRight,
  Search,
  Lock,
  BarChart3,
  Sparkles,
  Rocket,
  CheckCircle2,
  EyeOff,
  Sliders,
  Terminal,
} from 'lucide-react';
import { NavigationTab } from '../types/privacy';

interface LandingPageProps {
  onNavigate: (tab: NavigationTab) => void;
  onTriggerHackathonDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onTriggerHackathonDemo,
}) => {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-8 pb-12 border-b border-slate-800/80">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 mb-4">
            <span>PRE-LLM PRIVACY FIREWALL</span>
            <span aria-hidden="true">·</span>
            <span>CLIENT-SIDE ZERO-TRUST INSPECTION</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-50 leading-[1.1]"
            style={{ textWrap: 'balance' }}
          >
            Stop Sensitive Data Before It Reaches AI.
          </h1>

          <p className="mt-6 text-lg text-slate-300 max-w-2xl leading-relaxed">
            An intelligent pre-LLM privacy firewall that detects, evaluates, and
            protects sensitive information before it reaches AI systems.
            Inspect prompts in real time, calculate transparent risk scores, and
            generate sanitized safe prompts automatically.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('scanner')}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Scan a Prompt</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onTriggerHackathonDemo}
              className="px-5 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Rocket className="w-4 h-4 text-emerald-400" />
              <span>View Demo (Hackathon Live Mode)</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-3 text-slate-300 hover:text-white text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
            >
              Open Security Dashboard →
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/60 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Sensitive information is analyzed locally in this demo
            </span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Original prompts are never automatically sent to external LLMs
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Architecture Flow Diagram */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-slate-400">
              01. ZERO-TRUST INTERCEPTION PIPELINE
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mt-1">
              How PrivAI Guard Intercepts Prompts Before AI
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            LATENCY: &lt;5ms CLIENT-SIDE REGEX &amp; POLICY ENGINE
          </p>
        </div>

        <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
            {[
              {
                step: '01',
                title: 'USER',
                subtitle: 'Enters raw prompt with PII or secrets',
                accent: 'border-slate-700 text-slate-200',
              },
              {
                step: '02',
                title: 'PRIVAI GUARD',
                subtitle: 'Pre-LLM firewall intercepts locally',
                accent: 'border-indigo-500/50 text-indigo-300 bg-indigo-950/20',
              },
              {
                step: '03',
                title: 'DETECT',
                subtitle: 'Classifies 14+ PII & credential types',
                accent: 'border-amber-500/40 text-amber-300',
              },
              {
                step: '04',
                title: 'ASSESS',
                subtitle: 'Calculates 0–100 risk score & reasons',
                accent: 'border-orange-500/40 text-orange-300',
              },
              {
                step: '05',
                title: 'PROTECT',
                subtitle: 'Enforces Block, Redact, Mask, Anonymize',
                accent: 'border-emerald-500/40 text-emerald-300',
              },
              {
                step: '06',
                title: 'SAFE AI',
                subtitle: 'Only sanitized prompt reaches LLM',
                accent: 'border-emerald-500/60 text-emerald-200 bg-emerald-950/20',
              },
            ].map((node, index, arr) => (
              <div key={node.title} className="flex items-center gap-3">
                <div
                  className={`flex-1 p-4 rounded-lg border ${node.accent} transition-colors`}
                >
                  <div className="text-[11px] font-mono text-slate-400">
                    STEP {node.step}
                  </div>
                  <div className="text-sm font-bold tracking-wide mt-1">
                    {node.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 leading-snug">
                    {node.subtitle}
                  </div>
                </div>
                {index < arr.length - 1 && (
                  <ArrowRight className="hidden md:block w-4 h-4 text-slate-600 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Capabilities Grid */}
      <section className="space-y-6">
        <div>
          <div className="text-xs font-mono text-slate-400">
            02. CORE FIREWALL CAPABILITIES
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mt-1">
            Comprehensive Protection Across 9 Sensitive Data Categories
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
                <Search className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">
                01. Detect
              </h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Automatically identify sensitive information including API keys,
                passwords, credit cards, Aadhaar, PAN, emails, phones, and
                medical records.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400">
              14 ENTITY DETECTORS · REGEX + DICTIONARY
            </div>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">
                02. Protect
              </h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Apply configurable privacy policies per data category: Block,
                Redact, Mask, Anonymize, Tokenize, or Warn in real time.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400">
              GRANULAR POLICY ENGINE · LIVE TOGGLES
            </div>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">
                03. Risk Score
              </h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Understand privacy exposure instantly on a 0–100 scale with
                transparent point breakdowns explaining why a prompt was
                flagged.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400">
              EXPLAINABLE SCORING · LOW TO CRITICAL
            </div>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">
                04. Safe Prompt
              </h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Generate a sanitized version with semantic placeholders like
                [PERSON], [EMAIL], and [REDACTED] ready for safe AI processing.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400">
              ZERO RAW LEAKAGE · SAFE AI RELAY
            </div>
          </div>
        </div>
      </section>

      {/* Live Preview Comparison */}
      <section className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="text-xs font-mono text-indigo-400">
              03. REAL-TIME SANITIZATION PREVIEW
            </div>
            <h2 className="text-2xl font-bold text-slate-100">
              Never Send Raw Credentials or PII to External Models
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Employees and developers routinely paste source code, customer
              records, API keys, and tax identifiers into conversational AI
              assistants. PrivAI Guard acts as a deterministic compliance layer
              that strips sensitive tokens while preserving prompt intent.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={onTriggerHackathonDemo}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Run Live Multi-Threat Demo</span>
              </button>
              <button
                onClick={() => onNavigate('policies')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Configure Policy Rules</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 bg-slate-950 border border-red-500/30 rounded-lg">
              <div className="flex items-center justify-between text-red-400 mb-2">
                <span>UNSAFE RAW PROMPT (INTERCEPTED)</span>
                <span>RISK: 100/100 CRITICAL</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                "Hi, I'm <span className="text-indigo-300 underline">Rahul Sharma</span>. My email is{' '}
                <span className="text-amber-300 underline">rahul.sharma@gmail.com</span> and my PAN is{' '}
                <span className="text-orange-300 underline">ABCDE1234F</span>. My API key is{' '}
                <span className="text-red-400 underline">sk-test-92837</span>."
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-emerald-500/30 rounded-lg">
              <div className="flex items-center justify-between text-emerald-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5" />
                  SANITIZED SAFE PROMPT (READY FOR AI)
                </span>
                <span>0 SECRETS EXPOSED</span>
              </div>
              <p className="text-emerald-100 leading-relaxed">
                "Hi, I'm <span className="text-emerald-400 font-semibold">[PERSON]</span>. My email is{' '}
                <span className="text-emerald-400 font-semibold">[EMAIL]</span> and my PAN is{' '}
                <span className="text-emerald-400 font-semibold">[REDACTED]</span>. My API key is{' '}
                <span className="text-emerald-400 font-semibold">[REDACTED]</span>."
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

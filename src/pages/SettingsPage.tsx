import React, { useState } from 'react';
import { AppSettings, ThemeMode } from '../types/privacy';
import {
  Shield,
  Plus,
  X,
  RotateCcw,
  Check,
  Server,
  Cpu,
  Palette,
} from 'lucide-react';

interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  onResetAllData: () => void;
  theme: ThemeMode;
  onChangeTheme: (theme: ThemeMode) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onResetAllData,
  theme,
  onChangeTheme,
}) => {
  const [newNameInput, setNewNameInput] = useState('');
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [resetConfirmed, setResetConfirmed] = useState(false);

  const handleAddName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newNameInput.trim();
    if (!trimmed) return;
    if (!settings.customCommonNames.includes(trimmed)) {
      onUpdateSettings({
        customCommonNames: [...settings.customCommonNames, trimmed],
      });
    }
    setNewNameInput('');
  };

  const handleRemoveName = (name: string) => {
    onUpdateSettings({
      customCommonNames: settings.customCommonNames.filter((n) => n !== name),
    });
  };

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newKeywordInput.trim();
    if (!trimmed) return;
    if (!settings.customSensitiveKeywords.includes(trimmed)) {
      onUpdateSettings({
        customSensitiveKeywords: [...settings.customSensitiveKeywords, trimmed],
      });
    }
    setNewKeywordInput('');
  };

  const handleRemoveKeyword = (kw: string) => {
    onUpdateSettings({
      customSensitiveKeywords: settings.customSensitiveKeywords.filter(
        (k) => k !== kw
      ),
    });
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-slate-100">
          Firewall Engine Settings
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Configure visual theme palettes, local NER dictionaries, tokenization
          format, and zero-trust storage preferences.
        </p>
      </div>

      {/* Visual Theme Selector */}
      <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <Palette className="w-4 h-4 text-indigo-400" />
            <span>Interface Theme &amp; Color Palette</span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            ACTIVE: {theme.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 'obsidian' as ThemeMode,
              name: 'Obsidian Cyber Emerald',
              desc: 'Deep matrix carbon canvas with high-contrast emerald security accents.',
              swatches: ['#040907', '#0b1612', '#10b981', '#34d399'],
            },
            {
              id: 'daylight' as ThemeMode,
              name: 'Enterprise Daylight (Light)',
              desc: 'Crisp alabaster & white surfaces with ocean-blue enterprise contrast.',
              swatches: ['#f8fafc', '#ffffff', '#0284c7', '#0f172a'],
            },
            {
              id: 'cobalt' as ThemeMode,
              name: 'Midnight Cobalt Slate',
              desc: 'Classic dark slate cybersecurity console with indigo highlights.',
              swatches: ['#090d16', '#0f172a', '#4f46e5', '#818cf8'],
            },
          ].map((item) => {
            const isSelected = theme === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeTheme(item.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-indigo-500 bg-slate-950 ring-1 ring-indigo-500/40'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">
                      {item.name}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {item.swatches.map((hex) => (
                    <span
                      key={hex}
                      className="w-5 h-5 rounded-full border border-slate-700/60"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Core Engine Toggles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-xl space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>Zero-Trust Privacy &amp; Tokenization Controls</span>
          </div>

          <div className="space-y-4 divide-y divide-slate-800/70 text-xs">
            <div className="pt-2 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-slate-200">
                  Store Sanitized Scan History Locally
                </div>
                <div className="text-slate-400 mt-0.5">
                  Persist scan metadata and sanitized prompts in browser
                  localStorage (never stores raw sensitive values).
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    storeSanitizedHistory: !settings.storeSanitizedHistory,
                  })
                }
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  settings.storeSanitizedHistory
                    ? 'bg-indigo-600'
                    : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.storeSanitizedHistory
                      ? 'translate-x-4'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="pt-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-slate-200">
                  Context-Aware Person Name Detection
                </div>
                <div className="text-slate-400 mt-0.5">
                  Detect names following patterns like "My name is...", "I'm...",
                  or "Patient Name:..." in addition to the dictionary.
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    enableContextAwareNames: !settings.enableContextAwareNames,
                  })
                }
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  settings.enableContextAwareNames
                    ? 'bg-indigo-600'
                    : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.enableContextAwareNames
                      ? 'translate-x-4'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="pt-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-slate-200">
                  Deterministic Indexed Tokenization Mode
                </div>
                <div className="text-slate-400 mt-0.5">
                  Replace detected entities with indexed tokens like
                  [TOKEN_EMAIL_1] instead of standard [EMAIL] tags.
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    autoTokenizeIdentifiers: !settings.autoTokenizeIdentifiers,
                  })
                }
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  settings.autoTokenizeIdentifiers
                    ? 'bg-indigo-600'
                    : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.autoTokenizeIdentifiers
                      ? 'translate-x-4'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Extensible Enterprise Architecture Info */}
        <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Modular Architecture &amp; Enterprise Extensibility</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This MVP runs deterministic regex and dictionary inspection 100%
              in the browser for zero-latency, zero-leakage safety. The service
              layer is structured for drop-in backend adapters:
            </p>
            <ul className="space-y-2 text-xs text-slate-400 font-mono">
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Microsoft Presidio / spaCy Transformer NER Adapter</span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Python FastAPI Policy Enforcement Microservice</span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Reversible Vault Tokenization &amp; RBAC Audit Log</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Reset policies, custom dictionaries, and scan history to factory
              state
            </span>
            <button
              onClick={() => {
                onResetAllData();
                setResetConfirmed(true);
                setTimeout(() => setResetConfirmed(false), 2000);
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {resetConfirmed ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Reset Complete</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Factory Reset Demo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Configurable Name Dictionary & Confidential Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Custom Person Name Dictionary */}
        <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-xl space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Configurable Person Name Dictionary
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Names matched regardless of surrounding phrasing during client-side
              scanning.
            </p>
          </div>

          <form onSubmit={handleAddName} className="flex gap-2">
            <input
              type="text"
              value={newNameInput}
              onChange={(e) => setNewNameInput(e.target.value)}
              placeholder="Add full or first name (e.g., Vikram Sarabhai)…"
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-100 focus:outline-none"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-1">
            {settings.customCommonNames.map((name) => (
              <div
                key={name}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300"
              >
                <span>{name}</span>
                <button
                  onClick={() => handleRemoveName(name)}
                  className="text-slate-500 hover:text-red-400 cursor-pointer"
                  title="Remove name"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Organizational Confidential Keywords */}
        <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-xl space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Organizational Confidential Keywords &amp; Codenames
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Proprietary project names, M&amp;A targets, or internal tags to
              anonymize automatically.
            </p>
          </div>

          <form onSubmit={handleAddKeyword} className="flex gap-2">
            <input
              type="text"
              value={newKeywordInput}
              onChange={(e) => setNewKeywordInput(e.target.value)}
              placeholder="Add project codename (e.g., Project Titan)…"
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-100 focus:outline-none"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-1">
            {settings.customSensitiveKeywords.map((kw) => (
              <div
                key={kw}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 font-mono"
              >
                <span>{kw}</span>
                <button
                  onClick={() => handleRemoveKeyword(kw)}
                  className="text-slate-500 hover:text-red-400 cursor-pointer"
                  title="Remove keyword"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

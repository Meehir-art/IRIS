/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AppSettings,
  EntityType,
  NavigationTab,
  PolicyRule,
  ScanResult,
  StoredScanRecord,
  ThemeMode,
} from './types/privacy';
import {
  DEFAULT_POLICIES,
  DEFAULT_SETTINGS,
  HACKATHON_DEMO_PROMPT,
  INITIAL_SCAN_HISTORY,
  SCANNER_PLACEHOLDER_PROMPT,
} from './data/defaultData';
import { analyzePromptPrivacy } from './services/privacyEngine';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { PromptScannerPage } from './pages/PromptScannerPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import {
  Rocket,
  Search,
  Menu,
  X,
  Palette,
} from 'lucide-react';

const STORAGE_KEYS = {
  POLICIES: 'privai_guard_policies_v1',
  HISTORY: 'privai_guard_history_v1',
  SETTINGS: 'privai_guard_settings_v1',
  THEME: 'privai_guard_theme_v1',
};

const THEME_LABELS: Record<ThemeMode, string> = {
  obsidian: 'Obsidian Cyber',
  daylight: 'Daylight Clean',
  cobalt: 'Midnight Cobalt',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Theme state (defaults to the new 'obsidian' emerald theme)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode | null;
      if (saved === 'obsidian' || saved === 'daylight' || saved === 'cobalt') {
        return saved;
      }
    } catch {
      // Fallback
    }
    return 'obsidian';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  const handleCycleTheme = () => {
    setTheme((prev) =>
      prev === 'obsidian'
        ? 'daylight'
        : prev === 'daylight'
        ? 'cobalt'
        : 'obsidian'
    );
  };

  // Load Policies from localStorage or fallback to DEFAULT_POLICIES
  const [policies, setPolicies] = useState<PolicyRule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POLICIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_POLICIES;
  });

  // Load Settings from localStorage or fallback to DEFAULT_SETTINGS
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  });

  // Load Scan History from localStorage or fallback to INITIAL_SCAN_HISTORY
  const [scanHistory, setScanHistory] = useState<StoredScanRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_SCAN_HISTORY;
  });

  // Current Prompt & Scan Result state
  const [promptText, setPromptText] = useState<string>(
    SCANNER_PLACEHOLDER_PROMPT
  );
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(() =>
    analyzePromptPrivacy(
      SCANNER_PLACEHOLDER_PROMPT,
      DEFAULT_POLICIES,
      DEFAULT_SETTINGS,
      1023
    )
  );

  // Sync policies to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(policies));
    } catch {
      // Ignore quota errors
    }
  }, [policies]);

  // Sync settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings]);

  // Sync history to localStorage
  useEffect(() => {
    try {
      if (settings.storeSanitizedHistory) {
        localStorage.setItem(
          STORAGE_KEYS.HISTORY,
          JSON.stringify(scanHistory)
        );
      }
    } catch {
      // Ignore
    }
  }, [scanHistory, settings.storeSanitizedHistory]);

  // Re-evaluate currentScan automatically when policies or settings change so policy changes affect scanner behavior live
  useEffect(() => {
    if (promptText.trim()) {
      const updated = analyzePromptPrivacy(
        promptText,
        policies,
        settings,
        1020 + scanHistory.length
      );
      setCurrentScan(updated);
    }
  }, [policies, settings]);

  // Run a scan and record sanitized result into history
  const handleRunScan = useCallback(
    (customPrompt?: string) => {
      const targetText =
        typeof customPrompt === 'string' ? customPrompt : promptText;
      if (!targetText.trim()) {
        setCurrentScan(null);
        return;
      }

      const nextScanNumber =
        scanHistory.length > 0
          ? Math.max(
              1024,
              ...scanHistory.map(
                (h) => parseInt(h.scanId.replace('SCAN-', ''), 10) || 1024
              )
            )
          : 1024;

      const result = analyzePromptPrivacy(
        targetText,
        policies,
        settings,
        nextScanNumber
      );
      setCurrentScan(result);

      if (settings.storeSanitizedHistory) {
        const entityCounts: Record<string, number> = {};
        result.detectedEntities.forEach((e) => {
          entityCounts[e.type] = (entityCounts[e.type] || 0) + 1;
        });

        const newRecord: StoredScanRecord = {
          scanId: result.scanId,
          timestamp: result.timestamp,
          riskScore: result.riskScore,
          riskLevel: result.riskLevel,
          categoriesDetected: result.categoriesDetected,
          entityLabelsDetected: result.entityLabelsDetected,
          entityCounts,
          recommendedActionSummary: result.recommendedActionSummary,
          overallStatus: result.overallStatus,
          safePrompt: result.safePrompt,
          explanationSummary: result.explanationSummary,
        };

        setScanHistory((prev) => [newRecord, ...prev.slice(0, 49)]);
      }
    },
    [promptText, policies, settings, scanHistory]
  );

  // Trigger Hackathon Live Demo Mode
  const handleTriggerHackathonDemo = useCallback(() => {
    setPromptText(HACKATHON_DEMO_PROMPT);
    setActiveTab('scanner');
    setMobileMenuOpen(false);

    const nextScanNumber =
      scanHistory.length > 0
        ? Math.max(
            1024,
            ...scanHistory.map(
              (h) => parseInt(h.scanId.replace('SCAN-', ''), 10) || 1024
            )
          )
        : 1024;

    const demoResult = analyzePromptPrivacy(
      HACKATHON_DEMO_PROMPT,
      policies,
      settings,
      nextScanNumber
    );
    setCurrentScan(demoResult);

    if (settings.storeSanitizedHistory) {
      const entityCounts: Record<string, number> = {};
      demoResult.detectedEntities.forEach((e) => {
        entityCounts[e.type] = (entityCounts[e.type] || 0) + 1;
      });

      const newRecord: StoredScanRecord = {
        scanId: demoResult.scanId,
        timestamp: demoResult.timestamp,
        riskScore: demoResult.riskScore,
        riskLevel: demoResult.riskLevel,
        categoriesDetected: demoResult.categoriesDetected,
        entityLabelsDetected: demoResult.entityLabelsDetected,
        entityCounts,
        recommendedActionSummary: demoResult.recommendedActionSummary,
        overallStatus: demoResult.overallStatus,
        safePrompt: demoResult.safePrompt,
        explanationSummary: demoResult.explanationSummary,
      };

      setScanHistory((prev) => [newRecord, ...prev.slice(0, 49)]);
    }
  }, [policies, settings, scanHistory]);

  // Policy Engine Handlers
  const handleUpdatePolicy = (
    entityType: EntityType,
    updates: Partial<PolicyRule>
  ) => {
    setPolicies((prev) =>
      prev.map((p) =>
        p.entityType === entityType ? { ...p, ...updates } : p
      )
    );
  };

  const handleResetPolicies = () => {
    setPolicies(DEFAULT_POLICIES);
  };

  const handleApplyPreset = (preset: 'strict' | 'balanced' | 'audit') => {
    if (preset === 'strict') {
      setPolicies((prev) =>
        prev.map((p) => ({
          ...p,
          enabled: true,
          policyLevel: 'Strict',
          action:
            p.entityType === 'API_KEY' ||
            p.entityType === 'PASSWORD' ||
            p.entityType === 'CREDIT_CARD' ||
            p.entityType === 'PAN' ||
            p.entityType === 'AADHAAR'
              ? 'Block'
              : 'Redact',
        }))
      );
    } else if (preset === 'balanced') {
      setPolicies(DEFAULT_POLICIES);
    }
  };

  // History Handlers
  const handleDeleteHistoryRecord = (scanId: string) => {
    setScanHistory((prev) => prev.filter((item) => item.scanId !== scanId));
  };

  const handleClearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  };

  const handleRescanHistoryRecord = (record: StoredScanRecord) => {
    setPromptText(record.safePrompt);
    setActiveTab('scanner');
    handleRunScan(record.safePrompt);
  };

  const handleUpdateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const handleFactoryReset = () => {
    setPolicies(DEFAULT_POLICIES);
    setSettings(DEFAULT_SETTINGS);
    setScanHistory(INITIAL_SCAN_HISTORY);
    setPromptText(SCANNER_PLACEHOLDER_PROMPT);
    localStorage.removeItem(STORAGE_KEYS.POLICIES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  };

  const navItems: { id: NavigationTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'scanner', label: 'Prompt Scanner' },
    { id: 'policies', label: 'Privacy Policies' },
    { id: 'history', label: 'Scan History' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      {/* Top Bar Contract: Zone 1 (Single wordmark) — Zone 2 (Clean text nav links) — Zone 3 (1-2 primary actions) */}
      <header className="sticky top-0 z-40 h-16 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#overview"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('landing');
            setMobileMenuOpen(false);
          }}
          className="text-lg font-bold tracking-tight text-slate-50 font-display whitespace-nowrap"
        >
          IRIS AI Guard
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`py-1 transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
                  isActive
                    ? 'text-white border-indigo-500'
                    : 'text-slate-400 hover:text-slate-100 border-transparent'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCycleTheme}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            title="Switch visual theme (Obsidian Cyber / Daylight Clean / Midnight Cobalt)"
          >
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">{THEME_LABELS[theme]}</span>
          </button>

          <button
            onClick={handleTriggerHackathonDemo}
            className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Rocket className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hackathon Demo Mode</span>
          </button>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-2">
          <button
            onClick={() => {
              setActiveTab('landing');
              setMobileMenuOpen(false);
            }}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'landing'
                ? 'bg-indigo-600/20 text-indigo-300'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            Overview &amp; Architecture
          </button>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === item.id
                  ? 'bg-indigo-600/20 text-indigo-300'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Container (1440px max-w-7xl presence) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        {activeTab === 'landing' && (
          <LandingPage
            onNavigate={setActiveTab}
            onTriggerHackathonDemo={handleTriggerHackathonDemo}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            scanHistory={scanHistory}
            latestScan={currentScan}
            onNavigate={setActiveTab}
            onTriggerHackathonDemo={handleTriggerHackathonDemo}
            onSelectHistoryItem={handleRescanHistoryRecord}
          />
        )}

        {activeTab === 'scanner' && (
          <PromptScannerPage
            promptText={promptText}
            onPromptChange={setPromptText}
            currentScan={currentScan}
            onRunScan={handleRunScan}
            onTriggerHackathonDemo={handleTriggerHackathonDemo}
            policies={policies}
          />
        )}

        {activeTab === 'policies' && (
          <PoliciesPage
            policies={policies}
            onUpdatePolicy={handleUpdatePolicy}
            onResetPolicies={handleResetPolicies}
            onApplyPreset={handleApplyPreset}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage
            history={scanHistory}
            onDeleteRecord={handleDeleteHistoryRecord}
            onClearHistory={handleClearHistory}
            onRescanRecord={handleRescanHistoryRecord}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsPage history={scanHistory} />}

        {activeTab === 'settings' && (
          <SettingsPage
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetAllData={handleFactoryReset}
            theme={theme}
            onChangeTheme={setTheme}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-4 sm:px-8 mt-auto bg-slate-950/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <span className="font-semibold text-slate-200">PrivAI Guard</span>
            <span aria-hidden="true"> · </span>
            <span>Your Privacy Firewall Before AI</span>
            <span aria-hidden="true"> · </span>
            <span>Stop Sensitive Data Before It Reaches AI</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('landing')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Architecture
            </button>
            <button
              onClick={() => setActiveTab('scanner')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Scanner
            </button>
            <button
              onClick={() => setActiveTab('policies')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Policies
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              History
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

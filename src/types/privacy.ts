export type NavigationTab =
  | 'landing'
  | 'dashboard'
  | 'scanner'
  | 'policies'
  | 'history'
  | 'analytics'
  | 'settings';

export type ThemeMode = 'obsidian' | 'daylight' | 'cobalt';

export type EntityType =
  | 'PERSON'
  | 'EMAIL'
  | 'PHONE'
  | 'API_KEY'
  | 'PASSWORD'
  | 'CREDIT_CARD'
  | 'ADDRESS'
  | 'HEALTH'
  | 'FINANCIAL'
  | 'ORGANIZATION'
  | 'IP_ADDRESS'
  | 'AADHAAR'
  | 'PAN'
  | 'URL';

export type SensitiveCategory =
  | 'Personally Identifiable Information'
  | 'Contact Information'
  | 'Credentials'
  | 'Financial Information'
  | 'Health Information'
  | 'Government IDs'
  | 'Organizational Confidential Data'
  | 'Location Information'
  | 'Authentication Secrets';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type PolicyLevel = 'Normal' | 'Protect' | 'Strict' | 'Permissive';

export type PolicyAction =
  | 'Allow'
  | 'Warn'
  | 'Mask'
  | 'Redact'
  | 'Anonymize'
  | 'Tokenize'
  | 'Block';

export type OverallStatus = 'ALLOWED' | 'WARNED' | 'SANITIZED' | 'BLOCKED';

export interface PolicyRule {
  entityType: EntityType;
  label: string;
  category: SensitiveCategory;
  policyLevel: PolicyLevel;
  action: PolicyAction;
  baseWeight: number;
  enabled: boolean;
  description: string;
}

export interface DetectedEntity {
  id: string;
  type: EntityType;
  label: string;
  category: SensitiveCategory;
  value: string;
  maskedPreview: string;
  startIndex: number;
  endIndex: number;
  riskScore: number;
  riskLevel: RiskLevel;
  policyName: string;
  recommendedAction: PolicyAction;
  replacement: string;
}

export interface RiskContribution {
  entityType: EntityType;
  label: string;
  count: number;
  points: number;
  reason: string;
}

export interface ScanResult {
  scanId: string;
  timestamp: string;
  originalLength: number;
  safePrompt: string;
  riskScore: number;
  riskLevel: RiskLevel;
  overallStatus: OverallStatus;
  recommendedActionSummary: string;
  explanationSummary: string;
  detectedEntities: DetectedEntity[];
  riskContributions: RiskContribution[];
  categoriesDetected: SensitiveCategory[];
  entityLabelsDetected: string[];
}

/**
 * Stored in localStorage for Scan History.
 * Raw sensitive prompt and raw values are omitted by default to follow zero-trust data minimization.
 */
export interface StoredScanRecord {
  scanId: string;
  timestamp: string;
  riskScore: number;
  riskLevel: RiskLevel;
  categoriesDetected: SensitiveCategory[];
  entityLabelsDetected: string[];
  entityCounts: Record<string, number>;
  recommendedActionSummary: string;
  overallStatus: OverallStatus;
  safePrompt: string;
  explanationSummary: string;
}

export interface TestScenario {
  id: string;
  name: string;
  shortLabel: string;
  categoryFocus: string;
  prompt: string;
  expectedRisk: RiskLevel;
  expectedAction: string;
  description: string;
}

export interface AppSettings {
  strictZeroTrustMode: boolean;
  storeSanitizedHistory: boolean;
  enableContextAwareNames: boolean;
  autoTokenizeIdentifiers: boolean;
  customCommonNames: string[];
  customSensitiveKeywords: string[];
}

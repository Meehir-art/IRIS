import {
  AppSettings,
  DetectedEntity,
  EntityType,
  OverallStatus,
  PolicyAction,
  PolicyRule,
  RiskContribution,
  RiskLevel,
  ScanResult,
  SensitiveCategory,
} from '../types/privacy';

/**
 * Maps numeric 0-100 score to strict risk bands:
 * 0–29 = LOW
 * 30–59 = MEDIUM
 * 60–79 = HIGH
 * 80–100 = CRITICAL
 */
export function getRiskLevelFromScore(score: number): RiskLevel {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 30) return 'MEDIUM';
  return 'LOW';
}

export function getEntityRiskLevel(baseWeight: number): RiskLevel {
  if (baseWeight >= 50) return 'CRITICAL';
  if (baseWeight >= 30) return 'HIGH';
  if (baseWeight >= 15) return 'MEDIUM';
  return 'LOW';
}

/**
 * Generates a partial masked preview for UI inspection without exposing full secret in tables
 */
function createMaskedPreview(value: string, type: EntityType): string {
  const trimmed = value.trim();
  if (trimmed.length <= 4) return '••••';
  if (type === 'EMAIL') {
    const parts = trimmed.split('@');
    if (parts.length === 2) {
      const name = parts[0];
      return `${name[0]}${'*'.repeat(Math.max(2, name.length - 1))}@${parts[1]}`;
    }
  }
  if (type === 'PHONE' || type === 'CREDIT_CARD' || type === 'AADHAAR') {
    return `${trimmed.slice(0, 3)}${'*'.repeat(Math.max(4, trimmed.length - 5))}${trimmed.slice(-2)}`;
  }
  if (type === 'API_KEY' || type === 'PASSWORD') {
    return `${trimmed.slice(0, 4)}${'•'.repeat(8)}`;
  }
  return trimmed;
}

/**
 * Computes the sanitized replacement token according to the configured PolicyAction
 * and entity type, ensuring the prompt remains grammatically coherent for safe LLM usage.
 */
function computeReplacement(
  type: EntityType,
  rawValue: string,
  action: PolicyAction,
  entityOrderIndex: number,
  autoTokenize: boolean
): string {
  if (action === 'Allow' || action === 'Warn') {
    return rawValue;
  }

  if (autoTokenize || action === 'Tokenize') {
    return `[TOKEN_${type}_${entityOrderIndex}]`;
  }

  // Standard canonical placeholders matching hackathon specification:
  // e.g. [PERSON], [EMAIL], [PHONE], [REDACTED]
  switch (type) {
    case 'PERSON':
      return action === 'Redact' ? '[REDACTED]' : '[PERSON]';
    case 'EMAIL':
      return action === 'Redact' ? '[REDACTED]' : '[EMAIL]';
    case 'PHONE':
      return action === 'Redact' ? '[REDACTED]' : '[PHONE]';
    case 'API_KEY':
    case 'PASSWORD':
    case 'CREDIT_CARD':
    case 'PAN':
    case 'AADHAAR':
    case 'FINANCIAL':
      return '[REDACTED]';
    case 'ADDRESS':
      return action === 'Redact' ? '[REDACTED]' : '[ADDRESS]';
    case 'HEALTH':
      return action === 'Redact' ? '[REDACTED]' : '[HEALTH_DATA]';
    case 'IP_ADDRESS':
      return action === 'Redact' ? '[REDACTED]' : '[IP_ADDRESS]';
    case 'URL':
      return action === 'Redact' ? '[REDACTED]' : '[URL]';
    case 'ORGANIZATION':
      return action === 'Redact' ? '[REDACTED]' : '[ORGANIZATION]';
    default:
      return '[REDACTED]';
  }
}

interface RawCandidateMatch {
  type: EntityType;
  value: string;
  startIndex: number;
  endIndex: number;
  priority: number;
}

/**
 * Client-side Pattern & Dictionary Detection Engine
 * Inspects a raw prompt locally in the browser and returns a complete ScanResult.
 */
export function analyzePromptPrivacy(
  prompt: string,
  policies: PolicyRule[],
  settings: AppSettings,
  existingScanCount: number = 1024
): ScanResult {
  const policyMap = new Map<EntityType, PolicyRule>();
  for (const p of policies) {
    policyMap.set(p.entityType, p);
  }

  const candidates: RawCandidateMatch[] = [];

  const addMatches = (
    type: EntityType,
    regex: RegExp,
    priority: number,
    groupIndex: number = 0
  ) => {
    const rule = policyMap.get(type);
    if (!rule || !rule.enabled) return;

    const flags = regex.flags.includes('g') ? regex.flags : regex.flags + 'g';
    const clone = new RegExp(regex.source, flags);
    let match: RegExpExecArray | null;

    while ((match = clone.exec(prompt)) !== null) {
      const targetValue = match[groupIndex];
      if (!targetValue) continue;

      const fullMatchStart = match.index;
      const offsetInFull = match[0].indexOf(targetValue);
      const startIndex = fullMatchStart + (offsetInFull >= 0 ? offsetInFull : 0);
      const endIndex = startIndex + targetValue.length;

      candidates.push({
        type,
        value: targetValue,
        startIndex,
        endIndex,
        priority,
      });
    }
  };

  // 1. API Keys (sk-..., pk-..., ghp_..., AIza..., AKIA..., or key=value patterns)
  addMatches(
    'API_KEY',
    /\b(?:sk-(?:live|test|proj)?-?[a-zA-Z0-9_-]{5,}|pk_(?:live|test)_[a-zA-Z0-9]{6,}|ghp_[a-zA-Z0-9]{10,}|AIza[0-9A-Za-z-_]{15,}|AKIA[0-9A-Z]{12,}|xox[baprs]-[a-zA-Z0-9-]{8,})\b/g,
    100,
    0
  );
  addMatches(
    'API_KEY',
    /(?:api[_-]?key|apikey|secret[_-]?key|access[_-]?token)\s*(?:is|=|:)\s*['"]?([a-zA-Z0-9_\-@#$%.]{5,})['"]?/gi,
    99,
    1
  );

  // 2. Passwords (password=..., passwd: ..., "My password is ...")
  addMatches(
    'PASSWORD',
    /(?:password|passwd|pwd|passcode)\s*(?:is|=|:)\s*['"]?([^\s'",;]+)['"]?(?=[.,;!?]?\s|[.,;!?]?$)/gi,
    95,
    1
  );

  // 3. Email Addresses
  addMatches(
    'EMAIL',
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    90,
    0
  );

  // 4. Credit / Debit Card Numbers (13-19 digits, typically 16 digits with spaces or dashes)
  addMatches(
    'CREDIT_CARD',
    /\b(?:4\d{3}|5[1-5]\d{2}|2\d{3}|3[47]\d{2}|6(?:011|5\d{2}))[- ]?\d{4}[- ]?\d{4}[- ]?\d{3,4}\b/g,
    88,
    0
  );

  // 5. Indian PAN Numbers (5 uppercase letters + 4 digits + 1 uppercase letter, e.g., ABCDE1234F)
  addMatches('PAN', /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g, 86, 0);

  // 6. Indian Aadhaar Numbers (12 digits formatted as XXXX XXXX XXXX or XXXX-XXXX-XXXX)
  addMatches(
    'AADHAAR',
    /\b[2-9]\d{3}[ -]\d{4}[ -]\d{4}\b/g,
    84,
    0
  );
  addMatches(
    'AADHAAR',
    /(?:aadhaar|aadhar|uidai)(?:\s+number|\s+no\.?|\s+id)?\s*(?:is|=|:)?\s*(\b[2-9]\d{11}\b)/gi,
    85,
    1
  );

  // 7. Phone Numbers (supports +91 9876543210, +1-555-234-5678, and 10-digit Indian mobile numbers)
  addMatches(
    'PHONE',
    /(?:\+\d{1,3}[-.\s]?)?(?:\(\d{2,4}\)[-.\s]?)?\b[6-9]\d{9}\b/g,
    80,
    0
  );
  addMatches(
    'PHONE',
    /\+\d{1,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g,
    79,
    0
  );

  // 8. IPv4 Addresses
  addMatches(
    'IP_ADDRESS',
    /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
    78,
    0
  );

  // 9. URLs
  addMatches(
    'URL',
    /\bhttps?:\/\/[^\s/$.?#].[^\s'",)]*/gi,
    75,
    0
  );

  // 10. Financial Identifiers (IBAN, Bank Account, Salary/Routing patterns)
  addMatches(
    'FINANCIAL',
    /\b(?:[A-Z]{2}\d{2}[A-Z0-9]{11,30}|(?:account\s*(?:no|number|#)|routing\s*number|iban|swift)\s*(?:is|=|:)?\s*[A-Z0-9-]{6,20})\b/gi,
    72,
    0
  );

  // 11. Health / Medical Information
  addMatches(
    'HEALTH',
    /\b(?:(?:diagnosis|condition|prescription|medication|medical\s+history)\s*(?:is|:)\s*[^.,;\n]+|Type\s+[12]\s+Diabetes(?:\s+Mellitus)?|hypertension|Metformin\s+\d+mg|HIV\s+positive|chemotherapy\s+regimen|patient\s+id\s*[:=]?\s*[A-Z0-9-]+)\b/gi,
    70,
    0
  );

  // 12. Physical Addresses
  addMatches(
    'ADDRESS',
    /\b\d{1,5}\s+[A-Za-z0-9.\s]{3,25}\s+(?:Road|Rd|Street|St|Avenue|Ave|Boulevard|Blvd|Lane|Ln|Drive|Dr|Nagar|Marg)(?:,\s*[A-Za-z\s]+)?(?:\s+\d{5,6})?\b/gi,
    68,
    0
  );

  // 13. Person Names (Contextual phrases + configurable dictionary)
  if (settings.enableContextAwareNames) {
    addMatches(
      'PERSON',
      /(?:my\s+name\s+is|i\s+am|i'm|patient\s+name\s*:|name\s*:|client\s+name\s*:)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/gi,
      65,
      1
    );
  }

  for (const dictName of settings.customCommonNames) {
    if (!dictName.trim()) continue;
    const escaped = dictName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    addMatches('PERSON', new RegExp(`\\b${escaped}\\b`, 'gi'), 64, 0);
  }

  // 14. Organizational Confidential Keywords
  for (const orgKeyword of settings.customSensitiveKeywords) {
    if (!orgKeyword.trim()) continue;
    const escaped = orgKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    addMatches('ORGANIZATION', new RegExp(`\\b${escaped}\\b`, 'gi'), 62, 0);
  }
  addMatches(
    'ORGANIZATION',
    /\b(?:Project\s+[A-Z][a-zA-Z0-9_-]+|INTERNAL[_-]ONLY|STRICTLY[_-]CONFIDENTIAL)\b/g,
    60,
    0
  );

  // Resolve overlapping spans: sort by priority DESC, then length DESC, then startIndex ASC
  candidates.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    const lenDiff = b.endIndex - b.startIndex - (a.endIndex - a.startIndex);
    if (lenDiff !== 0) return lenDiff;
    return a.startIndex - b.startIndex;
  });

  const accepted: RawCandidateMatch[] = [];
  for (const cand of candidates) {
    const overlaps = accepted.some(
      (existing) =>
        cand.startIndex < existing.endIndex && cand.endIndex > existing.startIndex
    );
    if (!overlaps) {
      accepted.push(cand);
    }
  }

  // Sort chronologically by appearance in prompt
  accepted.sort((a, b) => a.startIndex - b.startIndex);

  const detectedEntities: DetectedEntity[] = accepted.map((item, idx) => {
    const rule = policyMap.get(item.type)!;
    const replacement = computeReplacement(
      item.type,
      item.value,
      rule.action,
      idx + 1,
      settings.autoTokenizeIdentifiers
    );

    return {
      id: `entity-${idx + 1}-${item.startIndex}`,
      type: item.type,
      label: rule.label,
      category: rule.category,
      value: item.value,
      maskedPreview: createMaskedPreview(item.value, item.type),
      startIndex: item.startIndex,
      endIndex: item.endIndex,
      riskScore: rule.baseWeight,
      riskLevel: getEntityRiskLevel(rule.baseWeight),
      policyName: `${rule.policyLevel} ${rule.category} Policy`,
      recommendedAction: rule.action,
      replacement,
    };
  });

  // Build Safe Prompt by replacing spans from right to left
  let safePrompt = prompt;
  const reverseEntities = [...detectedEntities].sort(
    (a, b) => b.startIndex - a.startIndex
  );
  for (const ent of reverseEntities) {
    safePrompt =
      safePrompt.slice(0, ent.startIndex) +
      ent.replacement +
      safePrompt.slice(ent.endIndex);
  }

  // Calculate Transparent Risk Score & Contributions
  // Each unique entity type adds its configured baseWeight, plus +5 for additional instances of the same type
  const groupedByType = new Map<EntityType, DetectedEntity[]>();
  for (const ent of detectedEntities) {
    const list = groupedByType.get(ent.type) || [];
    list.push(ent);
    groupedByType.set(ent.type, list);
  }

  const riskContributions: RiskContribution[] = [];
  let rawTotalScore = 0;

  groupedByType.forEach((list, type) => {
    const rule = policyMap.get(type)!;
    if (rule.action === 'Allow') return;

    const firstInstanceScore = rule.baseWeight;
    const extraInstancesScore = (list.length - 1) * Math.min(10, Math.round(rule.baseWeight / 3));
    const points = firstInstanceScore + extraInstancesScore;
    rawTotalScore += points;

    riskContributions.push({
      entityType: type,
      label: rule.label,
      count: list.length,
      points,
      reason:
        list.length > 1
          ? `${rule.label} detected (${list.length} instances)`
          : `${rule.label} detected`,
    });
  });

  // Sort contributions by highest points first
  riskContributions.sort((a, b) => b.points - a.points);

  const riskScore = Math.min(100, rawTotalScore);
  const riskLevel = getRiskLevelFromScore(riskScore);

  // Determine Overall Action & Status
  const hasBlockAction = detectedEntities.some(
    (e) => e.recommendedAction === 'Block'
  );
  const hasSanitizeAction = detectedEntities.some((e) =>
    ['Mask', 'Redact', 'Anonymize', 'Tokenize'].includes(e.recommendedAction)
  );
  const hasWarnAction = detectedEntities.some(
    (e) => e.recommendedAction === 'Warn'
  );

  let overallStatus: OverallStatus = 'ALLOWED';
  let recommendedActionSummary = 'ALLOW';

  if (hasBlockAction) {
    overallStatus = 'BLOCKED';
    recommendedActionSummary = hasSanitizeAction ? 'BLOCK & SANITIZE' : 'BLOCK';
  } else if (hasSanitizeAction) {
    overallStatus = 'SANITIZED';
    recommendedActionSummary = 'SANITIZE';
  } else if (hasWarnAction) {
    overallStatus = 'WARNED';
    recommendedActionSummary = 'WARN & REVIEW';
  }

  // Build Explainable Privacy Analysis Summary
  let explanationSummary =
    'No sensitive data or policy violations were detected. This prompt is safe to forward to an AI model.';

  if (hasBlockAction) {
    const blockedTypes = Array.from(
      new Set(
        detectedEntities
          .filter((e) => e.recommendedAction === 'Block')
          .map((e) => e.label)
      )
    );
    explanationSummary = `Critical violation: ${blockedTypes.join(
      ' and '
    )} detected in the prompt. According to your active Strict Privacy Policy, raw credentials and authentication secrets cannot be forwarded to external AI systems. PrivAI Guard blocked direct transmission and generated a redacted safe version.`;
  } else if (hasSanitizeAction) {
    const sanitizedTypes = Array.from(
      new Set(detectedEntities.map((e) => e.label))
    );
    explanationSummary = `Detected ${sanitizedTypes.join(
      ', '
    )} in the prompt. According to active protection policies, these fields were automatically sanitized into privacy-preserving placeholders before AI processing.`;
  } else if (hasWarnAction) {
    explanationSummary =
      'Low-to-moderate sensitivity items were flagged for review under permissive warning policy.';
  }

  const categoriesDetected = Array.from(
    new Set(detectedEntities.map((e) => e.category))
  ) as SensitiveCategory[];

  const entityLabelsDetected = Array.from(
    new Set(detectedEntities.map((e) => e.label))
  );

  return {
    scanId: `SCAN-${existingScanCount + 1}`,
    timestamp: new Date().toISOString(),
    originalLength: prompt.length,
    safePrompt,
    riskScore,
    riskLevel,
    overallStatus,
    recommendedActionSummary,
    explanationSummary,
    detectedEntities,
    riskContributions,
    categoriesDetected,
    entityLabelsDetected,
  };
}

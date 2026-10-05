import React from 'react';
import { DetectedEntity, EntityType } from '../types/privacy';

interface HighlightedPromptProps {
  prompt: string;
  entities: DetectedEntity[];
}

export function getEntityColorClasses(type: EntityType): {
  bg: string;
  border: string;
  text: string;
  labelText: string;
} {
  switch (type) {
    case 'API_KEY':
    case 'PASSWORD':
      return {
        bg: 'bg-red-500/15',
        border: 'border-b-2 border-red-500',
        text: 'text-red-200',
        labelText: 'text-red-400',
      };
    case 'CREDIT_CARD':
    case 'FINANCIAL':
    case 'PAN':
    case 'AADHAAR':
      return {
        bg: 'bg-orange-500/15',
        border: 'border-b-2 border-orange-500',
        text: 'text-orange-200',
        labelText: 'text-orange-400',
      };
    case 'HEALTH':
      return {
        bg: 'bg-rose-500/15',
        border: 'border-b-2 border-rose-400',
        text: 'text-rose-200',
        labelText: 'text-rose-400',
      };
    case 'EMAIL':
    case 'PHONE':
    case 'ADDRESS':
    case 'IP_ADDRESS':
      return {
        bg: 'bg-amber-500/15',
        border: 'border-b-2 border-amber-400',
        text: 'text-amber-100',
        labelText: 'text-amber-300',
      };
    case 'PERSON':
    case 'ORGANIZATION':
    case 'URL':
    default:
      return {
        bg: 'bg-indigo-500/15',
        border: 'border-b-2 border-indigo-400',
        text: 'text-indigo-100',
        labelText: 'text-indigo-300',
      };
  }
}

export function getShortTagLabel(type: EntityType): string {
  switch (type) {
    case 'PERSON':
      return 'PERSON';
    case 'EMAIL':
      return 'EMAIL';
    case 'PHONE':
      return 'PHONE';
    case 'API_KEY':
      return 'API KEY';
    case 'PASSWORD':
      return 'PASSWORD';
    case 'CREDIT_CARD':
      return 'CREDIT CARD';
    case 'ADDRESS':
      return 'ADDRESS';
    case 'HEALTH':
      return 'HEALTH';
    case 'FINANCIAL':
      return 'FINANCIAL';
    case 'ORGANIZATION':
      return 'ORGANIZATION';
    case 'PAN':
      return 'PAN';
    case 'AADHAAR':
      return 'AADHAAR';
    case 'IP_ADDRESS':
      return 'IP ADDRESS';
    case 'URL':
      return 'URL';
    default:
      return type;
  }
}

export const HighlightedPrompt: React.FC<HighlightedPromptProps> = ({
  prompt,
  entities,
}) => {
  if (!prompt) {
    return (
      <p className="text-slate-500 italic text-sm">
        No prompt text available to display.
      </p>
    );
  }

  if (entities.length === 0) {
    return (
      <div className="text-slate-200 leading-relaxed whitespace-pre-wrap text-sm font-sans">
        {prompt}
      </div>
    );
  }

  const sorted = [...entities].sort((a, b) => a.startIndex - b.startIndex);
  const segments: React.ReactNode[] = [];
  let cursor = 0;

  sorted.forEach((entity, idx) => {
    if (entity.startIndex > cursor) {
      segments.push(
        <span key={`text-${idx}`}>
          {prompt.slice(cursor, entity.startIndex)}
        </span>
      );
    }

    const styles = getEntityColorClasses(entity.type);
    const tagLabel = getShortTagLabel(entity.type);

    segments.push(
      <mark
        key={entity.id}
        className={`inline-flex items-baseline gap-1.5 px-1.5 py-0.5 mx-0.5 rounded-sm ${styles.bg} ${styles.border} ${styles.text} font-mono text-xs transition-colors`}
        title={`${entity.category} · Action: ${entity.recommendedAction} (+${entity.riskScore} Risk)`}
      >
        <span className="font-medium">{entity.value}</span>
        <span
          className={`text-[10px] font-semibold tracking-wider uppercase ${styles.labelText} select-none`}
        >
          [{tagLabel}]
        </span>
      </mark>
    );

    cursor = entity.endIndex;
  });

  if (cursor < prompt.length) {
    segments.push(<span key="text-tail">{prompt.slice(cursor)}</span>);
  }

  return (
    <div className="text-slate-200 leading-7 whitespace-pre-wrap text-sm">
      {segments}
    </div>
  );
};

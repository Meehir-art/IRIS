import React from 'react';
import { RiskLevel } from '../types/privacy';
import { getRiskLevelFromScore } from '../services/privacyEngine';
import { ShieldAlert, ShieldCheck, AlertTriangle, Flame } from 'lucide-react';

interface RiskMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showScaleLegend?: boolean;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({
  score,
  size = 'md',
  showScaleLegend = true,
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const riskLevel: RiskLevel = getRiskLevelFromScore(clampedScore);

  const getColors = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return {
          stroke: '#ef4444',
          text: 'text-red-400',
          bgBar: 'bg-red-500',
          label: 'CRITICAL RISK',
          Icon: Flame,
        };
      case 'HIGH':
        return {
          stroke: '#f97316',
          text: 'text-orange-400',
          bgBar: 'bg-orange-500',
          label: 'HIGH RISK',
          Icon: ShieldAlert,
        };
      case 'MEDIUM':
        return {
          stroke: '#eab308',
          text: 'text-amber-400',
          bgBar: 'bg-amber-500',
          label: 'MEDIUM RISK',
          Icon: AlertTriangle,
        };
      case 'LOW':
      default:
        return {
          stroke: '#10b981',
          text: 'text-emerald-400',
          bgBar: 'bg-emerald-500',
          label: 'LOW RISK',
          Icon: ShieldCheck,
        };
    }
  };

  const config = getColors(riskLevel);
  const StatusIcon = config.Icon;

  const radius = size === 'lg' ? 68 : size === 'md' ? 54 : 38;
  const strokeWidth = size === 'lg' ? 10 : size === 'md' ? 8 : 6;
  const svgDim = (radius + strokeWidth) * 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        <svg
          width={svgDim}
          height={svgDim}
          viewBox={`0 0 ${svgDim} ${svgDim}`}
          className="-rotate-90 transform"
        >
          {/* Background Track */}
          <circle
            cx={svgDim / 2}
            cy={svgDim / 2}
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />
          {/* Animated Value Arc */}
          <circle
            cx={svgDim / 2}
            cy={svgDim / 2}
            r={radius}
            fill="transparent"
            stroke={config.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className={`font-mono font-semibold tabular-nums tracking-tight text-slate-100 ${
              size === 'lg'
                ? 'text-3xl'
                : size === 'md'
                ? 'text-2xl'
                : 'text-lg'
            }`}
          >
            {clampedScore}
            <span className="text-xs text-slate-500 font-normal">/100</span>
          </span>
          <div className={`flex items-center gap-1 mt-0.5 ${config.text}`}>
            <StatusIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-semibold tracking-wider">
              {riskLevel}
            </span>
          </div>
        </div>
      </div>

      {showScaleLegend && (
        <div className="w-full mt-5 space-y-2">
          {/* Segmented Horizontal Bar */}
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-slate-800">
            <div className="h-full bg-emerald-500/80 rounded-l-full" style={{ width: '29%' }} />
            <div className="h-full bg-amber-500/80" style={{ width: '30%' }} />
            <div className="h-full bg-orange-500/80" style={{ width: '20%' }} />
            <div className="h-full bg-red-500/80 rounded-r-full" style={{ width: '21%' }} />
          </div>
          <div className="grid grid-cols-4 text-[11px] text-slate-400 font-mono tabular-nums pt-1">
            <div>
              <span className="text-emerald-400 font-medium">0–29</span> Low
            </div>
            <div>
              <span className="text-amber-400 font-medium">30–59</span> Med
            </div>
            <div>
              <span className="text-orange-400 font-medium">60–79</span> High
            </div>
            <div className="text-right">
              <span className="text-red-400 font-medium">80–100</span> Crit
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

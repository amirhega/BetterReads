import { useState } from 'react';
import clsx from 'clsx';

interface DimensionRatingProps {
  label: string;
  description: string;
  value: number | null;
  onChange?: (value: number) => void;
  readOnly?: boolean;
}

const LEVELS = [
  { value: 2, label: '1' },
  { value: 4, label: '2' },
  { value: 6, label: '3' },
  { value: 8, label: '4' },
  { value: 10, label: '5' },
];

function getColor(value: number): string {
  if (value <= 2) return 'bg-red-400';
  if (value <= 4) return 'bg-orange-400';
  if (value <= 6) return 'bg-yellow-400';
  if (value <= 8) return 'bg-lime-400';
  return 'bg-emerald-400';
}

export function DimensionRating({
  label,
  description,
  value,
  onChange,
  readOnly = false,
}: DimensionRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const activeValue = hovered ?? value;

  return (
    <div className="flex items-center gap-3">
      <div className="w-24 shrink-0">
        <span className="text-text-primary text-sm font-medium">{label}</span>
        {!readOnly && (
          <p className="text-text-muted text-[10px] leading-tight">{description}</p>
        )}
      </div>
      <div
        className="flex gap-1.5 items-center"
        onMouseLeave={() => !readOnly && setHovered(null)}
      >
        {LEVELS.map((level) => {
          const isActive = activeValue !== null && activeValue >= level.value;
          return (
            <button
              key={level.value}
              type="button"
              disabled={readOnly}
              className={clsx(
                'w-6 h-6 rounded-full transition-all text-[10px] font-bold',
                readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
                isActive
                  ? `${getColor(activeValue!)} text-surface shadow-sm`
                  : 'bg-surface-overlay text-text-muted'
              )}
              onMouseEnter={() => !readOnly && setHovered(level.value)}
              onClick={() => onChange?.(level.value)}
            >
              {level.label}
            </button>
          );
        })}
      </div>
      {value !== null && readOnly && (
        <span className="text-text-muted text-xs">{value / 2}/5</span>
      )}
    </div>
  );
}

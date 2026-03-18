import { useState } from 'react';
import clsx from 'clsx';

interface StarRatingProps {
  value: number | null;
  onChange?: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
}

export function StarRating({
  value,
  onChange,
  max = 5,
  size = 'md',
  readOnly = false,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  // We use half-star precision: rating 1-10 maps to 0.5-5.0 stars
  const displayValue = value ? value / 2 : 0;
  const hoveredValue = hovered ? hovered / 2 : null;
  const activeValue = hoveredValue ?? displayValue;

  const sizeClass = {
    sm: 'text-sm gap-0.5',
    md: 'text-xl gap-0.5',
    lg: 'text-2xl gap-1',
  }[size];

  return (
    <div
      className={clsx('flex items-center', sizeClass)}
      onMouseLeave={() => !readOnly && setHovered(null)}
    >
      {Array.from({ length: max }, (_, i) => {
        const starIndex = i + 1;
        const filled = activeValue >= starIndex;
        const half = !filled && activeValue >= starIndex - 0.5;

        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            className={clsx(
              'transition-colors',
              readOnly ? 'cursor-default' : 'cursor-pointer',
              filled || half ? 'text-accent-tertiary' : 'text-surface-overlay'
            )}
            onMouseEnter={() => !readOnly && setHovered(starIndex * 2)}
            onClick={() => onChange?.(starIndex * 2)}
          >
            {half ? '\u00BD' : '\u2605'}
          </button>
        );
      })}
      {value !== null && (
        <span className="text-text-muted text-xs ml-1">
          {displayValue.toFixed(1)}
        </span>
      )}
    </div>
  );
}

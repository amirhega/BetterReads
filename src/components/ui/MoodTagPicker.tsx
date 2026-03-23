import clsx from 'clsx';
import { MOOD_OPTIONS } from '@/types/book';

interface MoodTagPickerProps {
  selected: string[];
  onChange?: (tags: string[]) => void;
  readOnly?: boolean;
}

export function MoodTagPicker({ selected, onChange, readOnly = false }: MoodTagPickerProps) {
  function toggle(tag: string) {
    if (readOnly || !onChange) return;
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  }

  const tags = readOnly ? selected : [...MOOD_OPTIONS];

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        const isSelected = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            disabled={readOnly}
            onClick={() => toggle(tag)}
            className={clsx(
              'px-2.5 py-1 rounded-full text-xs font-medium transition-all',
              readOnly ? 'cursor-default' : 'cursor-pointer',
              isSelected
                ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/40'
                : 'bg-surface-overlay text-text-muted border border-transparent hover:border-surface-overlay hover:text-text-secondary'
            )}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}

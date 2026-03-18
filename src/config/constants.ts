export const OPEN_LIBRARY_BASE = 'https://openlibrary.org';
export const OPEN_LIBRARY_COVERS = 'https://covers.openlibrary.org';

export const MOOD_TAGS = [
  'cozy', 'thought-provoking', 'escapist', 'intense',
  'melancholic', 'uplifting', 'suspenseful', 'romantic',
  'funny', 'dark', 'nostalgic', 'adventurous',
  'calming', 'mind-bending', 'heartbreaking', 'inspiring',
] as const;

export const READING_FORMATS = [
  { value: 'physical', label: 'Physical Book', icon: '📖' },
  { value: 'ebook', label: 'E-Book', icon: '📱' },
  { value: 'audiobook', label: 'Audiobook', icon: '🎧' },
] as const;

export const SHELF_LABELS: Record<string, string> = {
  want_to_read: 'Want to Read',
  currently_reading: 'Currently Reading',
  read: 'Read',
};

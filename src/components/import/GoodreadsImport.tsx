import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { searchBooks } from '@/lib/openLibrary/search';
import type { ShelfStatus } from '@/types/book';
import { useQueryClient } from '@tanstack/react-query';

interface GoodreadsRow {
  title: string;
  author: string;
  isbn: string;
  isbn13: string;
  myRating: number;
  exclusiveShelf: string;
  dateRead: string;
  dateAdded: string;
}

function parseCSV(text: string): GoodreadsRow[] {
  const lines = text.split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.replace(/"/g, '').trim());

  const getIdx = (name: string) =>
    headers.findIndex((h) => h.toLowerCase().includes(name.toLowerCase()));

  const titleIdx = getIdx('Title');
  const authorIdx = getIdx('Author');
  const isbnIdx = getIdx('ISBN');
  const isbn13Idx = getIdx('ISBN13');
  const ratingIdx = getIdx('My Rating');
  const shelfIdx = getIdx('Exclusive Shelf');
  const dateReadIdx = getIdx('Date Read');
  const dateAddedIdx = getIdx('Date Added');

  const rows: GoodreadsRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parse handling quoted fields
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.trim());

    const title = fields[titleIdx] ?? '';
    if (!title) continue;

    rows.push({
      title,
      author: fields[authorIdx] ?? '',
      isbn: (fields[isbnIdx] ?? '').replace(/[="]/g, ''),
      isbn13: (fields[isbn13Idx] ?? '').replace(/[="]/g, ''),
      myRating: parseInt(fields[ratingIdx] ?? '0', 10) || 0,
      exclusiveShelf: fields[shelfIdx] ?? '',
      dateRead: fields[dateReadIdx] ?? '',
      dateAdded: fields[dateAddedIdx] ?? '',
    });
  }

  return rows;
}

function mapShelf(grShelf: string): ShelfStatus {
  switch (grShelf) {
    case 'currently-reading':
      return 'currently_reading';
    case 'read':
      return 'read';
    default:
      return 'want_to_read';
  }
}

export function GoodreadsImport() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'importing' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0, imported: 0, skipped: 0 });
  const [errorMsg, setErrorMsg] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setStatus('parsing');
    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      setStatus('error');
      setErrorMsg('No valid rows found in CSV. Make sure this is a Goodreads export.');
      return;
    }

    setStatus('importing');
    setProgress({ current: 0, total: rows.length, imported: 0, skipped: 0 });

    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        // Search for the book on Open Library
        const searchQuery = `${row.title} ${row.author}`.trim();
        const results = await searchBooks(searchQuery, 1, 1);

        if (results.results.length === 0) {
          skipped++;
          setProgress({ current: i + 1, total: rows.length, imported, skipped });
          continue;
        }

        const match = results.results[0];

        // Upsert book to DB
        const { data: book } = await supabase
          .from('books')
          .upsert(
            {
              ol_work_key: match.ol_work_key,
              title: match.title,
              author_names: match.author_names,
              cover_i: match.cover_i,
              first_publish_year: match.first_publish_year,
              subjects: match.subjects,
              fetched_at: new Date().toISOString(),
            },
            { onConflict: 'ol_work_key' }
          )
          .select()
          .single();

        if (!book) {
          skipped++;
          setProgress({ current: i + 1, total: rows.length, imported, skipped });
          continue;
        }

        const shelf = mapShelf(row.exclusiveShelf);

        // Add to library
        await supabase.from('library_entries').upsert(
          {
            user_id: user.id,
            book_id: book.id,
            shelf,
            started_at: row.dateRead || null,
            finished_at: shelf === 'read' ? row.dateRead || null : null,
          },
          { onConflict: 'user_id,book_id' }
        );

        // Add review if rated
        if (row.myRating > 0) {
          await supabase.from('reviews').upsert(
            {
              user_id: user.id,
              book_id: book.id,
              star_rating: row.myRating * 2, // Goodreads 1-5 -> our 2-10
            },
            { onConflict: 'user_id,book_id' }
          );
        }

        imported++;
      } catch {
        skipped++;
      }

      setProgress({ current: i + 1, total: rows.length, imported, skipped });

      // Rate limit: small delay between API calls
      if (i < rows.length - 1) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    setStatus('done');
    queryClient.invalidateQueries({ queryKey: ['library'] });
    queryClient.invalidateQueries({ queryKey: ['review'] });
    queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
  }

  return (
    <div className="bg-surface-raised border border-surface-overlay rounded-xl p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold font-display text-text-primary">
          Import from Goodreads
        </h2>
        <p className="text-text-muted text-sm mt-1">
          Export your Goodreads library as CSV, then upload it here.
          Go to Goodreads &rarr; My Books &rarr; Import/Export &rarr; Export Library.
        </p>
      </div>

      {status === 'idle' && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="bg-accent-primary text-surface px-6 py-2 rounded-lg font-medium hover:bg-accent-primary/90 transition-colors"
          >
            Choose CSV File
          </button>
        </>
      )}

      {status === 'parsing' && (
        <p className="text-text-secondary text-sm">Parsing CSV...</p>
      )}

      {status === 'importing' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">
              Processing {progress.current} of {progress.total}...
            </span>
            <span className="text-text-muted">
              {progress.imported} imported, {progress.skipped} skipped
            </span>
          </div>
          <div className="h-2 bg-surface-overlay rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-primary rounded-full transition-all"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {status === 'done' && (
        <div className="space-y-2">
          <p className="text-accent-primary font-medium text-sm">Import complete!</p>
          <p className="text-text-secondary text-sm">
            {progress.imported} books imported, {progress.skipped} skipped.
          </p>
          <button
            onClick={() => {
              setStatus('idle');
              setProgress({ current: 0, total: 0, imported: 0, skipped: 0 });
            }}
            className="text-accent-secondary text-sm hover:underline"
          >
            Import another file
          </button>
        </div>
      )}

      {status === 'error' && (
        <div>
          <p className="text-accent-warm text-sm">{errorMsg}</p>
          <button
            onClick={() => setStatus('idle')}
            className="text-accent-secondary text-sm hover:underline mt-2"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

import { OPEN_LIBRARY_BASE } from '@/config/constants';

const USER_AGENT = 'BetterReads/1.0 (https://github.com/betterreads)';

export async function olFetch<T>(path: string): Promise<T> {
  const url = `${OPEN_LIBRARY_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
    },
  });

  if (!res.ok) {
    throw new Error(`Open Library API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

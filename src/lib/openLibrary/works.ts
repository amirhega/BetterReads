import type { OLWork, OLAuthor } from './types';
import { olFetch } from './client';

function extractDescription(desc: OLWork['description']): string | null {
  if (!desc) return null;
  if (typeof desc === 'string') return desc;
  return desc.value ?? null;
}

export async function getWork(olWorkKey: string): Promise<{
  work: OLWork;
  description: string | null;
}> {
  const work = await olFetch<OLWork>(`${olWorkKey}.json`);
  return {
    work,
    description: extractDescription(work.description),
  };
}

export async function getAuthor(olAuthorKey: string): Promise<OLAuthor> {
  return olFetch<OLAuthor>(`/authors/${olAuthorKey}.json`);
}

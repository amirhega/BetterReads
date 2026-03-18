import { OPEN_LIBRARY_COVERS } from '@/config/constants';

export type CoverSize = 'S' | 'M' | 'L';

export function getCoverUrl(coverId: number, size: CoverSize = 'M'): string {
  return `${OPEN_LIBRARY_COVERS}/b/id/${coverId}-${size}.jpg`;
}

export function getCoverUrlByIsbn(isbn: string, size: CoverSize = 'M'): string {
  return `${OPEN_LIBRARY_COVERS}/b/isbn/${isbn}-${size}.jpg`;
}

export function getCoverUrlByOlid(olid: string, size: CoverSize = 'M'): string {
  return `${OPEN_LIBRARY_COVERS}/b/olid/${olid}-${size}.jpg`;
}

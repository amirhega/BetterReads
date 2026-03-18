import type { RankedBook } from '@/types/ranking';

const BASE_SPACING = 1000;
const MIN_GAP = 0.001;

export function computePosition(
  rankedList: RankedBook[],
  insertionIndex: number
): number {
  if (rankedList.length === 0) return BASE_SPACING;
  if (insertionIndex === 0) return rankedList[0].rank_position / 2;
  if (insertionIndex >= rankedList.length) {
    return rankedList[rankedList.length - 1].rank_position + BASE_SPACING;
  }
  const before = rankedList[insertionIndex - 1].rank_position;
  const after = rankedList[insertionIndex].rank_position;
  return (before + after) / 2;
}

export function needsNormalization(rankedList: RankedBook[]): boolean {
  for (let i = 1; i < rankedList.length; i++) {
    if (rankedList[i].rank_position - rankedList[i - 1].rank_position < MIN_GAP) {
      return true;
    }
  }
  return false;
}

export function normalize(rankedList: RankedBook[]): RankedBook[] {
  return rankedList.map((item, i) => ({
    ...item,
    rank_position: (i + 1) * BASE_SPACING,
  }));
}

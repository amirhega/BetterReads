import type { RankedBook, ComparisonPair, ComparisonChoice } from '@/types/ranking';

export function* binaryInsertionSort(
  rankedList: RankedBook[],
  newBookId: string
): Generator<ComparisonPair, number, ComparisonChoice> {
  let low = 0;
  let high = rankedList.length;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const choice: ComparisonChoice = yield {
      bookA: newBookId,
      bookB: rankedList[mid].book_id,
    };
    if (choice === 'a') {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  return low;
}

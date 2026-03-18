export interface RankedBook {
  book_id: string;
  rank_position: number;
}

export interface ComparisonPair {
  bookA: string;
  bookB: string;
}

export type ComparisonChoice = 'a' | 'b';

export type RankingFlowState = 'idle' | 'comparing' | 'complete';

export interface Word {
  id?: number;
  word: string;
  definition: string;
  translation: string;
  meaning?: string;
  examples?: string[];
}

export interface Unit {
  id: number;
  title: string;
  words: Word[];
}

export interface Exercise {
  type: 'sentence' | 'multiple-choice' | 'matching';
  word: Word;
  question: string;
  options?: string[];
  correctAnswer: string;
} 
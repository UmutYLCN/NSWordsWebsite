export interface Word {
  id: number;
  word: string;
  title?: string;
  definition: string;
  translation: string;
  translations?: string[];
  meaning: string;
  examples: string[];
  example?: string;
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
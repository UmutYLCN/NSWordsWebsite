import React, { useState, useEffect, useCallback } from 'react';
import { Unit } from '../../types';
import { motion } from 'framer-motion';

interface Props {
  unit: Unit;
  onComplete: () => void;
}

interface MatchItem {
  id: number;
  word: string;
  translation: string;
  isMatched: boolean;
}

const Matching: React.FC<Props> = ({ unit, onComplete }) => {
  const [words, setWords] = useState<MatchItem[]>([]);
  const [selectedWord, setSelectedWord] = useState<MatchItem | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  useEffect(() => {
    // Reset state when unit changes
    setSelectedWord(null);
    setMatchedPairs(0);
    setIsProcessing(false);

    // Create match items
    const shuffledWords = shuffleArray(unit.words.slice(0, 6));
    const items: MatchItem[] = shuffledWords.map((word, index) => ({
      id: index,
      word: word.word,
      translation: word.translation,
      isMatched: false
    }));

    // Set shuffled words
    setWords(shuffleArray([...items]));
  }, [unit, shuffleArray]);

  const handleWordClick = (word: MatchItem) => {
    if (word.isMatched || isProcessing) return;

    if (!selectedWord) {
      setSelectedWord(word);
    } else {
      if (selectedWord.id === word.id) {
        setSelectedWord(null);
        return;
      }

      setIsProcessing(true);
      const isMatch = 
        (selectedWord.word === word.translation) || 
        (selectedWord.translation === word.word);

      if (isMatch) {
        const updatedWords = words.map(w => 
          w.id === selectedWord.id || w.id === word.id
            ? { ...w, isMatched: true }
            : w
        );
        setWords(updatedWords);
        const newMatchedPairs = matchedPairs + 1;
        setMatchedPairs(newMatchedPairs);

        if (newMatchedPairs === unit.words.slice(0, 6).length) {
          setTimeout(onComplete, 1000);
        }
      }

      setTimeout(() => {
        setSelectedWord(null);
        setIsProcessing(false);
      }, 500);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">
          Eşleştirme
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Kelimeleri anlamlarıyla eşleştirin
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {words.map((word) => (
          <motion.button
            key={`${word.id}-${word.word}-${word.translation}`}
            onClick={() => handleWordClick(word)}
            className={`p-6 rounded-xl text-lg font-medium text-center transition-all ${
              word.isMatched
                ? 'bg-green-500 text-white'
                : selectedWord?.id === word.id
                ? 'bg-blue-500 text-white ring-2 ring-blue-500'
                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white shadow-lg hover:shadow-xl'
            }`}
            disabled={word.isMatched || isProcessing}
            whileHover={!word.isMatched && !isProcessing ? { scale: 1.03 } : {}}
            whileTap={!word.isMatched && !isProcessing ? { scale: 0.97 } : {}}
          >
            {word.word || word.translation}
          </motion.button>
        ))}
      </div>

      <div className="text-center text-lg text-gray-600 dark:text-gray-400">
        {matchedPairs} / {unit.words.slice(0, 6).length} eşleştirildi
      </div>
    </div>
  );
};

export default Matching;

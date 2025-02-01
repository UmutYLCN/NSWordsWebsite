import React, { useState, useMemo } from 'react';
import { Unit } from '../../types';
import { motion } from 'framer-motion';

interface Props {
  unit: Unit;
  onComplete: () => void;
}

const MultipleChoice: React.FC<Props> = ({ unit, onComplete }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentWord = unit.words[currentWordIndex];
  
  const generateOptions = (correctAnswer: string, words: any[]): string[] => {
    const options = [correctAnswer];
    const otherWords = words.filter(w => w.translation !== correctAnswer);
    
    while (options.length < 4 && otherWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherWords.length);
      options.push(otherWords[randomIndex].translation);
      otherWords.splice(randomIndex, 1);
    }

    return shuffleArray([...options]);
  };

  const shuffleArray = (array: any[]): any[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Use useMemo to keep options stable until currentWordIndex changes
  const options = useMemo(
    () => generateOptions(currentWord.translation, unit.words),
    [currentWordIndex, currentWord.translation, unit.words]
  );

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentWord.translation;
    setIsCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      if (currentWordIndex < unit.words.length - 1) {
        setCurrentWordIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        onComplete();
      }
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">
          {currentWord.word}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Doğru çeviriyi seçin
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {options.map((option, index) => (
          <motion.button
            key={option}
            onClick={() => handleAnswerSelect(option)}
            className={`p-6 rounded-xl text-lg font-medium text-center transition-all ${
              showResult
                ? option === currentWord.translation
                  ? 'bg-green-500 text-white'
                  : option === selectedAnswer
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white shadow-lg hover:shadow-xl'
            }`}
            disabled={showResult}
            whileHover={!showResult ? { scale: 1.03 } : {}}
            whileTap={!showResult ? { scale: 0.97 } : {}}
          >
            {option}
          </motion.button>
        ))}
      </div>

      <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
        <div className="text-lg">
          {showResult && (
            <span className={isCorrect ? 'text-green-500' : 'text-red-500'}>
              {isCorrect ? '✓ Doğru!' : '✗ Yanlış!'}
            </span>
          )}
        </div>
        <div className="text-lg">
          {currentWordIndex + 1} / {unit.words.length}
        </div>
      </div>
    </div>
  );
};

export default MultipleChoice;

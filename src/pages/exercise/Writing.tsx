import React, { useState } from 'react';
import { Unit } from '../../types';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Props {
  unit: Unit;
  onComplete: () => void;
}

const Writing: React.FC<Props> = ({ unit, onComplete }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentWord = unit.words[currentWordIndex];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isAnswerCorrect =
      userAnswer.toLowerCase().trim() === currentWord.translation.toLowerCase().trim();

    setIsCorrect(isAnswerCorrect);
    setShowResult(true);

    setTimeout(() => {
      if (currentWordIndex < unit.words.length - 1) {
        setCurrentWordIndex(prev => prev + 1);
        setUserAnswer('');
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
          Türkçe karşılığını yazın
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full px-6 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white shadow-lg"
            placeholder="Cevabınızı yazın..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white py-4 rounded-xl text-lg font-medium hover:bg-primary/90 transition-colors shadow-lg"
        >
          Kontrol Et
        </button>
      </form>

      {showResult && (
        <div
          className={`p-6 rounded-xl text-lg ${
            isCorrect
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          <div className="flex items-center justify-center">
            {isCorrect ? (
              <CheckIcon className="w-6 h-6 mr-2" />
            ) : (
              <XMarkIcon className="w-6 h-6 mr-2" />
            )}
            <span>
              {isCorrect
                ? 'Doğru cevap!'
                : `Yanlış cevap. Doğru cevap: ${currentWord.translation}`}
            </span>
          </div>
        </div>
      )}

      <div className="text-center text-lg text-gray-600 dark:text-gray-400">
        {currentWordIndex + 1} / {unit.words.length}
      </div>
    </div>
  );
};

export default Writing;

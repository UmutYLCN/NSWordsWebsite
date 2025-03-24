import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Unit, Word } from '../../types';

interface MultipleChoiceProps {
  unit: Unit;
  onComplete: () => void;
}

interface Question {
  word: Word;
  options: string[];
  correctAnswer: string;
}

const MultipleChoice = ({ unit, onComplete }: MultipleChoiceProps) => {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        // Ünite bilgisi props olarak geliyor, fetch etmemize gerek yok
        // Kelimeleri karıştıralım
        const words = [...unit.words].sort(() => Math.random() - 0.5);

        const generatedQuestions = words.map(word => {
          // Her kelime için diğer kelimelerden 3 yanlış cevap seç
          const otherWords = unit.words.filter(w => w.id !== word.id);
          const wrongAnswers = otherWords
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(w => w.translation);

          // Doğru cevabı rastgele bir pozisyona ekle
          const options = [...wrongAnswers];
          const correctIndex = Math.floor(Math.random() * 4);
          options.splice(correctIndex, 0, word.translation);

          return {
            word,
            options,
            correctAnswer: word.translation
          };
        });

        setQuestions(generatedQuestions);
        setLoading(false);
      } catch (error) {
        console.error('Sorular yüklenirken bir hata oluştu:', error);
        navigate('/units');
      }
    };

    loadQuestions();
  }, [unit, navigate]);

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    const correct = answer === questions[currentQuestionIndex].correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore(prev => prev + 1);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const handleBackClick = () => {
    setShowExitConfirmation(true);
  };

  const handleExitConfirm = () => {
    onComplete();
  };

  const handleExitCancel = () => {
    setShowExitConfirmation(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-primary text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-primary mb-8">
              Tebrikler! Tüm soruları tamamladınız!
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
              <p className="text-2xl font-semibold mb-4">
                Puanınız: {score}/{questions.length}
              </p>
              <button
                onClick={onComplete}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Yeni Egzersiz Seç
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      {showExitConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center max-w-md mx-4"
          >
            <h2 className="text-xl font-bold text-primary mb-4">Uyarı</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Alıştırmadan çıkmak istediğinize emin misiniz? İlerlemeniz kaydedilmeyecektir.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleExitCancel}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleExitConfirm}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Çıkış Yap
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8 justify-between">
          <button
            onClick={handleBackClick}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            <span>Geri Dön</span>
          </button>
          <div className="text-lg font-semibold text-primary">
            Soru {currentQuestionIndex + 1}/{questions.length} • Puan: {score}
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-2">{currentQuestion.word.word}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{currentQuestion.word.definition}</p>
            
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  className={`w-full p-4 rounded-lg text-left transition-colors ${
                    selectedAnswer === null
                      ? 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                      : selectedAnswer === option
                      ? isCorrect
                        ? 'bg-green-100 dark:bg-green-900 border border-green-500 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900 border border-red-500 text-red-700 dark:text-red-300'
                      : option === currentQuestion.correctAnswer && !isCorrect
                      ? 'bg-green-100 dark:bg-green-900 border border-green-500 text-green-700 dark:text-green-300'
                      : 'border border-gray-200 dark:border-gray-700 opacity-50'
                  }`}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={selectedAnswer !== null}
                  whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                  whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultipleChoice; 
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Unit, Word } from '../../types';

interface WritingProps {
  unit: Unit;
  onComplete: () => void;
}

interface Question {
  word: Word;
  isCorrect: boolean | null;
  userAnswer: string;
}

const Writing = ({ unit, onComplete }: WritingProps) => {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        // Ünite bilgisi props olarak geliyor
        // Kelimeleri karıştır
        const shuffledQuestions = [...unit.words]
          .sort(() => Math.random() - 0.5)
          .map(word => ({
            word,
            isCorrect: null,
            userAnswer: ''
          }));

        setQuestions(shuffledQuestions);
        setLoading(false);
      } catch (error) {
        console.error('Sorular yüklenirken bir hata oluştu:', error);
        navigate('/units');
      }
    };

    loadQuestions();
  }, [unit, navigate]);

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = currentQuestion.userAnswer.toLowerCase().trim() === 
                     currentQuestion.word.word.toLowerCase().trim();

    setQuestions(prev => prev.map((q, idx) => 
      idx === currentQuestionIndex 
        ? { ...q, isCorrect } 
        : q
    ));

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // 1.5 saniye sonra bir sonraki soruya geç
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const handleInputChange = (value: string) => {
    setQuestions(prev => prev.map((q, idx) =>
      idx === currentQuestionIndex
        ? { ...q, userAnswer: value }
        : q
    ));
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
      <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-primary mb-8">
              Egzersiz Tamamlandı!
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
              <p className="text-2xl font-semibold mb-4">
                Puanınız: {score}/{questions.length}
              </p>
              <div className="space-y-4 text-left mb-8">
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg ${
                      q.isCorrect
                        ? 'bg-green-100 dark:bg-green-900 border border-green-500'
                        : 'bg-red-100 dark:bg-red-900 border border-red-500'
                    }`}
                  >
                    <p className="font-medium">{q.word.translation}</p>
                    <p className="text-sm mt-1">
                      Cevabınız: {q.userAnswer}
                      {!q.isCorrect && (
                        <span className="text-green-700 dark:text-green-300 ml-2">
                          Doğru cevap: {q.word.word}
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
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
            <div className="mb-8">
              <h2 className="text-white text-2xl font-bold mb-2">Kelimeyi Yazın</h2>
              <p className="text-gray-600 dark:text-gray-400">
                "{currentQuestion.word.translation}" kelimesinin İngilizce karşılığını yazın.
              </p>
            </div>

            <form onSubmit={handleAnswerSubmit}>
              <div className="space-y-4">
                <input
                  type="text"
                  value={currentQuestion.userAnswer}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className={`w-full p-4 rounded-lg border text-lg transition-all ${
                    currentQuestion.isCorrect === null
                      ? 'border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20'
                      : currentQuestion.isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}
                  placeholder="Cevabınızı yazın..."
                  disabled={currentQuestion.isCorrect !== null}
                  autoFocus
                />

                {currentQuestion.isCorrect !== null && (
                  <div className={`text-center font-medium ${
                    currentQuestion.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {currentQuestion.isCorrect 
                      ? 'Doğru!' 
                      : `Yanlış. Doğru cevap: ${currentQuestion.word.word}`}
                  </div>
                )}

                <motion.button
                  type="submit"
                  className={`w-full p-4 rounded-lg text-white font-medium transition-colors ${
                    currentQuestion.isCorrect === null
                      ? 'bg-primary hover:bg-primary/90'
                      : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                  }`}
                  disabled={currentQuestion.isCorrect !== null || !currentQuestion.userAnswer.trim()}
                  whileHover={currentQuestion.isCorrect === null ? { scale: 1.02 } : {}}
                  whileTap={currentQuestion.isCorrect === null ? { scale: 0.98 } : {}}
                >
                  Kontrol Et
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Writing; 
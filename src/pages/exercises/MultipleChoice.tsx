import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Unit, Word } from '../../types';

interface Question {
  word: Word;
  options: string[];
  correctAnswer: string;
}

const MultipleChoice = () => {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch('/data.json');
        const units: Unit[] = await response.json();

        // Mix ünite kontrolü
        const isMixUnit = Number(unitId) >= 1000;
        let currentUnit: Unit | undefined;
        
        if (isMixUnit) {
          const unitNumber = Number(unitId) - 1000;
          const rwUnit = units.find(u => 
            u.title.includes('Reading & Writing') && 
            u.title.includes(`Unit ${unitNumber}`)
          );
          const lsUnit = units.find(u => 
            u.title.includes('Listening & Speaking') && 
            u.title.includes(`Unit ${unitNumber}`)
          );

          if (rwUnit && lsUnit) {
            currentUnit = {
              id: Number(unitId),
              title: `Mix Unit ${unitNumber}`,
              words: [...rwUnit.words, ...lsUnit.words]
            };
          }
        } else {
          currentUnit = units.find(u => u.id === Number(unitId));
        }
        
        if (!currentUnit) {
          throw new Error('Ünite bulunamadı');
        }

        const generatedQuestions = currentUnit.words.map(word => {
          // Her kelime için diğer kelimelerden 3 yanlış cevap seç
          const otherWords = currentUnit!.words.filter(w => w.id !== word.id);
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
  }, [unitId, navigate]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-primary mb-8">
              Tebrikler! Tüm soruları tamamladınız!
            </h2>
            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <p className="text-2xl font-semibold mb-4">
                Puanınız: {score}/{questions.length}
              </p>
              <button
                onClick={() => navigate(`/exercise/${unitId}`)}
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8 justify-between">
          <Link to={`/exercise/${unitId}`} className="flex items-center text-gray-600 hover:text-primary">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            <span>Geri Dön</span>
          </Link>
          <div className="text-lg font-semibold text-primary">
            Soru {currentQuestionIndex + 1}/{questions.length} • Puan: {score}
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-2">{currentQuestion.word.word}</h2>
            <p className="text-gray-600 mb-6">{currentQuestion.word.definition}</p>
            
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  className={`w-full p-4 rounded-lg text-left transition-colors ${
                    selectedAnswer === null
                      ? 'hover:bg-gray-50 border border-gray-200'
                      : selectedAnswer === option
                      ? isCorrect
                        ? 'bg-green-100 border border-green-500 text-green-700'
                        : 'bg-red-100 border border-red-500 text-red-700'
                      : option === currentQuestion.correctAnswer && !isCorrect
                      ? 'bg-green-100 border border-green-500 text-green-700'
                      : 'border border-gray-200 opacity-50'
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
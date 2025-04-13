import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Unit, Word } from '../../types';
import confetti from 'canvas-confetti';

interface VocabularyTestProps {
  unit: Unit;
  allWords?: boolean; // Tüm kelimeleri test etmek için
  onComplete: () => void;
}

interface Score {
  name: string;
  score: number;
  date: string;
}

interface UserAnswer {
  wordId: number;
  answer: string;
  isCorrect: boolean | null;
}

const VocabularyTest: React.FC<VocabularyTestProps> = ({ unit, allWords = false, onComplete }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [playerName, setPlayerName] = useState('');
  const [highScores, setHighScores] = useState<Score[]>([]);
  const [saveScore, setSaveScore] = useState(false);
  const [showScoreBoard, setShowScoreBoard] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Kelimeleri karıştır ve hazırla
  useEffect(() => {
    const prepareWords = async () => {
      try {
        let wordsToUse: Word[] = [];
        
        if (allWords) {
          // Tüm kelimeleri yükle
          const baseUrl = import.meta.env.BASE_URL;
          const response = await fetch(`${baseUrl}data.json`);
          const units: Unit[] = await response.json();
          wordsToUse = units.flatMap(u => u.words);
        } else {
          // Sadece seçilen ünitenin kelimelerini kullan
          wordsToUse = [...unit.words];
        }
        
        // Kelimeleri karıştır
        const shuffled = wordsToUse
          .sort(() => Math.random() - 0.5);
        
        setWords(shuffled);
        setLoading(false);
      } catch (error) {
        console.error('Kelimeler yüklenirken hata oluştu:', error);
      }
    };

    prepareWords();
  }, [unit, allWords]);

  // Yüksek skorları yükle
  useEffect(() => {
    const savedScores = localStorage.getItem('vocabularyTestScores');
    if (savedScores) {
      setHighScores(JSON.parse(savedScores));
    }
  }, []);

  // Input'a odaklan
  useEffect(() => {
    if (!showIntro && !gameOver && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentWordIndex, showIntro, gameOver]);

  useEffect(() => {
    // Initialize answers array
    const initialAnswers = words.map(word => ({
      wordId: word.id,
      answer: '',
      isCorrect: null
    }));
    setAnswers(initialAnswers);
  }, [words]);

  const startTest = () => {
    // Önce değişkenleri sıfırla
    setShowIntro(false);
    setCurrentWordIndex(0);
    setScore(0);
    setGameOver(false);
    setShowResults(false);
    setIsCorrect(null);
    
    // Kelimeleri yeniden karıştır
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    setWords(shuffledWords);
    
    // Cevapları tamamen yeniden oluştur
    const newAnswers = shuffledWords.map(word => ({
      wordId: word.id,
      answer: '',
      isCorrect: null
    }));
    
    setAnswers(newAnswers);
    setAnswer(''); // Eski cevabı temizle
    
    // Konsola bilgi yazdır (debug)
    console.log('Test yeniden başlatıldı', { wordsCount: shuffledWords.length });
  };

  const handleNext = () => {
    const currentAnswer = answers[currentWordIndex].answer.trim();
    if (!currentAnswer) return; // Boş cevapları kontrol etmiyoruz
    
    const word = words[currentWordIndex];
    const userAnswer = currentAnswer.toLowerCase();
    
    // Cevabı kontrol et
    const isCorrect = word.translations 
      ? word.translations.some(
          (translation: string) => translation.toLowerCase() === userAnswer
        )
      : word.translation.toLowerCase() === userAnswer;
    
    // Cevabı güncelle
    const newAnswers = [...answers];
    newAnswers[currentWordIndex] = {
      ...newAnswers[currentWordIndex],
      isCorrect: isCorrect
    };
    setAnswers(newAnswers);
    
    if (isCorrect) {
      // Confetti efekti göster
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 }
      });
      
      // Feedback göster
      setIsCorrect(true);
      
      // Doğru cevapları say
      setScore(prev => prev + 1);
      
      // 1 saniye sonra sonraki kelimeye geç
      setTimeout(() => {
        setIsCorrect(null);
        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex(currentWordIndex + 1);
        } else {
          // Tüm kelimeler bitti, test sonuçlarını göster
          showTestResults();
        }
      }, 1000);
    } else {
      // Yanlış cevap - testi bitir
      setIsCorrect(false);
      setTimeout(() => {
        showTestResults();
      }, 1000);
    }
  };
  
  const showTestResults = () => {
    setShowResults(true);
    setGameOver(true); // Oyun bittiğini belirt
    
    if (score > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setCompleted(true);
      
      // Artık otomatik olarak skor kaydetme ekranını gösterme
      // setTimeout(() => {
      //   setSaveScore(true);
      // }, 1500);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNext();
  };

  const savePlayerScore = () => {
    if (!playerName.trim()) return;
    
    const newScore: Score = {
      name: playerName,
      score,
      date: new Date().toLocaleString()
    };
    
    const updatedScores = [...highScores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Sadece en yüksek 10 skoru tut
    
    setHighScores(updatedScores);
    localStorage.setItem('vocabularyTestScores', JSON.stringify(updatedScores));
    
    setSaveScore(false);
    setShowScoreBoard(true);
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentWordIndex].answer = value;
    setAnswers(newAnswers);
  };

  // Yükleme ekranı
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-400">Kelimeler yükleniyor...</p>
      </div>
    );
  }

  // Giriş ekranı
  if (showIntro) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-white mb-4">Kelime Testi</h1>
        <div className="bg-blue-900/20 p-6 rounded-xl mb-6">
          <h2 className="text-xl font-semibold text-blue-300 mb-4">Nasıl Oynanır?</h2>
          <ul className="text-left text-gray-300 space-y-2 mb-4">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Ekranda İngilizce kelimeler gösterilecek</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Her kelime için doğru Türkçe karşılığını yazın</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Cevabınızı kontrol etmek için 'Kontrol Et' butonuna basın veya Enter tuşuna basın</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Doğru cevap verdiğinizde otomatik olarak bir sonraki kelimeye geçilecektir</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span className="text-yellow-400 font-medium">Yanlış cevap verdiğinizde test sonlanacaktır!</span>
            </li>
          </ul>
          <div className="bg-yellow-900/20 p-4 rounded-lg text-yellow-300">
            <p className="text-sm">
              <span className="font-bold">İpucu:</span> Cevaplarınız tam olarak doğru olmalıdır. 
              Yazım hatalarına dikkat edin!
            </p>
          </div>
        </div>
        <div className="mb-6">
          <p className="text-gray-300 mb-2">
            <span className="font-semibold">Toplam kelime sayısı:</span> {words.length}
          </p>
          <p className="text-gray-300">
            <span className="font-semibold">Bu testte:</span> {allWords ? 'Tüm kelimelerin' : unit.title + ' ünitesinin'} Türkçe karşılıklarını yazmanız beklenmektedir
          </p>
          <p className="text-white mt-4 text-lg font-medium">
            Hazır olduğunuzda testi başlatabilirsiniz!
          </p>
        </div>
        <button
          onClick={startTest}
          className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
        >
          Testi Başlat
        </button>
      </motion.div>
    );
  }

  // Skor kaydetme ekranı
  if (gameOver && saveScore) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-white mb-4">
          {score === words.length 
            ? 'Tebrikler! Tüm soruları doğru cevapladınız!' 
            : 'Oyun Bitti!'}
        </h2>
        
        <div className="bg-blue-900/20 p-6 rounded-xl mb-6">
          <p className="text-xl text-gray-200 mb-4">
            Toplam puan: <span className="font-bold text-blue-300">{score}</span>
          </p>
          <p className="text-gray-300">
            {score === 1 
              ? '1 kelimeyi doğru bildiniz.' 
              : `${score} kelimeyi doğru bildiniz.`}
          </p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="playerName" className="block text-gray-300 mb-2">
            İsminiz:
          </label>
          <input
            id="playerName"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="İsminizi girin"
            className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
            autoFocus
          />
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={savePlayerScore}
            disabled={!playerName.trim()}
            className={`px-6 py-2 rounded-lg transition-colors ${
              playerName.trim() 
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            Skoru Kaydet
          </button>
        </div>
      </motion.div>
    );
  }

  // Skor tablosu ekranı
  if (showScoreBoard) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Yüksek Skorlar</h2>
        
        {highScores.length > 0 ? (
          <div className="bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Sıra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    İsim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Puan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Tarih
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {highScores.map((scoreItem, index) => (
                  <tr key={index} className={scoreItem.name === playerName && scoreItem.score === score ? 'bg-blue-900/20' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {scoreItem.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {scoreItem.score}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {scoreItem.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-800 p-6 rounded-xl mb-6 text-gray-300">
            Henüz yüksek skor kaydedilmemiş.
          </div>
        )}
        
        <div className="flex space-x-4 justify-center">
          <button
            onClick={() => {
              setShowScoreBoard(false);
              setShowIntro(true);
            }}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Tekrar Oyna
          </button>
        </div>
      </motion.div>
    );
  }

  // Ana test ekranı
  if (!showResults) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            Kelime Testi
          </h2>
          <span className="text-sm text-gray-400">
            {currentWordIndex + 1} / {words.length}
          </span>
        </div>
        
        <motion.div
          key={words[currentWordIndex].id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`bg-gray-700 p-6 rounded-lg ${
            isCorrect === true ? 'ring-2 ring-green-500' : 
            isCorrect === false ? 'ring-2 ring-red-500' : ''
          }`}
        >
          <h3 className="text-2xl font-bold text-center mb-6 text-white">
            {words[currentWordIndex].word}
          </h3>
          
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Türkçe karşılığını yazın:
            </label>
            <input
              type="text"
              value={answers[currentWordIndex].answer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         bg-gray-800 text-white ${
                          isCorrect === true ? 'border-green-500' : 
                          isCorrect === false ? 'border-red-500' : 'border-gray-600'
                         }`}
              placeholder="Cevabınızı buraya yazın"
              onKeyDown={handleKeyDown}
              disabled={isCorrect !== null}
            />
            
            {isCorrect !== null && (
              <div className="absolute right-3 top-9">
                {isCorrect ? (
                  <span className="text-green-500 text-xl">✓</span>
                ) : (
                  <span className="text-red-500 text-xl">✗</span>
                )}
              </div>
            )}
          </div>

          {words[currentWordIndex].examples && words[currentWordIndex].examples.length > 0 && (
            <div className="mt-4 text-sm text-gray-400 italic">
              <p>Örnek: {words[currentWordIndex].examples[0]}</p>
            </div>
          )}
          
          {isCorrect === false && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">
                Doğru cevap: {words[currentWordIndex].translations 
                  ? [...new Set([words[currentWordIndex].translation, ...(words[currentWordIndex].translations || [])])].join(', ')
                  : words[currentWordIndex].translation}
              </p>
            </div>
          )}
        </motion.div>
        
        <div className="flex justify-center mt-6">
          <button
            onClick={handleNext}
            disabled={!answers[currentWordIndex].answer.trim() || isCorrect !== null}
            className={`px-6 py-3 rounded-md ${
              !answers[currentWordIndex].answer.trim() || isCorrect !== null
                ? 'bg-gray-700 cursor-not-allowed text-gray-500'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } transition-colors`}
          >
            Kontrol Et
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center mb-4 text-white">
          Test Sonucu
        </h2>
        
        <div className="text-center mb-8">
          <div className="text-5xl font-bold mb-2 text-white">
            {score} / {words.length}
          </div>
          <div className="text-lg text-gray-300 mb-2">
            {score === 0 
              ? "Hiç doğru cevap veremediniz" 
              : score === 1 
                ? "1 kelimeye doğru cevap verdiniz"
                : `${score} kelimeye doğru cevap verdiniz`
            }
          </div>
          <div className="mt-4">
            {score > 0 ? (
              <div className="inline-block bg-green-900/30 border border-green-500/30 py-3 px-6 rounded-lg">
                <span className="text-xl text-green-400">🎯 İyi çalışma! Daha fazla kelime öğrenmek için pratik yapmaya devam edin.</span>
              </div>
            ) : (
              <div className="inline-block bg-yellow-900/30 border border-yellow-500/30 py-3 px-6 rounded-lg">
                <span className="text-xl text-yellow-400">📚 Biraz daha çalışmanız gerekiyor. Tekrar deneyin!</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-sm divide-y divide-gray-700 mb-8">
          <div className="p-4 bg-gray-700/50">
            <div className="flex justify-between items-center">
              <div className="font-medium text-white">Kelime</div>
              <div className="font-medium text-white">Cevabınız</div>
            </div>
          </div>
          {answers
            .filter(answer => answer.isCorrect !== null && answer.answer.trim() !== '') // Sadece cevaplanmış soruları göster
            .map((answer, index) => {
              const wordIndex = words.findIndex(word => word.id === answer.wordId);
              if (wordIndex === -1) return null;
              
              return (
                <div key={answer.wordId} className={`p-4 ${answer.isCorrect ? 'bg-green-900/10' : 'bg-red-900/10'}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-white">
                        {words[wordIndex].word}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Doğru cevap: {words[wordIndex].translations 
                          ? [...new Set([words[wordIndex].translation, ...(words[wordIndex].translations || [])])].join(', ')
                          : words[wordIndex].translation}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className={`mr-2 text-sm font-medium ${answer.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {answer.answer || '-'}
                      </span>
                      {answer.isCorrect ? (
                        <span className="text-green-500 w-6 h-6 flex items-center justify-center bg-green-900/20 rounded-full">✓</span>
                      ) : (
                        <span className="text-red-500 w-6 h-6 flex items-center justify-center bg-red-900/20 rounded-full">✗</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          
          {answers.filter(answer => answer.isCorrect !== null && answer.answer.trim() !== '').length === 0 && (
            <div className="p-4 text-center text-gray-500">
              Hiç cevap verilmemiş
            </div>
          )}
        </div>
        
        <div className="text-center mt-8">
          <button
            onClick={() => {
              // Test başlangıcına tamamen dön
              setShowIntro(true);
            }}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            Tekrar Dene
          </button>
          {score > 0 && (
            <button
              onClick={() => setSaveScore(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors ml-4"
            >
              Skoru Kaydet
            </button>
          )}
        </div>
      </div>
    );
  }
};

export default VocabularyTest; 
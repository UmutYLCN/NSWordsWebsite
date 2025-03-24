import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Unit } from '../../types';

interface MatchingProps {
  unit: Unit;
  onComplete: () => void;
}

interface MatchingItem {
  id: string;
  content: string;
  type: 'word' | 'translation';
  originalId: number;
  isMatched: boolean;
}

const Matching = ({ unit, onComplete }: MatchingProps) => {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MatchingItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [remainingPairs, setRemainingPairs] = useState(0);
  const [incorrectPair, setIncorrectPair] = useState<string[]>([]);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  useEffect(() => {
    const loadWords = async () => {
      try {
        // Her kelime için iki item oluştur (İngilizce ve Türkçe)
        const matchingItems = unit.words.flatMap(word => [
          {
            id: `word-${word.id}`,
            content: word.word,
            type: 'word' as const,
            originalId: word.id,
            isMatched: false
          },
          {
            id: `translation-${word.id}`,
            content: word.translation,
            type: 'translation' as const,
            originalId: word.id,
            isMatched: false
          }
        ]);

        setItems(matchingItems);
        setRemainingPairs(unit.words.length);
        setLoading(false);
      } catch (error) {
        console.error('Kelimeler yüklenirken bir hata oluştu:', error);
        navigate('/units');
      }
    };

    loadWords();
  }, [unit, navigate]);

  const handleItemClick = (itemId: string) => {
    const clickedItem = items.find(item => item.id === itemId);
    if (!clickedItem || clickedItem.isMatched || incorrectPair.includes(itemId)) return;

    if (selectedItem === null) {
      setSelectedItem(itemId);
    } else {
      const previousItem = items.find(item => item.id === selectedItem);
      
      if (previousItem && 
          clickedItem.originalId === previousItem.originalId && 
          clickedItem.type !== previousItem.type) {
        // Doğru eşleşme
        setItems(prev => prev.map(item => 
          item.originalId === clickedItem.originalId
            ? { ...item, isMatched: true }
            : item
        ));
        setScore(prev => prev + 1);
        setRemainingPairs(prev => {
          const newRemaining = prev - 1;
          if (newRemaining === 0) {
            setShowCompletionMessage(true);
          }
          return newRemaining;
        });
        setSelectedItem(null);
      } else {
        // Yanlış eşleşme
        setIncorrectPair([selectedItem, itemId]);
        setTimeout(() => {
          setIncorrectPair([]);
          setSelectedItem(null);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    // Türkçe anlamları karıştır
    if (!loading && items.length > 0) {
      const words = items.filter(item => item.type === 'word');
      const translations = [...items.filter(item => item.type === 'translation')];
      
      // Türkçe anlamları karıştır
      const shuffledTranslations = [...translations].sort(() => Math.random() - 0.5);
      
      // Karıştırılmış Türkçe anlamlarıyla yeni bir dizi oluştur
      const newItems = [
        ...words,
        ...shuffledTranslations
      ];
      
      setItems(newItems);
    }
  }, [loading]); // Sadece loading değiştiğinde çalışsın

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

  // İngilizce ve Türkçe kelimeleri ayır
  const words = items.filter(item => item.type === 'word');
  const translations = items.filter(item => item.type === 'translation');

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      {showCompletionMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center max-w-md mx-4"
          >
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-primary mb-4">Tebrikler!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Tüm eşleştirmeleri başarıyla tamamladınız! Puanınız: {score}
            </p>
            <div className="flex justify-center">
              <button
                onClick={onComplete}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Diğer Alıştırmalara Geç
              </button>
            </div>
          </motion.div>
        </div>
      )}
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
            Kalan Eşleşme: {remainingPairs} • Puan: {score}
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-primary mb-2">Eşleştirme</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Kelimeleri anlamlarıyla eşleştirin</p>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sol taraf - İngilizce kelimeler */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-primary mb-6 text-center">İngilizce Kelimeler</h2>
              {words.map((item) => (
                <motion.button
                  key={item.id}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    item.isMatched
                      ? 'bg-green-100 dark:bg-green-900 border border-green-500 text-green-700 dark:text-green-300'
                      : incorrectPair.includes(item.id)
                      ? 'bg-red-100 dark:bg-red-900 border-2 border-red-500 text-red-700 dark:text-red-300'
                      : selectedItem === item.id
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => handleItemClick(item.id)}
                  disabled={item.isMatched}
                  whileHover={!item.isMatched ? { scale: 1.02 } : {}}
                  whileTap={!item.isMatched ? { scale: 0.98 } : {}}
                >
                  <span className="text-lg">{item.content}</span>
                </motion.button>
              ))}
            </div>

            {/* Sağ taraf - Türkçe anlamlar */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-primary mb-6 text-center">Türkçe Anlamlar</h2>
              {translations.map((item) => (
                <motion.button
                  key={item.id}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    item.isMatched
                      ? 'bg-green-100 dark:bg-green-900 border border-green-500 text-green-700 dark:text-green-300'
                      : incorrectPair.includes(item.id)
                      ? 'bg-red-100 dark:bg-red-900 border-2 border-red-500 text-red-700 dark:text-red-300'
                      : selectedItem === item.id
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => handleItemClick(item.id)}
                  disabled={item.isMatched}
                  whileHover={!item.isMatched ? { scale: 1.02 } : {}}
                  whileTap={!item.isMatched ? { scale: 0.98 } : {}}
                >
                  <span className="text-lg">{item.content}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Matching;
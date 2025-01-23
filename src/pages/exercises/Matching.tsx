import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Unit} from '../../types';

interface MatchingItem {
  id: string;
  content: string;
  type: 'word' | 'translation';
  originalId: number;
  isMatched: boolean;
}

const Matching = () => {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MatchingItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [remainingPairs, setRemainingPairs] = useState(0);
  const [translationOrder, setTranslationOrder] = useState<string[]>([]);
  const [incorrectPair, setIncorrectPair] = useState<string[]>([]);

  useEffect(() => {
    const loadWords = async () => {
      try {
        const response = await fetch('/data.json');
        const units: Unit[] = await response.json();
        const currentUnit = units.find(u => u.id === Number(unitId));

        if (!currentUnit) {
          throw new Error('Ünite bulunamadı');
        }

        // Kelimeleri karıştır ve ilk 6 tanesini al
        const shuffledWords = [...currentUnit.words]
          .sort(() => Math.random() - 0.5)
          .slice(0, 6);

        // Her kelime için iki item oluştur (İngilizce ve Türkçe)
        const matchingItems = shuffledWords.flatMap(word => [
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

        // Türkçe kelimelerin sırasını karıştır ve sakla
        const translations = matchingItems
          .filter(item => item.type === 'translation')
          .sort(() => Math.random() - 0.5);
        
        setTranslationOrder(translations.map(t => t.id));
        setItems(matchingItems);
        setRemainingPairs(shuffledWords.length);
        setLoading(false);
      } catch (error) {
        console.error('Kelimeler yüklenirken bir hata oluştu:', error);
        navigate('/units');
      }
    };

    loadWords();
  }, [unitId, navigate]);

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
        setRemainingPairs(prev => prev - 1);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl">Yükleniyor...</div>
      </div>
    );
  }

  // İngilizce ve Türkçe kelimeleri ayır
  const words = items.filter(item => item.type === 'word');
  const translations = translationOrder
    .map(id => items.find(item => item.id === id))
    .filter((item): item is MatchingItem => item !== undefined);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8 justify-between">
          <Link to={`/exercise/${unitId}`} className="flex items-center text-gray-600 hover:text-primary">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            <span>Geri Dön</span>
          </Link>
          <div className="text-lg font-semibold text-primary">
            Kalan Eşleşme: {remainingPairs} • Puan: {score}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 gap-8">
            {/* Sol taraf - İngilizce kelimeler */}
            <div className="space-y-4">
              {words.map((item) => (
                <motion.button
                  key={item.id}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    item.isMatched
                      ? 'bg-green-100 border border-green-500 text-green-700'
                      : incorrectPair.includes(item.id)
                      ? 'bg-red-100 border-2 border-red-500 text-red-700'
                      : selectedItem === item.id
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'hover:bg-gray-50 border border-gray-200'
                  }`}
                  onClick={() => handleItemClick(item.id)}
                  disabled={item.isMatched}
                  whileHover={!item.isMatched ? { scale: 1.02 } : {}}
                  whileTap={!item.isMatched ? { scale: 0.98 } : {}}
                >
                  {item.content}
                </motion.button>
              ))}
            </div>

            {/* Sağ taraf - Türkçe anlamlar */}
            <div className="space-y-4">
              {translations.map((item) => (
                <motion.button
                  key={item.id}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    item.isMatched
                      ? 'bg-green-100 border border-green-500 text-green-700'
                      : incorrectPair.includes(item.id)
                      ? 'bg-red-100 border-2 border-red-500 text-red-700'
                      : selectedItem === item.id
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'hover:bg-gray-50 border border-gray-200'
                  }`}
                  onClick={() => handleItemClick(item.id)}
                  disabled={item.isMatched}
                  whileHover={!item.isMatched ? { scale: 1.02 } : {}}
                  whileTap={!item.isMatched ? { scale: 0.98 } : {}}
                >
                  {item.content}
                </motion.button>
              ))}
            </div>
          </div>

          {remainingPairs === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <h2 className="text-2xl font-bold text-primary mb-4">
                Tebrikler! Tüm eşleştirmeleri tamamladınız!
              </h2>
              <button
                onClick={() => navigate(`/exercise/${unitId}`)}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Yeni Egzersiz Seç
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Matching; 
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  AcademicCapIcon, 
  Square3Stack3DIcon,
  ChevronRightIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Unit, Word } from '../types';

const Flashcards = () => {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const loadUnitWords = async () => {
      try {
        setLoading(true);
        setError(null);
        const baseUrl = import.meta.env.BASE_URL;
        const response = await fetch(`${baseUrl}data.json`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        // Mix ünite kontrolü
        const isMixUnit = Number(unitId) >= 1000;
        
        if (isMixUnit) {
          const unitNumber = Number(unitId) - 1000;
          const rwUnit = data.find((u: Unit) => 
            u.title.includes('Reading & Writing') && 
            u.title.includes(`Unit ${unitNumber}`)
          );
          const lsUnit = data.find((u: Unit) => 
            u.title.includes('Listening & Speaking') && 
            u.title.includes(`Unit ${unitNumber}`)
          );

          if (rwUnit && lsUnit) {
            const mixUnit = {
              id: Number(unitId),
              title: `Mix Unit ${unitNumber}`,
              words: [...rwUnit.words, ...lsUnit.words]
            };
            setUnit(mixUnit);
          } else {
            throw new Error('Ünite bulunamadı');
          }
        } else {
          const foundUnit = data.find((u: Unit) => u.id === Number(unitId));
          if (foundUnit) {
            setUnit(foundUnit);
          } else {
            throw new Error('Ünite bulunamadı');
          }
        }
      } catch (error) {
        console.error('Kelimeler yüklenirken bir hata oluştu:', error);
        setError('Kelimeler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
      } finally {
        setLoading(false);
      }
    };

    loadUnitWords();
  }, [unitId]);

  const toggleCard = (wordId: number) => {
    setFlippedCards(prev => ({
      ...prev,
      [wordId]: !prev[wordId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-primary text-xl">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-red-500 text-xl">{error}</div>
        </div>
      </div>
    );
  }

  if (!unit) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link to="/units" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            <span>Geri Dön</span>
          </Link>
        </div>

        {/* Başlık ve Butonlar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <h1 className="text-3xl font-bold text-primary dark:text-primary">{unit.title}</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={`/exercise/${unit.id}`}
              className="group flex items-center justify-between bg-green-100 dark:bg-green-900 hover:bg-green-500 dark:hover:bg-green-700 text-green-600 dark:text-green-400 hover:text-white px-6 py-3 rounded-xl transition-all duration-300"
            >
              <div className="flex items-center">
                <AcademicCapIcon className="w-6 h-6 mr-3" />
                <span>Alıştırma</span>
              </div>
              <ArrowRightIcon className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              to={`/memory-game/${unit.id}`}
              className="group flex items-center justify-between bg-purple-100 dark:bg-purple-900 hover:bg-purple-500 dark:hover:bg-purple-700 text-purple-600 dark:text-purple-400 hover:text-white px-6 py-3 rounded-xl transition-all duration-300"
            >
              <div className="flex items-center">
                <Square3Stack3DIcon className="w-6 h-6 mr-3" />
                <span>Hafıza Oyunu</span>
              </div>
              <ArrowRightIcon className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>

        {/* Kartlar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {unit.words.map((word: Word) => (
            <div
              key={word.id}
              className="relative h-64 cursor-pointer perspective-1000 hover:scale-105 transition-transform"
              onClick={() => toggleCard(word.id)}
            >
              <div
                className={`absolute w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
                  flippedCards[word.id] ? 'rotate-y-180' : ''
                }`}
              >
                {/* Ön Yüz */}
                <div className="absolute w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 backface-hidden">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{word.word}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{word.definition}</p>
                </div>

                {/* Arka Yüz */}
                <div className="absolute w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 rotate-y-180 backface-hidden">
                  <h3 className="text-xl font-semibold mb-2 text-primary dark:text-primary">
                    {word.translation}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{word.meaning}</p>
                  <div className="text-sm text-gray-500 dark:text-gray-400 overflow-y-auto max-h-24">
                    {word.examples.map((example, index) => (
                      <p key={index} className="mb-1">• {example}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Flashcards;
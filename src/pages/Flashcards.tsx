import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
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
        const response = await fetch('/data.json');
        if (!response.ok) {
          throw new Error('Veriler yüklenemedi');
        }
        const data = await response.json();
        const foundUnit = data.find((u: Unit) => u.id === Number(unitId));
        
        if (foundUnit) {
          setUnit(foundUnit);
        } else {
          throw new Error('Ünite bulunamadı');
        }
      } catch (error) {
        console.error('Kelimeler yüklenirken bir hata oluştu:', error);
        setError('Kelimeler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        setTimeout(() => navigate('/units'), 2000);
      } finally {
        setLoading(false);
      }
    };

    loadUnitWords();
  }, [unitId, navigate]);

  const toggleCard = (wordId: number) => {
    setFlippedCards(prev => ({
      ...prev,
      [wordId]: !prev[wordId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!unit) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link to="/units" className="flex items-center text-gray-600 hover:text-primary transition-colors">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            <span>Geri Dön</span>
          </Link>
          <h1 className="text-3xl font-bold text-primary ml-8">{unit.title}</h1>
        </div>

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
                <div className="absolute w-full h-full bg-white rounded-lg shadow-sm p-6 backface-hidden">
                  <h2 className="text-2xl font-semibold mb-2">{word.word}</h2>
                  <p className="text-gray-600">{word.definition}</p>
                </div>

                {/* Arka Yüz */}
                <div className="absolute w-full h-full bg-white rounded-lg shadow-sm p-6 rotate-y-180 backface-hidden">
                  <h3 className="text-xl font-semibold mb-2 text-primary">
                    {word.translation}
                  </h3>
                  <p className="text-gray-600 mb-4">{word.meaning}</p>
                  <div className="text-sm text-gray-500 overflow-y-auto max-h-24">
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
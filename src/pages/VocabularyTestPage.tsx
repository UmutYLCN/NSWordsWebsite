import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Unit } from '../types';
import VocabularyTest from './exercises/VocabularyTest';

const VocabularyTestPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dummyUnit, setDummyUnit] = useState<Unit | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get the base URL from Vite's environment
        const baseUrl = import.meta.env.BASE_URL;
        const response = await fetch(`${baseUrl}data.json`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Tüm kelimeleri bir araya getir
        const allWords = data.flatMap((unit: Unit) => unit.words);
        
        // Tüm kelimeleri içeren geçici bir ünite oluştur
        const dummyUnit: Unit = {
          id: 0,
          title: "Tüm Kelimeler",
          words: allWords
        };
        
        setDummyUnit(dummyUnit);
      } catch (err) {
        console.error('Veri yüklenirken bir hata oluştu:', err);
        setError('Veri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleComplete = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-white text-xl">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error || !dummyUnit) {
    return (
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-red-500 text-xl">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to="/"
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
        
        <div className="bg-gray-800 rounded-xl shadow-sm p-8">
          <VocabularyTest 
            unit={dummyUnit} 
            allWords={true}  
            onComplete={handleComplete} 
          />
        </div>
      </div>
    </div>
  );
};

export default VocabularyTestPage; 
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Unit } from '../types';

const Units = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(() => {
    const savedFilter = localStorage.getItem('unitFilter');
    return savedFilter || null;
  });

  useEffect(() => {
    if (selectedType) {
      localStorage.setItem('unitFilter', selectedType);
    } else {
      localStorage.removeItem('unitFilter');
    }
  }, [selectedType]);

  useEffect(() => {
    let isMounted = true;

    const loadUnits = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const baseUrl = import.meta.env.BASE_URL;
        const response = await fetch(`${baseUrl}data.json`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Veri formatı geçersiz');
        }
        
        if (isMounted) {
          setUnits(data);
        }
      } catch (error) {
        console.error('Üniteler yüklenirken bir hata oluştu:', error);
        if (isMounted) {
          setError('Üniteler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUnits();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredUnits = units.filter(unit => {
    if (!selectedType) return true;
    if (selectedType === 'RW') return unit.title.includes('Reading & Writing');
    if (selectedType === 'LS') return unit.title.includes('Listening & Speaking');
    return true;
  });

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
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
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-red-500 text-xl text-center">{error}</div>
            <button
              onClick={handleRetry}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-12 justify-between">
          <Link to="/" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            <span>Geri Dön</span>
          </Link>
          <h1 className="text-3xl font-bold text-primary dark:text-primary">Üniteler</h1>
          <div className="w-24"></div>
        </div>

        {/* Filtre ve İçerik Bölümü */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sol Taraf - Filtreler */}
          <div className="lg:w-64">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-700">
                <FunnelIcon className="w-5 h-5 text-primary dark:text-primary" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Filtrele</h2>
              </div>
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setSelectedType(null)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    !selectedType
                      ? 'bg-primary/10 text-primary dark:text-primary font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Tüm Üniteler
                </button>
                <button
                  onClick={() => setSelectedType('RW')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedType === 'RW'
                      ? 'bg-primary/10 text-primary dark:text-primary font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Reading & Writing
                </button>
                <button
                  onClick={() => setSelectedType('LS')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedType === 'LS'
                      ? 'bg-primary/10 text-primary dark:text-primary font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Listening & Speaking
                </button>
              </div>
            </div>
          </div>

          {/* Sağ Taraf - Üniteler */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredUnits.map((unit) => (
                <div 
                  key={unit.id} 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all hover:translate-y-[-2px]"
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{unit.title}</h2>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      {unit.words.length} kelime
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link
                      to={`/flashcards/${unit.id}`}
                      className="block w-full bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors text-center font-medium"
                    >
                      İncele
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Units;
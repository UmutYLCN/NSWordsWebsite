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
        
        const response = await fetch('/data.json');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Veri formatı geçersiz');
        }

        // Reading & Writing ve Listening & Speaking ünitelerini ayır
        const rwUnits = data.filter(unit => unit.title.includes('Reading & Writing'));
        const lsUnits = data.filter(unit => unit.title.includes('Listening & Speaking'));

        // Mix üniteleri oluştur
        const mixUnits = rwUnits.map(rwUnit => {
          const unitNumber = rwUnit.title.match(/\d+/)?.[0];
          if (!unitNumber) return null;

          const lsUnit = lsUnits.find(unit => unit.title.includes(`Unit ${unitNumber}`));
          if (!lsUnit) return null;

          return {
            id: 1000 + parseInt(unitNumber),
            title: `Mix Unit ${unitNumber}`,
            words: [...rwUnit.words, ...lsUnit.words]
          };
        }).filter((unit): unit is Unit => unit !== null);
        
        if (isMounted) {
          setUnits([...data, ...mixUnits]);
          setLoading(false);
        }
      } catch (error) {
        console.error('Üniteler yüklenirken bir hata oluştu:', error);
        if (isMounted) {
          setError('Üniteler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
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
    if (selectedType === 'MIX') return unit.title.includes('Mix Unit');
    return true;
  });

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="text-red-500 text-xl text-center">{error}</div>
        <button
          onClick={handleRetry}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-12 justify-between">
          <Link to="/" className="flex items-center text-gray-600 hover:text-primary">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            <span>Geri Dön</span>
          </Link>
          <h1 className="text-3xl font-bold text-primary">Üniteler</h1>
          <div className="w-24"></div>
        </div>

        {/* Filtre ve İçerik Bölümü */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sol Taraf - Filtreler */}
          <div className="lg:w-64">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <FunnelIcon className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-gray-900">Filtrele</h2>
              </div>
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setSelectedType(null)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    !selectedType
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Tüm Üniteler
                </button>
                <button
                  onClick={() => setSelectedType('RW')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedType === 'RW'
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Reading & Writing
                </button>
                <button
                  onClick={() => setSelectedType('LS')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedType === 'LS'
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Listening & Speaking
                </button>
                <button
                  onClick={() => setSelectedType('MIX')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedType === 'MIX'
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Mix Units
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
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all hover:translate-y-[-2px]"
                >
                  <h2 className="text-xl font-semibold mb-4">{unit.title}</h2>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {unit.words.length} kelime
                    </span>
                  </div>
                  <Link
                    to={`/flashcards/${unit.id}`}
                    className="block w-full bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors text-center font-medium"
                  >
                    İncele
                  </Link>
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
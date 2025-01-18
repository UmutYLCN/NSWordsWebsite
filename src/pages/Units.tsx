import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Unit } from '../types';

const Units = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUnits = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/data.json');
        if (!response.ok) {
          throw new Error('Veriler yüklenemedi');
        }
        const data = await response.json();
        setUnits(data);
      } catch (error) {
        console.error('Üniteler yüklenirken bir hata oluştu:', error);
        setError('Üniteler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
      } finally {
        setLoading(false);
      }
    };

    loadUnits();
  }, []);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link to="/" className="flex items-center text-gray-600 hover:text-primary">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            <span>Geri Dön</span>
          </Link>
          <h1 className="text-3xl font-bold text-primary ml-8">Üniteler</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {units.map((unit) => (
            <div key={unit.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-4">{unit.title}</h2>
              <p className="text-gray-600 mb-4">
                {unit.words.length} kelime
              </p>
              <Link
                to={`/flashcards/${unit.id}`}
                className="inline-block bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                İncele
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Units; 
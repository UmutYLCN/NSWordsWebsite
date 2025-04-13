import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Unit } from '../types';
import { motion } from 'framer-motion';
import MultipleChoice from './exercises/MultipleChoice';
import Matching from './exercises/Matching';
import Writing from './exercises/Writing';

interface ExerciseType {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const exerciseTypes: ExerciseType[] = [
  {
    id: 'multiple-choice',
    title: 'Çoktan Seçmeli',
    description: 'Verilen kelimeye uygun anlamı seçin',
    icon: '🎯',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'matching',
    title: 'Eşleştirme',
    description: 'Kelimeleri anlamlarıyla eşleştirin',
    icon: '🔄',
    color: 'from-green-500 to-teal-500'
  },
  {
    id: 'writing',
    title: 'Yazma',
    description: 'Verilen kelimeyi doğru şekilde yazın',
    icon: '✍️',
    color: 'from-orange-500 to-red-500'
  },
];

const Exercise = () => {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExercise, setShowExercise] = useState(false);

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
        const foundUnit = data.find((u: Unit) => u.id === Number(unitId));
        
        if (foundUnit) {
          setUnit(foundUnit);
        } else {
          setError('Ünite bulunamadı');
        }
      } catch (err) {
        console.error('Veri yüklenirken bir hata oluştu:', err);
        setError('Veri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [unitId]);

  const handleStart = () => {
    if (selectedType) {
      setShowExercise(true);
    }
  };

  const handleComplete = () => {
    setShowExercise(false);
    setSelectedType(null);
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

  if (error || !unit) {
    return (
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-red-500 text-xl">{error}</div>
        </div>
      </div>
    );
  }

  if (showExercise && selectedType) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="rounded-xl shadow-sm p-8">
            {selectedType === 'multiple-choice' && (
              <MultipleChoice unit={unit} onComplete={handleComplete} />
            )}
            {selectedType === 'matching' && (
              <Matching unit={unit} onComplete={handleComplete} />
            )}
            {selectedType === 'writing' && (
              <Writing unit={unit} onComplete={handleComplete} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-12">
          <Link
            to="/units"
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            <span>Geri Dön</span>
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Egzersiz Seç
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {exerciseTypes.map((type) => (
            <motion.div
              key={type.id}
              className="relative cursor-pointer transform-gpu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedType(type.id)}
            >
              <div
                className={`h-64 rounded-xl p-6 bg-gradient-to-br ${type.color} transition-all duration-300 ${
                  selectedType === type.id
                    ? 'ring-4 ring-blue-400 shadow-2xl scale-105'
                    : 'shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="text-4xl mb-4">{type.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{type.title}</h3>
                <p className="text-white/80">{type.description}</p>
                {selectedType === type.id && (
                  <div className="absolute top-4 right-4 bg-white rounded-full p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-blue-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <motion.button
            onClick={handleStart}
            disabled={!selectedType}
            className={`px-8 py-3 rounded-lg text-lg font-semibold transition-colors ${
              selectedType
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
            whileHover={selectedType ? { scale: 1.05 } : {}}
            whileTap={selectedType ? { scale: 0.95 } : {}}
          >
            Başla
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Exercise;
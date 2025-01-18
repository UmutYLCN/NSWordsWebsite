import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

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
  }
];

const Exercise = () => {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleStart = () => {
    if (selectedType) {
      navigate(`/exercise/${unitId}/${selectedType}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-12 justify-between">
          <Link to={`/flashcards/${unitId}`} className="flex items-center text-gray-600 hover:text-primary transition-colors">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            <span>Geri Dön</span>
          </Link>
          <h1 className="text-3xl font-bold text-primary">Egzersiz Seç</h1>
          <div className="w-24"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {exerciseTypes.map((type) => (
            <motion.div
              key={type.id}
              className={`relative cursor-pointer transform-gpu`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedType(type.id)}
            >
              <div
                className={`h-64 rounded-xl p-6 bg-gradient-to-br ${type.color} transition-all duration-300 ${
                  selectedType === type.id 
                    ? 'ring-4 ring-primary shadow-2xl scale-105' 
                    : 'shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="text-4xl mb-4">{type.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{type.title}</h3>
                <p className="text-white/80">{type.description}</p>
                {selectedType === type.id && (
                  <div className="absolute top-4 right-4 bg-white rounded-full p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
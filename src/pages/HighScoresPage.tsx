import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface Score {
  name: string;
  score: number;
  date: string;
}

const HighScoresPage = () => {
  const [highScores, setHighScores] = useState<Score[]>([]);
  
  useEffect(() => {
    // Yüksek skorları localStorage'dan yükle
    const savedScores = localStorage.getItem('vocabularyTestScores');
    if (savedScores) {
      setHighScores(JSON.parse(savedScores));
    }
  }, []);
  
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
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Skor Tablosu</h2>
          
          {highScores.length > 0 ? (
            <div className="bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Sıra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      İsim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Puan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Tarih
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {highScores.map((scoreItem, index) => (
                    <tr key={index} className="hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {scoreItem.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {scoreItem.score}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {scoreItem.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-800 p-6 rounded-xl mb-6 text-gray-300">
              Henüz yüksek skor kaydedilmemiş.
              <p className="mt-4">
                <Link to="/vocabulary-test" className="text-blue-400 hover:text-blue-300 underline">
                  Kelime testine katılarak ilk skoru kaydeden siz olun!
                </Link>
              </p>
            </div>
          )}
          
          <div className="mt-8">
            <Link 
              to="/vocabulary-test"
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
            >
              Kelime Testine Katıl
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HighScoresPage; 
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Link to="/units" className="group">
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 p-6 rounded-xl border border-purple-500/30 hover:border-purple-500/60 transition-all h-full flex flex-col">
          <div className="bg-purple-500/20 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
            <BookOpenIcon className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors">Kelimeleri Keşfet</h3>
          <p className="text-gray-400 flex-grow">
            Farklı kategorilerdeki kelimeleri keşfedin ve öğrenmeye başlayın.
          </p>
        </div>
      </Link>

      <Link to="/vocabulary-test" className="group">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 p-6 rounded-xl border border-blue-500/30 hover:border-blue-500/60 transition-all h-full flex flex-col">
          <div className="bg-blue-500/20 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
            <AcademicCapIcon className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors">Kendini Test Et</h3>
          <p className="text-gray-400 flex-grow">
            Alıştırmalar ile kelime bilginizi sınayın ve pekiştirin.
          </p>
        </div>
      </Link>
    </div>
  );
};

export default Home; 
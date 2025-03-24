import { Link } from 'react-router-dom';
import { ChartBarIcon, BookOpenIcon, AcademicCapIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { Word } from '../types/types';
import ThemeToggle from '../components/ThemeToggle';

export default function Home() {
  const [showDictionary, setShowDictionary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);

  useEffect(() => {
    const loadWords = async () => {
      try {
        const baseUrl = import.meta.env.BASE_URL;
        const response = await fetch(`${baseUrl}data.json`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const words = data.flatMap((unit: any) => unit.words);
        setAllWords(words);
      } catch (error) {
        console.error('Kelimeler yüklenirken bir hata oluştu:', error);
      }
    };

    loadWords();
  }, []);

  useEffect(() => {
    const filtered = allWords.filter(word => 
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.translation.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredWords(filtered);
  }, [searchTerm, allWords]);

  return (
    <div className="min-h-screen dark:bg-gray-900">
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-sm z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary dark:text-primary">NSWords</h1>
          <div className="flex items-center space-x-8">
            <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary">Hakkında</Link>
            <Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary">İletişim</Link>
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <main className="pt-24 pb-16 dark:bg-gray-900">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Kelime Haznenizi Geliştirin</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
              NSWords ile İngilizce kelime öğrenmeyi daha etkili ve eğlenceli hale getirin. 
              Üniteler halinde düzenlenmiş kelimeler, alıştırmalar ile 
              öğrenme sürecinizi hızlandırın.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/units"
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <BookOpenIcon className="w-5 h-5 mr-2" />
                Üniteleri Keşfet
              </Link>
              <button
                onClick={() => setShowDictionary(true)}
                className="inline-flex items-center px-6 py-3 bg-secondary dark:bg-gray-800 text-primary dark:text-primary rounded-lg hover:bg-secondary/90 dark:hover:bg-gray-700 transition-colors"
              >
                <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                Sözlük
              </button>
            </div>
          </div>

          <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-secondary dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <BookOpenIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Kelime Üniteleri</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Kategorilere ayrılmış kelime üniteleri ile sistemli bir şekilde İngilizce kelime öğrenin.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-secondary dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <AcademicCapIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Hafıza Oyunu</h3>
              <p className="text-gray-600 dark:text-gray-400">
                İki kişilik eğlenceli hafıza oyunu ile kelime öğrenmeyi daha keyifli hale getirin.
              </p>
            </div>
          </div>
        </section>
      </main>

      {showDictionary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-lg shadow-xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sözlük</h3>
              <button
                onClick={() => setShowDictionary(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Kelime ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-700 dark:text-white"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <div className="mt-4 max-h-96 overflow-y-auto">
                {filteredWords.map((word, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{word.word}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{word.translation}</p>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {word.definition}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
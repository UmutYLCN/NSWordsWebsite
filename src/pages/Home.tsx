import { Link } from 'react-router-dom';
import { ChartBarIcon, BookOpenIcon, AcademicCapIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { Word } from '../types/types';

export default function Home() {
  const [showDictionary, setShowDictionary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);

  useEffect(() => {
    const loadWords = async () => {
      try {
        const response = await fetch('/data.json');
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
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">NSWords</h1>
          <ul className="flex space-x-8">
            <li><a href="#" className="text-gray-600 hover:text-primary">Hakkında</a></li>
            <li><a href="#" className="text-gray-600 hover:text-primary">Quiz</a></li>
            <li><a href="#" className="text-gray-600 hover:text-primary">İletişim</a></li>
          </ul>
        </nav>
      </header>

      <main className="pt-24 pb-16">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Kelime Haznenizi Geliştirin</h2>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              NSWords ile İngilizce kelime öğrenmeyi daha etkili ve eğlenceli hale getirin. 
              Üniteler halinde düzenlenmiş kelimeler, alıştırmalar ve takip sistemi ile 
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
                className="inline-flex items-center px-6 py-3 bg-secondary text-primary rounded-lg hover:bg-secondary/90 transition-colors"
              >
                <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                Sözlük
              </button>
            </div>
          </div>

          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
                <BookOpenIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Kelime Üniteleri</h3>
              <p className="text-gray-600">
                Kategorilere ayrılmış kelime üniteleri ile sistemli bir şekilde İngilizce kelime öğrenin.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
                <ChartBarIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Alıştırmalar</h3>
              <p className="text-gray-600">
                Çeşitli egzersiz tipleri ile öğrendiğiniz kelimeleri pekiştirin ve pratik yapın.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
                <AcademicCapIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hafıza Oyunu</h3>
              <p className="text-gray-600">
                İki kişilik eğlenceli hafıza oyunu ile kelime öğrenmeyi daha keyifli hale getirin.
              </p>
            </div>
          </div>
        </section>
      </main>

      {showDictionary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Sözlük</h3>
              <button
                onClick={() => setShowDictionary(false)}
                className="text-gray-500 hover:text-gray-700"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <div className="mt-4 max-h-96 overflow-y-auto">
                {filteredWords.map((word, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{word.word}</h4>
                        <p className="text-sm text-gray-600">{word.translation}</p>
                      </div>
                      <div className="text-sm text-gray-500">
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
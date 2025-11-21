import { Link } from 'react-router-dom';
import { BookOpenIcon, AcademicCapIcon, PuzzlePieceIcon, MagnifyingGlassIcon, XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, useRef } from 'react';
import { Word } from '../types/types';
import ThemeToggle from '../components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [showWordDetail, setShowWordDetail] = useState(false);

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
        setFilteredWords(words);
      } catch (error) {
        console.error('Kelimeler yüklenirken bir hata oluştu:', error);
      }
    };

    loadWords();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      if (searchFocused) {
        setFilteredWords(allWords);
        setShowSearchResults(true);
      } else {
        setShowSearchResults(false);
      }
      return;
    }

    const filtered = allWords.filter(word =>
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.translation.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredWords(filtered);
    setShowSearchResults(true);
  }, [searchTerm, allWords, searchFocused]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node) &&
        !document.getElementById('dictionaryPopup')?.contains(event.target as Node)) {
        setShowSearchResults(false);
        setSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSearchResults(true);
  };

  const handleSearchFocus = () => {
    setSearchFocused(true);
    setShowSearchResults(true);
    if (searchTerm.trim() === '') {
      setFilteredWords(allWords);
    }
  };

  const handleWordClick = (word: Word) => {
    setSelectedWord(word);
    setShowWordDetail(true);
  };

  const closeWordDetail = () => {
    setShowWordDetail(false);
    setTimeout(() => setSelectedWord(null), 300);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="fixed top-0 left-0 right-0 bg-gray-900 shadow-md z-50 border-b border-gray-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">NSWords</h1>
          <div className="flex items-center space-x-8">
            <Link to="/learning-path" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors flex items-center">
              <span className="mr-2">🚀</span> Öğrenme Yolu
            </Link>
            <Link to="/high-scores" className="text-gray-300 hover:text-white">Skor Tablosu</Link>
            <Link to="/contact" className="text-gray-300 hover:text-white">İletişim</Link>
            <div className="opacity-50 pointer-events-none">
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </header>

      <main className="pt-28 pb-16 px-4 relative overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
            className="relative w-16 h-16"
          >
            <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-30"></div>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
              <path d="M32 5V59M5 32H59M13 13L51 51M13 51L51 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="32" cy="32" r="8" fill="#60A5FA" />
            </svg>
          </motion.div>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 relative pt-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-medium text-blue-400 mb-4"
            >
              NSWords'e Hoş Geldiniz
            </motion.h2>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-5xl font-bold text-white mb-8"
            >
              Kelime öğrenmeye başlayın
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
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

            <Link to="/memory-game" className="group">
              <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 p-6 rounded-xl border border-emerald-500/30 hover:border-emerald-500/60 transition-all h-full flex flex-col">
                <div className="bg-emerald-500/20 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <PuzzlePieceIcon className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-emerald-300 transition-colors">Hafıza Oyunu</h3>
                <p className="text-gray-400 flex-grow">
                  İki kişilik eğlenceli hafıza oyunu ile kelime öğrenmeyi daha keyifli hale getirin.
                </p>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="max-w-xl mx-auto relative"
          >
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Kelime ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={handleSearchFocus}
                className="w-full px-6 py-4 bg-gray-800/50 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-700 hover:bg-gray-600"
              >
                <MagnifyingGlassIcon className="w-5 h-5 text-blue-400" />
              </button>
            </form>

            {/* Sözlük popup - ARAMA ÇUBUĞUNUN ALTINDA, arkaplan kaldırıldı */}
            <AnimatePresence>
              {showSearchResults && (
                <motion.div
                  id="dictionaryPopup"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full left-0 right-0 mb-4 bg-gray-800/90 backdrop-blur-md border border-gray-700/80 rounded-xl shadow-2xl z-20 flex flex-col overflow-hidden max-h-[70vh]"
                >
                  {/* Popup Başlık */}
                  <div className="p-4 border-b border-gray-700/80 flex justify-between items-center sticky top-0 bg-gray-800/95 backdrop-blur-md z-10">
                    <div className="flex items-center space-x-3">
                      {showWordDetail ? (
                        <button
                          onClick={closeWordDetail}
                          className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      ) : null}
                      <h3 className="text-xl font-medium text-blue-400">
                        Dictionary
                        <span className="text-white font-light ml-2 text-sm">
                          {filteredWords.length} kelime
                        </span>
                      </h3>
                    </div>
                    <button onClick={() => setShowSearchResults(false)} className="p-2 rounded-full hover:bg-gray-700">
                      <XMarkIcon className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Kelime listesi veya Kelime detayı */}
                  <AnimatePresence mode="wait">
                    {!showWordDetail ? (
                      <motion.div
                        key="wordList"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-2 flex-1 overflow-y-auto"
                      >
                        {filteredWords.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {filteredWords.map((word, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.015 }}
                                className="p-4 hover:bg-blue-500/10 border border-gray-700/30 rounded-xl transition-colors cursor-pointer"
                                onClick={() => handleWordClick(word)}
                              >
                                <div className="mb-2 flex justify-between">
                                  <div>
                                    <h4 className="font-medium text-lg text-white">{word.word}</h4>
                                    <p className="text-blue-300">{word.translation}</p>
                                  </div>
                                  <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                {word.definition && (
                                  <div className="text-sm text-gray-400 bg-gray-800/80 px-3 py-2 rounded-lg mt-2">
                                    {word.definition.length > 100
                                      ? word.definition.substring(0, 100) + "..."
                                      : word.definition}
                                  </div>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center flex flex-col items-center justify-center h-full">
                            <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-gray-700/50">
                              <MagnifyingGlassIcon className="w-10 h-10 text-gray-500" />
                            </div>
                            <p className="text-gray-400 text-lg">Kelime bulunamadı</p>
                            <p className="text-gray-500 text-sm mt-2">Farklı bir arama terimi deneyin</p>
                          </div>
                        )}
                      </motion.div>
                    ) : selectedWord ? (
                      <motion.div
                        key="wordDetail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="p-6 overflow-y-auto"
                      >
                        <div className="mb-6">
                          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 rounded-xl border border-blue-500/30">
                            <h2 className="text-2xl font-bold text-white mb-1">{selectedWord.word}</h2>
                            <p className="text-xl text-blue-400">{selectedWord.translation}</p>
                          </div>
                        </div>

                        {selectedWord.definition && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="mb-6"
                          >
                            <h4 className="text-lg font-medium text-gray-300 mb-2">Tanım</h4>
                            <p className="text-gray-400 bg-gray-700/50 p-4 rounded-lg">{selectedWord.definition}</p>
                          </motion.div>
                        )}

                        {selectedWord.examples && selectedWord.examples.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="mb-6"
                          >
                            <h4 className="text-lg font-medium text-gray-300 mb-2">Örnekler</h4>
                            <div className="space-y-2">
                              {selectedWord.examples.map((example, index) => (
                                <div key={index} className="text-gray-400 bg-gray-700/50 p-3 rounded-lg italic">
                                  "{example}"
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {selectedWord.meaning && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                            className="mb-6"
                          >
                            <h4 className="text-lg font-medium text-gray-300 mb-2">Anlam</h4>
                            <p className="text-gray-400 bg-gray-700/50 p-4 rounded-lg">{selectedWord.meaning}</p>
                          </motion.div>
                        )}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
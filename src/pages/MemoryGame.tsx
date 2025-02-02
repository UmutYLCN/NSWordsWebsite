import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QuestionMarkCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { motion} from 'framer-motion';
import { Unit} from '../types';
import { TrophyIcon } from '@heroicons/react/24/solid';

interface Player {
  name: string;
  score: number;
  color: string;
}

interface Card {
  id: string;
  content: string;
  type: 'word' | 'translation';
  originalId: number;
  isFlipped: boolean;
  isMatched: boolean;
  matchedBy?: number;
}

const Confetti = () => {
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
  const pieces = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    x: Math.random() * window.innerWidth,
    y: -20,
    rotation: Math.random() * 360,
    scale: Math.random() * 0.5 + 0.5,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));

  return (
    <div className="fixed inset-0 pointer-events-none">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            x: piece.x,
            y: piece.y,
            rotate: piece.rotation,
            scale: piece.scale
          }}
          animate={{
            y: window.innerHeight + 20,
            rotate: piece.rotation + 360
          }}
          transition={{
            duration: Math.random() * 2 + 1,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            backgroundColor: piece.color,
            borderRadius: '50%'
          }}
        />
      ))}
    </div>
  );
};

const playerColors = [
  { name: 'Mavi', value: 'blue-500' },
  { name: 'Yeşil', value: 'green-500' },
  { name: 'Mor', value: 'purple-500' },
  { name: 'Turuncu', value: 'orange-500' },
  { name: 'Pembe', value: 'pink-500' },
  { name: 'Kırmızı', value: 'red-500' }
] as const;

const ColorPickerPopup = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  selectedColor,
  disabledColor 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSelect: (color: string) => void;
  selectedColor: string;
  disabledColor: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Renk Seçin</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {playerColors.map((color) => (
            <button
              key={color.value}
              onClick={() => {
                onSelect(color.value);
                onClose();
              }}
              disabled={color.value === disabledColor}
              className={`
                w-16 h-16 rounded-xl transition-all relative
                ${color.value === selectedColor ? 'ring-2 ring-offset-2' : ''}
                ${color.value === disabledColor ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105'}
                bg-${color.value}
              `}
              title={color.name}
            >
              {color.value === selectedColor && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const MemoryGame = () => {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [players, setPlayers] = useState<Player[]>([
    { name: 'Player 1', score: 0, color: '' },
    { name: 'Player 2', score: 0, color: '' }
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [canFlip, setCanFlip] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [player1Color, setPlayer1Color] = useState('blue-500');
  const [player2Color, setPlayer2Color] = useState('purple-500');
  const [showColorPicker1, setShowColorPicker1] = useState(false);
  const [showColorPicker2, setShowColorPicker2] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Tarayıcı geri tuşu kontrolü
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      window.history.pushState(null, '', window.location.pathname);
      if (gameStarted && !gameOver) {
        setShowExitConfirm(true);
      }
    };

    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    const loadCards = async () => {
      try {
        const baseUrl = import.meta.env.BASE_URL;
        const response = await fetch(`${baseUrl}data.json`);
        const units: Unit[] = await response.json();

        // Mix ünite kontrolü
        const isMixUnit = Number(unitId) >= 1000;
        let currentUnit: Unit | undefined;
        
        if (isMixUnit) {
          const unitNumber = Number(unitId) - 1000;
          const rwUnit = units.find(u => 
            u.title.includes('Reading & Writing') && 
            u.title.includes(`Unit ${unitNumber}`)
          );
          const lsUnit = units.find(u => 
            u.title.includes('Listening & Speaking') && 
            u.title.includes(`Unit ${unitNumber}`)
          );

          if (rwUnit && lsUnit) {
            currentUnit = {
              id: Number(unitId),
              title: `Mix Unit ${unitNumber}`,
              words: [...rwUnit.words, ...lsUnit.words]
            };
          }
        } else {
          currentUnit = units.find(u => u.id === Number(unitId));
        }

        if (!currentUnit) {
          throw new Error('Ünite bulunamadı');
        }

        // Üniteden rastgele 12 kelime seç
        const shuffledWords = [...currentUnit.words]
          .sort(() => Math.random() - 0.5)
          .slice(0, 12);

        const cardPairs = shuffledWords.flatMap(word => [
          {
            id: `word-${word.id}`,
            content: word.word,
            type: 'word' as const,
            originalId: word.id,
            isFlipped: false,
            isMatched: false
          },
          {
            id: `translation-${word.id}`,
            content: word.translation,
            type: 'translation' as const,
            originalId: word.id,
            isFlipped: false,
            isMatched: false
          }
        ]);

        // Kartları karıştır
        setCards(cardPairs.sort(() => Math.random() - 0.5));
        setLoading(false);
      } catch (error) {
        console.error('Kartlar yüklenirken bir hata oluştu:', error);
        navigate('/units');
      }
    };

    loadCards();
  }, [unitId, navigate]);

  // Alert komponenti
  const Alert = () => {
    if (!showAlert) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg max-w-sm w-full mx-4"
        >
          <div className="flex items-center gap-3 text-red-500 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hata</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Lütfen farklı renkler seçin!</p>
          <button
            onClick={() => setShowAlert(false)}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Tamam
          </button>
        </motion.div>
      </div>
    );
  };

  const handleStartGame = () => {
    if (!player1Color || !player2Color) {
      alert('Lütfen her iki oyuncu için renk seçin');
      return;
    }
    if (player1Color === player2Color) {
      setShowAlert(true);
      return;
    }
    setPlayers([
      { name: player1Name || 'Player 1', score: 0, color: player1Color },
      { name: player2Name || 'Player 2', score: 0, color: player2Color }
    ]);
    setGameStarted(true);
  };

  const handleCardClick = async (cardId: string) => {
    if (!canFlip || flippedCards.includes(cardId)) return;

    const clickedCard = cards.find(card => card.id === cardId);
    if (!clickedCard || clickedCard.isMatched) return;

    // Kartı çevir
    setCards(prevCards =>
      prevCards.map(card =>
        card.id === cardId ? { ...card, isFlipped: true } : card
      )
    );
    setFlippedCards(prev => [...prev, cardId]);

    // İki kart çevrildiğinde
    if (flippedCards.length === 1) {
      setCanFlip(false);
      const firstCard = cards.find(card => card.id === flippedCards[0])!;
      const secondCard = clickedCard;

      // Eşleşme kontrolü
      if (firstCard.originalId === secondCard.originalId) {
        // Eşleşme başarılı
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(card =>
              card.originalId === firstCard.originalId
                ? { ...card, isMatched: true, matchedBy: currentPlayerIndex }
                : card
            )
          );
          setPlayers(prevPlayers =>
            prevPlayers.map((player, idx) =>
              idx === currentPlayerIndex
                ? { ...player, score: player.score + 1 }
                : player
            )
          );
          setFlippedCards([]);
          setCanFlip(true);

          // Oyun bitişi kontrolü
          const allMatched = cards.every(card => 
            card.originalId === firstCard.originalId ? true : card.isMatched
          );
          if (allMatched) {
            setGameOver(true);
            setShowCompletionMessage(true);
          }
        }, 1000);
      } else {
        // Eşleşme başarısız - 2 saniye beklet
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(card =>
              card.id === firstCard.id || card.id === secondCard.id
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
          setCanFlip(true);
          setCurrentPlayerIndex(prevIndex => (prevIndex === 0 ? 1 : 0));
        }, 2000);
      }
    }
  };

  // Oyun bitişi kontrolü için useEffect
  useEffect(() => {
    if (gameStarted && !loading && cards.length > 0) {
      const allMatched = cards.every(card => card.isMatched);
      if (allMatched) {
        setGameOver(true);
        setShowCompletionMessage(true);
      }
    }
  }, [cards, gameStarted, loading]);

  // Çıkış Onay Popup'ı
  const ExitConfirmPopup = () => {
    if (!showExitConfirm) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center max-w-md mx-4"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Oyundan Çıkmak İstediğinize Emin Misiniz?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Oyundan çıkarsanız ilerlemeniz kaydedilmeyecektir.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/units')}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
            >
              Çık
            </button>
            <button
              onClick={() => setShowExitConfirm(false)}
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              İptal
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-primary text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Geri Dön Butonu */}
          <div className="mb-8">
            <Link 
              to="/units"
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              <span>Geri Dön</span>
            </Link>
          </div>

          <div className="flex items-center justify-center">
            <div className="max-w-md w-full">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
                Oyuncu Bilgilerini Girin
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg space-y-6">
                {/* 1. Oyuncu */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-700 dark:text-gray-400">
                      1. Oyuncu <span className="text-sm text-gray-500 dark:text-gray-600">(opsiyonel)</span>
                    </label>
                    <span className="text-sm text-gray-500 dark:text-gray-600">Renk Seç</span>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={player1Name}
                      onChange={(e) => setPlayer1Name(e.target.value)}
                      placeholder="Player 1"
                      className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-gray-400"
                    />
                    <button
                      onClick={() => setShowColorPicker1(true)}
                      className={`w-12 h-12 rounded-lg transition-all ${
                        player1Color ? `bg-${player1Color} ring-2 ring-${player1Color}` : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    />
                  </div>
                </div>

                {/* 2. Oyuncu */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-700 dark:text-gray-400">
                      2. Oyuncu <span className="text-sm text-gray-500 dark:text-gray-600">(opsiyonel)</span>
                    </label>
                    <span className="text-sm text-gray-500 dark:text-gray-600">Renk Seç</span>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={player2Name}
                      onChange={(e) => setPlayer2Name(e.target.value)}
                      placeholder="Player 2"
                      className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-gray-400"
                    />
                    <button
                      onClick={() => setShowColorPicker2(true)}
                      className={`w-12 h-12 rounded-lg transition-all ${
                        player2Color ? `bg-${player2Color} ring-2 ring-${player2Color}` : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    />
                  </div>
                </div>

                <button
                  onClick={handleStartGame}
                  className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Oyunu Başlat
                </button>
              </div>
            </div>
          </div>

          {/* Renk Seçici Popupları */}
          <ColorPickerPopup
            isOpen={showColorPicker1}
            onClose={() => setShowColorPicker1(false)}
            onSelect={setPlayer1Color}
            selectedColor={player1Color}
            disabledColor={player2Color}
          />
          <ColorPickerPopup
            isOpen={showColorPicker2}
            onClose={() => setShowColorPicker2(false)}
            onSelect={setPlayer2Color}
            selectedColor={player2Color}
            disabledColor={player1Color}
          />
          <Alert />
        </div>
      </div>
    );
  }

  if (gameOver) {
    const winner = players[0].score > players[1].score ? players[0] : players[1];

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Confetti />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg max-w-md w-full mx-4 text-center relative"
        >
          <div className="flex justify-center mb-4">
            <TrophyIcon className="w-16 h-16 text-yellow-500" />
          </div>

          <h2 className="text-4xl font-bold text-primary dark:text-white mb-4">
            Tebrikler {winner.name}!
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Oyunu Kazandın! 🎉
          </p>

          <div className="space-y-4 mb-8 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-center px-4">
              <span className="font-semibold">{players[0].name}</span>
              <span className="text-lg font-bold text-primary">{players[0].score} puan</span>
            </div>
            <div className="flex justify-between items-center px-4">
              <span className="font-semibold">{players[1].name}</span>
              <span className="text-lg font-bold text-primary">{players[1].score} puan</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/units')}
            className="bg-primary text-white px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors text-lg font-semibold w-full"
          >
            Ana Menüye Dön
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Completion Message */}
      {showCompletionMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center max-w-md mx-4"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-primary mb-4">Tebrikler!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Oyunu başarıyla tamamladınız!
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">Sonuçlar:</h3>
              {players.map((player, index) => (
                <p key={index} className={`text-${player.color} mb-1`}>
                  {player.name}: {player.score} puan
                </p>
              ))}
            </div>
            <div className="flex justify-center space-x-4">
              <Link
                to="/units"
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Ünitelere Dön
              </Link>
            </div>
          </motion.div>
        </div>
      )}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center max-w-md mx-4"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Oyundan Çıkmak İstediğinize Emin Misiniz?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Oyundan çıkarsanız ilerlemeniz kaydedilmeyecektir.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/units')}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
              >
                Çık
              </button>
              <button
                onClick={() => setShowExitConfirm(false)}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                İptal
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <div className="container mx-auto px-4 py-4">
        {/* Skor Tablosu - Kompakt Tasarım */}
        <div className="flex justify-center mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 w-full max-w-xl">
            <div className="flex justify-between items-center gap-4">
              {players.map((player, idx) => (
                <div
                  key={idx}
                  className={`flex-1 p-2 rounded-lg transition-all ${
                    currentPlayerIndex === idx
                      ? `bg-${player.color}/10 ring-1 ring-${player.color}`
                      : 'bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-${player.color}`} />
                    <span className={`font-medium text-sm text-${player.color} truncate`}>
                      {player.name}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {player.score} puan
                  </div>
                  {currentPlayerIndex === idx && (
                    <div className={`text-xs mt-0.5 text-${player.color}`}>
                      Sıra Sende
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Oyun Alanı */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
          {cards.map((card) => {
            const isSelected = flippedCards.includes(card.id);
            const playerColor = isSelected ? players[currentPlayerIndex].color : '';

            return (
              <motion.div
                key={card.id}
                className={`aspect-[3/4] relative cursor-pointer transform-gpu transition-transform duration-200 ${
                  !card.isMatched && 'hover:scale-105'
                } ${
                  card.isMatched ? 'opacity-40' : ''
                }`}
                onClick={() => handleCardClick(card.id)}
              >
                {/* Ön Yüz (Kapalı) */}
                <motion.div
                  className={`absolute inset-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center p-2 text-center transition-colors ${
                    isSelected 
                      ? `ring-2 ring-${playerColor}` 
                      : ''
                  }`}
                  initial={false}
                  animate={{
                    rotateY: card.isFlipped ? 180 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    backfaceVisibility: 'hidden'
                  }}
                >
                  <QuestionMarkCircleIcon 
                    className={`w-10 h-10 ${
                      isSelected 
                        ? `text-${playerColor}` 
                        : 'text-gray-400 dark:text-gray-600'
                    }`}
                  />
                </motion.div>

                {/* Arka Yüz (Açık) */}
                <motion.div
                  className={`absolute inset-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-2 text-center transition-colors ${
                    card.isMatched
                      ? `ring-2 ring-${players[card.matchedBy || 0].color}`
                      : isSelected
                      ? `ring-2 ring-${playerColor}`
                      : ''
                  }`}
                  initial={false}
                  animate={{
                    rotateY: card.isFlipped ? 0 : -180
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    backfaceVisibility: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <span className={`text-base font-medium ${
                    isSelected ? `text-${playerColor}` : 'text-gray-800 dark:text-gray-400'
                  }`}>
                    {card.content}
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MemoryGame; 
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
      <div className="bg-white rounded-xl p-6 shadow-lg" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Renk Seçin</h3>
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
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [player1Color, setPlayer1Color] = useState('blue-500');
  const [player2Color, setPlayer2Color] = useState('purple-500');
  const [showColorPicker1, setShowColorPicker1] = useState(false);
  const [showColorPicker2, setShowColorPicker2] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    const loadCards = async () => {
      try {
        const response = await fetch('/data.json');
        const units: Unit[] = await response.json();
        const currentUnit = units.find(u => u.id === Number(unitId));

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
          className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full mx-4"
        >
          <div className="flex items-center gap-3 text-red-500 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-semibold">Hata</h3>
          </div>
          <p className="text-gray-600 mb-6">Lütfen farklı renkler seçin!</p>
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
                ? { ...card, isMatched: true }
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
          }
        }, 1000);
      } else {
        // Eşleşme başarısız
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
        }, 1000);
      }
    }
  };

  // Oyun bitişi kontrolü için useEffect
  useEffect(() => {
    if (gameStarted && !loading && cards.length > 0) {
      const allMatched = cards.every(card => card.isMatched);
      if (allMatched) {
        setGameOver(true);
      }
    }
  }, [cards, gameStarted, loading]);

  // Çıkış Onay Popup'ı
  const ExitConfirmPopup = () => {
    if (!showExitConfirm) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full mx-4"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Oyundan Çıkmak İstiyor musunuz?
          </h3>
          <p className="text-gray-600 mb-6">
            Oyundan çıkarsanız ilerlemeniz kaydedilmeyecektir.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/units')}
              className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Evet, Çık
            </button>
            <button
              onClick={() => setShowExitConfirm(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Geri Dön Butonu */}
          <div className="mb-8">
            <Link 
              to="/units"
              className="flex items-center text-gray-600 hover:text-primary transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              <span>Geri Dön</span>
            </Link>
          </div>

          <div className="flex items-center justify-center">
            <div className="max-w-md w-full">
              <h2 className="text-3xl font-bold text-primary text-center mb-8">
                Oyuncu Bilgilerini Girin
              </h2>
              <div className="bg-white rounded-xl p-8 shadow-lg space-y-6">
                {/* 1. Oyuncu */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-700">
                      1. Oyuncu <span className="text-sm text-gray-500">(opsiyonel)</span>
                    </label>
                    <span className="text-sm text-gray-500">Renk Seç</span>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={player1Name}
                      onChange={(e) => setPlayer1Name(e.target.value)}
                      placeholder="Player 1"
                      className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      onClick={() => setShowColorPicker1(true)}
                      className={`w-12 h-12 rounded-lg transition-all ${
                        player1Color ? `bg-${player1Color} ring-2 ring-${player1Color}` : 'bg-gray-100'
                      }`}
                    />
                  </div>
                </div>

                {/* 2. Oyuncu */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-700">
                      2. Oyuncu <span className="text-sm text-gray-500">(opsiyonel)</span>
                    </label>
                    <span className="text-sm text-gray-500">Renk Seç</span>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={player2Name}
                      onChange={(e) => setPlayer2Name(e.target.value)}
                      placeholder="Player 2"
                      className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      onClick={() => setShowColorPicker2(true)}
                      className={`w-12 h-12 rounded-lg transition-all ${
                        player2Color ? `bg-${player2Color} ring-2 ring-${player2Color}` : 'bg-gray-100'
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
          className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full mx-4 text-center relative"
        >
          <div className="flex justify-center mb-4">
            <TrophyIcon className="w-16 h-16 text-yellow-500" />
          </div>

          <h2 className="text-4xl font-bold text-primary mb-4">
            Tebrikler {winner.name}!
          </h2>
          
          <p className="text-xl text-gray-600 mb-8">
            Oyunu Kazandın! 🎉
          </p>

          <div className="space-y-4 mb-8 bg-gray-50 p-4 rounded-lg">
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Üst Bar */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            <span>Geri Dön</span>
          </button>
          {/* Skor Tablosu */}
          <div className="flex space-x-8">
            {players.map((player, idx) => (
              <div
                key={idx}
                className={`text-lg font-semibold ${
                  currentPlayerIndex === idx
                    ? 'text-primary ring-2 ring-primary rounded-lg px-4 py-2'
                    : 'text-gray-600'
                }`}
              >
                {player.name}: {player.score}
              </div>
            ))}
          </div>
        </div>

        {/* Oyun Alanı */}
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              className={`aspect-[3/4] relative cursor-pointer ${
                card.isMatched ? 'opacity-50' : ''
              }`}
              onClick={() => handleCardClick(card.id)}
            >
              <motion.div
                className="absolute inset-0 bg-white rounded-lg shadow-md flex items-center justify-center p-2 text-center"
                initial={false}
                animate={{
                  rotateY: card.isFlipped ? 180 : 0
                }}
                transition={{ duration: 0.3 }}
                style={{
                  backfaceVisibility: 'hidden'
                }}
              >
                <QuestionMarkCircleIcon className="w-12 h-12 text-primary/30" />
              </motion.div>
              <motion.div
                className={`absolute inset-0 ${card.isMatched ? 'bg-primary' : 'bg-white'} text-${card.isMatched ? 'white' : 'primary'} rounded-lg shadow-md flex items-center justify-center p-2 text-center`}
                initial={false}
                animate={{
                  rotateY: card.isFlipped ? 0 : -180
                }}
                transition={{ duration: 0.3 }}
                style={{
                  backfaceVisibility: 'hidden'
                }}
              >
                <span className="text-lg font-medium">{card.content}</span>
              </motion.div>
            </motion.div>
          ))}
        </div>
        <ExitConfirmPopup />
      </div>
    </div>
  );
};

export default MemoryGame; 
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { motion} from 'framer-motion';
import { Unit} from '../types';
import { TrophyIcon } from '@heroicons/react/24/solid';

interface Player {
  name: string;
  score: number;
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

const MemoryGame = () => {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [players, setPlayers] = useState<Player[]>([
    { name: 'Player 1', score: 0 },
    { name: 'Player 2', score: 0 }
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [canFlip, setCanFlip] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');

  useEffect(() => {
    const loadCards = async () => {
      try {
        const response = await fetch('/data.json');
        const units: Unit[] = await response.json();
        const currentUnit = units.find(u => u.id === Number(unitId));

        if (!currentUnit) {
          throw new Error('Ünite bulunamadı');
        }

        const cardPairs = currentUnit.words.flatMap(word => [
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

  const handleStartGame = () => {
    setPlayers([
      { name: player1Name || 'Player 1', score: 0 },
      { name: player2Name || 'Player 2', score: 0 }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <h2 className="text-3xl font-bold text-primary text-center mb-8">
            Oyuncu İsimlerini Girin
          </h2>
          <div className="bg-white rounded-xl p-8 shadow-lg space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">1. Oyuncu</label>
              <input
                type="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder="Player 1"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">2. Oyuncu</label>
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Player 2"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              onClick={handleStartGame}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Oyunu Başlat
            </button>
          </div>
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
        {/* Skor Tablosu */}
        <div className="flex justify-center items-center mb-8">
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
      </div>
    </div>
  );
};

export default MemoryGame; 
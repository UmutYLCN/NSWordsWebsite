import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Units from './pages/Units';
import Flashcards from './pages/Flashcards';
import MemoryGame from './pages/MemoryGame';
import Exercise from './pages/Exercise';
import Contact from './pages/Contact';
import { ThemeProvider } from './contexts/ThemeContext';
import VocabularyTestPage from './pages/VocabularyTestPage';
import HighScoresPage from './pages/HighScoresPage';
import LearningPath from './pages/LearningPath';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/units" element={<Units />} />
        <Route path="/flashcards/:unitId" element={<Flashcards />} />
        <Route path="/memory-game" element={<MemoryGame />} />
        <Route path="/memory-game/:unitId" element={<MemoryGame />} />
        <Route path="/exercise/:unitId" element={<Exercise />} />
        <Route path="/vocabulary-test" element={<VocabularyTestPage />} />
        <Route path="/high-scores" element={<HighScoresPage />} />
        <Route path="/learning-path" element={<LearningPath />} />
        <Route path="/contact" element={<Contact />} />
        {/* Fallback route for the base URL */}
        <Route path="*" element={<Home />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;

import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Units from './pages/Units';
import Flashcards from './pages/Flashcards';
import MemoryGame from './pages/MemoryGame';
import Exercise from './pages/Exercise';
import About from './pages/About';
import Contact from './pages/Contact';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/units" element={<Units />} />
        <Route path="/flashcards/:unitId" element={<Flashcards />} />
        <Route path="/memory-game/:unitId" element={<MemoryGame />} />
        <Route path="/exercise/:unitId" element={<Exercise />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;

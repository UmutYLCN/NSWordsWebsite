import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Units from './pages/Units';
import Flashcards from './pages/Flashcards';
import Exercise from './pages/Exercise';
import MultipleChoice from './pages/exercises/MultipleChoice';
import Matching from './pages/exercises/Matching';
import Writing from './pages/exercises/Writing';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/units" element={<Units />} />
      <Route path="/flashcards/:unitId" element={<Flashcards />} />
      <Route path="/exercise/:unitId" element={<Exercise />} />
      <Route path="/exercise/:unitId/multiple-choice" element={<MultipleChoice />} />
      <Route path="/exercise/:unitId/matching" element={<Matching />} />
      <Route path="/exercise/:unitId/writing" element={<Writing />} />
    </Routes>
  );
}

export default App;

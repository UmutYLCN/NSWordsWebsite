import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Units from './pages/Units';
import Flashcards from './pages/Flashcards';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/units" element={<Units />} />
      <Route path="/flashcards/:unitId" element={<Flashcards />} />
    </Routes>
  );
}

export default App;

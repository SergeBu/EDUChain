import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Staking from './pages/Staking';
import Courses from './pages/Courses';
import Navigation from './components/Navigation'; // Создадим этот компонент

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/staking" element={<Staking />} />
        <Route path="/courses" element={<Courses />} />
      </Routes>
    </Router>
  );
}

export default App;
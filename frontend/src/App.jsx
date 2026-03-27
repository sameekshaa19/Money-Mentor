import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import XRay from './pages/XRay';
import HealthScore from './pages/HealthScore';
import Fire from './pages/Fire';
import Goals from './pages/Goals';
import LifeEvent from './pages/LifeEvent';
import Couple from './pages/Couple';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/xray" element={<XRay />} />
          <Route path="/health" element={<HealthScore />} />
          <Route path="/fire" element={<Fire />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/events" element={<LifeEvent />} />
          <Route path="/couple" element={<Couple />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
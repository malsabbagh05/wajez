import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Jiz from './pages/Jiz'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jiz" element={<Jiz />} />
      </Routes>
    </Router>
  )
}

export default App

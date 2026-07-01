import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import Home from './pages/Home'
import { Routes, Route } from 'react-router-dom'
import About from './pages/About'
import NavBar from './components/NavyBar'
import Footer from './components/Footer'
import WarningBanner from './components/WarningBanner'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gray-50">
      <WarningBanner />   {/* 항상 최상단 고정 */}
      <NavBar />          {/* 그 아래 네비 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
      
      <Footer />          {/* 페이지 하단 푸터 */}
    </div>
  )
}


export default App

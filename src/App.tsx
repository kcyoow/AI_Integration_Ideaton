import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import ChatBot from './pages/ChatBot'
import PolicyRecommendation from './pages/PolicyRecommendation'
import MedicalFacilities from './pages/MedicalFacilities'
import PostpartumCare from './pages/PostpartumCare'
import Community from './pages/Community'

// ScrollToTop 컴포넌트
const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
}

const pageStyle = {
  position: 'relative',
  width: '100%',
  minHeight: '100%'
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-gradient-bg-government flex flex-col">
        <Navbar />
        <main className="flex-grow relative">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={
                <motion.div
                  key="home"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  style={pageStyle}
                >
                  <Home />
                </motion.div>
              } />
              <Route path="/chatbot" element={
                <motion.div
                  key="chatbot"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  style={pageStyle}
                >
                  <ChatBot />
                </motion.div>
              } />
              <Route path="/policy" element={
                <motion.div
                  key="policy"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  style={pageStyle}
                >
                  <PolicyRecommendation />
                </motion.div>
              } />
              <Route path="/medical" element={
                <motion.div
                  key="medical"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  style={pageStyle}
                >
                  <MedicalFacilities />
                </motion.div>
              } />
              <Route path="/postpartum" element={
                <motion.div
                  key="postpartum"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  style={pageStyle}
                >
                  <PostpartumCare />
                </motion.div>
              } />
              <Route path="/community" element={
                <motion.div
                  key="community"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  style={pageStyle}
                >
                  <Community />
                </motion.div>
              } />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App

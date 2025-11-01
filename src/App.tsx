import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import ChatBot from './pages/ChatBot'
import PolicyRecommendation from './pages/PolicyRecommendation'
import MedicalFacilities from './pages/MedicalFacilities'
import PostpartumCare from './pages/PostpartumCare'
import Community from './pages/Community'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
        <Navbar />
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-grow"
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chatbot" element={<ChatBot />} />
            <Route path="/policy" element={<PolicyRecommendation />} />
            <Route path="/medical" element={<MedicalFacilities />} />
            <Route path="/postpartum" element={<PostpartumCare />} />
            <Route path="/community" element={<Community />} />
          </Routes>
        </motion.main>
        <Footer />
      </div>
    </Router>
  )
}

export default App

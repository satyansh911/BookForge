import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import Layout from './components/layout/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import EditorPage from './pages/EditorPage'
import ViewBookPage from './pages/ViewBookPage'
import ProfilePage from './pages/ProfilePage'
import PricingPage from './pages/PricingPage'
import ExplorePage from './pages/ExplorePage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import DashboardLayout from './components/layout/DashboardLayout'

gsap.registerPlugin(ScrollTrigger);

const App = () => {
  useEffect(() => {
    // Global GSAP Config
    gsap.config({
      nullTargetWarn: false,
    });
  }, []);

  const { user } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/view-book/:bookId" element={<ProtectedRoute><ViewBookPage/></ProtectedRoute>} />
      </Routes>
      <Layout>
        <Routes>
          <Route path="/" element={user ? <DashboardPage /> : <LandingPage/>} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/signup" element={<SignupPage/>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage/></ProtectedRoute>} />
          <Route path="/editor/:bookId" element={<ProtectedRoute><EditorPage/></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage/></ProtectedRoute>} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
        </Routes>
      </Layout>
    </>
  )
}

export default App
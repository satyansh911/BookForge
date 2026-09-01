import React, { useEffect } from 'react'
import { Routes, Route, Outlet, Link } from 'react-router-dom'
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
import BookDetailsPage from './pages/BookDetailsPage'
import MangaPage from './pages/MangaPage'
import DiscussionPage from './pages/DiscussionPage'
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
    // One route tree, not two. Two sibling <Routes> meant every navigation
    // logged "No routes matched location" from whichever tree missed, and the
    // full-screen reader still rendered Layout's navbar and footer around an
    // empty <main>. A layout route gives the reader the bare page it wants.
    <Routes>
      <Route path="/view-book/:bookId" element={<ViewBookPage/>} />

      <Route element={<ChromeLayout/>}>
        <Route path="/" element={user ? <DashboardPage /> : <LandingPage/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/signup" element={<SignupPage/>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage/></ProtectedRoute>} />
        <Route path="/editor/:bookId" element={<ProtectedRoute><EditorPage/></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage/></ProtectedRoute>} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/book/:bookId" element={<BookDetailsPage />} />
        <Route path="/manga" element={<ProtectedRoute><MangaPage/></ProtectedRoute>} />
        <Route path="/discuss/:type/:id" element={<ProtectedRoute><DiscussionPage/></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage/>} />
      </Route>
    </Routes>
  )
}

const ChromeLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

// Previously an unknown URL rendered an empty page with no explanation.
const NotFoundPage = () => (
  <div className="py-32 text-center space-y-6">
    <p className="text-[10px] tracking-[0.3em] text-muted uppercase">Error 404</p>
    <h1 className="font-serif text-5xl font-black uppercase tracking-tighter">
      This page was never bound.
    </h1>
    <p className="text-secondary max-w-md mx-auto">
      The address you followed does not exist in this archive.
    </p>
    <Link
      to="/"
      className="inline-block mt-4 px-8 py-4 bg-primary text-white text-xs tracking-[0.2em] font-black uppercase"
    >
      Return to the archive
    </Link>
  </div>
);

export default App
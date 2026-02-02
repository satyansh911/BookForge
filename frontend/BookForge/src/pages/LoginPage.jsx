import { useState } from "react"
import {Link, useNavigate} from "react-router-dom"
import {Mail, Lock, BookOpen, ArrowLeft} from "lucide-react"
import toast from "react-hot-toast"

import InputField from  "../components/ui/InputField.jsx"
import Button from  "../components/ui/Button.jsx"
import { useAuth } from "../context/AuthContext"
import axiosInstance from "../utils/axiosInstance.js"
import { API_PATHS } from "../utils/apiPaths.js"
import LottieSafeWrapper from "../components/ui/LottieSafeWrapper.jsx"

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const {login} = useAuth();
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, formData);
      const {token} = response.data;

      const profileResponse = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE, {
        headers: {Authorization: `Bearer ${token}`},
      });
       login(profileResponse.data, token);
       toast.success("Login successful!");
       navigate("/dashboard");
    } catch (error) {
      localStorage.clear();
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen overflow-hidden" 
         style={{
           background: 'linear-gradient(135deg, #ffe8f3, #d9f3ff)'
         }}>
      {/* Navbar */}
      <header className="relative z-20 bg-white/60 backdrop-blur-md border-b border-gray-100/50">
        <div className='max-w-7xl mx-auto px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <Link to='/' className='flex items-center space-x-2.5 group'>
              <LottieSafeWrapper src="/logo.json" size={60} />
              <span className='text-xl font-semibold text-gray-900 tracking-tight'>
                BookForge
              </span>
            </Link>
            <div className='flex items-center space-x-3'>
              <Link 
                to='/'
                className='px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white/50 transition-all duration-200 flex items-center gap-2'
              >
                <ArrowLeft className='h-4 w-4' />
                Back to Home
              </Link>
              <Link 
                to='/signup'
                className='px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-400 to-purple-500 rounded-lg shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-200 hover:scale-105'
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Background gradient layers */}
      <div className="absolute inset-0 overflow-hidden" 
           style={{
             background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2), rgba(0, 0, 0, 0.1))'
           }}>
        <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%]"
             style={{
               background: 'conic-gradient(from 0deg, #ff9aa2, #ffb7b2, #ffdac1, #e2f0cb, #a2e4ff, #c9afff, #ffb7b2, #ff9aa2)',
               transform: 'translate(-50%, -50%)',
               animation: 'rotate 8s linear infinite',
               filter: 'blur(50px)',
               opacity: 0.8
             }} />
        <div className="absolute top-1/2 left-1/2 w-[180%] h-[180%]"
             style={{
               background: 'conic-gradient(from 0deg, #ff9aa2, #ffb7b2, #ffdac1, #e2f0cb, #a2e4ff, #c9afff, #ffb7b2, #ff9aa2)',
               transform: 'translate(-50%, -50%)',
               animation: 'rotate-reverse 10s linear infinite',
               filter: 'blur(50px)',
               opacity: 0.6
             }} />
      </div>

      {/* Login form container */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-600 mt-2">Sign in to continue to your eBook dashboard.</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                icon={Mail}
                required
              />
              <InputField
                label="Password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                icon={Lock}
                required
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                Sign In
              </Button>
            </form>
            <p className="text-center text-sm text-slate-600 mt-8">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-violet-600 hover:text-violet-700">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
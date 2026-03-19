import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { LogIn } from "lucide-react"

import Button from "../components/ui/Button"
import InputField from "../components/ui/InputField"
import Reveal from "../components/ui/Reveal"
import { useAuth } from "../context/AuthContext"

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success("Welcome back to the monograph.");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-20 items-center">
        {/* Left Side: Context */}
        <div className="hidden lg:block space-y-12">
          <Reveal direction="left">
            <h1 className="text-8xl font-serif font-black tracking-tighter uppercase leading-[0.8]">
              LOG <br />
              <span className="text-secondary opacity-30">INTO</span> <br />
              MANU <br />
              SCRIPT.
            </h1>
          </Reveal>
          <Reveal direction="left" delay={0.2}>
            <p className="text-lg text-secondary max-w-sm leading-relaxed font-serif italic">
               "Designing for the screen is designing for time; designing for the page is designing for eternity."
            </p>
          </Reveal>
        </div>

        {/* Right Side: Form */}
        <Reveal direction="right" className="bg-white border border-border p-12 md:p-20 shadow-2xl relative">
          <div className="absolute top-0 right-0 w-12 h-12 bg-accent/10 border-l border-b border-border" />
          
          <div className="mb-12">
            <h2 className="text-3xl font-serif font-bold uppercase tracking-tight mb-2">IDENTIFICATION</h2>
            <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-bold">Access the global monograph repository</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <InputField
              label="CREDENTIAL ID (EMAIL)"
              type="email"
              name="email"
              placeholder="user@monograph.agency"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <InputField
              label="SECURITY KEY (PASSWORD)"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            <div className="pt-8 space-y-8">
              <Button 
                type="submit" 
                isLoading={isLoading} 
                className="w-full py-5 text-sm flex items-center justify-center gap-4"
              >
                <LogIn size={18} />
                AUTHORIZE ACCESS
              </Button>
              
              <div className="flex justify-between items-center text-[10px] tracking-widest font-bold uppercase pt-8 border-t border-border/50">
                <span className="text-muted">NEW TO BOOKFORGE?</span>
                <Link to="/signup" className="text-accent hover:text-primary transition-colors hover:underline underline-offset-4">
                  INITIALIZE ACCOUNT
                </Link>
              </div>
            </div>
          </form>
        </Reveal>
      </div>
    </div>
  )
}

export default LoginPage
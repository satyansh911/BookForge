import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { UserPlus } from "lucide-react"

import Button from "../components/ui/Button"
import InputField from "../components/ui/InputField"
import Reveal from "../components/ui/Reveal"
import { useAuth } from "../context/AuthContext"

const SignupPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup(formData.name, formData.email, formData.password);
      toast.success("Account initialized. Welcome to the collective.");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-20 items-center">
        {/* Left Side: Context (Order reversed on mobile handled by grid) */}
        <Reveal direction="left" className="bg-background border border-border p-12 md:p-20 shadow-2xl relative order-2 lg:order-1">
          <div className="absolute top-0 left-0 w-12 h-12 bg-accent/10 border-r border-b border-border" />
          
          <div className="mb-12">
            <h2 className="text-3xl font-serif font-bold uppercase tracking-tight mb-2">INITIALIZATION</h2>
            <p className="text-muted text-[10px] tracking-[0.4em] uppercase font-bold">JOIN THE DESIGN MONOGRAPH COLLECTIVE</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <InputField
              label="IDENTITY NAME"
              type="text"
              name="name"
              placeholder="FULL LEGAL NAME"
              value={formData.name}
              onChange={handleChange}
              required
            />
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
                <UserPlus size={18} />
                REGISTER ARCHIVE
              </Button>
              
              <div className="flex justify-between items-center text-[10px] tracking-widest font-bold uppercase pt-8 border-t border-border/50">
                <span className="text-muted">ALREADY REGISTERED?</span>
                <Link to="/login" className="text-accent hover:text-primary transition-colors hover:underline underline-offset-4">
                  AUTHORIZE ACCESS
                </Link>
              </div>
            </div>
          </form>
        </Reveal>

        {/* Right Side: Large Typography */}
        <div className="hidden lg:block space-y-12 order-1 lg:order-2 text-right">
          <Reveal direction="right">
            <h1 className="text-8xl font-serif font-black tracking-tighter uppercase leading-[0.8]">
              JOIN <br />
              <span className="text-secondary opacity-30">THE</span> <br />
              FOUN <br />
              DRY.
            </h1>
          </Reveal>
          <Reveal direction="right" delay={0.2}>
            <p className="text-lg text-secondary ml-auto max-w-sm leading-relaxed font-serif italic">
               "Every book is a world; every page is a decision."
            </p>
          </Reveal>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
import React from 'react';
import { Check, Zap, Shield, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import Reveal from '../components/ui/Reveal';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const PricingPage = () => {
  const { user, updateUser } = useAuth();

  const handleUpgrade = async () => {
     // Mock upgrade logic
     toast.loading("Processing transaction...", { id: 'billing' });
     setTimeout(() => {
        updateUser({ tier: 'premium' });
        toast.success("Welcome to Synthesis. AI features unlocked.", { id: 'billing' });
     }, 2000);
  };

  const plans = [
    {
      name: "Manuscript",
      price: "0",
      description: "For the dedicated reader and manual curator.",
      features: [
        "Unlimited Gallery Search",
        "Personal PDF Ingestion",
        "Premium Paginated Reader",
        "High-End Export Options",
        "Manual Book Creation"
      ],
      buttonText: user?.tier === 'premium' ? "CURRENT PLAN" : "FREE FOREVER",
      disabled: true,
      popular: false
    },
    {
      name: "Synthesis",
      price: "19",
      description: "For the knowledge architect who builds at scale.",
      features: [
        "Everything in Manuscript",
        "AI-Driven Book Outlines",
        "Automated Chapter Synthesis",
        "Infinite Intelligence",
        "Early Access to Lab Features",
        "Priority Architecture Support"
      ],
      buttonText: user?.tier === 'premium' ? "CURRENT PLAN" : "UPGRADE TO PRO",
      disabled: user?.tier === 'premium',
      popular: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-32 pb-32">
      {/* Header */}
      <Reveal direction="up">
        <header className="text-center space-y-8 max-w-3xl mx-auto">
          <p className="text-[10px] tracking-[0.5em] text-muted uppercase font-bold">Commerce / Tiers</p>
          <h1 className="text-6xl md:text-8xl font-serif font-black tracking-tighter uppercase leading-[0.85]">
            Invest in <br />
            <span className="text-secondary italic">Intelligence.</span>
          </h1>
          <p className="text-xl text-secondary leading-relaxed font-serif">
            Select the architecture that suits your knowledge synthesis needs. 
            From manual curation to AI-driven mastery.
          </p>
        </header>
      </Reveal>

      {/* Pricing Grid */}
      <div className="grid md:grid-cols-2 gap-12 lg:gap-20 max-w-5xl mx-auto items-center">
        {plans.map((plan, i) => (
          <Reveal key={plan.name} direction="up" delay={i * 0.1}>
            <div className={`relative p-12 space-y-12 border ${plan.popular ? 'border-accent bg-surface-dark ring-4 ring-accent/5 scale-105' : 'border-border bg-surface'} transition-all`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-6 py-1 text-[10px] tracking-[0.3em] font-bold uppercase">
                  RECOMMENDED
                </div>
              )}

              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-3xl font-serif font-black uppercase tracking-tighter">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-serif">$</span>
                    <span className="text-5xl font-serif font-black tracking-tighter">{plan.price}</span>
                    <span className="text-xs text-muted font-sans font-bold">/MO</span>
                  </div>
                </div>
                <p className="text-sm text-secondary font-serif leading-relaxed italic border-l-2 border-border pl-6">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-4 group">
                    <div className={`p-1 rounded-full ${plan.popular ? 'bg-accent/10' : 'bg-surface-dark'}`}>
                       <Check size={12} className={plan.popular ? 'text-accent' : 'text-primary'} />
                    </div>
                    <span className="text-[11px] tracking-widest text-secondary group-hover:text-primary transition-colors uppercase font-bold">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                onClick={plan.name === "Synthesis" ? handleUpgrade : undefined}
                disabled={plan.disabled}
                className={`w-full py-6 flex items-center justify-center gap-4 ${plan.popular ? 'bg-accent hover:bg-black text-white' : ''}`}
              >
                {plan.popular ? <Sparkles size={16} /> : <Zap size={16} />}
                <span className="text-xs tracking-[0.2em] font-black">{plan.buttonText}</span>
              </Button>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Trust Quote */}
      <Reveal direction="up" delay={0.4}>
        <div className="text-center bg-surface border-y border-border py-24 space-y-12">
            <Shield size={48} className="mx-auto text-accent opacity-20" />
            <blockquote className="max-w-4xl mx-auto px-8">
               <p className="text-3xl md:text-5xl font-serif italic text-secondary leading-snug">
                 "Knowledge is the only asset that grows when shared. BookForge is the vessel."
               </p>
               <footer className="mt-8 text-[10px] tracking-[0.5em] text-muted uppercase font-bold">
                 — Anonymous Synthesizer
               </footer>
            </blockquote>
        </div>
      </Reveal>
    </div>
  );
};

export default PricingPage;

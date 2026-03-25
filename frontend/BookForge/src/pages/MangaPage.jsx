import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, ShoppingCart, Bell, BookOpen, ChevronRight, Zap, Star, Flame } from 'lucide-react';
import { mangaData } from '../data/mangaData';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

gsap.registerPlugin(ScrollTrigger);

import anyaImg from '../assets/animecharacters/anyaforger.png';
import denjiImg from '../assets/animecharacters/denji.png';
import gojoImg from '../assets/animecharacters/gojosaturo.png';
import gutsImg from '../assets/animecharacters/guts.jpg';
import ichigoImg from '../assets/animecharacters/ichigo.jpg';
import narutoImg from '../assets/animecharacters/naruto.png';
import gokuImg from '../assets/animecharacters/songoku.jpeg';
import tanjiroImg from '../assets/animecharacters/tanjiro.jpg';
import luffyImg from '../assets/animecharacters/luffy.jpeg';
import erenImg from '../assets/animecharacters/erenyeager.jpg';
import kanekiImg from '../assets/animecharacters/kenkanaki.jpg';
import saitamaImg from '../assets/animecharacters/saitama.jpg';
import zoroImg from '../assets/animecharacters/zoro.jpg';

// Generated Manga Panels
import shonenPanel from '../assets/manga-samples/shonen.png';
import sceneryPanel from '../assets/manga-samples/scenery.png';
import adventurePanel from '../assets/manga-samples/adventure.png';

const FALLBACK_CHARACTERS = [
  { _id: 'f1', name: 'Gojo Satoru', mangaTitle: 'Jujutsu Kaisen', image: gojoImg, votes: 1250 },
  { _id: 'f2', name: 'Monkey D. Luffy', mangaTitle: 'One Piece', image: luffyImg, votes: 1100 },
  { _id: 'f3', name: 'Guts', mangaTitle: 'Berserk', image: gutsImg, votes: 1050 },
  { _id: 'f4', name: 'Denji', mangaTitle: 'Chainsaw Man', image: denjiImg, votes: 980 },
  { _id: 'f5', name: 'Anya Forger', mangaTitle: 'Spy x Family', image: anyaImg, votes: 950 },
  { _id: 'f6', name: 'Son Goku', mangaTitle: 'Dragon Ball Z', image: gokuImg, votes: 920 },
  { _id: 'f7', name: 'Tanjiro Kamado', mangaTitle: 'Demon Slayer', image: tanjiroImg, votes: 890 },
  { _id: 'f8', name: 'Ichigo Kurosaki', mangaTitle: 'Bleach', image: ichigoImg, votes: 850 },
  { _id: 'f9', name: 'Naruto Uzumaki', mangaTitle: 'Naruto', image: narutoImg, votes: 820 },
  { _id: 'f10', name: 'Eren Yeager', mangaTitle: 'Attack on Titan', image: erenImg, votes: 810 },
  { _id: 'f11', name: 'Ken Kaneki', mangaTitle: 'Tokyo Ghoul', image: kanekiImg, votes: 800 },
  { _id: 'f12', name: 'Saitama', mangaTitle: 'One Punch Man', image: saitamaImg, votes: 790 },
  { _id: 'f13', name: 'Roronoa Zoro', mangaTitle: 'One Piece', image: zoroImg, votes: 780 },
];

const MangaPage = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const [leaderboard, setLeaderboard] = React.useState(FALLBACK_CHARACTERS);
  const [loading, setLoading] = React.useState(false);
  const [selectedSample, setSelectedSample] = React.useState(null);
  const { user } = useAuth();

  const MANGA_TRIVIA = [
    "One Piece was originally supposed to run for only 5 years. Oda has been drawing it for 25+ years!",
    "Jujutsu Kaisen features several Buddhist architectural concepts in its domain expansion designs.",
    "Berserk's author Kentaro Miura was heavily inspired by 'Hokuto no Ken' and 'Willow'.",
    "Chainsaw Man creator Tatsuki Fujimoto once tried to eat his pet fish after it passed away.",
    "Anya Forger's character design was inspired by 'Rengoku no Ashe' by Tatsuya Endo.",
    "Dragon Ball's Goku was initially based on Sun Wukong from 'Journey to the West'."
  ];

  const handleGetTrivia = () => {
    if (!user || user.role !== 'premium') {
       toast.error("MANGA MASTERY IS FOR ELITE MEMBERS! 🔥 UPGRADE NOW.", {
          style: { background: '#1A1A1A', color: '#fff', border: '2px solid #FF3333' }
       });
       return;
    }
    const randomTrivia = MANGA_TRIVIA[Math.floor(Math.random() * MANGA_TRIVIA.length)];
    toast.success(randomTrivia, { duration: 6000, icon: '🧠' });
  };

  const handleEnableNotifications = () => {
    toast.loading("REQUESTING TRANSMISSION PERMISSION...", { duration: 1500 });
    setTimeout(() => {
      toast.success("MOBILE NOTIFICATIONS ENABLED! ⚡ STAY SHARP.", {
         icon: '🔔',
         style: { background: '#00AEEF', color: '#fff', border: '2px solid #000' }
      });
    }, 1600);
  };

  const handleVote = async (id) => {
    try {
      const { data } = await axiosInstance.post(`/api/social/vote/${id}`);
      
      if (data.success) {
        setLeaderboard(prev => {
          const updated = prev.map(c => c._id === id ? { ...c, votes: data.data.votes } : c);
          return [...updated].sort((a, b) => b.votes - a.votes);
        });
        toast.success("VOTE CAST! 💥");
      }
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error("YOU ALREADY HYPED THIS CHARACTER! 🔥");
      } else {
        toast.error("Hype session failed. Try again!");
        console.error("Voting error:", error);
      }
    }
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get('/api/social/leaderboard');
        if (data.data && data.data.length > 0) {
          setLeaderboard(prev => {
            const updated = prev.map(fallbackChar => {
              const matched = data.data.find(d => d.name.toLowerCase().includes(fallbackChar.name.toLowerCase()));
              return matched ? { ...fallbackChar, votes: matched.votes, _id: matched._id } : fallbackChar;
            });
            return [...updated].sort((a, b) => b.votes - a.votes);
          });
        }
      } catch (error) {
        console.error("Leaderboard fetch failed, using fallbacks", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();

    // Refresh ScrollTrigger after a delay to account for images/layout settlement
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Animate whenever leaderboard changes
  useEffect(() => {
    if (leaderboard.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(".leaderboard-card-main", 
        { scale: 0.8, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "back.out(1.2)", clearProps: "all" }
      );
      
      gsap.fromTo(".leaderboard-card-sub",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power2.out", delay: 0.3, clearProps: "all" }
      );

      // Featured Collection (Vibrant Shelf)
      gsap.from(".manga-card", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".featured-collection-grid",
          start: "top 85%",
          onEnter: () => gsap.set(".manga-card", { clearProps: "all" })
        }
      });
      gsap.from(".archive-card", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".archive-grid",
          start: "top 90%",
          toggleActions: "play none none none",
          onEnter: () => gsap.set(".archive-card", { clearProps: "all" })
        }
      });

      gsap.from(".leaderboard-card-main", {
        x: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".leaderboard-card-main",
          start: "top 85%",
        }
      });

      gsap.from(".leaderboard-card-sub", {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "back.out(2)",
        scrollTrigger: {
          trigger: ".leaderboard-card-sub",
          start: "top 90%",
        }
      });


      gsap.from(".legendary-page", {
        scale: 0.9,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ".legendary-vault",
          start: "top 85%",
          onEnter: () => gsap.set(".legendary-page", { clearProps: "all" })
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [leaderboard.length]);

  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FFFBEB] text-[#1A1A1A] pt-24 pb-12 overflow-x-hidden relative">
      {/* Halftone Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '10px 10px' }} 
      />

      {/* Speed Lines Overlay */}
      <div className="speed-lines fixed inset-0 pointer-events-none opacity-[0.05] z-0" 
           style={{ backgroundImage: 'linear-gradient(45deg, transparent 48%, #000 49%, #000 51%, transparent 52%)', backgroundSize: '60px 60px' }} 
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Dynamic Shonen Header */}
        <div className="relative mb-20">
          <div className="absolute -left-12 -top-12 pow-sticker z-20 hidden md:block">
            <div className="relative transform -rotate-12">
               <div className="absolute inset-0 bg-[#FFD700] rounded-full blur-xl opacity-50" />
               <div className="relative bg-[#FF3333] text-white px-6 py-4 font-black text-2xl border-4 border-black clip-path-pow">
                  POW!
               </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-12 bg-[#00AEEF] p-12 border-b-8 border-r-8 border-black transform -skew-x-2">
            <div className="text-center md:text-left transform skew-x-2">
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-none text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
                MANGA <span className="text-[#FFD700]">VAULT</span>
              </h1>
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                 <span className="px-4 py-1 bg-black text-white font-bold text-[10px] tracking-widest uppercase">Action Driven</span>
                 <span className="px-4 py-1 bg-[#FF6600] text-white font-bold text-[10px] tracking-widest uppercase">Weekly Drops</span>
                 <span className="px-4 py-1 bg-white text-black font-bold text-[10px] tracking-widest uppercase italic">The Legend Starts Here</span>
              </div>
            </div>

            <div className="hidden lg:flex gap-4 transform skew-x-2">
               <div className="writing-vertical-rl text-4xl font-serif font-black text-white/40 select-none">最前線の物語</div>
            </div>
          </div>
        </div>

        {/* --- CHARACTER LEADERBOARD (NEW) --- */}
        <div className="mb-24 relative">
          <div className="flex items-center gap-6 mb-12">
            <div className="w-12 h-12 bg-[#FFD700] border-4 border-black flex items-center justify-center transform rotate-12 shadow-[4px_4px_0_rgba(0,0,0,1)]">
              <Star className="text-black" fill="currentColor" size={24} />
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter italic border-b-6 border-black">Most Hyped Characters</h2>
          </div>

          {/* Top 3 High Impact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            {!loading && top3.map((char, i) => (
              <div key={char._id} className="leaderboard-card-main relative group">
                <div className={`absolute -top-10 left-1/2 -translate-x-1/2 z-30 w-16 h-16 flex items-center justify-center font-black text-3xl border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] ${i === 0 ? 'bg-[#FFD700] scale-125' : i === 1 ? 'bg-[#C0C0C0]' : 'bg-[#CD7F32]'}`}>
                  #{i + 1}
                </div>
                <div className={`relative bg-white border-4 border-black p-6 pt-12 shadow-[12px_12px_0_rgba(0,0,0,1)] transition-all duration-300 group-hover:-translate-y-4 ${i === 0 ? 'ring-8 ring-[#FFD700]/20' : ''}`}>
                  <div className="aspect-[4/5] overflow-hidden border-2 border-black mb-6 relative">
                    <img 
                      src={char.image} 
                      alt={char.name} 
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" 
                      onError={(e) => e.target.src = 'https://via.placeholder.com/400x500?text=HERO'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tight truncate mb-1">{char.name}</h3>
                  <p className="text-xs font-bold text-[#FF6600] uppercase mb-6 italic tracking-widest">{char.mangaTitle}</p>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center bg-gray-50 border-2 border-black p-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-gray-400">Battle Power</span>
                        <span className="text-2xl font-black italic text-[#FF3333] tracking-tighter">{char.votes.toLocaleString()}</span>
                      </div>
                      <button 
                        onClick={() => handleVote(char._id)}
                        className="p-4 bg-black text-white hover:bg-[#FF3333] transition-all transform hover:scale-110 active:scale-95 border-b-4 border-black"
                      >
                        <Flame fill="currentColor" size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Remaining 6 Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {!loading && others.map((char, i) => (
              <div key={char._id} className="leaderboard-card-sub group relative">
                <div className="absolute -top-3 -left-3 z-30 w-8 h-8 bg-white border-2 border-black flex items-center justify-center font-black text-xs shadow-[2px_2px_0_rgba(0,0,0,1)]">
                  #{i + 4}
                </div>
                <div className={`bg-white border-2 border-black p-3 shadow-[4px_4px_0_rgba(0,0,0,1)] transition-all group-hover:-translate-y-1 ${
                  i % 3 === 0 ? 'group-hover:bg-[#FFD700]' : i % 3 === 1 ? 'group-hover:bg-[#00AEEF]' : 'group-hover:bg-[#FF3333]'
                }`}>
                   <div className="aspect-square border-2 border-black overflow-hidden mb-3 transition-all">
                      <img src={char.image} alt={char.name} className="w-full h-full object-cover" />
                   </div>
                   <h4 className="text-xs font-black uppercase truncate mb-1">{char.name}</h4>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black italic text-[#FF3333]">{char.votes}</span>
                      <button 
                        onClick={() => handleVote(char._id)}
                        className="w-6 h-6 bg-black text-white flex items-center justify-center hover:bg-[#FF6600] transition-colors"
                      >
                        <Zap size={12} fill="currentColor" />
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- NEW SECTION: LEGENDARY VAULT (SAMPLE READER) --- */}
        <div className="mb-24 legendary-vault">
          <div className="flex items-center gap-4 mb-10 overflow-hidden">
             <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic writing-vertical-rl bg-black text-white px-2 py-6">LEGENDARY VAULT</h2>
             <div className="flex-1">
                <div className="h-2 w-1/2 bg-[#FF6600] mb-2" />
                <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FF6600]">Iconic Manga Moments // Free Access</p>
                <h3 className="text-2xl md:text-3xl font-black uppercase leading-tight mt-2">Study the strokes of the masters. <br /> High-energy panel study.</h3>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "SHONEN SPECIMEN", img: "/src/assets/manga-samples/shonen.svg", tag: "ACTION // 001" },
              { title: "SEINEN SPECIMEN", img: "/src/assets/manga-samples/seinen.svg", tag: "CYBERPUNK // 042" },
              { title: "ADVENTURE SPECIMEN", img: "/src/assets/manga-samples/adventure.svg", tag: "JOURNEY // 777" }
            ].map((panel, i) => (
              <div 
                key={i} 
                className="legendary-page group cursor-pointer relative overflow-hidden bg-black border-4 border-black shadow-[8px_8px_0_rgba(255,102,0,1)]"
                onClick={() => setSelectedSample(panel.img)}
              >
                <div className="aspect-[3/4] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-105">
                  <img 
                    src={panel.img} 
                    alt={panel.title} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      const fallbacks = [
                        '/src/assets/manga-samples/shonen.svg',
                        '/src/assets/manga-samples/seinen.svg',
                        '/src/assets/manga-samples/adventure.svg'
                      ];
                      e.target.src = fallbacks[i % 3];
                    }}
                  />
                </div>
                <div className="absolute top-4 right-4 bg-white text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 border-black">
                  {panel.tag}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-white border-t-4 border-black p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h4 className="text-sm font-black uppercase tracking-tight">{panel.title}</h4>
                  <span className="text-[10px] font-bold text-[#FF6600]">TAP TO EXPAND FREQUENCY</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- NEW SECTION: MANGA ARCHIVE (DETAILED DIRECTORY) --- */}
        <div className="mb-24">
          <div className="flex justify-between items-end mb-12 border-b-8 border-black pb-6">
            <div>
              <span className="text-[10px] font-black tracking-[0.4em] bg-[#00AEEF] text-white px-3 py-1 uppercase inline-block mb-4">THE ARCHIVE</span>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic">SERIES DIRECTORY</h2>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-xs font-black uppercase tracking-widest">Total Volumes In Repository</p>
              <span className="text-4xl font-black text-[#FF6600]">207+</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 archive-grid mb-24">
            {mangaData.map((manga) => (
              <div key={manga.id} className="archive-card flex bg-white border-4 border-black p-6 gap-6 relative group overflow-hidden shadow-[12px_12px_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                {/* Premium Badge */}
                {manga.isPremium && (
                  <div className="absolute top-0 right-0 p-2 bg-[#FFD700] border-l-4 border-b-4 border-black flex items-center gap-1 z-20">
                     <Star size={12} fill="black" />
                     <span className="text-[8px] font-black uppercase tracking-widest">PREMIUM</span>
                  </div>
                )}

                <div className="w-32 h-44 border-2 border-black flex-shrink-0 relative overflow-hidden">
                  <img src={manga.cover} alt={manga.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                     <button 
                       onClick={() => manga.samplePages.length > 0 && setSelectedSample(manga.samplePages[0])}
                       className="bg-white text-black px-3 py-1 text-[10px] font-black uppercase border-2 border-black hover:bg-[#FFD700] transition-colors"
                      >
                       {manga.samplePages.length > 0 ? 'READ SAMPLE' : 'PREVIEW'}
                     </button>
                  </div>
                </div>

                <div className="flex-1 flex flex-col pt-4">
                  <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1 group-hover:text-[#FF6600] transition-colors">{manga.title}</h3>
                  <p className="text-[10px] font-bold text-gray-400 mb-4">{manga.kanji}</p>
                  
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {manga.genres.map((g, i) => (
                      <span key={i} className="text-[8px] font-black uppercase px-2 py-0.5 border border-black/10 bg-gray-50">{g}</span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t-2 border-black/5 pt-4">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">REPOSITORY</span>
                        <span className="text-xl font-black tracking-tighter leading-none">{manga.volumes} VOLS</span>
                     </div>
                     <div className="flex flex-col text-right">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">STATUS</span>
                        <span className={`text-[10px] font-black uppercase tracking-tighter leading-none ${manga.status.includes('Ongoing') ? 'text-green-600' : 'text-blue-600'}`}>
                           {manga.status}
                        </span>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main Content: Vibrant Shelf */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-6 mb-12">
              <div className="w-12 h-12 bg-[#FF6600] border-4 border-black flex items-center justify-center transform -rotate-12 shadow-[4px_4px_0_rgba(0,0,0,1)]">
                <Zap className="text-white" fill="currentColor" size={24} />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight italic border-b-4 border-black">Featured Collection</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10 featured-collection-grid">
              {mangaData.map((manga, idx) => (
                <div 
                  key={manga.id} 
                  className={`manga-card group relative bg-white border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] transition-all duration-300 hover:translate-x-1 hover:translate-y-1 hover:shadow-none`}
                >
                  {/* Badge */}
                  <div className="absolute -top-3 -right-3 z-30 transform rotate-12">
                    <div className="bg-[#FFD700] border-2 border-black px-3 py-1 text-[9px] font-black uppercase shadow-[2px_2px_0_rgba(0,0,0,1)]">
                      {manga.status}
                    </div>
                  </div>

                  {/* Cover */}
                  <div className="aspect-[2/3] overflow-hidden relative border-b-4 border-black">
                    <img 
                      src={manga.cover} 
                      alt={manga.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    
                    {/* Character Overlay Accent */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <p className="text-white text-[10px] font-bold leading-relaxed mb-4 italic">
                        "{manga.description}"
                      </p>
                      <div className="flex flex-col gap-2">
                        <a href={manga.readUrl} target="_blank" className="w-full py-2 bg-[#00AEEF] text-white border-2 border-black text-center text-[10px] font-black tracking-widest hover:bg-[#0090D4] transition-colors">
                          READ ONLINE
                        </a>
                        <button 
                          onClick={() => navigate(`/discuss/manga/${manga.id}`)}
                          className="w-full py-2 bg-white text-black border-2 border-black text-center text-[10px] font-black tracking-widest hover:bg-gray-100 transition-colors"
                        >
                          JOIN DISCUSSIONS
                        </button>
                        <a href={manga.buyUrl} target="_blank" className="w-full py-2 bg-[#FFD700] text-black border-2 border-black text-center text-[10px] font-black tracking-widest hover:bg-[#E6C200] transition-colors">
                          BUY PHYSICAL
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 bg-white">
                    <div className="mb-2">
                       <h3 className="text-2xl font-black tracking-tighter uppercase leading-none mb-1 group-hover:text-[#FF6600] transition-colors">
                         {manga.title}
                       </h3>
                       <p className="text-[10px] font-bold text-muted-foreground italic">— {manga.author}</p>
                    </div>
                    {manga.isWeekly && (
                      <div className="mt-4 inline-flex items-center gap-2 bg-[#FF3333] text-white px-2 py-1 text-[8px] font-black tracking-[0.2em] uppercase">
                        <Flame size={12} fill="currentColor" /> NEXT RELEASE: {manga.nextRelease.split(',')[1]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar: Dynamic Chronicle */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-10">
              <div className="bg-[#FFD700] border-4 border-black p-6 transform rotate-2 shadow-[8px_8px_0_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="text-black" fill="currentColor" size={20} />
                  <h2 className="text-xl font-black uppercase tracking-tight italic">Weekly Log</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white border-2 border-black transform -rotate-1 relative group overflow-hidden">
                     <div className="absolute top-0 right-0 w-12 h-12 bg-[#FF6600] transition-transform group-hover:scale-150 duration-500 opacity-20" />
                     <span className="text-[8px] font-black px-2 py-0.5 bg-[#FF3333] text-white mb-2 inline-block">HOT!</span>
                     <h4 className="text-xs font-bold leading-tight mb-2 uppercase">Jujutsu Kaisen Chapter 255 is OUT NOW!</h4>
                     <button 
                       onClick={() => setSelectedSample(shonenPanel)}
                       className="text-[9px] font-black border-b-2 border-black hover:text-[#FF6600] hover:border-[#FF6600] transition-all"
                     >
                        VIEW CHRONICLE
                     </button>
                  </div>

                  <div className="p-4 bg-black text-white border-2 border-black transform rotate-1">
                     <h4 className="text-[10px] font-bold tracking-widest uppercase mb-3">Next Transmissions</h4>
                     <div className="space-y-2">
                        {mangaData.filter(m => m.isWeekly).map(m => (
                          <div key={m.id} className="flex justify-between items-center text-[9px] font-bold">
                             <span className="text-[#00AEEF]">— {m.title}</span>
                             <span className="text-[#FFD700]">{m.nextRelease.split(',')[0]}</span>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
              </div>

              {/* --- MANGA TRIVIA (NEW) --- */}
              <div className="bg-[#FF3333] border-4 border-black p-8 text-white relative overflow-hidden group shadow-[8px_8px_0_rgba(0,0,0,1)]">
                <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none transform rotate-12 group-hover:scale-150 transition-transform duration-700">
                  <Zap size={100} fill="white" />
                </div>
                <h3 className="text-2xl font-black uppercase italic mb-6 border-b-2 border-white/30 pb-2">Manga Mastery</h3>
                <div className="space-y-6 relative z-10">
                  <div className="p-4 bg-white/10 border-l-4 border-white">
                    <p className="text-[11px] font-bold leading-relaxed italic">
                      "Did you know? One Piece was originally supposed to run for only 5 years. Eiichiro Oda has been drawing it for over 25 years now!"
                    </p>
                  </div>
                  <div className="p-4 bg-white/10 border-l-4 border-[#FFD700]">
                    <p className="text-[11px] font-bold leading-relaxed italic">
                      "Jujutsu Kaisen features several Buddhist architectural concepts in its domain expansion designs."
                    </p>
                  </div>
                  <button 
                    onClick={handleGetTrivia}
                    className="w-full py-2 bg-white text-[#FF3333] font-black text-[10px] tracking-widest uppercase hover:bg-[#FFD700] hover:text-black transition-colors border-2 border-black"
                  >
                    GET DAILY TRIVIA
                  </button>
                </div>
              </div>

              {/* Elite Access / Alert */}
              <div 
                onClick={handleEnableNotifications}
                className="relative group cursor-pointer overflow-hidden p-8 bg-[#00AEEF] border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] transition-all hover:bg-[#FF3333]"
              >
                  <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-30 transition-opacity">
                     <Zap size={80} fill="white" />
                  </div>
                  <h3 className="text-3xl font-black text-white italic drop-shadow-[2px_2px_0_rgba(0,0,0,1)] uppercase leading-none">
                    Elite <br /> Access
                  </h3>
                  <p className="mt-4 text-[9px] font-bold text-white uppercase tracking-widest">Enable mobile notifications for instant release updates.</p>
                  <ChevronRight size={24} className="mt-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Viewer Modal */}
      {selectedSample && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedSample(null)}>
          <div className="relative max-w-4xl w-full h-[90vh] bg-white border-4 border-[#FF6600] overflow-hidden flex flex-col p-2" onClick={e => e.stopPropagation()}>
            <button 
               onClick={() => setSelectedSample(null)}
               className="absolute top-4 right-4 z-50 bg-black text-white p-2 border-2 border-white hover:bg-[#FF3333] transition-colors font-black text-[10px] tracking-widest"
            >
               CLOSE [ESC]
            </button>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
               <img 
                 src={selectedSample} 
                 alt="Sample Page" 
                 className="max-w-full shadow-2xl border-4 border-black" 
                 onError={(e) => e.target.src = '/samples/shonen.png'}
               />
               <p className="mt-8 text-[10px] font-black text-black uppercase tracking-[0.5em] italic">BOOKFORGE MANGA REPOSITORY // SAMPLE ACCESS GRANTED</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .clip-path-pow {
          clip-path: polygon(0% 15%, 15% 15%, 15% 0%, 85% 0%, 85% 15%, 100% 15%, 100% 85%, 85% 85%, 85% 100%, 15% 100%, 15% 85%, 0% 85%);
        }
        .writing-vertical-rl {
          writing-mode: vertical-rl;
        }
      `}</style>
    </div>
  );
};

export default MangaPage;

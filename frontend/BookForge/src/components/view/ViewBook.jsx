import React, { useState, useRef, useEffect } from "react"
import gsap from "gsap"
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  BookOpen, 
  Layout, 
  Highlighter, 
  Quote, 
  Brain, 
  Languages,
  Volume2,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import toast from "react-hot-toast"
import axiosInstance from "../../utils/axiosInstance"
import { API_PATHS } from "../../utils/apiPaths"
import ViewChapterSidebar from "./ViewChapterSidebar"
import { useAuth } from "../../context/AuthContext"

const ViewBook = ({ book, isSampleOnly }) => {
  const { user } = useAuth();
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(book.lastChapterIndex || 0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [currentPage, setCurrentPage] = useState(book.lastPageIndex || 0);
  const [totalPages, setTotalPages] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [startAtLastPage, setStartAtLastPage] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [selectedText, setSelectedText] = useState("");
  const [menuPosition, setMenuPosition] = useState(null);
  const [aiDefinition, setAiDefinition] = useState(null);
  const [isDefining, setIsDefining] = useState(false);
  const [annotations, setAnnotations] = useState(book.annotations || []);
  const [isTwoPage, setIsTwoPage] = useState(window.innerWidth > 1024);

  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const readerRef = useRef(null);
  const menuRef = useRef(null);
  const aiModalRef = useRef(null);

  const saveProgress = async (chapterIdx, pageIdx) => {
    if (!user || book._id.startsWith('featured')) return;
    try {
      await axiosInstance.patch(`${API_PATHS.BOOKS.GET_BOOK_BY_ID}/progress/${book._id}`, {
        lastChapterIndex: chapterIdx,
        lastPageIndex: pageIdx
      });
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  };

  const handleSpeak = async (textToSpeak) => {
    const text = textToSpeak || selectedText;
    if (!text) return;

    const loadingToast = toast.loading("Synthesizing voice...");
    try {
      const response = await axiosInstance.post(API_PATHS.AI.SPEAK, {
        text,
      }, { responseType: 'blob' });
      
      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);
      audio.play();
      toast.dismiss(loadingToast);
      toast.success("Synthesized successfully.", { icon: '🎙️' });
      setMenuPosition(null);
      window.getSelection().removeAllRanges();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Vocal chords are currently offline.");
    }
  };

  const selectedChapter = book.chapters[selectedChapterIndex];
  const currentGap = isTwoPage ? 80 : 20; // Small 20px gap on mobile to prevent bleed

  // Handle Pagination Calculation
  useEffect(() => {
    const updatePagination = () => {
      if (contentRef.current && containerRef.current) {
        const innerWidth = contentRef.current.offsetWidth;
        const twoPage = window.innerWidth > 1024;
        
        setIsTwoPage(twoPage);

        // Standardize column logic
        const scrollWidth = contentRef.current.scrollWidth;
        const pagesPerSpread = twoPage ? 2 : 1;
        
        // Single page width within the inner area
        const pageWidth = (innerWidth - (twoPage ? currentGap : 0)) / pagesPerSpread;
        
        // Total single pages
        const pages = Math.ceil((scrollWidth + currentGap) / (innerWidth + currentGap));
        setTotalPages(pages || 1);

        // Snap to current spread
        const currentSpreadIndex = Math.floor(currentPage / pagesPerSpread);
        const shiftAmount = -currentSpreadIndex * (innerWidth + currentGap);

        gsap.to(contentRef.current, {
          x: shiftAmount,
          duration: 0.5,
          ease: "power2.out"
        });
      }
    };

    const timer = setTimeout(updatePagination, 500); 
    window.addEventListener('resize', updatePagination);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePagination);
    };
  }, [selectedChapterIndex, isFullscreen, fontSize, book.chapters]);

  const toggleFullscreen = () => {
    if (!readerRef.current) return;
    if (!document.fullscreenElement) {
      readerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const navigatePage = (direction) => {
    if (!contentRef.current || !containerRef.current) return;

    const innerWidth = contentRef.current.offsetWidth;
    const shift = isTwoPage ? 2 : 1;
    const nextPage = currentPage + (direction * shift);

    if (nextPage < 0 || nextPage >= totalPages) {
      if (nextPage < 0 && selectedChapterIndex > 0) {
        setSelectedChapterIndex(selectedChapterIndex - 1);
        setCurrentPage(0); 
      } else if (nextPage >= totalPages && selectedChapterIndex < book.chapters.length - 1) {
        if (isSampleOnly) {
          toast("Subscription required for full access.", { 
            icon: '🔒', 
            style: { borderRadius: '0', background: '#000', color: '#fff' } 
          });
          return;
        }
        setSelectedChapterIndex(selectedChapterIndex + 1);
        setCurrentPage(0);
      }
      return;
    }

    const nextSpreadIndex = Math.floor(nextPage / shift);
    const shiftAmount = -nextSpreadIndex * (innerWidth + currentGap);

    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentPage(nextPage);
      }
    });

    tl.to(containerRef.current, {
      scale: 0.995,
      rotationY: direction * 1,
      duration: 0.25,
      ease: "power2.in"
    })
    .to(contentRef.current, {
      x: shiftAmount,
      duration: 0.8,
      ease: "power4.inOut"
    }, "-=0.1")
    .to(containerRef.current, {
      scale: 1,
      rotationY: 0,
      duration: 0.45,
      ease: "power2.out"
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") navigatePage(1);
      if (e.key === "ArrowLeft") navigatePage(-1);
      if (e.key.toLowerCase() === "f") toggleFullscreen();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, selectedChapterIndex]);

  useEffect(() => {
    if (!isFirstLoad) {
      const timer = setTimeout(() => {
        saveProgress(selectedChapterIndex, currentPage);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedChapterIndex, currentPage]);

  const handleSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text && text.length > 1) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectedText(text);
      const newPos = {
        top: rect.top - 65, // Position above the selection
        left: rect.left + rect.width / 2
      };
      setMenuPosition(newPos);
    } else {
      if (menuPosition && menuRef.current) {
        gsap.to(menuRef.current, {
          opacity: 0,
          scale: 0.95,
          y: 10,
          duration: 0.2,
          onComplete: () => {
            setSelectedText("");
            setMenuPosition(null);
          }
        });
      } else {
        setSelectedText("");
        setMenuPosition(null);
      }
    }
  };

  useEffect(() => {
    if (menuPosition && menuRef.current) {
      gsap.fromTo(menuRef.current, 
        { opacity: 0, y: 15, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
    }
  }, [menuPosition]);

  useEffect(() => {
    if (aiDefinition && aiModalRef.current) {
      const modal = aiModalRef.current.querySelector('.modal-content');
      gsap.fromTo(aiModalRef.current, 
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );
      gsap.fromTo(modal,
        { scale: 0.9, y: 20, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, delay: 0.1, duration: 0.5, ease: "power4.out" }
      );
    }
  }, [aiDefinition]);

  const handleAIDefine = async () => {
    if (!selectedText) return;
    setIsDefining(true);
    const loadingToast = toast.loading("Consulting Intelligence...");
    try {
      const response = await axiosInstance.post(API_PATHS.AI.DEFINE, { 
        text: selectedText,
        context: selectedChapter.content.substring(0, 500) // Provide some context
      });
      setAiDefinition({
        word: selectedText,
        definition: response.data.definition || response.data.meaning,
        phonetic: response.data.phonetic
      });
      toast.dismiss(loadingToast);
      setMenuPosition(null);
    } catch (error) {
      const serverError = error.response?.data?.error || error.response?.data?.message;
      if (error.response?.status === 403) {
        toast.error("Lexicon Intelligence requires a Premium Subscription.", { icon: '🔒' });
      } else if (serverError) {
        toast.error(`Lexicon Error: ${serverError}`);
      } else {
        toast.error("The lexicon is currently unreachable.");
      }
      toast.dismiss(loadingToast);
    } finally {
      setIsDefining(false);
    }
  };

  const handleAddAnnotation = async (type) => {
    if (!user) {
      toast.error("Authentication required to save highlights.");
      return;
    }
    try {
      const response = await axiosInstance.post(`${API_PATHS.BOOKS.GET_BOOK_BY_ID}/annotations/${book._id}`, {
        type,
        chapterIndex: selectedChapterIndex,
        text: selectedText,
        color: type === 'highlight' ? "rgba(212, 163, 115, 0.35)" : "transparent"
      });
      
      setAnnotations([...annotations, response.data]);
      toast.success(type === 'highlight' ? "Passage illuminated." : "Quote archived.");
      window.getSelection().removeAllRanges();
      setMenuPosition(null);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("Premium access required for highlights.", { icon: '🔒' });
      } else {
        toast.error("Failed to scribe annotation.");
      }
    }
  };

  const formatContent = (content) => {
    if (!content) return "";
    let html = content
      .split('\n\n')
      .filter(paragraph => paragraph.trim())
      .map(paragraph => {
        let p = paragraph.trim();
        p = p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        p = p.replace(/(?<!\*)\*(?!\*)(.*?)\*(?!\*)/g, '<em>$1</em>');
        return `<p class="mb-12 last:mb-0">${p}</p>`;
      })
      .join('');

    annotations
      .filter(ann => ann.chapterIndex === selectedChapterIndex && ann.type === 'highlight')
      .forEach(ann => {
        const escapedText = ann.text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`(${escapedText})`, 'gi');
        html = html.replace(regex, `<mark style="background-color: ${ann.color}; color: inherit;">$1</mark>`);
      });

    return html;
  };

  const progress = ((selectedChapterIndex + 1) / book.chapters.length) * 100;

  const handleDeleteAnnotation = async (id) => {
    try {
      await axiosInstance.delete(`${API_PATHS.BOOKS.GET_BOOK_BY_ID}/annotations/${book._id}/${id}`);
      setAnnotations(annotations.filter(ann => ann._id !== id));
      toast.success("Excerpt removed from archive.");
    } catch (error) {
      toast.error("Failed to remove annotation.");
    }
  };

  if (!book || !selectedChapter) return (
    <div className="fixed inset-0 bg-[#121212] flex items-center justify-center text-white/20 font-serif italic tracking-widest">
      LOADING MONOGRAPH...
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] bg-[#121212] flex flex-col overflow-hidden font-serif" ref={readerRef}>
      {/* Header Bar */}
      <header className="h-14 sm:h-16 bg-black/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-[60] flex-shrink-0">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-white/5 transition-colors text-white/50 hover:text-white"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-[10px] uppercase tracking-[0.2em] text-white/80 truncate max-w-[150px] md:max-w-none">
              {book.title}
            </h1>
            <p className="text-[9px] uppercase tracking-[0.1em] text-white/30 hidden sm:block">
              {book.author}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 transition-colors ${showSettings ? 'text-accent' : 'text-white/40 hover:text-white'}`}
          >
            <Settings size={20} />
          </button>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-1.5 bg-white/5 hover:bg-accent text-white/60 hover:text-white text-[10px] font-bold tracking-[0.1em] border border-white/10 transition-all uppercase"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar and Reader */}
      <div className="flex-1 flex relative overflow-hidden">
        <ViewChapterSidebar
          book={{ ...book, annotations }}
          selectedChapterIndex={selectedChapterIndex}
          onSelectChapter={(idx) => { setSelectedChapterIndex(idx); setIsSidebarOpen(false); }}
          onDeleteAnnotation={handleDeleteAnnotation}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isSampleOnly={isSampleOnly}
        />

        {showSettings && (
          <div className="absolute top-4 right-6 w-72 bg-black/90 backdrop-blur-2xl border border-white/10 p-8 z-[100] shadow-2xl animate-in slide-in-from-top-2 duration-300">
            <p className="text-[10px] tracking-[0.3em] text-accent font-bold mb-6 uppercase">Display Controls</p>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between text-[10px] mb-3 uppercase tracking-widest text-white/40">
                  <span>Font Scale</span>
                  <span>{fontSize}px</span>
                </div>
                <input 
                  type="range" min="14" max="32" step="1" 
                  value={fontSize} 
                  onChange={(e) => setFontSize(parseInt(e.target.value))} 
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent" 
                />
              </div>
            </div>
          </div>
        )}

        <main className="relative flex-1 flex items-center justify-center p-4 lg:p-12 overflow-hidden bg-black/5 shadow-inner">
          <div className="absolute inset-y-0 left-0 w-20 z-40 cursor-pointer flex items-center justify-center group" onClick={() => navigatePage(-1)}>
            <div className="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all">
              <ChevronLeft size={20} />
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 w-20 z-40 cursor-pointer flex items-center justify-center group" onClick={() => navigatePage(1)}>
            <div className="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all">
              <ChevronRight size={20} />
            </div>
          </div>

          <div 
            ref={containerRef}
            id="book-surface-final"
            className="relative bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
            style={{
              width: isTwoPage ? '94%' : '100%',
              maxWidth: isTwoPage ? '1300px' : '580px',
              height: isTwoPage ? '86%' : '90%',
              maxHeight: '940px',
              backgroundColor: '#ffffff',
              transformStyle: 'preserve-3d',
              zIndex: 30,
              minHeight: '400px',
              minWidth: '280px',
              border: '1px solid rgba(0,0,0,0.05)',
              opacity: 1,
              visibility: 'visible',
              display: 'block',
              perspective: '2000px'
            }}
          >
            {isTwoPage && (
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[60px] z-20 pointer-events-none bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
            )}

            <div className="h-full w-full overflow-hidden relative p-6 md:p-16">
              <div 
                ref={contentRef}
                className="text-black h-full"
                style={{
                  columnFill: 'auto',
                  columnCount: isTwoPage ? 2 : 1,
                  columnWidth: isTwoPage ? `calc(50% - ${currentGap / 2}px)` : '100%',
                  columnGap: `${currentGap}px`,
                  columnRule: isTwoPage ? '1px solid rgba(0,0,0,0.05)' : 'none',
                  fontSize: `${fontSize}px`,
                  lineHeight: lineHeight,
                  height: '100%',
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: '#000000',
                  fontFamily: 'serif',
                  transition: 'none'
                }}
                onMouseUp={handleSelection}
                onTouchEnd={() => setTimeout(handleSelection, 100)}
              >
                <div className="mb-14 opacity-20 text-center pointer-events-none">
                  <span className="text-[9px] uppercase tracking-[0.5em]">{selectedChapter.title}</span>
                </div>
                <div 
                  className="font-serif leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatContent(selectedChapter.content) }}
                />
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
            <div className="px-5 py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-4">
              <span className="text-[9px] font-black tracking-[0.3em] text-white/60 uppercase whitespace-nowrap">
                {isTwoPage ? 'SPREAD' : 'PAGE'} {Math.floor(currentPage / (isTwoPage ? 2 : 1)) + 1} — {currentPage + (isTwoPage ? 2 : 1)} / {totalPages}
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Selection Menu */}
      {menuPosition && (
        <div 
          ref={menuRef}
          className="fixed z-[110] flex rounded-md bg-[#1a1a1a] border border-white/10 p-1 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px`, transform: 'translateX(-50%)' }}
        >
          <button 
            onClick={() => handleAddAnnotation('highlight')}
            className="p-3 text-white/60 hover:text-white hover:bg-white/5 transition-all rounded"
            title="Highlight"
          >
            <Highlighter size={16} />
          </button>
          <button 
            onClick={() => handleAIDefine()}
            className="p-3 text-white/60 hover:text-white hover:bg-white/5 transition-all rounded border-l border-white/5"
            title="AI Meaning"
          >
            <Brain size={16} />
          </button>
          <button 
            onClick={() => handleAddAnnotation('quote')}
            className="p-3 text-white/60 hover:text-white hover:bg-white/5 transition-all rounded border-l border-white/5"
            title="Save Quote"
          >
            <Quote size={16} />
          </button>
          <button 
            onClick={() => handleSpeak()}
            className="p-3 text-[#d4a373] hover:bg-white/5 transition-all rounded border-l border-white/5"
            title="Listen"
          >
            <Volume2 size={16} />
          </button>
        </div>
      )}

      {/* AI Definition Overlay */}
      {aiDefinition && (
        <div ref={aiModalRef} className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="modal-content max-w-md w-full bg-[#121212] border border-white/10 p-8 shadow-2xl relative">
            <button 
              onClick={() => setAiDefinition(null)}
              className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6 text-white/40">
              <Brain size={16} className="text-[#d4a373]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Lexicon Intelligence</span>
            </div>
            <h3 className="text-2xl font-serif text-white mb-2 italic">"{aiDefinition.word}"</h3>
            {aiDefinition.phonetic && (
              <p className="text-white/40 text-xs mb-6 font-mono tracking-widest uppercase">{aiDefinition.phonetic}</p>
            )}
            <div className="h-[1px] w-12 bg-[#d4a373]/30 mb-6"></div>
            <p className="text-white/80 font-serif leading-relaxed text-lg">
              {aiDefinition.definition}
            </p>
            <button 
              onClick={() => setAiDefinition(null)}
              className="mt-10 w-full py-3 text-[10px] font-bold border border-white/10 hover:bg-white hover:text-black transition-all uppercase tracking-widest"
            >
              Acknowledged
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBook;
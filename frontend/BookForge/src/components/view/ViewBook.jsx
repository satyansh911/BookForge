import React, { useState, useRef, useEffect } from "react"
import gsap from "gsap"
import { ChevronLeft, ChevronRight, Menu, Settings, X, Volume2, Sparkles } from "lucide-react"
import toast from "react-hot-toast"
import axiosInstance from "../../utils/axiosInstance"
import { API_PATHS } from "../../utils/apiPaths"
import ViewChapterSidebar from "./ViewChapterSidebar"

const ViewBook = ({ book }) => {
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(book.lastChapterIndex || 0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [currentPage, setCurrentPage] = useState(book.lastPageIndex || 0);
  const [totalPages, setTotalPages] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [startAtLastPage, setStartAtLastPage] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [selectedText, setSelectedText] = useState("");
  const [menuPosition, setMenuPosition] = useState(null);
  const [annotations, setAnnotations] = useState(book.annotations || []);

  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const readerRef = useRef(null);

  const saveProgress = async (chapterIdx, pageIdx) => {
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

  // Handle Pagination Calculation
  useEffect(() => {
    const calculatePagination = () => {
      if (contentRef.current && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        
        // Force height for column flow
        contentRef.current.style.height = `${containerHeight}px`;
        
        const scrollWidth = contentRef.current.scrollWidth;
        const pages = Math.max(1, Math.ceil(scrollWidth / containerWidth));
        setTotalPages(pages);
        
        const targetPage = isFirstLoad ? (book.lastPageIndex || 0) : (startAtLastPage ? pages - 1 : 0);
        const finalPage = Math.min(targetPage, pages - 1);
        
        setCurrentPage(finalPage);
        setStartAtLastPage(false);
        setIsFirstLoad(false);
        
        const targetX = -finalPage * containerWidth;
        gsap.set(contentRef.current, { x: targetX });
      }
    };

    const timer = setTimeout(calculatePagination, 100);
    window.addEventListener('resize', calculatePagination);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculatePagination);
    };
  }, [selectedChapterIndex, fontSize, lineHeight, isFullscreen, book]);

  const toggleFullscreen = () => {
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
    const nextPage = currentPage + direction;
    if (nextPage >= 0 && nextPage < totalPages) {
      const containerWidth = containerRef.current.offsetWidth;
      const targetX = -nextPage * containerWidth;

      gsap.to(contentRef.current, {
        x: targetX,
        duration: 0.7,
        ease: "power3.inOut",
        scale: 0.98,
        filter: "blur(2px)",
        onComplete: () => {
          setCurrentPage(nextPage);
          gsap.to(contentRef.current, {
            scale: 1,
            filter: "blur(0px)",
            duration: 0.3
          });
        }
      });
    } else if (nextPage < 0 && selectedChapterIndex > 0) {
      setStartAtLastPage(true);
      setSelectedChapterIndex(selectedChapterIndex - 1);
    } else if (nextPage >= totalPages && selectedChapterIndex < book.chapters.length - 1) {
      setSelectedChapterIndex(selectedChapterIndex + 1);
    }
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
      setMenuPosition({
        top: rect.top - 60 + window.scrollY,
        left: rect.left + rect.width / 2
      });
    } else {
      setSelectedText("");
      setMenuPosition(null);
    }
  };

  const handleAddAnnotation = async (type) => {
    try {
      const response = await axiosInstance.post(`${API_PATHS.BOOKS.GET_BOOK_BY_ID}/annotations/${book._id}`, {
        type,
        chapterIndex: selectedChapterIndex,
        text: selectedText,
        color: type === 'highlight' ? "rgba(173, 71, 51, 0.3)" : "transparent"
      });
      
      setAnnotations([...annotations, response.data]);
      toast.success(type === 'highlight' ? "Passage highlighted." : "Quote saved to archives.");
      window.getSelection().removeAllRanges();
      setMenuPosition(null);
    } catch (error) {
      toast.error("Failed to save annotation.");
    }
  };

  const formatContent = (content) => {
    let html = content
      .split('\n\n')
      .filter(paragraph => paragraph.trim())
      .map(paragraph => {
        let p = paragraph.trim();
        p = p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        p = p.replace(/(?<!\*)\*(?!\*)(.*?)\*(?!\*)/g, '<em>$1</em>');
        return `<p class="mb-8 last:mb-0">${p}</p>`;
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

  return (
    <div className="fixed inset-0 z-[60] bg-surface flex flex-col animate-in fade-in duration-500 overflow-hidden" ref={readerRef}>
      {!isFullscreen && (
        <header className="px-8 py-4 flex justify-between items-center border-b border-border/50 bg-surface/80 backdrop-blur-md sticky top-0 z-10 transition-all duration-500">
          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-black/5 transition-colors">
              <Menu size={20} />
            </button>
            <div className="hidden md:block">
              <h1 className="text-sm font-serif font-bold tracking-tight uppercase">{book.title}</h1>
              <p className="text-[10px] text-muted tracking-widest uppercase">{book.author}</p>
            </div>
          </div>

          <div className="absolute top-0 left-0 w-full h-[2px] bg-border/20">
            <div className="h-full bg-accent transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setShowSettings(!showSettings)} className={`p-2 hover:bg-black/5 transition-colors ${showSettings ? 'text-accent' : ''}`}>
              <Settings size={20} />
            </button>
            <button onClick={toggleFullscreen} className="p-2 hover:bg-black/5 transition-colors">
              <Settings size={20} className="rotate-45" /> 
            </button>
            <button onClick={() => window.history.back()} className="p-2 hover:bg-black/5 transition-colors text-muted hover:text-primary">
              <X size={20} />
            </button>
          </div>
        </header>
      )}

      {showSettings && (
        <div className="absolute top-20 right-8 w-64 bg-white border border-border p-6 shadow-2xl z-50 animate-in slide-in-from-top-4 duration-300">
          <p className="text-[10px] tracking-[0.3em] text-muted mb-4 uppercase">Typography Settings</p>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-[13px] mb-2 uppercase tracking-tighter">
                <span>Font Size</span>
                <span>{fontSize}px</span>
              </div>
              <input type="range" min="14" max="32" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full accent-accent" />
            </div>
            <div>
              <div className="flex justify-between text-[13px] mb-2 uppercase tracking-tighter">
                <span>Line Height</span>
                <span>{lineHeight}</span>
              </div>
              <input type="range" min="1.2" max="2.4" step="0.1" value={lineHeight} onChange={(e) => setLineHeight(parseFloat(e.target.value))} className="w-full accent-accent" />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden relative flex items-center justify-center pt-8 pb-12 bg-surface">
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 z-10 cursor-pointer group" onClick={() => navigatePage(-1)}>
          <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft size={32} className="md:size-[48px] text-accent/20" />
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 z-10 cursor-pointer group" onClick={() => navigatePage(1)}>
          <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={32} className="md:size-[48px] text-accent/20" />
          </div>
        </div>

        <div className="w-full h-full max-w-5xl mx-auto px-6 md:px-12 overflow-hidden" ref={containerRef}>
          <div 
            ref={contentRef}
            className="h-full w-full"
            style={{
              columnWidth: '100%',
              columnGap: '2rem',
              columnFill: 'auto',
              height: '100%',
              minHeight: '100%',
              fontFamily: '"Playfair Display", serif'
            }}
          >
            <div className="mb-8 md:mb-12">
               <p className="text-[9px] md:text-[10px] tracking-[0.4em] md:tracking-[0.5em] text-muted mb-4 uppercase">Chapter {selectedChapterIndex + 1}</p>
               <h2 className="text-3xl md:text-5xl font-serif font-black leading-tight tracking-tighter uppercase break-words">
                 {selectedChapter.title}
               </h2>
               <div className="w-10 md:w-12 h-[2px] bg-accent mt-6 md:mt-8" />
            </div>

            <article 
              className="reader-content leading-relaxed selection:bg-accent/20 text-primary"
              onMouseUp={handleSelection}
              onKeyUp={handleSelection}
              style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight, height: '100%' }}
              dangerouslySetInnerHTML={{ __html: formatContent(selectedChapter.content) }}
            />
          </div>
        </div>

        {menuPosition && (
          <div 
            className="fixed z-[100] flex bg-black/90 backdrop-blur-xl border border-white/10 p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px`, transform: 'translateX(-50%)' }}
          >
            <button onClick={() => handleAddAnnotation('highlight')} className="px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-white hover:bg-white/10 transition-colors border-r border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" /> HIGHLIGHT
            </button>
            <button onClick={() => handleAddAnnotation('quote')} className="px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-white hover:bg-white/10 transition-colors border-r border-white/10">
              SAVE QUOTE
            </button>
            <button onClick={() => handleSpeak()} className="px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-white hover:bg-white/10 transition-colors border-r border-white/10 flex items-center gap-2">
              <Volume2 size={12} className="text-secondary" /> LISTEN
            </button>
            <button 
              onClick={async () => {
                const loadingToast = toast.loading("Consulting Intelligence...");
                try {
                  const response = await axiosInstance.post(API_PATHS.AI.DEFINE, {
                    text: selectedText,
                    context: selectedChapter.content.substring(0, 500)
                  });
                  toast.dismiss(loadingToast);
                  toast(response.data.definition, { duration: 6000, icon: '🧠', style: { maxWidth: '400px', fontSize: '13px', fontFamily: 'serif', lineHeight: '1.6', background: 'black', color: 'white', border: '1px solid rgba(255,255,255,0.1)' } });
                  window.getSelection().removeAllRanges();
                  setMenuPosition(null);
                } catch (error) { toast.dismiss(loadingToast); toast.error("Intelligence module unreachable."); }
              }}
              className="px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-accent hover:bg-white/10 transition-colors"
            >
              AI MEANING
            </button>
          </div>
        )}

        <div className="absolute bottom-4 md:bottom-8 left-0 w-full flex justify-center text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] font-sans text-muted">
          PAGE {currentPage + 1} OF {totalPages}
        </div>
      </div>

      {!isFullscreen && (
        <ViewChapterSidebar
          book={{ ...book, annotations }}
          selectedChapterIndex={selectedChapterIndex}
          onSelectChapter={(idx) => { setSelectedChapterIndex(idx); setSidebarOpen(false); }}
          onDeleteAnnotation={handleDeleteAnnotation}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default ViewBook
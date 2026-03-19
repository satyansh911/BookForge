import React, { useState, useRef, useEffect } from "react"
import gsap from "gsap"
import { ChevronLeft, ChevronRight, Menu, Settings, X } from "lucide-react"
import ViewChapterSidebar from "./ViewChapterSidebar"
import Button from "../ui/Button"

const ViewBook = ({ book }) => {
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [startAtLastPage, setStartAtLastPage] = useState(false);

  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const readerRef = useRef(null);

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
        
        const targetPage = startAtLastPage ? pages - 1 : 0;
        setCurrentPage(targetPage);
        setStartAtLastPage(false);
        
        const targetX = -targetPage * containerWidth;
        gsap.set(contentRef.current, { x: targetX });
      }
    };

    // Small delay to ensure internal dangerouslySetInnerHTML is rendered
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
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => setCurrentPage(nextPage)
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
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, selectedChapterIndex]);

  const formatContent = (content) => {
    return content
      .split('\n\n')
      .filter(paragraph => paragraph.trim())
      .map(paragraph => {
        let p = paragraph.trim();
        p = p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        p = p.replace(/(?<!\*)\*(?!\*)(.*?)\*(?!\*)/g, '<em>$1</em>');
        return `<p class="mb-8 last:mb-0">${p}</p>`;
      })
      .join('');
  };

  const progress = ((selectedChapterIndex + 1) / book.chapters.length) * 100;

  return (
    <div className="fixed inset-0 z-[60] bg-surface flex flex-col animate-in fade-in duration-500 overflow-hidden" ref={readerRef}>
      {/* Immersive Top Bar - Hidden in Fullscreen */}
      {!isFullscreen && (
        <header className="px-8 py-4 flex justify-between items-center border-b border-border/50 bg-surface/80 backdrop-blur-md sticky top-0 z-10 transition-all duration-500">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-black/5 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:block">
              <h1 className="text-sm font-serif font-bold tracking-tight uppercase">{book.title}</h1>
              <p className="text-[10px] text-muted tracking-widest uppercase">{book.author}</p>
            </div>
          </div>

          <div className="absolute top-0 left-0 w-full h-[2px] bg-border/20">
            <div 
              className="h-full bg-accent transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 hover:bg-black/5 transition-colors ${showSettings ? 'text-accent' : ''}`}
            >
              <Settings size={20} />
            </button>
            <button 
              onClick={toggleFullscreen}
              className="p-2 hover:bg-black/5 transition-colors"
              title="Enter Fullscreen (F)"
            >
              <Settings size={20} className="rotate-45" /> 
            </button>
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-black/5 transition-colors text-muted hover:text-primary"
            >
              <X size={20} />
            </button>
          </div>
        </header>
      )}

      {/* Exit Fullscreen Hint (Visible in Fullscreen) */}
      {isFullscreen && (
        <div className="fixed top-4 right-4 z-[100] opacity-0 hover:opacity-100 transition-opacity">
           <button 
            onClick={toggleFullscreen}
            className="p-3 bg-black/10 hover:bg-black/20 backdrop-blur-sm transition-colors text-primary"
            title="Exit Fullscreen (F or Esc)"
          >
            <X size={24} />
          </button>
        </div>
      )}

      {/* Settings Popover */}
      {showSettings && (
        <div className="absolute top-20 right-8 w-64 bg-white border border-border p-6 shadow-2xl z-50 animate-in slide-in-from-top-4 duration-300">
          <p className="text-[10px] tracking-[0.3em] text-muted mb-4 uppercase">Typography Settings</p>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-[13px] mb-2 uppercase tracking-tighter">
                <span>Font Size</span>
                <span>{fontSize}px</span>
              </div>
              <input 
                type="range" min="14" max="32" value={fontSize} 
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
            <div>
              <div className="flex justify-between text-[13px] mb-2 uppercase tracking-tighter">
                <span>Line Height</span>
                <span>{lineHeight}</span>
              </div>
              <input 
                type="range" min="1.2" max="2.4" step="0.1" value={lineHeight} 
                onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reader Content Area (Paginated) */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center pt-8 pb-12 bg-surface">
        {/* Navigation Overlays (Swipe hints) */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-32 z-10 cursor-pointer group"
          onClick={() => navigatePage(-1)}
        >
          <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft size={48} className="text-accent/20" />
          </div>
        </div>
        <div 
          className="absolute right-0 top-0 bottom-0 w-32 z-10 cursor-pointer group"
          onClick={() => navigatePage(1)}
        >
          <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={48} className="text-accent/20" />
          </div>
        </div>

        <div className="w-full h-full max-w-5xl mx-auto px-12 overflow-hidden" ref={containerRef}>
          <div 
            ref={contentRef}
            className="h-full w-full"
            style={{
              columnWidth: '100%',
              columnGap: '4rem',
              columnFill: 'auto',
              height: '100%',
              minHeight: '100%',
              fontFamily: '"Playfair Display", serif'
            }}
          >
            <div className="mb-12">
               <p className="text-[10px] tracking-[0.5em] text-muted mb-4 uppercase">Chapter {selectedChapterIndex + 1}</p>
               <h2 className="text-4xl md:text-5xl font-serif font-black leading-tight tracking-tighter uppercase break-words">
                 {selectedChapter.title}
               </h2>
               <div className="w-12 h-[2px] bg-accent mt-8" />
            </div>

            <article 
              className="reader-content leading-relaxed selection:bg-accent/20 text-primary"
              style={{ 
                fontSize: `${fontSize}px`, 
                lineHeight: lineHeight,
                height: '100%'
              }}
              dangerouslySetInnerHTML={{ __html: formatContent(selectedChapter.content) }}
            />
          </div>
        </div>

        {/* Bottom Page Indicator */}
        <div className="absolute bottom-8 left-0 w-full flex justify-center text-[10px] tracking-[0.3em] font-sans text-muted">
          PAGE {currentPage + 1} OF {totalPages}
        </div>
      </div>

      {!isFullscreen && (
        <ViewChapterSidebar
          book={book}
          selectedChapterIndex={selectedChapterIndex}
          onSelectChapter={(idx) => {
            setSelectedChapterIndex(idx);
            setSidebarOpen(false);
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default ViewBook
import React, { useState, useRef, useEffect } from "react"
import gsap from "gsap"
import { Draggable } from "gsap/all"
gsap.registerPlugin(Draggable);
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
  Menu,
  X,
  Sparkles,
  Headphones,
  Bookmark,
  Trash2,
  Maximize,
  Minimize,
  Volume2
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
  const [wpm, setWpm] = useState(0);
  const [isDistractionFree, setIsDistractionFree] = useState(false);
  const [voicePreference, setVoicePreference] = useState('male'); // 'male' or 'female'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudiobookMode, setIsAudiobookMode] = useState(false);
  const [bookmarks, setBookmarks] = useState(book.bookmarks || []);

  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const readerRef = useRef(null);
  const menuRef = useRef(null);
  const aiModalRef = useRef(null);
  const sessionStartTime = useRef(Date.now());
  const wordsReadCount = useRef(0);
  const lastTrackedPage = useRef({ chapter: selectedChapterIndex, page: currentPage });
  const dwellTimer = useRef(null);
  const currentAudioRef = useRef(null);
  const silentAudioRef = useRef(new Audio('data:audio/wav;base64,UklGRigAAABXQVZFav7//f////9nZW5lcmF0ZWQgYnkgYXVkaW9nZW4uY29tCg==')); 
  const bubbleRef = useRef(null);
  const [isBubbleExpanded, setIsBubbleExpanded] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  // Initialize Draggable for the Insight Bubble
  useEffect(() => {
    if (bubbleRef.current) {
      Draggable.create(bubbleRef.current, {
        type: "x,y",
        edgeResistance: 0.65,
        bounds: "body",
        inertia: true,
        onClick: function() {
          setIsBubbleExpanded(prev => !prev);
        }
      });
    }
  }, []);

  const stopSpeech = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

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

  const handleSpeak = async (textToSpeak, isContinuous = false) => {
    const text = textToSpeak || selectedText || selectedChapter.content;
    if (!text) return;

    if (!isContinuous) stopSpeech(); // Stop any current speech unless we are in transition
    const loadingToast = toast.loading("Synthesizing voice...");
    
    try {
      // Get text chunks if it's long
      let chunks = [text];
      if (text.length > 1000) {
        const chunkRes = await axiosInstance.post(API_PATHS.AI.GET_CHUNKS, { text, size: 250 });
        chunks = chunkRes.data.chunks;
      }

      const playNextChunk = async (index) => {
        if (index >= chunks.length) {
            setIsSpeaking(false);
            currentAudioRef.current = null;
            
            // Audiobook Mode: Move to next chapter if ended
            if (isAudiobookMode && selectedChapterIndex < book.chapters.length - 1) {
                const nextIdx = selectedChapterIndex + 1;
                setSelectedChapterIndex(nextIdx);
                setCurrentPage(0);
                setTimeout(() => {
                    handleSpeak(book.chapters[nextIdx].content, true);
                }, 1000);
            } else if (isAudiobookMode) {
                setIsAudiobookMode(false);
                toast.success("Monograph concluded.");
            }
            return;
        }

        const response = await axiosInstance.post(API_PATHS.AI.SPEAK, {
            text: chunks[index],
            voiceType: voicePreference
        }, { responseType: 'blob' });

        if (response.data.size < 100) throw new Error("Invalid audio data");

        const audioUrl = URL.createObjectURL(response.data);
        const audio = new Audio();
        audio.src = audioUrl;
        currentAudioRef.current = audio;
        
        audio.onplay = () => {
            setIsSpeaking(true);
            if (index === 0) toast.dismiss(loadingToast);
        };

        audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            playNextChunk(index + 1);
        };

        audio.onerror = (err) => {
            console.error("Audio error:", err);
            toast.error("Audio chunk failed to load.");
            setIsSpeaking(false);
        };

        audio.play().catch(err => {
            console.error("Playback failed:", err);
            toast.error("Playback blocked.");
            setIsSpeaking(false);
        });
      };

      await playNextChunk(0);

      setMenuPosition(null);
      window.getSelection().removeAllRanges();
    } catch (error) {
      toast.dismiss(loadingToast);
      
      // Fallback to high-quality Browser Speech engine
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = voicePreference === 'female' ? 1.2 : 0.9;
        
        // Powerful selection: Priority for "Natural" or "Google" voices matching preference
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => 
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online')) && 
          v.lang.startsWith('en') &&
          (voicePreference === 'female' ? (v.name.includes('Female') || v.name.includes('Zira')) : (v.name.includes('Male') || v.name.includes('David')))
        ) || voices.find(v => v.lang.startsWith('en'));

        if (preferredVoice) utterance.voice = preferredVoice;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          if (isAudiobookMode && selectedChapterIndex < book.chapters.length - 1) {
              const nextIdx = selectedChapterIndex + 1;
              setSelectedChapterIndex(nextIdx);
              setCurrentPage(0);
              setTimeout(() => {
                  handleSpeak(book.chapters[nextIdx].content, true);
              }, 1000);
          } else if (isAudiobookMode) {
              setIsAudiobookMode(false);
              toast.success("Monograph concluded.");
          }
        };
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
        toast(`Using ${preferredVoice?.name || 'local'} voice engine (Free)`, { icon: '🗣️' });
        
        setMenuPosition(null);
        window.getSelection().removeAllRanges();
      } else {
        toast.error("Vocal chords are currently offline.");
      }
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
      setIsDistractionFree(true); // Automatically enter distraction-free in fullscreen
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

  // Reading Speed (WPM) Tracking (Refined with 3s Dwell Time)
  useEffect(() => {
    if (dwellTimer.current) clearTimeout(dwellTimer.current);
    
    dwellTimer.current = setTimeout(() => {
      if (lastTrackedPage.current.chapter !== selectedChapterIndex || lastTrackedPage.current.page !== currentPage) {
        const text = contentRef.current?.innerText || "";
        const words = text.trim().split(/\s+/).length;
        
        // Only count if there's significant content
        if (words > 10) {
          wordsReadCount.current += words;
          const timeElapsedMin = (Date.now() - sessionStartTime.current) / 60000;
          if (timeElapsedMin > 0.05) { 
            setWpm(Math.round(wordsReadCount.current / timeElapsedMin));
          }
        }
        lastTrackedPage.current = { chapter: selectedChapterIndex, page: currentPage };
      }
    }, 5000); // 5s dwell time for accuracy

    return () => {
      if (dwellTimer.current) clearTimeout(dwellTimer.current);
    };
  }, [selectedChapterIndex, currentPage]);

  const handleJumpTo = (chapterIdx, pageIdx) => {
    setSelectedChapterIndex(chapterIdx);
    setCurrentPage(pageIdx);
    setIsSidebarOpen(false);
    toast.success(`Jumping to Chapter ${chapterIdx + 1}, Page ${pageIdx + 1}`, { icon: '📖' });
  };

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
        pageIndex: currentPage,
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
        return `<p class="mb-12 last:mb-0 text-justify hyphens-auto leading-relaxed">${p}</p>`;
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

  const progress = ((selectedChapterIndex + (currentPage / (totalPages || 1))) / book.chapters.length) * 100;

  const handleDeleteAnnotation = async (id) => {
    try {
      await axiosInstance.delete(`${API_PATHS.BOOKS.GET_BOOK_BY_ID}/annotations/${book._id}/${id}`);
      setAnnotations(annotations.filter(ann => ann._id !== id));
      toast.success("Excerpt removed from archive.");
    } catch (error) {
      toast.error("Failed to remove annotation.");
    }
  };

  const handleAudiobookToggle = () => {
    if (!isAudiobookMode) {
      setIsAudiobookMode(true);
      handleSpeak(selectedChapter.content, true);
      toast.success("Audiobook Mode activated.", { icon: '🎧' });
    } else {
      setIsAudiobookMode(false);
      stopSpeech();
      toast("Audiobook Mode paused.");
    }
  };

  const handleAddBookmark = async () => {
    if (!user) {
      toast.error("Authentication required to save bookmarks.");
      return;
    }
    try {
      const response = await axiosInstance.post(`${API_PATHS.BOOKS.GET_BOOK_BY_ID}/bookmarks/${book._id}`, {
        chapterIndex: selectedChapterIndex,
        pageIndex: currentPage,
        label: `Chapter ${selectedChapterIndex + 1}, Page ${currentPage + 1}`
      });
      setBookmarks([...bookmarks, response.data]);
      toast.success("Position preserved in bookmarks.", { icon: '🔖' });
    } catch (error) {
      toast.error("Failed to save bookmark.");
    }
  };

  const handleDeleteBookmark = async (id) => {
    try {
        await axiosInstance.delete(`${API_PATHS.BOOKS.GET_BOOK_BY_ID}/bookmarks/${book._id}/${id}`);
        setBookmarks(bookmarks.filter(bm => bm._id !== id));
        toast.success("Bookmark removed.");
    } catch (error) {
        toast.error("Failed to remove bookmark.");
    }
  };

  const animatePageTurn = (direction, onComplete) => {
    // Reverted: Call onComplete immediately for a snappier feel as requested
    onComplete();
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - (isTwoPage ? 2 : 1)) {
      animatePageTurn('next', () => setCurrentPage(prev => prev + (isTwoPage ? 2 : 1)));
    } else if (selectedChapterIndex < book.chapters.length - 1) {
      animatePageTurn('next', () => {
        setSelectedChapterIndex(prev => prev + 1);
        setCurrentPage(0);
      });
    } else {
      toast("Threshold of the monograph reached.", { icon: '📖' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      animatePageTurn('prev', () => setCurrentPage(prev => Math.max(0, prev - (isTwoPage ? 2 : 1))));
    } else if (selectedChapterIndex > 0) {
      animatePageTurn('prev', () => {
        setSelectedChapterIndex(prev => prev - 1);
        setCurrentPage(0); // This might need logic to go to the LAST page of the previous chapter
        setStartAtLastPage(true);
      });
    }
  };

  // Touch Handlers for Swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;

    if (distance > 70) { // Swipe Left
      handleNextPage();
    } else if (distance < -70) { // Swipe Right
      handlePrevPage();
    }
    setTouchStart(null);
  };

  // MediaSession API Integration
  useEffect(() => {
    if ('mediaSession' in navigator && selectedChapter) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: book.title,
        artist: book.author,
        album: selectedChapter.title,
        artwork: [
          { src: book.coverImage || '', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (!isAudiobookMode) handleAudiobookToggle();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (isAudiobookMode) handleAudiobookToggle();
      });
      navigator.mediaSession.setActionHandler('nexttrack', handleNextPage);
      navigator.mediaSession.setActionHandler('previoustrack', handlePrevPage);
    }
  }, [book, selectedChapter, isAudiobookMode]);

  // Handle Background Audio Continuity
  useEffect(() => {
    if (isAudiobookMode) {
      silentAudioRef.current.loop = true;
      silentAudioRef.current.play().catch(() => {
        // Handle user interaction requirement
      });
    } else {
      silentAudioRef.current.pause();
    }
  }, [isAudiobookMode]);

  if (!book || !selectedChapter) return (
    <div className="fixed inset-0 bg-[#121212] flex items-center justify-center text-white/20 font-serif italic tracking-widest">
      LOADING MONOGRAPH...
    </div>
  );

  return (
    <div 
      className={`fixed inset-0 z-[60] bg-[#121212] flex flex-col overflow-hidden font-serif ${isFullscreen ? 'w-screen h-screen' : ''}`} 
      ref={readerRef}
    >
      {/* Header Bar */}
      <header className={`h-16 bg-black border-b border-white/10 flex items-center justify-between px-6 z-[100] transition-all duration-500 w-full ${isDistractionFree && !showSettings ? '-translate-y-full opacity-0 absolute' : 'translate-y-0 opacity-100 relative mb-0'}`}>
        <div className="flex items-center gap-3 md:gap-6">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-white/5 transition-colors text-white/50 hover:text-white"
          >
            <Menu size={20} />
          </button>
          <div className="max-w-[100px] md:max-w-none">
            <h1 className="text-[10px] uppercase tracking-[0.2em] text-white/80 truncate">
              {book.title}
            </h1>
            <p className="text-[9px] uppercase tracking-[0.1em] text-white/30 hidden md:block">
              {book.author}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-4">
          <button 
            onClick={handleAudiobookToggle}
            className={`p-2 transition-colors hidden sm:flex ${isAudiobookMode ? 'text-accent' : 'text-white/40 hover:text-white'}`}
            title="Audiobook Mode (Continuous)"
          >
            <Headphones size={18} />
          </button>
          <button 
            onClick={handleAddBookmark}
            className="p-2 text-white/40 hover:text-white transition-colors hidden sm:flex"
            title="Bookmark this position"
          >
            <Bookmark size={18} />
          </button>
          <button 
            onClick={() => setIsDistractionFree(!isDistractionFree)}
            className="p-2 text-white/40 hover:text-white transition-colors"
            title={isDistractionFree ? "Normal View" : "Immersive Mode"}
          >
            {isDistractionFree ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 transition-colors ${showSettings ? 'text-accent' : 'text-white/40 hover:text-white'}`}
          >
            <Settings size={18} />
          </button>
          <button 
            onClick={() => {
              if (isFullscreen && document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
              }
              window.history.back();
            }}
            className="ml-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[10px] uppercase tracking-[0.1em] border border-white/10 rounded-sm transition-all"
          >
            <span className="hidden md:inline">EXIT</span>
            <X size={14} className="md:hidden" />
          </button>
        </div>
      </header>
      
      {/* Floating Exit Fullscreen Button (Persistent in Fullscreen/Immersive) */}
      {(isDistractionFree || isFullscreen) && (
        <button 
          onClick={() => {
            if (document.fullscreenElement) {
              document.exitFullscreen();
              setIsFullscreen(false);
            }
            setIsDistractionFree(false);
          }}
          className="fixed top-6 right-6 z-[110] p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-white/40 hover:text-accent hover:scale-110 transition-all shadow-2xl group"
          title="Exit Immersive Mode (Esc)"
        >
          <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}

      {/* Top Progress Info Bar */}
      <div className={`h-12 bg-black/40 backdrop-blur-md border-b border-white/5 flex items-center px-6 z-50 flex-shrink-0 transition-all duration-300 w-full ${isDistractionFree && !showSettings ? 'opacity-0 pointer-events-none absolute' : 'opacity-100 relative'}`}>
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black tracking-[0.2em] text-accent uppercase">{Math.round(progress)}% COMPLETE</span>
              <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden hidden sm:block">
                <div 
                  className="h-full bg-accent transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            {wpm > 0 && (
               <div className="flex items-center gap-2 border-l border-white/10 pl-6">
                 <span className="text-[9px] font-bold tracking-[0.2em] text-white/40 uppercase">Reading Speed:</span>
                 <span className="text-[9px] font-black tracking-[0.2em] text-white/80 uppercase">{wpm} WPM</span>
               </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isSpeaking && (
              <button 
                onClick={stopSpeech}
                className="flex items-center gap-2 px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[8px] font-black tracking-[0.2em] border border-red-500/20 transition-all uppercase animate-pulse"
              >
                <X size={10} /> STOP SPEECH
              </button>
            )}
            <span className="text-[9px] font-black tracking-[0.3em] text-white/60 uppercase whitespace-nowrap">
               {isTwoPage ? 'SPREAD' : 'PAGE'} {Math.floor(currentPage / (isTwoPage ? 2 : 1)) + 1} — {currentPage + (isTwoPage ? 2 : 1)} / {totalPages}
            </span>
          </div>
        </div>
      </div>

      {/* Floating Stats Overlay (Only in Distraction Free / Immersive) */}
      {isDistractionFree && !showSettings && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-6 px-6 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black tracking-[0.2em] text-accent uppercase">{Math.round(progress)}%</span>
            <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
            </div>
          </div>
          {wpm > 0 && (
            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
              <span className="text-[8px] font-black tracking-[0.2em] text-white/80 uppercase">{wpm} WPM</span>
            </div>
          )}
        </div>
      )}

      {/* Main Body with Sidebar and Reader */}
      <div className="flex-1 flex relative overflow-hidden">
          <ViewChapterSidebar
            book={{ ...book, annotations, bookmarks }}
            selectedChapterIndex={selectedChapterIndex}
            onSelectChapter={(idx) => { setSelectedChapterIndex(idx); setIsSidebarOpen(false); }}
            onDeleteAnnotation={handleDeleteAnnotation}
            onDeleteBookmark={handleDeleteBookmark}
            onJumpTo={handleJumpTo}
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

              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-3">AI Voice Persona</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setVoicePreference('male'); stopSpeech(); }}
                    className={`flex-1 py-1.5 text-[8px] font-bold tracking-widest uppercase border transition-all ${voicePreference === 'male' ? 'bg-accent text-white border-accent' : 'bg-white/5 text-white/30 border-white/5 hover:bg-white/10'}`}
                  >
                    Male
                  </button>
                  <button 
                    onClick={() => { setVoicePreference('female'); stopSpeech(); }}
                    className={`flex-1 py-1.5 text-[8px] font-bold tracking-widest uppercase border transition-all ${voicePreference === 'female' ? 'bg-accent text-white border-accent' : 'bg-white/5 text-white/30 border-white/5 hover:bg-white/10'}`}
                  >
                    Female
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <main 
          className={`relative flex-1 flex items-center justify-center overflow-hidden bg-black/5 shadow-inner transition-all duration-500 ${isDistractionFree ? 'p-0 lg:p-0' : 'p-4 lg:p-12'}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="absolute inset-y-0 left-0 w-12 z-[100] flex items-center justify-center pointer-events-none">
            <button 
              onClick={handlePrevPage}
              className="p-3 bg-black/40 backdrop-blur-xl text-white/40 hover:text-accent hover:bg-black/60 rounded-r-2xl transition-all pointer-events-auto border-y border-r border-white/5 shadow-[5px_0_20px_rgba(0,0,0,0.5)] group"
              title="Previous Page"
            >
              <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="absolute inset-y-0 right-0 w-12 z-[100] flex items-center justify-center pointer-events-none">
            <button 
              onClick={handleNextPage}
              className="p-3 bg-black/40 backdrop-blur-xl text-white/40 hover:text-accent hover:bg-black/60 rounded-l-2xl transition-all pointer-events-auto border-y border-l border-white/5 shadow-[-5px_0_20px_rgba(0,0,0,0.5)] group"
              title="Next Page"
            >
              <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div 
            ref={containerRef}
            id="book-surface-final"
            className="relative bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
            style={{
              width: isDistractionFree ? '100%' : (isTwoPage ? '94%' : '100%'),
              maxWidth: isDistractionFree ? '100%' : (isTwoPage ? '1300px' : '580px'),
              height: isDistractionFree ? '100%' : (isTwoPage ? '86%' : '90%'),
              maxHeight: isDistractionFree ? 'none' : '940px',
              backgroundColor: '#ffffff',
              transformStyle: 'preserve-3d',
              zIndex: 30,
              minHeight: isDistractionFree ? '100vh' : '400px',
              minWidth: isDistractionFree ? '100vw' : '280px',
              border: isDistractionFree ? 'none' : '1px solid rgba(0,0,0,0.05)',
              opacity: 1,
              visibility: 'visible',
              display: 'block',
              perspective: '2000px',
              borderRadius: isDistractionFree ? '0' : '2px'
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
      {/* Floating Insight Bubble */}
      <div 
        ref={bubbleRef}
        className="fixed bottom-10 right-10 z-[100] cursor-grab active:cursor-grabbing"
      >
        <div className={`relative transition-all duration-500 ${isBubbleExpanded ? 'w-64' : 'w-14 h-14'}`}>
          {/* Main Bubble */}
          <button 
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${isBubbleExpanded ? 'bg-accent scale-90' : 'bg-black/60 backdrop-blur-xl border border-white/10 hover:border-accent text-white hover:text-accent'}`}
          >
            {isBubbleExpanded ? <X size={20} /> : <Brain size={24} className="animate-pulse" />}
          </button>

          {/* Expanded Menu */}
          <div className={`absolute bottom-0 right-0 bg-[#121212]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,1)] transition-all duration-500 origin-bottom-right ${isBubbleExpanded ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-50 pointer-events-none'}`}>
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-accent tracking-[0.2em] font-black uppercase">Knowledge Pulse</p>
                  <p className="text-xl font-serif text-white font-black">{Math.round(progress)}%</p>
                </div>
                {wpm > 0 && (
                  <div className="text-right">
                    <p className="text-[8px] text-white/40 tracking-[0.2em] uppercase">Est. Remaining</p>
                    <p className="text-sm font-mono text-white/80">
                      {Math.ceil(((100 - progress) / 100) * book.chapters.reduce((acc, c) => acc + c.content.split(/\s+/).length, 0) / wpm)} MINS
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleAudiobookToggle}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${isAudiobookMode ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'}`}
                >
                  <Headphones size={18} />
                  <span className="text-[8px] font-bold tracking-widest uppercase">Audio</span>
                </button>
                <button 
                  onClick={handleAddBookmark}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Bookmark size={18} />
                  <span className="text-[8px] font-bold tracking-widest uppercase">Mark</span>
                </button>
              </div>

              <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                <p className="text-[8px] text-white/20 tracking-widest uppercase mb-1">Current Anchor</p>
                <p className="text-[10px] text-white/60 font-serif italic truncate">
                   {selectedChapter.title} — Page {currentPage + 1}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBook;
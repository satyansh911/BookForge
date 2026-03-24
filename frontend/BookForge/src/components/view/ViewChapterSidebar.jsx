import React, { useState, useEffect } from "react"
import { BookOpen, ChevronLeft, Library, Sparkles, Wand2, ShoppingCart, Quote, Trash2, X, Bookmark } from "lucide-react"
import toast from "react-hot-toast"
import axiosInstance from "../../utils/axiosInstance"
import { API_PATHS } from "../../utils/apiPaths"

const ViewChapterSidebar = ({
  book,
  selectedChapterIndex,
  onSelectChapter,
  onDeleteAnnotation,
  onDeleteBookmark,
  onJumpTo,
  isOpen,
  onClose,
  isSampleOnly
}) => {
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [bookDeals, setBookDeals] = useState([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [isLoadingDeals, setIsLoadingDeals] = useState(false);
  const [continuation, setContinuation] = useState("");
  const [isContinuing, setIsContinuing] = useState(false);

  const savedQuotes = book.annotations?.filter(ann => ann.type === 'quote') || [];

  useEffect(() => {
    const fetchData = async () => {
      if (!book?._id || book._id.startsWith('featured')) return;
      setIsLoadingRelated(true);
      setIsLoadingDeals(true);
      try {
        const [relatedRes, dealsRes] = await Promise.all([
          axiosInstance.get(`${API_PATHS.BOOKS.GET_BOOK_BY_ID}/related/${book._id}`),
          axiosInstance.get(`${API_PATHS.BOOKS.GET_BOOK_BY_ID}/deals/${book._id}`)
        ]);
        setRelatedBooks(relatedRes.data);
        setBookDeals(dealsRes.data);
      } catch (error) {
        console.error("Failed to fetch sidebar data");
      } finally {
        setIsLoadingRelated(false);
        setIsLoadingDeals(false);
      }
    };
    fetchData();
  }, [book._id]);

  const handleContinue = async () => {
    if (isSampleOnly) {
      toast.error("Authentication required for Saga Expansion.");
      return;
    }
    setIsContinuing(true);
    const loadingToast = toast.loading("Synthesizing future paths...");
    try {
      const response = await axiosInstance.post(API_PATHS.AI.CONTINUE, {
        title: book.title,
        summary: book.subtitle || "A synthesized monograph.",
        currentChapters: book.chapters
      });
      setContinuation(response.data.continuation);
      toast.dismiss(loadingToast);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("The saga is currently locked.");
    } finally {
      setIsContinuing(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <div className={`
      fixed lg:relative left-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl border-r border-black/5 transform transition-transform duration-500 ease-in-out z-50 flex flex-col shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-8 border-b border-black/5 bg-black text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-accent"/>
              <span className="font-serif font-black uppercase text-[11px] tracking-[0.4em]">INDEX Explorer</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-white"/>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="border-b border-black/5">
            {book.chapters.map((chapter, index) => (
              <button
                key={index}
                onClick={() => {
                  if (isSampleOnly && index > 0) {
                    toast.error("Premium subscription required for this chapter.");
                    return;
                  }
                  onSelectChapter(index);
                  onClose();
                }}
                className={`
                  w-full text-left p-6 hover:bg-black group transition-all duration-300 border-b border-black/5 last:border-b-0
                  ${selectedChapterIndex === index ? 'bg-black text-white' : 'text-primary'}
                  ${isSampleOnly && index > 0 ? 'opacity-30 grayscale cursor-not-allowed' : ''}
                `}
              >
                <div className={`font-serif font-black text-sm uppercase tracking-tight group-hover:text-white transition-colors ${selectedChapterIndex === index ? 'text-white' : ''}`}>
                  0{index + 1} — {chapter.title}
                </div>
                <div className={`text-[9px] font-bold mt-2 uppercase tracking-[0.3em] group-hover:text-accent transition-colors ${selectedChapterIndex === index ? 'text-accent' : 'text-muted'}`}>
                  Monograph Segment
                </div>
              </button>
            ))}
          </div>

          {/* Saga Expansion Section */}
          <div className="p-8 border-b border-black/5 space-y-6 bg-black text-white">
             <div className="flex items-center gap-3">
                <Sparkles size={14} className="text-accent" />
                <span className="font-serif font-black uppercase text-[10px] tracking-[0.4em] text-accent">Saga Expansion</span>
             </div>
             
             {continuation ? (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-6 bg-white/5 border border-white/10 text-[12px] font-serif leading-relaxed text-white/80 max-h-64 overflow-y-auto custom-scrollbar italic whitespace-pre-wrap">
                    {continuation}
                  </div>
                  <button 
                    onClick={() => setContinuation("")}
                    className="w-full h-12 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-accent hover:text-white transition-all"
                  >
                    Reset Synthesis
                  </button>
               </div>
             ) : (
               <div className="space-y-6">
                 <p className="text-[11px] text-white/60 font-serif italic leading-relaxed">
                   Infinite intelligence projected into the narrative.
                 </p>
                 <button
                    onClick={handleContinue}
                    disabled={isContinuing}
                    className="w-full py-4 bg-accent text-white text-[10px] font-black tracking-[0.3em] uppercase flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all"
                 >
                    <Wand2 size={12} />
                    {isContinuing ? 'SYNTHESIZING...' : 'CONTINUE THE SAGA'}
                 </button>
               </div>
             )}
          </div>

          {/* Persistent Bookmarks Section */}
          <div className="p-6 border-b border-black/5 space-y-6">
             <div className="flex items-center gap-3 opacity-50">
                <Bookmark size={14} className="text-accent" />
                <span className="font-serif font-black uppercase text-[9px] tracking-[0.3em] text-primary">Persistent Bookmarks</span>
             </div>
             
             <div className="space-y-4">
               {book.bookmarks && book.bookmarks.length > 0 ? (
                 book.bookmarks.map((bm) => (
                   <div key={bm._id} className="group relative p-4 bg-surface border border-black/5 hover:border-accent/20 transition-all">
                      <button 
                        onClick={() => onJumpTo(bm.chapterIndex, bm.pageIndex || 0)}
                        className="text-left w-full"
                      >
                        <p className="text-[11px] font-serif font-bold text-primary uppercase tracking-tight group-hover:text-accent transition-colors">
                          {bm.label || `Chapter ${bm.chapterIndex + 1}, Page ${bm.pageIndex + 1}`}
                        </p>
                        <p className="text-[8px] text-muted mt-1 uppercase tracking-widest leading-relaxed">
                          Saved Position
                        </p>
                      </button>
                      <button 
                         onClick={() => onDeleteBookmark(bm._id)}
                         className="absolute top-4 right-4 text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                         <Trash2 size={12} />
                      </button>
                   </div>
                 ))
               ) : (
                 <p className="text-[10px] text-muted italic">No bookmarks preserved.</p>
               )}
             </div>
          </div>

          {/* Saved Excerpts Section */}
          <div className="p-6 border-b border-black/5 space-y-6">
             <div className="flex items-center gap-3 opacity-50">
                <Quote size={14} className="text-primary" />
                <span className="font-serif font-black uppercase text-[9px] tracking-[0.3em] text-primary">Saved Excerpts</span>
             </div>
             
             <div className="space-y-4">
               {savedQuotes.length > 0 ? (
                 savedQuotes.map((quote) => (
                   <div key={quote._id} className="group relative p-4 bg-surface border border-black/5 hover:border-accent/20 transition-all">
                      <button 
                        onClick={() => onJumpTo(quote.chapterIndex, quote.pageIndex || 0)}
                        className="text-left w-full"
                      >
                        <p className="text-[11px] font-serif italic text-primary leading-relaxed line-clamp-3 group-hover:text-accent transition-colors">
                          "{quote.text}"
                        </p>
                      </button>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-black/5">
                         <span className="text-[8px] text-muted uppercase tracking-tighter">
                           Chapter {quote.chapterIndex + 1} — Page {(quote.pageIndex || 0) + 1}
                         </span>
                         <button 
                           onClick={() => onDeleteAnnotation(quote._id)}
                           className="text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                         >
                           <Trash2 size={12} />
                         </button>
                      </div>
                   </div>
                 ))
               ) : (
                 <p className="text-[10px] text-muted italic">No archives preserved yet.</p>
               )}
             </div>
          </div>

          {/* Related Volumes Section */}
          <div className="p-6 border-b border-black/5 space-y-8">
             <div className="flex items-center gap-3 opacity-50">
                <Library className="w-4 h-4"/>
                <span className="font-serif font-black uppercase text-[9px] tracking-[0.3em] text-primary">Related Volumes</span>
             </div>

             {isLoadingRelated ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-black/5 animate-pulse rounded" />)}
                </div>
             ) : (
                <div className="space-y-6">
                  {relatedBooks.map((rel) => (
                    <a 
                      key={rel.id} 
                      href={rel.previewLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex gap-4 group p-2 rounded-lg hover:bg-black/5 transition-all"
                    >
                      <div className="w-12 h-16 bg-surface-dark border border-black/5 overflow-hidden flex-shrink-0">
                        {rel.thumbnail ? (
                           <img src={rel.thumbnail} alt={rel.title} className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-[8px] text-muted">N/A</div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <h4 className="text-[11px] font-serif font-black text-primary uppercase truncate leading-tight group-hover:text-accent transition-colors">
                          {rel.title}
                        </h4>
                        <p className="text-[9px] text-muted uppercase tracking-tighter truncate mt-1">
                          {rel.authors?.join(', ')}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
             )}
          </div>

          {/* Marketplace Section */}
          <div className="p-6 space-y-8 pb-32">
             <div className="flex items-center gap-3 opacity-50">
                <ShoppingCart className="w-4 h-4"/>
                <span className="font-serif font-black uppercase text-[9px] tracking-[0.3em] text-primary">Marketplace</span>
             </div>

             {isLoadingDeals ? (
                <div className="h-24 bg-black/5 animate-pulse rounded" />
             ) : (
                <div className="space-y-4">
                  {bookDeals.map((deal) => (
                    <a 
                      key={deal.id} 
                      href={deal.buyLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-4 border border-black/5 hover:border-accent/40 bg-black/5 hover:bg-black/10 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[8px] font-black tracking-widest text-accent uppercase">
                          {deal.isEbook ? 'Digital Edition' : 'Physical Edition'}
                        </span>
                        <span className="text-[10px] font-bold text-primary">{deal.price}</span>
                      </div>
                      <h5 className="text-[10px] font-serif font-bold text-primary truncate group-hover:text-accent">
                        {deal.publisher || 'Acquire Monograph'}
                      </h5>
                    </a>
                  ))}
                  {bookDeals.length === 0 && (
                    <p className="text-[10px] italic text-muted text-center">No secondary markets identified.</p>
                  )}
                </div>
             )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ViewChapterSidebar
import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { Plus } from "lucide-react"

import Button from "../components/ui/Button"
import BookCard from "../components/ui/BookCard"
import Reveal from "../components/ui/Reveal"
import { useAuth } from "../context/AuthContext"
import axiosInstance from "../utils/axiosInstance"
import { API_PATHS } from "../utils/apiPaths"
import CreateBookModel from "../components/models/CreateBookModel"
import PdfUploadModal from "../components/models/PdfUploadModal"
import StatCard from "../components/dashboard/StatCard"

const DashboardPage = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.BOOKS.GET_BOOKS);
        setBooks(response.data);
      } catch (error) {
        toast.error("Failed to load documents.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const stats = {
    totalBooks: books.length,
    totalChapters: books.reduce((acc, b) => acc + (b.chapters?.length || 0), 0),
    readTime: Math.max(1, Math.round(books.reduce((acc, b) => acc + (b.chapters?.length || 0), 0) * 15 / 60))
  };

  const recentBooks = [...books]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 3);

  const handleBookCreated = (bookId) => {
    setIsCreateModalOpen(false);
    navigate(`/editor/${bookId}`);
  };

  return (
    <div className="space-y-40 pb-32">
      {/* Dynamic Header Section */}
      <Reveal direction="up">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-border pb-20">
          <div className="max-w-3xl space-y-10">
            <div className="space-y-4">
              <p className="text-[10px] tracking-[0.5em] text-muted uppercase font-bold tabular-nums">
                Workspace / {new Date().getFullYear()} / Version 2.0
              </p>
              <h1 className="text-6xl md:text-8xl font-serif font-black leading-[0.85] tracking-tighter uppercase">
                {getGreeting()}, <br />
                <span className="text-secondary italic">{user?.name}.</span>
              </h1>
            </div>
            <p className="text-xl text-secondary leading-relaxed max-w-xl font-serif border-l-2 border-accent/20 pl-8 ml-2">
              Welcome back to your curated selection of manuscripts and archived inspirations. 
              The future of knowledge is being synthesized here.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 self-start lg:self-end">
            <Button
              variant="outline"
              onClick={() => setIsPdfModalOpen(true)}
              className="flex items-center gap-6 py-5 px-12 group"
            >
              <Plus size={18} className="text-accent" />
              <span className="text-sm tracking-widest font-bold">UPLOAD PDF</span>
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-6 py-5 px-12 group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-sm tracking-widest font-bold">SYNTHESIZE EBOOK</span>
            </Button>
          </div>
        </header>
      </Reveal>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[1, 2, 3].map(i => <div key={i} className="h-48 bg-surface animate-pulse" />)}
        </div>
      ) : books.length > 0 ? (
         <>
          {/* Analytics Overview */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard 
              label="Manuscripts" 
              value={stats.totalBooks.toString().padStart(2, '0')} 
              description="Your total collection of unique monographs." 
              delay={0.1}
            />
            <StatCard 
              label="Synthesized Chapters" 
              value={stats.totalChapters.toString().padStart(2, '0')} 
              description="Total number of knowledge segments generated."
              delay={0.2} 
            />
            <StatCard 
              label="Reading Volume" 
              value={`${stats.readTime}h`} 
              description="Estimated time to consume your current library."
              delay={0.3} 
            />
          </section>

          {/* Recently Synthesized Gallery */}
          <section className="space-y-16">
            <div className="flex justify-between items-end border-b border-border/50 pb-8">
               <h2 className="text-3xl font-serif font-black uppercase tracking-tighter">Recently Synthesized</h2>
               <p className="text-[10px] tracking-[0.3em] text-muted uppercase">01 / LATEST ENTRIES</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {recentBooks.map((book, i) => (
                <Reveal key={book._id} direction="up" delay={0.2 + (i * 0.1)}>
                  <BookCard 
                    book={{ 
                      title: book.title, 
                      author: user?.name, 
                      year: new Date(book.createdAt).getFullYear(),
                      category: "LATEST",
                      index: (i + 1).toString().padStart(2, '0'),
                      image: book.coverImage
                    }} 
                    variant="grid"
                    onClick={() => navigate(`/editor/${book._id}`)}
                  />
                </Reveal>
              ))}
            </div>
          </section>

          {/* Full Repository */}
          <section className="space-y-16">
            <div className="flex justify-between items-end border-b border-border/50 pb-8">
               <h2 className="text-3xl font-serif font-black uppercase tracking-tighter">Archives</h2>
               <p className="text-[10px] tracking-[0.3em] text-muted uppercase">02 / FULL REPOSITORY</p>
            </div>
            <div className="flex flex-col">
              {books.map((book, index) => (
                <BookCard 
                  key={book._id} 
                  book={{ 
                    title: book.title, 
                    author: user?.name, 
                    year: new Date(book.createdAt).getFullYear(),
                    index: (index + 1).toString().padStart(2, '0'),
                    category: "PRACTICE",
                    image: book.coverImage
                  }} 
                  variant="list" 
                  onClick={() => navigate(`/editor/${book._id}`)}
                />
              ))}
            </div>
          </section>
         </>
      ) : (
        /* Empty State */
        <Reveal direction="up" delay={0.2}>
          <div className="py-48 flex flex-col items-center text-center space-y-12 bg-surface border border-border">
            <div className="space-y-6">
              <h2 className="text-5xl font-serif font-black uppercase tracking-tighter leading-none">THE LIBRARY IS <br/> SILENT.</h2>
              <p className="max-w-md text-secondary tracking-wide leading-relaxed text-lg mx-auto">
                Your digital bookshelf awaits its first entry. 
                Start by synthesizing your knowledge into a new monograph.
              </p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} className="px-16 py-5">
               INITIALIZE FIRST DRAFT
            </Button>
          </div>
        </Reveal>
      )}

      <CreateBookModel
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onBookCreated={handleBookCreated}
      />

      <PdfUploadModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        onBookCreated={handleBookCreated}
      />
    </div>
  )
}

export default DashboardPage
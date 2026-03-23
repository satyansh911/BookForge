import React, { useState } from 'react';
import { Search, Book as BookIcon, ExternalLink, ArrowRight, Loader } from 'lucide-react';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import Reveal from '../components/ui/Reveal';
import BookCard from '../components/ui/BookCard';
import toast from 'react-hot-toast';

const ExplorePage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query) return;

    setIsSearching(true);
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12`);
      const data = await response.json();
      
      const formattedResults = (data.items || []).map(item => ({
        id: item.id,
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.[0] || "Unknown",
        image: item.volumeInfo.imageLinks?.thumbnail || null,
        year: item.volumeInfo.publishedDate?.split('-')[0] || "N/A",
        description: item.volumeInfo.description,
        previewLink: item.volumeInfo.previewLink,
        category: item.volumeInfo.categories?.[0] || "NOVEL"
      }));

      setResults(formattedResults);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-20 pb-24">
      {/* Search Header */}
      <Reveal direction="down">
        <div className="space-y-8 bg-surface border border-border p-12 md:p-20 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
             <Search size={200} />
           </div>
           
           <div className="max-w-2xl space-y-6 relative z-10">
              <p className="text-[10px] tracking-[0.5em] text-muted uppercase font-bold">Discovery / Global Library</p>
              <h1 className="text-5xl font-serif font-black tracking-tighter uppercase leading-none">Explore the <br/>Archives</h1>
              <p className="text-secondary font-serif italic text-lg leading-relaxed">
                Vaulting millions of titles from the global repository. 
                Search, synthesize, and expand your digital library.
              </p>
              
              <form onSubmit={handleSearch} className="flex gap-4 pt-4">
                 <div className="flex-1">
                    <InputField 
                      icon={Search}
                      placeholder="SEARCH BY TITLE, AUTHOR, OR SUBJECT..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="bg-transparent"
                    />
                 </div>
                 <Button type="submit" disabled={isSearching} className="px-12">
                   {isSearching ? <Loader className="animate-spin" /> : "SEARCH"}
                 </Button>
              </form>
           </div>
        </div>
      </Reveal>

      {/* Results Grid */}
      <div className="space-y-12">
        <div className="flex items-center justify-between border-b border-border pb-6">
          <h2 className="text-[10px] tracking-[0.4em] text-muted uppercase font-bold">
            {results.length > 0 ? `Showing ${results.length} Discovery Results` : "Start Your Discovery"}
          </h2>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
            {results.map((book, i) => (
              <Reveal key={book.id} direction="up" delay={i * 0.05}>
                 <div className="group space-y-6">
                    <div className="relative aspect-[3/4] bg-surface-dark border border-border overflow-hidden">
                       {book.image ? (
                         <img src={book.image} alt={book.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-muted italic font-serif opacity-30">
                           Artifact Pending
                         </div>
                       )}
                       <div className="absolute top-4 right-0 bg-white/90 backdrop-blur-sm px-4 py-1 text-[10px] tracking-widest uppercase font-bold text-primary">
                         {book.category}
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-serif font-black uppercase leading-tight group-hover:text-accent transition-colors line-clamp-2">
                          {book.title}
                        </h3>
                        <p className="text-[10px] tracking-widest text-secondary uppercase font-bold mt-1">
                          {book.author} • {book.year}
                        </p>
                      </div>
                      
                      <div className="pt-4 border-t border-border/50 flex gap-2">
                         <Button 
                           variant="outline" 
                           onClick={() => window.open(book.previewLink, '_blank')}
                           className="flex-1 py-3 text-[9px] tracking-[0.2em] font-bold"
                         >
                           PREVIEW
                         </Button>
                         <Button 
                           className="flex-1 py-3 text-[9px] tracking-[0.2em] font-bold"
                           onClick={() => toast.success("Feature coming soon: Ingest into Synthesis")}
                         >
                           INGEST
                         </Button>
                      </div>
                    </div>
                 </div>
              </Reveal>
            ))}
          </div>
        ) : (
          !isSearching && (
            <div className="py-32 text-center space-y-8 opacity-40">
              <BookIcon size={64} className="mx-auto text-border" />
              <div className="space-y-2">
                <p className="text-xl font-serif italic text-secondary">The library is vast and silent.</p>
                <p className="text-[10px] tracking-widest uppercase font-bold">Awaiting your search query</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ExplorePage;

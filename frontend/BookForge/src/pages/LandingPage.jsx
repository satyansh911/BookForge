import { Link, Navigate, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import BookCard from '../components/ui/BookCard';
import Reveal from '../components/ui/Reveal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import typographyImg from '../assets/bookimgs/typography.png';
import gridSystemsImg from '../assets/bookimgs/gridsystems.png';
import artOfColorImg from '../assets/bookimgs/theartofcolor.jpg';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  const featuredBooks = [
    { title: "Typography: A Manual of Design", author: "Emil Ruder", year: "1967", category: "PRACTICE", image: typographyImg },
    { title: "Grid Systems", author: "Josef Müller-Brockmann", year: "1981", category: "DESIGN", image: gridSystemsImg },
    { title: "The Art of Color", author: "Johannes Itten", year: "1961", category: "INSPIRE", image: artOfColorImg },
  ];

  return (
    <div className="space-y-32">
      {/* Hero Section */}
      <section className="min-h-[70vh] flex flex-col justify-center">
        <Reveal direction="up" duration={1.5}>
          <h1 className="text-[clamp(3rem,10vw,8rem)] leading-[0.9] font-serif font-black tracking-tighter uppercase mb-12">
            Books that <br />
            <span className="text-secondary italic">inspire</span>, <br />
            knowledge that <br />
            endures.
          </h1>
        </Reveal>
        
        <Reveal direction="up" delay={0.3}>
          <div className="flex flex-wrap gap-8 items-center">
            <p className="max-w-md text-secondary leading-relaxed text-lg">
              BookForge — a personal selection of titles that show design in ways the screen never could. 
              These books inspire, educate, and support the creators of the future.
            </p>
            <div className="flex gap-4">
              <Link to="/dashboard">
                <Button className="px-10 py-4">EXPLORE LIBRARY</Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Featured Books Section */}
      <section>
        <Reveal direction="up">
          <div className="flex justify-between items-end mb-16 pb-8 border-b border-border">
            <div>
              <p className="text-[10px] tracking-[0.4em] text-muted mb-4">01 / FEATURED COLLECTION</p>
              <h2 className="text-5xl font-serif">CURATED SELECTION</h2>
            </div>
            <Link to="/dashboard" className="text-xs tracking-widest hover:text-accent transition-colors underline-offset-8 underline decoration-accent/30 hover:decoration-accent">
              VIEW ALL BOOKS
            </Link>
          </div>
        </Reveal>
        
        <Reveal direction="up" delay={0.2} stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {featuredBooks.map((book, i) => (
            <BookCard 
              key={i} 
              book={book} 
              onClick={() => {
                // Navigate to a search-based or static route for the book
                // In this implementation, we'll try to use a static ID or slug
                const SLUGS = {
                  "Typography: A Manual of Design": "typography-manual",
                  "Grid Systems": "grid-systems",
                  "The Art of Color": "art-of-color"
                };
                toast.success(`Opening ${book.title}...`);
                // For demonstration, these can be unique IDs once seeded
                // We'll use a specific ID if we have it, or a generic detail page
                navigate(`/book/${SLUGS[book.title] || 'featured'}`);
              }}
            />
          ))}
        </Reveal>
      </section>

      {/* Quote Section */}
      <section className="py-40 border-y border-border text-center bg-surface/30">
        <Reveal direction="up">
          <blockquote className="max-w-4xl mx-auto">
            <p className="text-4xl font-serif italic leading-relaxed mb-12">
              "Typography has one plain duty before it and that is to convey information in writing. No argument or consideration can absolve typography from this duty."
            </p>
            <cite className="text-[10px] tracking-[0.5em] font-sans text-muted uppercase not-italic">— Emil Ruder, 1967</cite>
          </blockquote>
        </Reveal>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white p-24 md:p-32 flex flex-col items-center justify-center text-center space-y-12">
        <Reveal direction="up">
          <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-serif font-black tracking-tighter leading-none max-w-3xl uppercase">
            READY TO START YOUR READING JOURNEY?
          </h2>
        </Reveal>
        
        <Reveal direction="up" delay={0.2}>
          <div className="flex gap-4">
            <Link to="/signup">
              <Button className="px-20 py-5 text-sm bg-white text-black border-white hover:bg-accent hover:border-accent hover:text-white">
                CREATE FREE ACCOUNT
              </Button>
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default LandingPage;
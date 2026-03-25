import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Book as BookIcon, ChevronRight, Lock, Play, Star, Clock, Globe } from 'lucide-react';
import Button from '../components/ui/Button';
import Reveal from '../components/ui/Reveal';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import typographyImg from '../assets/bookimgs/typography.png';
import gridSystemsImg from '../assets/bookimgs/gridsystems.png';
import artOfColorImg from '../assets/bookimgs/theartofcolor.jpg';

const BookDetailsPage = () => {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [book, setBook] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBook = async () => {
            setIsLoading(true);
            try {
                // Check if bookId is a featured slug
                const FEATURED_SLUGS = {
                    "typography-manual": "Typography: A Manual of Design",
                    "grid-systems": "Grid Systems",
                    "art-of-color": "The Art of Color"
                };

                if (FEATURED_SLUGS[bookId]) {
                    // Try to fetch by title first if it's a slug
                    const response = await axiosInstance.get(`${API_PATHS.BOOKS.GET_BOOKS}`);
                    const matchedBook = response.data.find(b => b.title === FEATURED_SLUGS[bookId]);
                    if (matchedBook) {
                        setBook(matchedBook);
                        return;
                    }
                }

                // Default fetch by ID
                const response = await axiosInstance.get(`${API_PATHS.BOOKS.GET_BOOK_BY_ID}/${bookId}`);
                setBook(response.data);
            } catch (error) {
                console.error("Failed to fetch book:", error);
                // If it's a featured book that hasn't seeded yet, use a mock
                const FEATURED_DATA = {
                         "typography-manual": { title: "Typography: A Manual of Design", author: "Emil Ruder", year: "1967", category: "PRACTICE", coverImage: typographyImg, _id: "featured-1" },
                         "grid-systems": { title: "Grid Systems", author: "Josef Müller-Brockmann", year: "1981", category: "DESIGN", coverImage: gridSystemsImg, _id: "featured-2" },
                         "art-of-color": { title: "The Art of Color", author: "Johannes Itten", year: "1961", category: "INSPIRE", coverImage: artOfColorImg, _id: "featured-3" }
                };
                if (FEATURED_DATA[bookId]) {
                    setBook(FEATURED_DATA[bookId]);
                } else {
                    toast.error("Failed to load monograph details.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (bookId) {
            fetchBook();
        }
    }, [bookId]);

    const handleReadSample = () => {
        // Navigate to the reader starting at the first chapter
        navigate(`/view-book/${book._id}`);
    };

    const handleFullAccess = () => {
        if (!user) {
            toast.error("Authentication required for full access.");
            navigate('/login');
            return;
        }

        if (user.tier === 'premium' || user.isPro) {
            navigate(`/view-book/${book._id}`);
        } else {
            toast("Premium subscription required for full access.", {
                icon: '🔒',
                style: {
                    borderRadius: '0',
                    background: '#000',
                    color: '#fff',
                    fontFamily: 'serif',
                    fontSize: '12px',
                    letterSpacing: '0.1em'
                }
            });
            navigate('/pricing');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-border/20 rounded-full" />
                    <p className="text-[10px] tracking-[0.4em] text-muted uppercase">Retrieving Archive...</p>
                </div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8 text-center">
                <h2 className="text-4xl font-serif font-black uppercase mb-4">Record Not Found</h2>
                <p className="text-secondary max-w-sm mb-8">The requested monograph is not present in our primary repository.</p>
                <Button onClick={() => navigate('/dashboard')}>Return to Library</Button>
            </div>
        );
    }

    const BASE_URL = import.meta.env.VITE_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '');
    const imageUrl = book.coverImage ? (
        book.coverImage.startsWith('http') || book.coverImage.startsWith('data:') 
            ? book.coverImage 
            : `${BASE_URL}${book.coverImage}`.replace(/\\/g, '/')
    ) : '';

    return (
        <div className="min-h-screen bg-surface pb-32">
            {/* Hero Header */}
            <div className="relative h-[40vh] bg-black overflow-hidden border-b border-border">
                <div className="absolute inset-0 opacity-30 grayscale">
                    <img src={imageUrl} alt="" className="w-full h-full object-cover blur-xl scale-110" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-12 md:p-20">
                    <Reveal direction="up">
                        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-12">
                            <div className="hidden md:block w-48 aspect-[3/4] bg-surface relative -bottom-16 shadow-2xl border border-border overflow-hidden">
                                <img src={imageUrl} alt={book.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                            </div>
                            <div className="flex-1 space-y-4 text-white">
                                <p className="text-[10px] tracking-[0.5em] text-accent uppercase font-bold">Monograph 0{bookId.slice(-1) || '1'}</p>
                                <h1 className="text-5xl md:text-7xl font-serif font-black tracking-tighter uppercase leading-none">{book.title}</h1>
                                <div className="flex flex-wrap items-center gap-6 mt-4">
                                    <p className="text-sm tracking-widest uppercase font-bold opacity-70">{book.author}</p>
                                    <span className="w-1 h-1 bg-white/30 rounded-full" />
                                    <p className="text-sm tracking-widest uppercase font-bold opacity-70">{book.year || '1967'}</p>
                                    <span className="w-1 h-1 bg-white/30 rounded-full" />
                                    <div className="px-3 py-1 bg-white/10 backdrop-blur-sm text-[10px] tracking-widest uppercase border border-white/20">
                                        {book.category || 'DESIGN'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-12 md:px-20 pt-24 grid grid-cols-1 lg:grid-cols-3 gap-24">
                {/* Info Column */}
                <div className="lg:col-span-2 space-y-16">
                    <Reveal direction="up">
                        <div className="space-y-8">
                            <h2 className="text-[10px] tracking-[0.4em] text-muted uppercase font-bold border-b border-border pb-4">Synopsis</h2>
                            <p className="text-xl font-serif italic text-secondary leading-relaxed">
                                {book.subtitle || "Exploring the fundamental principles and subjective experiences of visual communication."}
                            </p>
                            <div className="prose prose-invert max-w-none text-muted leading-relaxed font-sans">
                                {book.description || "This foundational text provides a comprehensive exploration of design methodology, focusing on the synthesis of form and function. It remains a cornerstone for designers seeking to understand the enduring laws of visual composition and typographic clarity."}
                            </div>
                        </div>
                    </Reveal>

                    <Reveal direction="up" delay={0.1}>
                        <div className="space-y-8">
                            <h2 className="text-[10px] tracking-[0.4em] text-muted uppercase font-bold border-b border-border pb-4">Archives / Chapters</h2>
                            <div className="space-y-2">
                                {book.chapters && book.chapters.length > 0 ? book.chapters.map((chapter, index) => (
                                    <div key={index} className="group flex items-center justify-between py-6 border-b border-border/50 hover:bg-black/[0.02] transition-colors">
                                        <div className="flex items-center gap-8">
                                            <span className="text-xs font-serif text-muted tabular-nums">{(index + 1).toString().padStart(2, '0')}</span>
                                            <div>
                                                <h3 className="font-serif uppercase tracking-tight group-hover:text-accent transition-colors">{chapter.title}</h3>
                                                <p className="text-[10px] text-muted tracking-widest uppercase mt-1">{chapter.description || 'Monograph Synthesis'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {index === 0 ? (
                                                <span className="text-[9px] tracking-widest text-secondary font-bold uppercase py-1 px-2 border border-secondary/20">Sample Available</span>
                                            ) : (
                                                <Lock size={12} className="text-muted opacity-30" />
                                            )}
                                            <ChevronRight size={16} className="text-muted group-hover:text-accent transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                )) : (
                                    <p className="py-12 text-center text-muted italic font-serif opacity-40">No chapters indexed in this repository.</p>
                                )}
                            </div>
                        </div>
                    </Reveal>
                </div>

                {/* Action Sidebar */}
                <div className="space-y-12">
                    <Reveal direction="left">
                        <div className="bg-white border border-border p-10 space-y-10 shadow-sm sticky top-32">
                            <div className="space-y-2">
                                <h3 className="text-[10px] tracking-[0.4em] text-muted uppercase font-bold">Repository Access</h3>
                                <p className="text-2xl font-serif font-black uppercase">Ingest Knowledge</p>
                            </div>

                            <div className="space-y-4">
                                <Button onClick={handleFullAccess} className="w-full py-5 text-sm tracking-[0.2em] font-black">
                                    GET FULL ACCESS
                                </Button>
                                <Button variant="outline" onClick={handleReadSample} className="w-full py-5 text-sm tracking-[0.2em] font-black border-2">
                                    READ SAMPLE
                                </Button>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-border">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-surface rounded-full flex items-center justify-center">
                                        <Star size={14} className="text-accent" />
                                    </div>
                                    <p className="text-[10px] tracking-widest uppercase font-bold text-secondary">Premium Archive</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-surface rounded-full flex items-center justify-center">
                                        <Clock size={14} className="text-muted" />
                                    </div>
                                    <p className="text-[10px] tracking-widest uppercase font-bold text-secondary">Unlimited Access</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-surface rounded-full flex items-center justify-center">
                                        <Globe size={14} className="text-muted" />
                                    </div>
                                    <p className="text-[10px] tracking-widest uppercase font-bold text-secondary">Global Distribution</p>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </div>
    );
};

export default BookDetailsPage;

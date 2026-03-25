import {useEffect, useState} from "react"
import { useParams } from "react-router-dom"
import toast from "react-hot-toast"
import {Book} from "lucide-react"

import DashboardLayout from "../components/layout/DashboardLayout"
import axiosInstance from "../utils/axiosInstance"
import { API_PATHS } from "../utils/apiPaths"
import ViewBook from "../components/view/ViewBook"
import Reveal from "../components/ui/Reveal"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { MessageSquare } from "lucide-react"
import typographyImg from '../assets/bookimgs/typography.png';
import gridSystemsImg from '../assets/bookimgs/gridsystems.png';
import artOfColorImg from '../assets/bookimgs/theartofcolor.jpg';

const ViewBookSkeleton = () => (
  <div className="animate-pulse space-y-12 pb-32">
    <div className="h-12 bg-surface border-b border-border/30 w-1/2 mb-8"></div>
    <div className="flex flex-col lg:flex-row gap-16">
      <div className="lg:w-1/3">
        <div className="aspect-[3/4] bg-surface border border-border/30 shadow-sm"></div>
      </div>
      <div className="lg:w-2/3 space-y-6">
        <div className="h-4 bg-surface w-full"></div>
        <div className="h-4 bg-surface w-full"></div>
        <div className="h-4 bg-surface w-2/3"></div>
      </div>
    </div>
  </div>
);

const ViewBookPage = () => {
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 
  const {bookId} = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSampleOnly = false; // All chapters are now readable by everyone

  useEffect(() => {
    const fetchBook = async () => {
      try {
        // Check if bookId is a featured slug or mock ID
        const FEATURED_SLUGS = {
          "typography-manual": "Typography: A Manual of Design",
          "grid-systems": "Grid Systems",
          "art-of-color": "The Art of Color",
          "featured-1": "Typography: A Manual of Design",
          "featured-2": "Grid Systems",
          "featured-3": "The Art of Color"
        };

        if (FEATURED_SLUGS[bookId]) {
          const response = await axiosInstance.get(`${API_PATHS.BOOKS.GET_BOOKS}`);
          const matchedBook = response.data.find(b => b.title === FEATURED_SLUGS[bookId]);
          if (matchedBook) {
            setBook(matchedBook);
            setIsLoading(false);
            return;
          }
        }

        const response = await axiosInstance.get(`${API_PATHS.BOOKS.GET_BOOK_BY_ID}/${bookId}`);
        setBook(response.data);
      } catch (error) {
        console.error("Failed to fetch book:", error);
        // Fallback for featured books
        const DATA = {
          "typography-manual": { 
            title: "Typography: A Manual of Design", 
            author: "Emil Ruder", 
            coverImage: typographyImg, 
            _id: "featured-1",
            chapters: [{ title: "The Fundamentals", content: "Typography has one plain duty before it and that is to convey information in writing. No argument or consideration can absolve typography from this duty. A printed work that cannot be read becomes a product without purpose. It must be legible and readable in the best sense of those words. To this end, the typographer must have a clear understanding of the laws of optical perception. \n\nThe grid system is an aid, not a guarantee. It permits a number of possible uses and each designer can look for a solution appropriate to his personal style. But one must learn how to use the grid; it is an art that requires practice. Typography is a matter of proportions. The relationship between the size of the type and the size of the page, the relationship between the weight of the type and the weight of the paper, the relationship between the spacing of the letters and the spacing of the words—all these things are important. \n\nIn the process of design, the typographer must always keep in mind the reader. The reader is the ultimate judge of the work. If the work is not readable, it is a failure. If the work is readable but not beautiful, it is a missed opportunity. If the work is both readable and beautiful, it is a triumph of typography. \n\nThe history of typography is a long and fascinating one. From the early days of Gutenberg to the modern era of digital type, the basic principles have remained the same. The goal has always been to communicate information clearly and beautifully. Typography is an art form that is both functional and aesthetic. It is a language of its own, a way of expressing ideas through the arrangement of letters and words on a page. \n\nAs we look to the future, the world of typography continues to evolve. New technologies and new platforms present new challenges and new opportunities. But the fundamental principles of typography will always remain the same. The duty of the typographer will always be to convey information clearly and beautifully. This is the essence of typography. This is the manual of design." }]
          },
          "grid-systems": { 
            title: "Grid Systems", 
            author: "Josef Müller-Brockmann", 
            coverImage: gridSystemsImg, 
            _id: "featured-2",
            chapters: [{ title: "The Grid System", content: "The grid system is an aid, not a guarantee. It permits a number of possible uses and each designer can look for a solution appropriate to his personal style. But one must learn how to use the grid; it is an art that requires practice." }]
          },
          "art-of-color": { 
            title: "The Art of Color", 
            author: "Johannes Itten", 
            coverImage: artOfColorImg, 
            _id: "featured-3",
            chapters: [{ title: "The Physics of Color", content: "Color is life; for a world without colors appears to us as dead. Colors are primordial ideas, children of the primordial colorless light and its contrary, colorless darkness." }]
          }
        };

        const FEATURED_DATA = {
          ...DATA,
          "featured-1": DATA["typography-manual"],
          "featured-2": DATA["grid-systems"],
          "featured-3": DATA["art-of-color"]
        };
        if (FEATURED_DATA[bookId]) {
          setBook(FEATURED_DATA[bookId]);
        } else {
          toast.error("Failed to load monograph.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchBook();
  }, [bookId]);

  return (
    <div className="min-h-screen bg-background">
      {isLoading ? (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <ViewBookSkeleton />
        </div>
      ) : book ? (
        <>
          <ViewBook book={book} isSampleOnly={isSampleOnly} />
          
          {/* Public Chat Trigger */}
          <button 
            onClick={() => navigate(`/discuss/book/${book._id}`)}
            className="fixed bottom-8 right-8 z-50 bg-black text-white p-4 rounded-full shadow-2xl hover:bg-primary transition-all group flex items-center gap-3"
          >
            <MessageSquare size={24} />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-bold text-xs">
              PUBLIC CHAT
            </span>
          </button>
        </>
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-48">
          <div className="flex flex-col items-center justify-center text-center bg-surface border border-border border-dashed p-12">
            <h3 className="text-4xl font-serif font-black uppercase tracking-tighter mb-6">
              RECORD NOT FOUND.
            </h3>
            <p className="text-secondary max-w-sm tracking-wide leading-relaxed">
              The monograph you are seeking is either restricted or has been moved from the primary repository.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewBookPage
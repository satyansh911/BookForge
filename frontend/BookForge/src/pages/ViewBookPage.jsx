import {useEffect, useState} from "react"
import { useParams } from "react-router-dom"
import toast from "react-hot-toast"
import {Book} from "lucide-react"

import DashboardLayout from "../components/layout/DashboardLayout"
import axiosInstance from "../utils/axiosInstance"
import { API_PATHS } from "../utils/apiPaths"
import ViewBook from "../components/view/ViewBook"
import Reveal from "../components/ui/Reveal"

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

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axiosInstance.get(`${API_PATHS.BOOKS.GET_BOOK_BY_ID}/${bookId}`);
        setBook(response.data);
      } catch (error) {
        toast.error("Failed to load monograph.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBook();
  }, [bookId]);

  return (
    <div className="min-h-screen bg-surface">
      {isLoading ? (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <ViewBookSkeleton />
        </div>
      ) : book ? (
        <ViewBook book={book} />
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
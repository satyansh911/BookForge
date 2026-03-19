import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import {
  Sparkles,
  FileDown,
  Save,
  Menu,
  X,
  Edit,
  NotebookText,
  ChevronDown,
  FileText,
  ArrowLeft,
  Eye,
} from "lucide-react"
import { arrayMove } from "@dnd-kit/sortable"

import axiosInstance from "../utils/axiosInstance"
import { API_PATHS } from "../utils/apiPaths"
import Dropdown, { DropdownItem } from "../components/ui/Dropdown"
import Button from "../components/ui/Button"
import ChapterSidebar from "../components/editor/ChapterSidebar"
import ChapterEditorTab from "../components/editor/ChapterEditorTab"
import BookDetailsTab from "../components/editor/BookDetailsTab"

const EditorPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("editor");
  const fileInputRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axiosInstance.get(`${API_PATHS.BOOKS.GET_BOOK_BY_ID}/${bookId}`);
        setBook(response.data);
      } catch (error) {
        toast.error("Failed to load book. Please try again.");
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBook();
  }, [bookId, navigate]);

  const handleBookChange = (e) => {
    const { name, value } = e.target;
    setBook((prev) => ({ ...prev, [name]: value }));
  };

  const handleChapterChange = (e) => {
    const { name, value } = e.target;
    const updatedChapters = [...book.chapters];
    updatedChapters[selectedChapterIndex][name] = value;
    setBook((prev) => ({ ...prev, chapters: updatedChapters }));
  };

  const handleAddChapter = () => {
    const newChapter = {
      title: `CHAPTER ${book.chapters.length + 1}`,
      content: "",
    };
    const updatedChapters = [...book.chapters, newChapter];
    setBook((prev) => ({ ...prev, chapters: updatedChapters }));
    setSelectedChapterIndex(updatedChapters.length - 1);
  };

  const handleDeleteChapter = (index) => {
    if (book.chapters.length <= 1) {
      toast.error("A monograph must have at least one chapter.");
      return;
    }
    const updatedChapters = book.chapters.filter((_, i) => i !== index);
    setBook((prev) => ({ ...prev, chapters: updatedChapters }));
    setSelectedChapterIndex((prevIndex) =>
      prevIndex >= index ? Math.max(0, prevIndex - 1) : prevIndex
    );
  };

  const handleReorderChapters = (oldIndex, newIndex) => {
    setBook((prev) => ({
      ...prev,
      chapters: arrayMove(prev.chapters, oldIndex, newIndex),
    }));
    setSelectedChapterIndex(newIndex);
  };

  const handleSaveChanges = async (bookToSave = book, showToast = true) => {
    setIsSaving(true);
    try {
      await axiosInstance.put(`${API_PATHS.BOOKS.UPDATE_BOOK}/${bookId}`, bookToSave);
      if (showToast) toast.success("Manuscript saved successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCoverImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("coverImage", file);
    setIsUploading(true);
    try {
      const response = await axiosInstance.put(
        `${API_PATHS.BOOKS.UPDATE_COVER}/${bookId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setBook(response.data);
      toast.success("Cover artifact updated.");
    } catch (error) {
      toast.error("Failed to upload cover.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateChapterContent = async (index) => {
    const chapter = book.chapters[index];
    if (!chapter || !chapter.title) {
      toast.error("Chapter identifier is required.");
      return;
    }
    setIsGenerating(true);
    try {
      const response = await axiosInstance.post(API_PATHS.AI.GENERATE_CHAPTER_CONTENT, {
        chapterTitle: chapter.title,
        chapterDescription: chapter.description || "",
        style: "Informative",
      });
      const updatedChapters = [...book.chapters];
      updatedChapters[index].content = response.data.content;
      const updatedBook = { ...book, chapters: updatedChapters };
      setBook(updatedBook);
      toast.success(`Content for "${chapter.title}" synthesized.`);
      await handleSaveChanges(updatedBook, false);
    } catch (error) {
      toast.error("Failed to generate content.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    toast.loading("SYNTHESIZING PDF...");
    try {
      const response = await axiosInstance.get(`${API_PATHS.EXPORT.PDF}/${bookId}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${book.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success("PDF PUBLISHED.");
    } catch (error) {
      toast.dismiss();
      toast.error("EXPORT FAILED.");
    }
  };

  if (isLoading || !book) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-[10px] tracking-[0.5em] text-muted uppercase animate-pulse">INITIALIZING EDITOR...</p>
      </div>
    )
  }

  return (
    <div className="flex bg-white font-sans relative min-h-screen">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[80] md:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative w-80 h-full bg-white border-r border-border animate-in slide-in-from-left duration-300">
            <ChapterSidebar
              book={book}
              selectedChapterIndex={selectedChapterIndex}
              onSelectChapter={(index) => { setSelectedChapterIndex(index); setIsSidebarOpen(false); }}
              onAddChapter={handleAddChapter}
              onDeleteChapter={handleDeleteChapter}
              onGenerateChapterContent={handleGenerateChapterContent}
              onReorderChapters={handleReorderChapters}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-80 h-screen sticky top-0 border-r border-border bg-surface">
        <ChapterSidebar
          book={book}
          selectedChapterIndex={selectedChapterIndex}
          onSelectChapter={setSelectedChapterIndex}
          onAddChapter={handleAddChapter}
          onDeleteChapter={handleDeleteChapter}
          onGenerateChapterContent={handleGenerateChapterContent}
          isGenerating={isGenerating}
          onReorderChapters={handleReorderChapters}
        />
      </div>

      <main className="flex-1 flex flex-col">
        {/* Editor Top Bar */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border p-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-primary hover:text-accent">
              <Menu size={24} />
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("editor")}
                className={`py-2 px-6 text-[11px] tracking-[0.2em] uppercase font-bold transition-all border ${
                  activeTab === "editor" ? "bg-primary text-white border-primary" : "bg-transparent text-muted border-transparent hover:text-primary"
                }`}
              >
                EDITOR
              </button>
              <button
                onClick={() => setActiveTab("details")}
                className={`py-2 px-6 text-[11px] tracking-[0.2em] uppercase font-bold transition-all border ${
                  activeTab === "details" ? "bg-primary text-white border-primary" : "bg-transparent text-muted border-transparent hover:text-primary"
                }`}
              >
                DETAILS
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/view-book/${bookId}`)}
              className="flex items-center gap-3 py-2 px-6"
            >
              <Eye size={14} />
              VIEW BOOK
            </Button>
            <Dropdown
              trigger={
                <Button variant="outline" className="flex items-center gap-3 py-2 px-6">
                  EXPORT
                  <ChevronDown size={14} />
                </Button>
              }
            >
              <DropdownItem onClick={handleExportPDF}>
                <FileText size={14} className="mr-3" /> PDF DOCUMENT
              </DropdownItem>
            </Dropdown>
            <Button
              onClick={() => handleSaveChanges()}
              isLoading={isSaving}
              className="flex items-center gap-3 py-2 px-6"
            >
              <Save size={14} />
              SAVE MANUSCRIPT
            </Button>
          </div>
        </header>

        {/* Tab Content */}
        <div className="flex-1 min-h-0 bg-white">
          {activeTab === "editor" ? (
            <ChapterEditorTab
              book={book}
              selectedChapterIndex={selectedChapterIndex}
              onChapterChange={handleChapterChange}
              onGenerateChapterContent={handleGenerateChapterContent}
              isGenerating={isGenerating}
            />
          ) : (
            <BookDetailsTab
              book={book}
              onBookChange={handleBookChange}
              onCoverUpload={handleCoverImageUpload}
              isUploading={isUploading}
              fileInputRef={fileInputRef}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default EditorPage
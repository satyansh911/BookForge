import { useState, useRef, useEffect } from "react"
import {
  Plus,
  Sparkles,
  Trash2,
  ArrowLeft,
  BookOpen,
  Hash,
  Lightbulb,
  Palette,
  ChevronRight,
} from "lucide-react"
import Model from "../ui/Model"
import InputField from "../ui/InputField"
import SelectField from "../ui/SelectField"
import Button from "../ui/Button"
import axiosInstance from "../../utils/axiosInstance"
import { API_PATHS } from "../../utils/apiPaths"
import toast from "react-hot-toast"
import { useAuth } from "../../context/AuthContext"

const CreateBookModel = ({ isOpen, onClose, onBookCreated }) => {
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [bookTitle, setBookTitle] = useState("");
  const [numChapters, setNumChapters] = useState(5);
  const [aiTopic, setAiTopic] = useState("");
  const [aiStyle, setAiStyle] = useState("Informative");
  const [chapters, setChapters] = useState([]);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [isFinalizingBook, setIsFinalizingBook] = useState(false);
  const chaptersContainerRef = useRef(null);

  const resetModel = () => {
    setStep(1);
    setBookTitle("");
    setNumChapters(5);
    setAiTopic("");
    setAiStyle("Informative");
    setChapters([]);
    setIsGeneratingOutline(false);
    setIsFinalizingBook(false);
  }

  const handleGenerateOutline = async () => {
    if (!bookTitle || !numChapters) {
      toast.error("Please provide book title and number of chapters.");
      return;
    }
    setIsGeneratingOutline(true);
    try {
      const response = await axiosInstance.post(API_PATHS.AI.GENERATE_OUTLINE, {
        topic: bookTitle,
        description: aiTopic || "",
        style: aiStyle,
        numChapters: numChapters,
      });
      setChapters(response.data.outline);
      setStep(2);
      toast.success("Outline generated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate outline. Please try again.");
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  const handleChapterChange = (index, field, value) => {
    const updatedChapters = [...chapters];
    updatedChapters[index][field] = value;
    setChapters(updatedChapters);
  };

  const handleDeleteChapter = (index) => {
    if (chapters.length <= 1) return;
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const handleAddChapter = () => {
    setChapters([...chapters, { title: `Chapter ${chapters.length + 1}`, description: "" }]);
  };

  const handleFinalizeBook = async () => {
    if (!bookTitle || chapters.length === 0) {
      toast.error("Please provide book title and at least one chapter.");
      return;
    }
    setIsFinalizingBook(true);
    try {
      const response = await axiosInstance.post(API_PATHS.BOOKS.CREATE_BOOK, {
        title: bookTitle,
        author: user.name || "Unknown Author",
        chapters: chapters,
      });
      toast.success("eBook created successfully!");
      onBookCreated(response.data._id);
      onClose();
      resetModel();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create eBook. Please try again.");
    } finally {
      setIsFinalizingBook(false);
    }
  };

  useEffect(() => {
    if (step === 2 && chaptersContainerRef.current) {
      const scrollableDiv = chaptersContainerRef.current;
      scrollableDiv.scrollTo({
        top: scrollableDiv.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chapters.length, step]);

  return (
    <Model
      isOpen={isOpen}
      onClose={() => {
        resetModel();
        onClose();
      }}
      title={step === 1 ? "CREATE NEW MONOGRAPH" : "REFINE THE OUTLINE"}
    >
      {step === 1 && (
        <div className="space-y-12">
          {user?.tier !== 'premium' ? (
            <div className="p-12 border border-accent/20 bg-surface-dark space-y-8 text-center animate-in zoom-in duration-500">
               <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                 <Sparkles size={32} className="text-accent" />
               </div>
               <div className="space-y-4">
                 <h3 className="text-2xl font-serif font-black uppercase tracking-tighter">Synthesis Tier Required</h3>
                 <p className="text-sm text-secondary font-serif italic max-w-md mx-auto leading-relaxed">
                   AI-driven monograph synthesis is an exclusive feature of our Synthesis tier. 
                   Join the ranks of advanced knowledge architects to unlock infinite intelligence.
                 </p>
               </div>
               <div className="pt-6">
                 <Button 
                   onClick={() => {
                     onClose();
                     window.location.href = '/pricing';
                   }}
                   className="bg-accent text-white px-12 py-6 border-accent hover:bg-black"
                 >
                   <span className="text-xs tracking-[0.2em] font-black uppercase">Upgrade to Synthesis</span>
                 </Button>
               </div>
               <p className="text-[10px] tracking-widest text-muted uppercase font-bold pt-4">
                 Manual curation remains free for all manuscripts.
               </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <span className="text-[10px] tracking-widest text-primary font-bold">01</span>
                <div className="flex-1 h-[1px] bg-primary"></div>
                <span className="text-[10px] tracking-widest text-border">02</span>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-10">
                  <InputField
                    icon={BookOpen}
                    label="Book Title"
                    placeholder="UNSPECIFIED TITLE"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                  />
                  <InputField
                    icon={Hash}
                    label="Chapters"
                    type="number"
                    placeholder="05"
                    value={numChapters}
                    onChange={(e) => setNumChapters(parseInt(e.target.value) || 1)}
                    min="1"
                    max="20"
                  />
                </div>
                <div className="space-y-10">
                  <InputField
                    icon={Lightbulb}
                    label="Topic Focus"
                    placeholder="OPTIONAL CONTEXT"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                  />
                  <SelectField
                    icon={Palette}
                    label="Voice / Style"
                    value={aiStyle}
                    onChange={(e) => setAiStyle(e.target.value)}
                    options={["Informative", "Storytelling", "Casual", "Professional", "Humorous"]}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-8 border-t border-border/50">
                <Button
                  onClick={handleGenerateOutline}
                  disabled={isGeneratingOutline || !bookTitle}
                  className="flex items-center gap-4 group"
                >
                  <Sparkles size={16} className={isGeneratingOutline ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'} />
                  {isGeneratingOutline ? 'GENERATING...' : 'GENERATE OUTLINE'}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-12">
          <div className="flex items-center gap-4">
            <span className="text-[10px] tracking-widest text-muted">01</span>
            <div className="flex-1 h-[1px] bg-border"></div>
            <span className="text-[10px] tracking-widest text-primary font-bold">02</span>
          </div>

          <div
            ref={chaptersContainerRef}
            className="space-y-6 max-h-[50vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-border"
          >
            {chapters.map((chapter, index) => (
              <div
                key={index}
                className="group p-8 border border-border hover:border-primary transition-all bg-white relative"
              >
                <div className="flex items-start gap-6">
                  <span className="font-serif italic text-4xl text-border group-hover:text-accent transition-colors">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="flex-1 space-y-4">
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => handleChapterChange(index, "title", e.target.value)}
                      placeholder="CHAPTER TITLE"
                      className="w-full text-2xl font-serif font-black uppercase outline-none bg-transparent"
                    />
                    <textarea
                      value={chapter.description}
                      onChange={(e) => handleChapterChange(index, "description", e.target.value)}
                      placeholder="Brief description of this chapter's intent..."
                      rows={2}
                      className="w-full text-sm font-sans text-secondary bg-transparent outline-none resize-none placeholder:text-border"
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteChapter(index)}
                    className="p-2 text-muted hover:text-error transition-colors"
                    title="Remove Chapter"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            <button 
              onClick={handleAddChapter}
              className="w-full py-8 border-2 border-dashed border-border text-muted hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-xs font-bold"
            >
              <Plus size={16} />
              ADD NEW CHAPTER
            </button>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-border/50">
            <button 
              onClick={() => setStep(1)}
              className="flex items-center gap-3 text-[10px] tracking-widest text-muted hover:text-primary transition-colors uppercase"
            >
              <ArrowLeft size={16} />
              BACK TO CONFIG
            </button>
            <Button
              onClick={handleFinalizeBook}
              disabled={isFinalizingBook}
              className="flex items-center gap-4"
            >
              {isFinalizingBook ? 'FINALIZING...' : 'CREATE EBOOK'}
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </Model>
  )
}

export default CreateBookModel
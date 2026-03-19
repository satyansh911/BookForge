import { useMemo, useState } from "react"
import { Sparkles, Eye, Maximize2, Type, FileText } from "lucide-react"
import Button from "../ui/Button"
import InputField from "../ui/InputField"
import SimpleMDEditor from "./SimpleMDEditor"

const ChapterEditorTab = ({
  book,
  selectedChapterIndex,
  onChapterChange,
  onGenerateChapterContent,
  isGenerating,
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const formatMarkdown = (content) => {
    return content
      .replace(/^### (.*$)/gm, '<h3 class="text-2xl font-serif font-bold mb-6 mt-10 tracking-tight">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-3xl font-serif font-black mb-8 mt-12 tracking-tighter uppercase">$2</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-5xl font-serif font-black mb-10 mt-16 tracking-tighter uppercase">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-primary">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-secondary">$1</em>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-accent pl-8 italic text-secondary my-12 text-xl font-serif leading-relaxed">$1</blockquote>')
      .replace(/^\- (.*$)/gm, '<li class="ml-6 mb-3 font-sans list-none flex gap-4"><span class="text-accent">•</span> $1</li>')
      .split('\n\n')
      .map(p => {
        let trimmed = p.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('<')) return trimmed;
        return `<p class="mb-8 font-serif text-lg leading-relaxed text-primary">${trimmed}</p>`;
      })
      .join('');
  };

  const mdeOptions = useMemo(() => ({
    autofocus: true,
    spellChecker: false,
    placeholder: "START TYPING THE FUTURE...",
    toolbar: [
      "bold", "italic", "heading", "|",
      "quote", "unordered-list", "ordered-list", "|",
      "link", "image", "|",
      "preview", "side-by-side", "fullscreen",
    ],
  }), []);

  const currentChapter = book.chapters[selectedChapterIndex];

  if (!currentChapter) return null;

  const wordCount = currentChapter.content ? currentChapter.content.split(/\s+/).filter(w => w.length > 0).length : 0;

  return (
    <div className={`${isFullscreen ? "fixed inset-0 z-[100] bg-white" : "h-full"} flex flex-col animate-in fade-in duration-500`}>
      <div className="flex-1 flex flex-col p-8 md:p-12 gap-12 max-w-6xl mx-auto w-full">
        {/* Editor Controls Overlay */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 pb-12 border-b border-border/50">
          <div className="flex-1 space-y-12 w-full">
            <div className="space-y-4">
              <p className="text-[10px] tracking-[0.5em] text-muted uppercase">Selected Segment</p>
              <input
                value={currentChapter.title || ""}
                name="title"
                onChange={onChapterChange}
                placeholder="CHAPTER IDENTIFIER"
                className="w-full text-5xl font-serif font-black uppercase outline-none bg-transparent tracking-tighter"
              />
            </div>
            
            <div className="flex gap-4">
               <button
                onClick={() => setIsPreviewMode(false)}
                className={`py-2 px-8 text-[11px] tracking-[0.2em] font-bold border transition-all ${!isPreviewMode ? 'bg-primary text-white border-primary' : 'bg-transparent text-muted border-border hover:border-primary hover:text-primary'}`}
              >
                EDIT MODE
              </button>
              <button
                onClick={() => setIsPreviewMode(true)}
                className={`py-2 px-8 text-[11px] tracking-[0.2em] font-bold border transition-all ${isPreviewMode ? 'bg-primary text-white border-primary' : 'bg-transparent text-muted border-border hover:border-primary hover:text-primary'}`}
              >
                PREVIEW
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-3 border border-border hover:bg-black/5 transition-colors"
              title="Focus Mode"
            >
              <Maximize2 size={18} />
            </button>
            <Button
              onClick={() => onGenerateChapterContent(selectedChapterIndex)}
              isLoading={isGenerating === selectedChapterIndex}
              className="flex items-center gap-4 py-3"
              variant="outline"
            >
              <Sparkles size={16} />
              <span className="text-[11px] tracking-[0.2em] font-bold">AI SYNTHESIS</span>
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 relative">
          {isPreviewMode ? (
            <div className="h-full overflow-y-auto bg-surface p-12 md:p-20 shadow-inner border border-border">
               <div className="max-w-2xl mx-auto space-y-12">
                  <div className="text-center space-y-4">
                    <p className="text-[10px] tracking-[0.5em] text-muted uppercase">Segment {(selectedChapterIndex + 1).toString().padStart(2, '0')}</p>
                    <h1 className="text-5xl font-serif font-black tracking-tighter uppercase leading-none">
                      {currentChapter.title || "UNTITLED"}
                    </h1>
                    <div className="w-12 h-[2px] bg-accent mx-auto mt-8" />
                  </div>
                  <div 
                    className="reader-content font-serif leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: currentChapter.content ? formatMarkdown(currentChapter.content) : '<p class="text-muted italic text-center text-sm tracking-widest uppercase">Manuscript is empty.</p>'
                    }}
                  />
               </div>
            </div>
          ) : (
            <div className="h-full border border-border bg-white focus-within:border-primary transition-colors">
              <SimpleMDEditor
                value={currentChapter.content || ""}
                onChange={(value) => onChapterChange({ target: { name: "content", value } })}
                options={mdeOptions}
              />
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="flex justify-between items-center text-[10px] tracking-[0.2em] font-bold uppercase text-muted">
          <div className="flex gap-8">
            <span>Words: {wordCount}</span>
            <span>Est. Read: {Math.ceil(wordCount / 200)}m</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-accent" />
            <span>Buffer Synchronized</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChapterEditorTab
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Sparkles, Trash2, Plus, GripVertical } from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, useSortable, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import Button from "../ui/Button"

const SortableItem = ({ chapter, index, selectedChapterIndex, onSelectChapter, onDeleteChapter, onGenerateChapterContent, isGenerating }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: chapter._id || `new-${index}` });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isActive = selectedChapterIndex === index;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group relative border-b border-border/50 transition-all ${isActive ? 'bg-black text-white' : 'bg-transparent text-primary hover:bg-black/5'}`}
    >
      <div className="flex items-center">
        <div 
          {...attributes} {...listeners}
          className="p-4 cursor-grab active:cursor-grabbing text-muted group-hover:text-primary transition-colors"
        >
          <GripVertical size={14} />
        </div>
        
        <button
          onClick={() => onSelectChapter(index)}
          className={`flex-1 py-4 text-left font-serif font-bold text-sm tracking-tight uppercase truncate pr-12`}
        >
          <span className="mr-3 text-[10px] font-sans opacity-50">{(index + 1).toString().padStart(2, '0')}</span>
          {chapter.title}
        </button>

        <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onGenerateChapterContent(index); }}
            className={`p-2 transition-colors ${isActive ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-black/10 text-muted hover:text-accent'}`}
            title="AI Synthesis"
          >
            <Sparkles size={14} className={isGenerating === index ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteChapter(index); }}
            className={`p-2 transition-colors ${isActive ? 'hover:bg-white/10 text-white/50 hover:text-error' : 'hover:bg-black/10 text-muted hover:text-error'}`}
            title="Remove"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
};

const ChapterSidebar = ({
  book,
  selectedChapterIndex,
  onSelectChapter,
  onAddChapter,
  onDeleteChapter,
  onGenerateChapterContent,
  isGenerating,
  onReorderChapters,
}) => {
  const navigate = useNavigate();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const chapterIds = book.chapters.map((chapter, index) => chapter._id || `new-${index}`);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = chapterIds.indexOf(active.id);
      const newIndex = chapterIds.indexOf(over.id);
      onReorderChapters(oldIndex, newIndex);
    }
  };

  return (
    <aside className="h-full flex flex-col bg-white overflow-hidden">
      <div className="p-8 border-b border-border space-y-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3 text-[10px] tracking-[0.3em] text-muted hover:text-primary transition-colors uppercase font-bold"
        >
          <ArrowLeft size={14} />
          DASHBOARD
        </button>
        <div>
          <p className="text-[10px] tracking-[0.4em] text-muted mb-2 uppercase">Monograph Title</p>
          <h2 className="text-xl font-serif font-black tracking-tighter uppercase leading-tight line-clamp-2">
            {book.title}
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={chapterIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col">
              {book.chapters.map((chapter, index) => (
                <SortableItem
                  key={chapter._id || `new-${index}`}
                  chapter={chapter}
                  index={index}
                  selectedChapterIndex={selectedChapterIndex}
                  onSelectChapter={onSelectChapter}
                  onDeleteChapter={onDeleteChapter}
                  onGenerateChapterContent={onGenerateChapterContent}
                  isGenerating={isGenerating}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="mt-auto p-8 border-t border-border bg-white">
        <Button
          onClick={onAddChapter}
          className="w-full flex items-center justify-center gap-4 py-4"
          variant="outline"
        >
          <Plus size={16} />
          <span className="text-[11px] tracking-[0.2em] font-bold">ADD CHAPTER</span>
        </Button>
      </div>
    </aside>
  )
}

export default ChapterSidebar
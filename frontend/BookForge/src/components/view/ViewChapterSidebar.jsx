import {BookOpen, ChevronLeft} from "lucide-react"

const ViewChapterSidebar = ({
  book,
  selectedChapterIndex,
  onSelectChapter,
  isOpen,
  onClose,
}) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20  backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <div className={`
      fixed lg:relative left-0 top-0 h-full w-80 bg-surface border-r border-black/5 transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-6 border-b border-black/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-accent"/>
              <span className="font-serif font-black uppercase text-[10px] tracking-[0.3em] text-primary">Chapters</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4"/>
            </button>
          </div>
        </div>
        <div className="overflow-y-auto h-full pb-20">
          {book.chapters.map((chapter, index) => (
            <button
              key={index}
              onClick={() => {
                onSelectChapter(index);
                onClose();
              }}
              className={`
                w-full text-left p-4 hover:bg-black/5 transition-colors border-b border-black/5 last:border-b-0
                ${selectedChapterIndex === index ? 'bg-black/5 border-l-4 border-l-accent' : ''}
              `}
            >
              <div className={`font-serif font-bold text-sm truncate uppercase tracking-tight ${
                 selectedChapterIndex === index ? 'text-primary' : 'text-secondary'
              }`}>
                {chapter.title}
              </div>
              <div className="text-[10px] text-muted mt-1 uppercase tracking-widest">
                Segment {index + 1}
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

export default ViewChapterSidebar
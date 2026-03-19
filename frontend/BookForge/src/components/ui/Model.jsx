import { X } from "lucide-react"

const Model = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>
        <div className="bg-white border border-border shadow-2xl max-w-2xl w-full p-10 relative text-left animate-in zoom-in-95 fade-in duration-300">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-border/50">
            <div>
              <p className="text-[10px] tracking-[0.4em] text-muted mb-2 uppercase">Action / Request</p>
              <h3 className="text-3xl font-serif font-black tracking-tighter uppercase">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-primary hover:text-accent transition-colors p-2"
            >
              <X size={24} />
            </button>
          </div>
          <div className="font-sans">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default Model
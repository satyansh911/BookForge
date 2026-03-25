import { useState, useRef } from "react"
import {
  Upload,
  FileText,
  X,
  Plus,
  ArrowRight,
  ShieldCheck,
  Loader
} from "lucide-react"
import Model from "../ui/Model"
import Button from "../ui/Button"
import axiosInstance from "../../utils/axiosInstance"
import { API_PATHS } from "../../utils/apiPaths"
import toast from "react-hot-toast"

const PdfUploadModal = ({ isOpen, onClose, onBookCreated }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      toast.error("Please select a valid PDF file.");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await axiosInstance.post(API_PATHS.BOOKS.UPLOAD_PDF, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success("Monograph ingested successfully!");
      onBookCreated(response.data._id);
      onClose();
      setFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to ingest PDF. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Model
      isOpen={isOpen}
      onClose={() => {
        setFile(null);
        onClose();
      }}
      title="INGEST PERSONAL ARTIFACT"
    >
      <div className="space-y-12">
        {!file ? (
          <div 
            onClick={() => fileInputRef.current.click()}
            className="group p-20 border-2 border-dashed border-border hover:border-primary transition-all bg-surface-dark cursor-pointer text-center space-y-8"
          >
             <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/10 transition-colors">
               <Upload size={40} className="text-muted group-hover:text-primary transition-colors" />
             </div>
             <div className="space-y-2">
               <h3 className="text-xl font-serif font-black uppercase tracking-tighter">Selection Required</h3>
               <p className="text-[10px] tracking-widest text-muted uppercase font-bold">DRAG AND DROP OR CLICK TO SELECT PDF</p>
             </div>
             <p className="text-[11px] font-sans text-secondary leading-relaxed max-w-xs mx-auto italic">
               Max file size: 10MB. Content will be synthesized for the premium reader layout.
             </p>
          </div>
        ) : (
          <div className="p-12 border border-border bg-surface flex items-center gap-8 group animate-in slide-in-from-bottom duration-500">
             <div className="w-16 h-20 bg-primary/10 flex items-center justify-center border border-primary/20">
               <FileText size={32} className="text-primary" />
             </div>
             <div className="flex-1 min-w-0">
               <h3 className="text-lg font-serif font-black uppercase tracking-tight truncate">{file.name}</h3>
               <p className="text-[10px] tracking-widest text-muted uppercase font-bold">{(file.size / (1024 * 1024)).toFixed(2)} MB • READY FOR INGESTION</p>
             </div>
             <button onClick={() => setFile(null)} className="p-2 text-muted hover:text-error transition-colors">
               <X size={20} />
             </button>
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="application/pdf" 
        />

        <div className="flex items-center justify-between pt-8 border-t border-border/50">
           <div className="flex items-center gap-2 opacity-50">
             <ShieldCheck size={14} className="text-secondary" />
             <span className="text-[9px] tracking-[0.2em] font-bold uppercase text-secondary">Secured Ingestion</span>
           </div>
           
           <div className="flex gap-4">
             <button 
               onClick={onClose}
               className="px-8 py-3 text-[10px] tracking-widest uppercase font-bold text-muted hover:text-primary transition-all"
             >
               CANCEL
             </button>
             <Button
               onClick={handleUpload}
               disabled={!file || isUploading}
               className="flex items-center gap-4 px-12"
             >
               {isUploading ? <Loader size={16} className="animate-spin" /> : <ArrowRight size={16} />}
               <span className="text-xs tracking-[0.2em] font-black">{isUploading ? 'INGESTING...' : 'CONFIRM INGESTION'}</span>
             </Button>
           </div>
        </div>
      </div>
    </Model>
  )
}

export default PdfUploadModal

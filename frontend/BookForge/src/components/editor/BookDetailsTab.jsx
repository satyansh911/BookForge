import InputField from "../ui/InputField"
import Button from "../ui/Button"
import { UploadCloud, Image as ImageIcon } from "lucide-react"

const BookDetailsTab = ({
  book,
  onBookChange,
  onCoverUpload,
  isUploading,
  fileInputRef,
}) => {
  const BASE_URL = import.meta.env.VITE_BASE_URL || '';
  const coverImageUrl = book.coverImage && book.coverImage.startsWith('http')
    ? book.coverImage
    : (book.coverImage ? `${BASE_URL}${book.coverImage}`.replace(/\\/g, '/') : '');

  return (
    <div className="flex-1 p-8 md:p-16 max-w-6xl mx-auto w-full space-y-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="space-y-4 border-b border-border/50 pb-12">
        <p className="text-[10px] tracking-[0.5em] text-muted uppercase font-bold">Metadata / Configuration</p>
        <h1 className="text-6xl font-serif font-black tracking-tighter uppercase leading-none">MONOGRAPH DETAILS</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-20">
        {/* Basic Info */}
        <div className="space-y-12">
          <section className="space-y-12">
            <div className="space-y-10">
              <InputField label="Primary Title" name="title" value={book.title} onChange={onBookChange} placeholder="BOOK TITLE" />
              <InputField label="Author Identifier" name="author" value={book.author} onChange={onBookChange} placeholder="LEGAL NAME" />
              <InputField label="Descriptive Subtitle" name="subtitle" value={book.subtitle || ""} onChange={onBookChange} placeholder="SUBTITLE OR EDITION" />
            </div>
          </section>

          <section className="space-y-6 pt-12 border-t border-border/50">
             <p className="text-[10px] tracking-[0.2em] text-muted uppercase font-bold">Manuscript Stats</p>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-surface border border-border">
                  <p className="text-[10px] tracking-widest text-muted uppercase mb-1">Chapters</p>
                  <p className="text-2xl font-serif font-black">{book.chapters.length}</p>
                </div>
                <div className="p-6 bg-surface border border-border">
                  <p className="text-[10px] tracking-widest text-muted uppercase mb-1">Status</p>
                  <p className="text-lg font-serif font-bold uppercase tracking-widest">DRAFT</p>
                </div>
             </div>
          </section>
        </div>

        {/* Cover Upload */}
        <div className="space-y-8">
           <p className="text-[10px] tracking-[0.4em] text-muted uppercase font-bold">Visual Identity</p>
           <div className="group relative aspect-[3/4] bg-surface border border-border flex items-center justify-center overflow-hidden transition-all hover:border-primary">
              {coverImageUrl ? (
                <img src={coverImageUrl} alt={book.title} className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0 duration-700" />
              ) : (
                <div className="text-center space-y-4">
                  <ImageIcon size={48} className="mx-auto text-border" />
                  <p className="text-[10px] tracking-widest text-muted uppercase font-bold">Artifact Pending</p>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                 <Button 
                   variant="outline" 
                   onClick={() => fileInputRef.current.click()} 
                   isLoading={isUploading}
                   className="bg-white text-primary border-white hover:bg-white hover:text-accent font-bold tracking-[0.2em]"
                 >
                   UPLOAD ARTIFACT
                 </Button>
              </div>
           </div>
           
           <input type="file" ref={fileInputRef} onChange={onCoverUpload} className="hidden" accept="image/*" />
           
           <div className="space-y-2">
             <p className="text-[10px] tracking-widest text-muted uppercase font-bold flex items-center gap-2">
               <UploadCloud size={12} />
               Technical Requirements
             </p>
             <p className="text-[11px] font-sans text-secondary leading-relaxed tracking-wider">
               PREFERRED DIMENSIONS: 1500 X 2000 PX. <br/>
               ACCEPTED FORMATS: JPEG, PNG, WEBP. <br/>
               MAX FILE SIZE: 5MB.
             </p>
           </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetailsTab
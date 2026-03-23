import React, { useRef } from 'react';
import VerticalLabel from './VerticalLabel';
import gsap from 'gsap';

const BookCard = ({ book, variant = 'grid', onClick }) => {
  const BASE_URL = import.meta.env.VITE_BASE_URL || '';
  const imageUrl = book.image && (book.image.startsWith('http') || book.image.startsWith('data:') || book.image.startsWith('/'))
    ? book.image
    : (book.image ? `${BASE_URL}${book.image}`.replace(/\\/g, '/') : '');

  const cardRef = useRef(null);
  const imgRef = useRef(null);

  const onMouseEnter = () => {
    gsap.to(imgRef.current, { scale: 1.1, duration: 0.8, ease: "power2.out" });
    gsap.to(cardRef.current, { y: -8, duration: 0.4, ease: "power2.out" });
  };

  const onMouseLeave = () => {
    gsap.to(imgRef.current, { scale: 1, duration: 0.8, ease: "power2.out" });
    gsap.to(cardRef.current, { y: 0, duration: 0.4, ease: "power2.out" });
  };

  if (variant === 'list') {
    return (
      <div 
        ref={cardRef}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="group flex items-center justify-between py-6 border-b border-border hover:bg-surface transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-8">
          <span className="text-xs font-serif text-muted tabular-nums">
            {book.index || '01'}
          </span>
          {imageUrl && (
            <div className="w-10 h-14 bg-surface-dark border border-border/30 overflow-hidden hidden sm:block">
              <img 
                ref={imgRef}
                src={imageUrl} 
                alt="" 
                className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" 
              />
            </div>
          )}
          <div>
            <h3 className="text-xl font-serif group-hover:text-accent transition-colors">{book.title}</h3>
            <p className="text-sm text-secondary font-sans uppercase tracking-widest">{book.author}</p>
          </div>
        </div>
        <div className="flex items-center gap-12">
          <span className="text-[10px] tracking-[0.2em] text-muted uppercase">
            {book.year || '2024'}
          </span>
          <VerticalLabel>{book.category || 'DESIGN'}</VerticalLabel>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={cardRef}
      onClick={onClick} 
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[3/4] bg-surface overflow-hidden border border-border shadow-sm group-hover:shadow-xl transition-shadow duration-500">
        {imageUrl ? (
          <img 
            ref={imgRef}
            src={imageUrl} 
            alt={book.title} 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted italic font-serif">
            Cover
          </div>
        )}
        <div className="absolute top-4 right-0">
          <VerticalLabel className="bg-white/90 backdrop-blur-sm pr-1">{book.category || 'INSPIRE'}</VerticalLabel>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-serif group-hover:text-accent transition-colors leading-tight">{book.title}</h3>
          <p className="text-xs text-secondary font-sans uppercase tracking-widest mt-1">{book.author}</p>
        </div>
        <span className="text-[10px] tracking-[0.2em] text-muted">{book.year}</span>
      </div>
    </div>
  );
};

export default BookCard;

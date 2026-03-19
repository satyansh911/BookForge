import React from 'react';
import VerticalLabel from './VerticalLabel';

const BookCard = ({ book, variant = 'grid', onClick }) => {
  const BASE_URL = import.meta.env.VITE_BASE_URL || '';
  const imageUrl = book.image && (book.image.startsWith('http') || book.image.startsWith('data:'))
    ? book.image
    : (book.image ? `${BASE_URL}${book.image}`.replace(/\\/g, '/') : '');

  if (variant === 'list') {
    return (
      <div 
        onClick={onClick}
        className="group flex items-center justify-between py-6 border-b border-border hover:bg-surface transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-8">
          <span className="text-xs font-serif text-muted tabular-nums">
            {book.index || '01'}
          </span>
          {imageUrl && (
            <div className="w-10 h-14 bg-surface-dark border border-border/30 overflow-hidden hidden sm:block">
              <img src={imageUrl} alt="" className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
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
    <div onClick={onClick} className="group cursor-pointer">
      <div className="relative aspect-[3/4] bg-surface overflow-hidden border border-border">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={book.title} 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
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

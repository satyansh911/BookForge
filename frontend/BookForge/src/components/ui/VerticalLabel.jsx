import React from 'react';

const VerticalLabel = ({ children, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="w-[1px] h-12 bg-border"></span>
      <span className="text-[10px] tracking-[0.4em] font-sans text-muted rotate-180 [writing-mode:vertical-lr] uppercase">
        {children}
      </span>
    </div>
  );
};

export default VerticalLabel;

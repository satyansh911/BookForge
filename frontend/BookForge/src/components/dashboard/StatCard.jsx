import React from 'react';
import Reveal from '../ui/Reveal';

const StatCard = ({ label, value, description, delay = 0 }) => {
  return (
    <Reveal direction="up" delay={delay}>
      <div className="p-8 bg-surface border border-border/30 hover:border-border transition-colors group">
        <p className="text-[10px] tracking-[0.4em] text-muted uppercase mb-8 font-bold group-hover:text-accent transition-colors">
          {label}
        </p>
        <div className="flex items-baseline gap-4">
          <h3 className="text-5xl font-serif font-black tracking-tighter leading-none">
            {value}
          </h3>
          <span className="text-[10px] tracking-widest text-secondary uppercase font-sans">
            Sync'd
          </span>
        </div>
        {description && (
          <p className="mt-6 text-xs text-secondary leading-relaxed font-serif italic border-t border-border/10 pt-4">
            {description}
          </p>
        )}
      </div>
    </Reveal>
  );
};

export default StatCard;

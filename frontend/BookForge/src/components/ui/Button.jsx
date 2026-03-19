import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const Button = ({ children, variant = 'primary', className = '', isLoading = false, ...props }) => {
  const buttonRef = useRef(null);
  const { contextSafe } = useGSAP({ scope: buttonRef });

  const onMouseMove = contextSafe((e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);

    gsap.to(buttonRef.current, {
      x: x * 0.2,
      y: y * 0.2,
      duration: 0.6,
      ease: "power2.out",
    });
  });

  const onMouseLeave = contextSafe(() => {
    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.3)",
    });
  });

  const baseStyles = "relative px-8 py-3 text-[11px] font-sans tracking-[0.2em] font-bold transition-colors active:scale-95 disabled:opacity-50 disabled:pointer-events-none uppercase overflow-hidden";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-accent border border-primary hover:border-accent",
    secondary: "bg-secondary text-white hover:bg-primary border border-secondary hover:border-primary",
    outline: "border border-border text-primary hover:bg-primary hover:text-white",
    ghost: "text-primary hover:bg-surface border border-transparent",
  };

  return (
    <button 
      ref={buttonRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default Button;
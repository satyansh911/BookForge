import React, { useEffect, useRef, useState } from 'react'

const Dropdown = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className='relative inline-block text-left' ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">{trigger}</div>
      {isOpen && (
        <div
          className='absolute right-0 z-[70] mt-2 w-64 origin-top-right bg-white shadow-2xl border border-border focus:outline-none animate-in slide-in-from-top-2 duration-200'
          role="menu"
          aria-orientation='vertical'
          aria-labelledby='menu-button'
          tabIndex="-1"
        >
          <div className='py-2' role="none">
            {children}
          </div>
        </div>
      )}
    </div>
  )
};

export const DropdownItem = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className='flex items-center w-full px-6 py-3 text-[11px] tracking-[0.2em] uppercase text-secondary hover:bg-black/5 hover:text-primary transition-all text-left font-sans font-bold'
      role="menuitem"
      tabIndex="-1"
    >
      {children}
    </button>
  )
};

export default Dropdown
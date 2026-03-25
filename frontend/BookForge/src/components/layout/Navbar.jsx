import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X as CloseIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = React.useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const navLinks = user 
    ? [
        { name: 'HOME', path: '/' },
        { name: 'MANGA', path: '/manga' },
        { name: 'EXPLORE', path: '/explore' },
        { name: 'PRICING', path: '/pricing' },
        { name: 'PROFILE', path: '/profile' },
      ]
    : [
        { name: 'HOME', path: '/' },
      ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-4 md:px-8 py-4 md:py-6 flex justify-between items-center bg-background/80 backdrop-blur-md border-b border-border">
      <Link to="/" className="text-xl md:text-2xl font-serif font-black tracking-tighter shrink-0">
        BOOKFORGE
      </Link>
      
      {/* Desktop Links */}
      <div className="hidden md:flex gap-8 lg:gap-12">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`text-[10px] lg:text-xs font-sans tracking-[0.2em] transition-colors hover:text-accent ${
              location.pathname === link.path ? 'text-primary font-bold' : 'text-secondary'
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className="flex gap-2 md:gap-6 items-center">
        <button 
          onClick={toggleTheme}
          className="p-2 text-muted hover:text-accent transition-colors"
          title={isDarkMode ? "Light Mode" : "Dark Mode"}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Desktop User Section */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover ring-1 ring-border" />
                ) : (
                  <div className="w-6 h-6 bg-surface border border-border flex items-center justify-center text-[8px] font-bold text-muted">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-[10px] tracking-widest text-muted uppercase">{user.name}</span>
              </div>
              <button 
                onClick={logout}
                className="text-xs font-sans tracking-[0.2em] hover:text-error transition-colors"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-xs font-sans tracking-[0.2em] hover:text-accent">
                LOGIN
              </Link>
              <Link 
                to="/signup" 
                className="px-6 py-2 bg-primary text-background text-xs font-sans tracking-[0.2em] hover:bg-accent transition-colors"
              >
                SIGN UP
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={toggleMenu}
          className="md:hidden p-2 text-primary hover:text-accent transition-colors"
        >
          {isMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div 
          ref={menuRef}
          className="absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl z-[100] md:hidden border-b border-border shadow-2xl animate-in slide-in-from-top duration-500 ease-out max-h-[85vh] overflow-y-auto"
        >
          <div className="flex flex-col p-8 space-y-10">
            <div className="space-y-6">
              <p className="text-[9px] tracking-[0.4em] text-muted uppercase font-bold">Menu</p>
              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={toggleMenu}
                    className={`text-3xl font-serif font-black tracking-tighter transition-all hover:translate-x-2 flex items-center gap-4 ${
                      location.pathname === link.path ? 'text-primary italic' : 'text-secondary opacity-60'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="space-y-6 pt-6 border-t border-border/50">
              {user ? (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4 p-4 bg-surface/50 border border-border/50">
                     <div className="w-10 h-10 bg-primary flex items-center justify-center text-white text-base font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                     </div>
                     <div className="flex flex-col">
                        <span className="text-xs tracking-widest text-muted uppercase font-bold">{user.name}</span>
                        <span className="text-[9px] text-muted/60 lowercase italic line-clamp-1">{user.email || 'Member'}</span>
                     </div>
                  </div>
                  <button 
                    onClick={() => {
                        logout();
                        toggleMenu();
                    }}
                    className="w-full py-4 bg-primary text-background text-[9px] font-sans tracking-[0.3em] font-bold hover:bg-accent transition-colors"
                  >
                    LOGOUT
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                   <Link 
                     to="/login" 
                     onClick={toggleMenu}
                     className="py-4 border border-border text-center text-[9px] font-sans tracking-[0.3em] font-bold"
                   >
                     LOGIN
                   </Link>
                   <Link 
                     to="/signup" 
                     onClick={toggleMenu}
                     className="py-4 bg-primary text-background text-center text-[9px] font-sans tracking-[0.3em] font-bold"
                   >
                     SIGN UP
                   </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
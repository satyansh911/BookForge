import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X as CloseIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = user 
    ? [
        { name: 'HOME', path: '/' },
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
                className="px-6 py-2 bg-primary text-white text-xs font-sans tracking-[0.2em] hover:bg-accent transition-colors"
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

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[73px] bg-background z-40 md:hidden animate-in slide-in-from-top duration-300">
          <div className="flex flex-col p-8 space-y-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={toggleMenu}
                className={`text-lg font-serif tracking-[0.1em] transition-colors hover:text-accent border-b border-border pb-4 ${
                  location.pathname === link.path ? 'text-primary font-black italic' : 'text-secondary'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="pt-8 space-y-6">
              {user ? (
                <>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-surface border border-border flex items-center justify-center text-sm font-bold text-muted">
                        {user.name?.charAt(0).toUpperCase()}
                     </div>
                     <span className="text-sm tracking-widest text-muted uppercase font-bold">{user.name}</span>
                  </div>
                  <button 
                    onClick={() => {
                        logout();
                        toggleMenu();
                    }}
                    className="w-full py-4 border border-border text-xs font-sans tracking-[0.2em] hover:bg-surface transition-colors"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                   <Link 
                     to="/login" 
                     onClick={toggleMenu}
                     className="py-4 border border-border text-center text-xs font-sans tracking-[0.2em]"
                   >
                     LOGIN
                   </Link>
                   <Link 
                     to="/signup" 
                     onClick={toggleMenu}
                     className="py-4 bg-primary text-white text-center text-xs font-sans tracking-[0.2em]"
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
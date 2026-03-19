import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

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

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-border">
      <Link to="/" className="text-2xl font-serif font-black tracking-tighter">
        BOOKFORGE
      </Link>
      
      <div className="flex gap-12">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`text-xs font-sans tracking-[0.2em] transition-colors hover:text-accent ${
              location.pathname === link.path ? 'text-primary font-bold' : 'text-secondary'
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className="flex gap-6 items-center">
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
    </nav>
  );
};

export default Navbar;
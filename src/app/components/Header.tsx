'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import Analytics from '../../utils/analytics';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

interface MobileNavLinkProps {
  href: string;
  children: ReactNode;
  onClick: () => void;
  className?: string;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Track menu toggle
    Analytics.buttonClick(isMenuOpen ? 'close_menu' : 'open_menu', 'header');
  };

  // Track scroll position to adjust header size
  const handleScroll = () => {
    const offset = window.scrollY;
    if (offset > 80) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  // Add event listeners
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Track logo click
  const handleLogoClick = () => {
    Analytics.buttonClick('logo', 'header');
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out bg-[#09090b]/80 backdrop-blur-sm shadow-md ${
        scrolled 
          ? 'h-16' 
          : 'h-24'
      }`}
    >
      <div className="w-full h-full flex items-center justify-between">
        {/* Logo - positioned at the far left with no padding */}
        <div className="flex items-center -ml-2">
          <Link 
            href="/" 
            className={`flex items-center p-0 transition-all duration-300 ${scrolled ? 'h-16' : 'h-24'}`}
            onClick={handleLogoClick}
          >
            <Image 
              src="/images/midwave-logo.png" 
              alt="Midwave Studio Logo" 
              width={4800} 
              height={1200} 
              priority
              className={`h-auto object-contain transition-all duration-300 ${
                scrolled 
                  ? 'w-[180px] md:w-[200px]' 
                  : 'w-[200px] md:w-[280px]'
              }`} 
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 pr-6">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/services">Services</NavLink>
          <NavLink href="/about">About</NavLink>
          {/* Projects link temporarily hidden */}
          <NavLink href="/contact">Contact</NavLink>
        </nav>

        {/* Mobile Menu Button - positioned on the right */}
        <motion.button 
          className="md:hidden text-white focus:outline-none w-10 h-10 flex items-center justify-center rounded-full bg-[#0f0f13] border border-[#b85a00]/20 mr-4"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMenuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </motion.button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="md:hidden bg-[#09090b]/95 backdrop-blur-md border-b border-[#b85a00]/20"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-4">
              <MobileNavLink href="/" onClick={toggleMenu}>Home</MobileNavLink>
              <MobileNavLink href="/services" onClick={toggleMenu}>Services</MobileNavLink>
              <MobileNavLink href="/about" onClick={toggleMenu}>About</MobileNavLink>
              {/* Projects link temporarily hidden */}
              <MobileNavLink href="/contact" onClick={toggleMenu}>Contact</MobileNavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// Desktop Navigation Link
const NavLink = ({ href, children, className = '' }: NavLinkProps) => {
  const handleClick = () => {
    // Track navigation click
    Analytics.buttonClick(`nav_${href.replace('/', '') || 'home'}`, 'desktop');
  };
  
  return (
    <Link 
      href={href} 
      className={`relative text-white hover:text-[#b85a00] text-sm font-semibold transition-all duration-300 py-2 group ${className}`}
      onClick={handleClick}
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#b85a00] transition-all duration-300 group-hover:w-full"></span>
    </Link>
  );
};

// Mobile Navigation Link
const MobileNavLink = ({ href, children, onClick, className = '' }: MobileNavLinkProps) => {
  const handleClick = () => {
    // Track mobile navigation click
    Analytics.buttonClick(`nav_${href.replace('/', '') || 'home'}`, 'mobile');
    onClick();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link 
        href={href}
        className={`block py-2 px-4 text-white hover:text-[#b85a00] font-semibold transition-colors ${className}`}
        onClick={handleClick}
      >
        {children}
      </Link>
    </motion.div>
  );
};

export default Header;
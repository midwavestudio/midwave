'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

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

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out backdrop-blur-sm ${
        scrolled 
          ? 'h-16 bg-[#09090b]/90 shadow-lg' 
          : 'h-24 bg-[#09090b]'
      }`}
    >
      <div className="container mx-auto h-full px-4">
        <div className="flex items-center justify-between h-full">
          <Link href="/" className={`flex items-center p-0 m-0 flex-1 mr-4 transition-all duration-300 ${scrolled ? 'h-16' : 'h-24'}`}>
            <Image 
              src="/images/midwave-logo.png" 
              alt="Midwave Studio Logo" 
              width={4800} 
              height={1200} 
              priority
              className={`h-auto object-contain transition-all duration-300 ${scrolled ? 'w-[220px]' : 'w-[300px]'}`} 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 pr-6">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/services">Services</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/projects">Projects</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </nav>

          {/* Mobile Menu Button */}
          <motion.button 
            className="md:hidden text-white focus:outline-none w-10 h-10 flex items-center justify-center rounded-full bg-[#0f0f13] border border-[#b85a00]/20"
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
            <div className="container mx-auto px-4 py-4">
              <MobileNavLink href="/" onClick={toggleMenu}>Home</MobileNavLink>
              <MobileNavLink href="/services" onClick={toggleMenu}>Services</MobileNavLink>
              <MobileNavLink href="/about" onClick={toggleMenu}>About</MobileNavLink>
              <MobileNavLink href="/projects" onClick={toggleMenu}>Projects</MobileNavLink>
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
  return (
    <Link 
      href={href} 
      className={`relative text-white hover:text-[#b85a00] text-sm font-medium transition-all duration-300 py-2 group ${className}`}
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#b85a00] transition-all duration-300 group-hover:w-full"></span>
    </Link>
  );
};

// Mobile Navigation Link
const MobileNavLink = ({ href, children, onClick, className = '' }: MobileNavLinkProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link 
        href={href} 
        className={`text-white hover:text-[#b85a00] text-base font-medium transition-all block py-4 border-b border-[#b85a00]/10 flex items-center ${className}`}
        onClick={onClick}
      >
        <span>{children}</span>
        <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </motion.div>
  );
};

export default Header; 
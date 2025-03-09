'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
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
  const [showAdminLink, setShowAdminLink] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Show admin link when Alt+A is pressed
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.altKey && e.key === 'a') {
      setShowAdminLink(true);
    }
  };

  // Add event listener for keyboard shortcut
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#09090b] border-b border-[#b85a00]/20 h-16">
      <div className="container h-full mx-auto flex items-center justify-between">
        <Link href="/" className="h-10">
          <Image 
            src="/images/midwave-logo.png" 
            alt="Midwave Studio Logo" 
            width={240} 
            height={60} 
            priority
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 pr-4">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/services">Services</NavLink>
          <NavLink href="/about">About</NavLink>
          <NavLink href="/projects">Projects</NavLink>
          <NavLink href="/contact">Contact</NavLink>
          {showAdminLink && (
            <NavLink href="/admin" className="text-[#b85a00]">
              Admin
            </NavLink>
          )}
          <NavLink 
            href="/client-login" 
            className="bg-[#b85a00] text-white px-4 py-1.5 rounded text-sm hover:bg-[#a04d00] transition-all duration-300"
          >
            Client Login
          </NavLink>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
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
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#09090b] border-b border-[#b85a00]/20">
          <div className="container mx-auto px-4 py-2">
            <MobileNavLink href="/" onClick={toggleMenu}>Home</MobileNavLink>
            <MobileNavLink href="/services" onClick={toggleMenu}>Services</MobileNavLink>
            <MobileNavLink href="/about" onClick={toggleMenu}>About</MobileNavLink>
            <MobileNavLink href="/projects" onClick={toggleMenu}>Projects</MobileNavLink>
            <MobileNavLink href="/contact" onClick={toggleMenu}>Contact</MobileNavLink>
            {showAdminLink && (
              <MobileNavLink href="/admin" onClick={toggleMenu} className="text-[#b85a00]">
                Admin
              </MobileNavLink>
            )}
            <MobileNavLink 
              href="/client-login" 
              onClick={toggleMenu}
              className="bg-[#b85a00] text-white px-4 py-1.5 rounded text-sm mt-2 inline-block hover:bg-[#a04d00]"
            >
              Client Login
            </MobileNavLink>
          </div>
        </div>
      )}
    </header>
  );
};

// Desktop Navigation Link
const NavLink = ({ href, children, className = '' }: NavLinkProps) => {
  return (
    <Link 
      href={href} 
      className={`text-gray-300 hover:text-[#b85a00] text-sm font-medium transition-all duration-300 ${className}`}
    >
      {children}
    </Link>
  );
};

// Mobile Navigation Link
const MobileNavLink = ({ href, children, onClick, className = '' }: MobileNavLinkProps) => {
  return (
    <Link 
      href={href} 
      className={`text-gray-300 hover:text-[#b85a00] text-sm font-medium transition-colors block py-2 ${className}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default Header; 
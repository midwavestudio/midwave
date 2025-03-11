'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#09090b] pt-36">
      {/* Fixed background elements */}
      <div className="absolute inset-0 z-0">
        {/* Main amber glow */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#b85a00]/20 blur-[100px] opacity-60" />
        
        {/* Animated floating orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#b85a00]/10 blur-[80px]"
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] rounded-full bg-[#b85a00]/8 blur-[100px]"
          animate={{ 
            x: [0, -70, 0],
            y: [0, 50, 0],
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full bg-[#b85a00]/5 blur-[80px]"
          animate={{ 
            x: [0, -40, 0],
            y: [0, -60, 0],
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
      </div>
      
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center opacity-10 z-10"></div>
      
      {/* Noise texture overlay */}
      <div className="absolute inset-0 bg-[url('/images/noise.svg')] opacity-5 z-10"></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 z-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-6"
          >
            <div className="inline-block px-4 py-1 rounded-full bg-[#b85a00]/10 border border-[#b85a00]/20 text-[#b85a00] text-sm font-medium mb-6">
              Design & Development Agency
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Redefining Digital <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#b85a00] to-amber-500">Craftsmanship</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Midwave Studio delivers high-fidelity digital design and custom software solutions for discerning clients who demand excellence.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/projects" className="group inline-flex items-center justify-center bg-[#b85a00] text-white px-7 py-4 rounded-lg shadow-lg hover:bg-[#a04d00] transition-all duration-300">
                <span>View Our Work</span>
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/contact" className="inline-flex items-center justify-center bg-transparent text-white border border-white/20 backdrop-blur-sm px-7 py-4 rounded-lg hover:bg-white/5 hover:border-white/30 transition-all duration-300">
                Get in Touch
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        animate={{ 
          y: [0, 10, 0],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      >
        <svg 
          className="w-6 h-6 text-[#b85a00]" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 14l-7 7m0 0l-7-7m7 7V3" 
          />
        </svg>
      </motion.div>
    </section>
  );
};

export default Hero; 
'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import BackgroundDesign from '../components/BackgroundDesign';

export default function About() {
  return (
    <div className="min-h-screen relative">
      <BackgroundDesign />
      <Header />
      
      <main className="pt-24 pb-16 relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="h-px w-12 bg-[#b85a00]/50 mr-4"></div>
              <span className="text-[#b85a00] uppercase tracking-wider text-sm font-medium">Our Story</span>
              <div className="h-px w-12 bg-[#b85a00]/50 ml-4"></div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">About Midwave Studio</h1>
            
            <div className="bg-[#0f0f13]/80 backdrop-blur-sm p-8 rounded-lg border border-[#b85a00]/20 mb-16 shadow-lg shadow-[#b85a00]/5">
              <p className="text-xl text-white font-bold mb-6">
                Midwave Studio redefines digital impact for discerning clients across the United States. 
                We specialize in high-fidelity digital design and custom software solutions, catering to industries 
                where visual storytelling and precision are paramount.
              </p>
              <p className="text-white font-bold">
                We are dedicated to delivering results-driven solutions that help our clients achieve their marketing goals and stand out in competitive markets.
              </p>
            </div>
          </div>
        </section>
        
        {/* Mission Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <div className="h-px w-12 bg-[#b85a00]/50 mr-4"></div>
                <span className="text-[#b85a00] uppercase tracking-wider text-sm font-medium">Our Purpose</span>
                <div className="h-px w-12 bg-[#b85a00]/50 ml-4"></div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">Our Mission</h2>
              
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="w-full md:w-1/2">
                  {/* Placeholder for an image - in production, use actual image */}
                  <div className="aspect-video bg-gradient-to-br from-[#b85a00]/20 to-[#b85a00]/30 rounded-lg shadow-lg overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-[#b85a00]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-1/2">
                  <p className="text-white font-bold mb-6">
                    At Midwave Studio, our mission is to elevate digital experiences for luxury brands and 
                    premium services through meticulous design and innovative technology solutions.
                  </p>
                  <p className="text-white font-bold mb-6">
                    We believe that exceptional digital impact is the result of deep understanding, 
                    strategic thinking, and relentless attention to detail. Every pixel, interaction, and 
                    line of code is crafted with purpose.
                  </p>
                  <p className="text-white font-bold">
                    Our work empowers our clients to stand out in crowded markets, connect meaningfully with 
                    their audience, and achieve measurable business results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Values Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center mb-6">
            <div className="h-px w-12 bg-[#b85a00]/50 mr-4"></div>
            <span className="text-[#b85a00] uppercase tracking-wider text-sm font-medium">What We Stand For</span>
            <div className="h-px w-12 bg-[#b85a00]/50 ml-4"></div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">Our Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#0f0f13] p-8 rounded-lg border border-[#b85a00]/20 hover:border-[#b85a00]/50 transition-colors shadow-lg shadow-[#b85a00]/5">
              <div className="bg-[#b85a00]/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#b85a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Excellence</h3>
              <p className="text-white font-bold">
                We pursue excellence in every aspect of our work, from the initial concept to the final 
                implementation. Mediocrity is not an option.
              </p>
            </div>
            
            <div className="bg-[#0f0f13] p-8 rounded-lg border border-[#b85a00]/20 hover:border-[#b85a00]/50 transition-colors shadow-lg shadow-[#b85a00]/5">
              <div className="bg-[#b85a00]/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#b85a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Innovation</h3>
              <p className="text-white font-bold">
                We embrace innovation and creative problem-solving, constantly exploring new technologies 
                and approaches to deliver exceptional results.
              </p>
            </div>
            
            <div className="bg-[#0f0f13] p-8 rounded-lg border border-[#b85a00]/20 hover:border-[#b85a00]/50 transition-colors shadow-lg shadow-[#b85a00]/5">
              <div className="bg-[#b85a00]/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#b85a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Partnership</h3>
              <p className="text-white font-bold">
                We build true partnerships with our clients, working collaboratively to understand their 
                vision and transform it into reality.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 
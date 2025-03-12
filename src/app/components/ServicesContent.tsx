'use client';

import { motion } from 'framer-motion';

const ServicesContent = () => {
  return (
    <>
      {/* New background design */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Dark gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0d] via-[#0f0f13] to-[#09090b]"></div>
        
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-20" 
             style={{ 
               backgroundImage: 'url("/images/noise.svg")', 
               backgroundRepeat: 'repeat'
             }}></div>
        
        {/* Ambient glow effects */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Top right glow */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-[#b85a00]/5 blur-[150px] transform -translate-y-1/4 translate-x-1/4"></div>
          
          {/* Bottom left glow */}
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] rounded-full bg-[#b85a00]/5 blur-[150px] transform translate-y-1/4 -translate-x-1/4"></div>
          
          {/* Center subtle glow */}
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full bg-[#b85a00]/3 blur-[120px] transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" 
             style={{ 
               backgroundImage: 'linear-gradient(to right, #b85a00 1px, transparent 1px), linear-gradient(to bottom, #b85a00 1px, transparent 1px)', 
               backgroundSize: '60px 60px' 
             }}></div>
      </div>
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="h-px w-12 bg-[#b85a00]/50 mr-4"></div>
              <span className="text-[#b85a00] uppercase tracking-wider text-sm font-medium">Our Services</span>
              <div className="h-px w-12 bg-[#b85a00]/50 ml-4"></div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Elevating Digital <span className="text-[#b85a00]">Experiences</span>
            </h1>
            <p className="text-xl text-white font-bold mb-10">
              We craft bespoke digital solutions that blend stunning aesthetics with 
              powerful functionality for discerning clients nationwide.
            </p>
          </div>
        </div>
      </section>
      
      {/* Services Cards Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Digital Design Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-[#0f0f13]/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg shadow-black/20 border border-[#b85a00]/20 hover:border-[#b85a00]/40 transition-all duration-300 group"
            >
              <div className="h-48 bg-gradient-to-br from-[#b85a00]/20 to-[#b85a00]/30 flex items-center justify-center">
                <svg className="w-20 h-20 text-[#b85a00] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Digital Design</h2>
                <p className="text-white font-bold mb-6">
                  Our design approach combines visual excellence with strategic thinking to create 
                  immersive digital experiences.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <div className="text-[#b85a00] mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white font-bold">User Interface Design</span>
                  </li>
                  <li className="flex items-center">
                    <div className="text-[#b85a00] mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white font-bold">User Experience Design</span>
                  </li>
                  <li className="flex items-center">
                    <div className="text-[#b85a00] mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white font-bold">Brand Identity</span>
                  </li>
                </ul>
              </div>
            </motion.div>
            
            {/* Software Development Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#0f0f13]/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg shadow-black/20 border border-[#b85a00]/20 hover:border-[#b85a00]/40 transition-all duration-300 group"
            >
              <div className="h-48 bg-gradient-to-br from-[#b85a00]/20 to-[#b85a00]/30 flex items-center justify-center">
                <svg className="w-20 h-20 text-[#b85a00] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Software Development</h2>
                <p className="text-white font-bold mb-6">
                  We engineer robust digital solutions that power seamless experiences, combining technical excellence with design thinking.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <div className="text-[#b85a00] mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white font-bold">Web Application Development</span>
                  </li>
                  <li className="flex items-center">
                    <div className="text-[#b85a00] mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white font-bold">Mobile App Development</span>
                  </li>
                  <li className="flex items-center">
                    <div className="text-[#b85a00] mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white font-bold">Custom Solutions</span>
                  </li>
                </ul>
              </div>
            </motion.div>
            
            {/* Digital Strategy Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-[#0f0f13]/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg shadow-black/20 border border-[#b85a00]/20 hover:border-[#b85a00]/40 transition-all duration-300 group"
            >
              <div className="h-48 bg-gradient-to-br from-[#b85a00]/20 to-[#b85a00]/30 flex items-center justify-center">
                <svg className="w-20 h-20 text-[#b85a00] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Digital Strategy</h2>
                <p className="text-white font-bold mb-6">
                  We transform business objectives into strategic digital roadmaps that drive growth, engagement, and measurable results.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <div className="text-[#b85a00] mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white font-bold">Digital Transformation</span>
                  </li>
                  <li className="flex items-center">
                    <div className="text-[#b85a00] mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white font-bold">User Research & Testing</span>
                  </li>
                  <li className="flex items-center">
                    <div className="text-[#b85a00] mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white font-bold">Analytics & Optimization</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Our Process Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-[#0f0f13]/70 backdrop-blur-sm z-0"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="h-px w-12 bg-[#b85a00]/50 mr-4"></div>
              <span className="text-[#b85a00] uppercase tracking-wider text-sm font-medium">How We Work</span>
              <div className="h-px w-12 bg-[#b85a00]/50 ml-4"></div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Process</h2>
              <p className="text-white font-bold max-w-3xl mx-auto">
                We follow a structured yet flexible approach to ensure your vision is realized with precision and excellence.
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative bg-[#09090b]/80 backdrop-blur-sm p-8 rounded-xl border border-[#b85a00]/20 shadow-lg hover:shadow-xl hover:border-[#b85a00]/40 transition-all duration-300 group"
            >
              <div className="absolute -top-5 -left-5 w-12 h-12 rounded-full bg-[#b85a00]/20 flex items-center justify-center border border-[#b85a00]/40 group-hover:bg-[#b85a00]/30 transition-colors duration-300">
                <span className="text-xl font-bold text-white">01</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 mt-2">Discovery</h3>
              <p className="text-white font-bold">
                Understanding your goals, audience, and vision through comprehensive research and consultation.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative bg-[#09090b]/80 backdrop-blur-sm p-8 rounded-xl border border-[#b85a00]/20 shadow-lg hover:shadow-xl hover:border-[#b85a00]/40 transition-all duration-300 group"
            >
              <div className="absolute -top-5 -left-5 w-12 h-12 rounded-full bg-[#b85a00]/20 flex items-center justify-center border border-[#b85a00]/40 group-hover:bg-[#b85a00]/30 transition-colors duration-300">
                <span className="text-xl font-bold text-white">02</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 mt-2">Strategy</h3>
              <p className="text-white font-bold">
                Developing a tailored approach that aligns with your objectives and resonates with your audience.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative bg-[#09090b]/80 backdrop-blur-sm p-8 rounded-xl border border-[#b85a00]/20 shadow-lg hover:shadow-xl hover:border-[#b85a00]/40 transition-all duration-300 group"
            >
              <div className="absolute -top-5 -left-5 w-12 h-12 rounded-full bg-[#b85a00]/20 flex items-center justify-center border border-[#b85a00]/40 group-hover:bg-[#b85a00]/30 transition-colors duration-300">
                <span className="text-xl font-bold text-white">03</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 mt-2">Creation</h3>
              <p className="text-white font-bold">
                Bringing your vision to life through iterative design and development, with regular client feedback.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="relative bg-[#09090b]/80 backdrop-blur-sm p-8 rounded-xl border border-[#b85a00]/20 shadow-lg hover:shadow-xl hover:border-[#b85a00]/40 transition-all duration-300 group"
            >
              <div className="absolute -top-5 -left-5 w-12 h-12 rounded-full bg-[#b85a00]/20 flex items-center justify-center border border-[#b85a00]/40 group-hover:bg-[#b85a00]/30 transition-colors duration-300">
                <span className="text-xl font-bold text-white">04</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 mt-2">Optimization</h3>
              <p className="text-white font-bold">
                Refining and enhancing your digital presence through ongoing analysis and improvements.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ServicesContent; 
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const ContactCTA = () => {
  return (
    <section className="py-20 bg-[#09090b] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        {/* Ambient glow effects */}
        <motion.div 
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#b85a00]/5 blur-[150px]"
          animate={{ 
            x: [0, -30, 0],
            y: [0, 30, 0],
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-[#b85a00]/5 blur-[150px]"
          animate={{ 
            x: [0, 40, 0],
            y: [0, -20, 0],
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-20" 
             style={{ 
               backgroundImage: 'url("/images/noise.svg")', 
               backgroundRepeat: 'repeat'
             }}></div>
      </div>
      
      <div className="container relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto bg-[#0f0f13]/80 backdrop-blur-sm rounded-2xl p-12 border border-[#b85a00]/20 shadow-lg"
          whileInView={{
            boxShadow: [
              '0 10px 50px rgba(0,0,0,0.3)',
              '0 10px 60px rgba(184,90,0,0.1)',
              '0 10px 50px rgba(0,0,0,0.3)'
            ],
            borderColor: [
              'rgba(184,90,0,0.2)',
              'rgba(184,90,0,0.4)',
              'rgba(184,90,0,0.2)'
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="h-px w-12 bg-[#b85a00]/50 mr-4"></div>
              <span className="text-[#b85a00] uppercase tracking-wider text-sm font-medium">Contact Us</span>
              <div className="h-px w-12 bg-[#b85a00]/50 ml-4"></div>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Elevate Your Digital Presence?</h2>
            <p className="text-white font-bold mb-8 max-w-2xl mx-auto">
              Let's discuss how Midwave Studio can transform your vision into a compelling digital experience 
              that resonates with your discerning audience.
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link href="/contact" className="inline-block px-8 py-4 bg-gradient-to-r from-[#b85a00] to-amber-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                Start a Conversation
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactCTA; 
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const ContactCTA = () => {
  return (
    <section className="py-20 bg-[#0E1116] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl"
          animate={{ 
            x: [0, -30, 0],
            y: [0, 30, 0],
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-amber-600/10 blur-3xl"
          animate={{ 
            x: [0, 40, 0],
            y: [0, -20, 0],
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
      </div>
      
      <div className="container relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto bg-[#171A21] rounded-2xl p-12 border border-gray-800 shadow-[0_10px_50px_rgba(0,0,0,0.3)]"
          whileInView={{
            boxShadow: [
              '0 10px 50px rgba(0,0,0,0.3)',
              '0 10px 60px rgba(245,158,11,0.1)',
              '0 10px 50px rgba(0,0,0,0.3)'
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
            <h2 className="heading-lg text-white mb-6">Ready to Elevate Your Digital Presence?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Let's discuss how Midwave Studio can transform your vision into a compelling digital experience 
              that resonates with your discerning audience.
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link href="/contact" className="btn btn-primary">
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
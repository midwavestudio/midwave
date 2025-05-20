'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import BackgroundDesign from '../components/BackgroundDesign';
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import Analytics from '../../utils/analytics';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Track page view when component mounts
  useEffect(() => {
    Analytics.pageView('Contact Page');
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    try {
      // Send the form data to our API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Track form error
        Analytics.formError('contact_form', data.error || 'Failed to send message');
        throw new Error(data.error || 'Failed to send message');
      }

      // Track successful form submission
      Analytics.formSubmitted('contact_form');
      
      // Handle successful submission
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'There was an error submitting your message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Track button click for phone call
  const trackPhoneClick = () => {
    Analytics.buttonClick('phone_call', 'contact_page');
  };

  // Track button click for email
  const trackEmailClick = () => {
    Analytics.buttonClick('email_click', 'contact_page');
  };

  return (
    <div className="min-h-screen">
      <BackgroundDesign />
      <Header />
      
      <main className="pt-28 md:pt-48 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-8 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4">Contact Us</h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
              Have a project in mind or want to learn more about our services? 
              We'd love to hear from you.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Contact Form */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[#09090b]/95 backdrop-blur-md rounded-xl p-5 md:p-8 border border-[#b85a00]/20 shadow-lg"
            >
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Send Us a Message</h2>
              
              {submitStatus === 'success' && (
                <div className="bg-green-900/20 text-green-300 p-4 rounded-lg mb-6 text-sm md:text-base">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-semibold">Message Sent Successfully!</span>
                  </div>
                  <p>Thank you for contacting Midwave Studio. We've received your message and will get back to you as soon as possible, usually within 24-48 hours.</p>
                  <p className="mt-2">If you need immediate assistance, please call us at (720) 443-2517.</p>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="bg-red-900/20 text-red-300 p-4 rounded-lg mb-6 text-sm md:text-base">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">Error Sending Message</span>
                  </div>
                  <p>{errorMessage}</p>
                  <p className="mt-2">You can also reach us directly by phone at (720) 443-2517.</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6" suppressHydrationWarning>
                <div>
                  <label htmlFor="name" className="block text-sm md:text-base font-medium text-gray-300 mb-1.5">
                    Your Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 md:py-2.5 bg-[#0f0f13] border border-[#b85a00]/20 rounded-lg text-white text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50 focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm md:text-base font-medium text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 md:py-2.5 bg-[#0f0f13] border border-[#b85a00]/20 rounded-lg text-white text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm md:text-base font-medium text-gray-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 md:py-2.5 bg-[#0f0f13] border border-[#b85a00]/20 rounded-lg text-white text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50 focus:border-transparent"
                    placeholder="(123) 456-7890"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm md:text-base font-medium text-gray-300 mb-1.5">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3 py-2 md:py-2.5 bg-[#0f0f13] border border-[#b85a00]/20 rounded-lg text-white text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50 focus:border-transparent"
                    required
                  >
                    <option value="" disabled>Select a subject</option>
                    <option value="Project Inquiry">Project Inquiry</option>
                    <option value="Partnership">Partnership</option>
                    <option value="General Question">General Question</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm md:text-base font-medium text-gray-300 mb-1.5">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-3 py-2 md:py-2.5 bg-[#0f0f13] border border-[#b85a00]/20 rounded-lg text-white text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50 focus:border-transparent"
                    placeholder="Tell us about your project or question..."
                    required
                  ></textarea>
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#b85a00] hover:bg-[#a04d00] text-white py-2.5 md:py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50 focus:ring-offset-2 focus:ring-offset-[#09090b] disabled:opacity-70 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
            
            {/* Contact Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6 md:space-y-8"
            >
              <div className="bg-[#09090b]/95 backdrop-blur-md rounded-xl p-5 md:p-8 border border-[#b85a00]/20 shadow-lg">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Contact Information</h2>
                
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#b85a00]/20 flex items-center justify-center mr-4">
                      <FiMail className="text-[#b85a00] text-lg" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm md:text-base">Email</h3>
                      <p className="text-gray-400 mt-1 text-sm md:text-base">
                        <a href="mailto:midwavestudio@gmail.com" className="hover:text-[#b85a00] transition-colors" onClick={trackEmailClick}>
                          midwavestudio@gmail.com
                        </a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#b85a00]/20 flex items-center justify-center mr-4">
                      <FiPhone className="text-[#b85a00] text-lg" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm md:text-base">Phone</h3>
                      <p className="text-gray-400 mt-1 text-sm md:text-base">
                        <a href="tel:7204432517" className="hover:text-[#b85a00] transition-colors" onClick={trackPhoneClick}>
                          (720) 443-2517
                        </a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#b85a00]/20 flex items-center justify-center mr-4">
                      <FiMapPin className="text-[#b85a00] text-lg" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm md:text-base">Location</h3>
                      <p className="text-gray-400 mt-1 text-sm md:text-base">
                        Kalispell, MT
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#09090b]/95 backdrop-blur-md rounded-xl p-5 md:p-8 border border-[#b85a00]/20 shadow-lg">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Business Hours</h2>
                
                <div className="space-y-2 md:space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm md:text-base">Monday - Friday:</span>
                    <span className="text-white text-sm md:text-base">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm md:text-base">Saturday:</span>
                    <span className="text-white text-sm md:text-base">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm md:text-base">Sunday:</span>
                    <span className="text-white text-sm md:text-base">Closed</span>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-800">
                  <p className="text-gray-400 text-sm md:text-base">
                    We typically respond to inquiries within 24-48 business hours.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

type FormData = {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  services: string[];
};

const services = [
  { id: 'design', label: 'Digital Design' },
  { id: 'development', label: 'Custom Development' },
  { id: 'branding', label: 'Brand Identity' },
  { id: 'strategy', label: 'Digital Strategy' }
];

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset
  } = useForm<FormData>();
  
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // In a real application, this would send data to Firestore
      // For now, we'll simulate a successful submission
      console.log('Form data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
      reset();
    } catch (err) {
      setError('There was an error submitting your message. Please try again.');
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-[#0f0f13]/80 backdrop-blur-sm rounded-lg p-5 sm:p-8 border border-[#b85a00]/20">
      {isSubmitted ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 sm:py-12"
        >
          <div className="bg-[#b85a00]/20 p-4 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#b85a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Message Sent!</h3>
          <p className="text-gray-300 mb-6 sm:mb-8">
            Thank you for reaching out. We'll get back to you within 24-48 hours.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="px-6 py-3 bg-transparent border border-[#b85a00]/50 text-white rounded-lg hover:bg-[#b85a00]/10 transition-colors font-medium"
          >
            Send Another Message
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-gray-300 mb-2 text-sm sm:text-base">Name *</label>
              <input
                id="name"
                type="text"
                className={`w-full bg-[#18181b] border ${errors.name ? 'border-red-500' : 'border-[#b85a00]/20'} rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00] text-base`}
                placeholder="Your name"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-gray-300 mb-2 text-sm sm:text-base">Email *</label>
              <input
                id="email"
                type="email"
                className={`w-full bg-[#18181b] border ${errors.email ? 'border-red-500' : 'border-[#b85a00]/20'} rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00] text-base`}
                placeholder="Your email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="company" className="block text-gray-300 mb-2 text-sm sm:text-base">Company</label>
              <input
                id="company"
                type="text"
                className="w-full bg-[#18181b] border border-[#b85a00]/20 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00] text-base"
                placeholder="Your company"
                {...register('company')}
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-gray-300 mb-2 text-sm sm:text-base">Phone</label>
              <input
                id="phone"
                type="tel"
                className="w-full bg-[#18181b] border border-[#b85a00]/20 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00] text-base"
                placeholder="Your phone number"
                {...register('phone')}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 mb-2 text-sm sm:text-base">Services of Interest</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map(service => (
                <div key={service.id} className="flex items-center py-2">
                  <input
                    id={`service-${service.id}`}
                    type="checkbox"
                    value={service.id}
                    className="w-5 h-5 bg-[#18181b] border-[#b85a00]/20 rounded text-[#b85a00] focus:ring-[#b85a00]"
                    {...register('services')}
                  />
                  <label htmlFor={`service-${service.id}`} className="ml-3 text-gray-300 text-sm sm:text-base">
                    {service.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="message" className="block text-gray-300 mb-2 text-sm sm:text-base">Message *</label>
            <textarea
              id="message"
              rows={5}
              className={`w-full bg-[#18181b] border ${errors.message ? 'border-red-500' : 'border-[#b85a00]/20'} rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00] text-base`}
              placeholder="Tell us about your project"
              {...register('message', { required: 'Message is required' })}
            ></textarea>
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
            )}
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-md text-red-400 text-sm sm:text-base">
              {error}
            </div>
          )}
          
          <div className="text-center">
            <motion.button
              type="submit"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-[#b85a00] text-white rounded-lg hover:bg-[#a04d00] transition-colors font-medium"
              disabled={isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Message'
              )}
            </motion.button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ContactForm; 
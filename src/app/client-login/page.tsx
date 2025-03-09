'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

type LoginFormData = {
  email: string;
  password: string;
};

export default function ClientLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginFormData>();
  
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real application, this would authenticate with Firebase
      // For now, we'll simulate a login attempt
      console.log('Login attempt:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, always show an error since we don't have actual auth yet
      setError('This is a demo. In a real application, this would authenticate with Firebase.');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      console.error('Error during login:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="heading-lg text-white mb-4">Client Login</h1>
              <p className="text-gray-400">
                Access your project dashboard and resources.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-6">
                  <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
                  <input
                    id="email"
                    type="email"
                    className={`w-full bg-gray-700 border ${errors.email ? 'border-red-500' : 'border-gray-600'} rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500`}
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
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="password" className="block text-gray-300">Password</label>
                    <Link href="/forgot-password" className="text-amber-500 text-sm hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    className={`w-full bg-gray-700 border ${errors.password ? 'border-red-500' : 'border-gray-600'} rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    placeholder="Your password"
                    {...register('password', { required: 'Password is required' })}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>
                
                {error && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-md text-red-400">
                    {error}
                  </div>
                )}
                
                <div className="mb-6">
                  <motion.button
                    type="submit"
                    className="w-full btn btn-primary"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Logging in...
                      </span>
                    ) : (
                      'Log In'
                    )}
                  </motion.button>
                </div>
                
                <div className="relative flex items-center justify-center mb-6">
                  <div className="border-t border-gray-700 w-full"></div>
                  <span className="bg-gray-800 px-3 text-gray-500 text-sm">Or continue with</span>
                  <div className="border-t border-gray-700 w-full"></div>
                </div>
                
                <div>
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-md transition-colors"
                    onClick={() => setError('Google login would be implemented with Firebase in a real application.')}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                  </button>
                </div>
              </form>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link href="/contact" className="text-amber-500 hover:underline">
                  Contact us
                </Link>{' '}
                to get started.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 
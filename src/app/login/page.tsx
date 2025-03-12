'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth';
import { motion } from 'framer-motion';
import BackgroundDesign from '../components/BackgroundDesign';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect to admin
    if (user) {
      router.push('/admin');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push('/admin');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <BackgroundDesign />
      
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-gray-900/50 backdrop-blur-sm p-6 md:p-8 rounded-xl border border-gray-800"
        >
          <div className="text-center mb-6 md:mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                <span className="text-[#b85a00]">Midwave</span> Studio
              </h1>
            </Link>
            <p className="text-gray-400 mt-2 text-sm md:text-base">Sign in to access the admin dashboard</p>
          </div>
          
          {error && (
            <div className="bg-red-900/20 text-red-300 p-3 md:p-4 rounded-lg mb-4 md:mb-6 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm md:text-base font-medium text-gray-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 md:py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm md:text-base font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 md:py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#b85a00] hover:bg-[#a04d00] text-white py-2.5 md:py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-70 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/" className="text-[#b85a00] hover:text-[#a04d00] text-sm md:text-base">
              ← Back to website
            </Link>
          </div>
        </motion.div>
      </div>
      
      <div className="py-4 text-center text-gray-500 text-xs md:text-sm">
        &copy; {new Date().getFullYear()} Midwave Studio. All rights reserved.
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BackgroundDesign from '../components/BackgroundDesign';

export default function AdminIndexPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAndRedirect = async () => {
      try {
        // Add a small delay to ensure the page renders before redirecting
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Try to initialize Firebase (optional, can be removed if not needed)
        try {
          const { ensureFirebaseInitialized } = await import('@/lib/firebase/firebase');
          await ensureFirebaseInitialized();
        } catch (firebaseError) {
          console.error('Firebase initialization error:', firebaseError);
          // Continue anyway, as we're just redirecting
        }
        
        // Direct redirect to projects admin page, no authentication required
        router.push('/admin/projects');
      } catch (error) {
        console.error('Error during admin page initialization:', error);
        setError('Failed to load the admin page. Please try refreshing.');
        setIsLoading(false);
      }
    };
    
    initializeAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <BackgroundDesign />
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b85a00]"></div>
          <p className="text-gray-300">Loading admin panel...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-900/20 text-red-300 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg"
          >
            Refresh Page
          </button>
        </div>
      ) : null}
    </div>
  );
} 
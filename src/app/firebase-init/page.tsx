'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { addSampleProjectsToFirestore } from '@/lib/firebase/firebaseUtils';

export default function FirebaseInit() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const [addingProjects, setAddingProjects] = useState(false);
  const [projectsAdded, setProjectsAdded] = useState(false);
  const [projectsMessage, setProjectsMessage] = useState('');
  const router = useRouter();

  const initializeFirebase = async () => {
    try {
      setStatus('loading');
      setMessage('Fetching Firebase initialization instructions...');
      
      const response = await fetch('/api/firebase/init');
      const data = await response.json();
      
      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        if (data.steps) {
          setSteps(data.steps);
        }
      } else {
        setStatus('error');
        setMessage(data.message);
        setError(data.error || 'Unknown error occurred');
        console.error('Firebase initialization error:', data.error);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to fetch Firebase initialization instructions');
      const errorMessage = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      setError(errorMessage);
      console.error('Firebase initialization error:', error);
    }
  };

  const handleAddSampleProjects = async () => {
    try {
      setAddingProjects(true);
      setProjectsMessage('Adding sample projects to Firestore...');
      
      const result = await addSampleProjectsToFirestore();
      
      setProjectsAdded(true);
      setProjectsMessage(result.message);
    } catch (error) {
      setProjectsAdded(false);
      const errorMessage = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      setProjectsMessage(`Error adding sample projects: ${errorMessage}`);
      console.error('Error adding sample projects:', error);
    } finally {
      setAddingProjects(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-[#0f0f13] rounded-lg p-8 shadow-lg">
            <h1 className="text-3xl font-bold text-white mb-6">Firebase Initialization</h1>
            
            <p className="text-gray-300 mb-8">
              This page will provide instructions on how to set up your Firebase Storage folders and Firestore collections.
              Click the button below to get started.
            </p>
            
            <div className="mb-8">
              <button
                onClick={initializeFirebase}
                disabled={status === 'loading'}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  status === 'loading'
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-[#b85a00] text-white hover:bg-[#a04d00]'
                }`}
              >
                {status === 'loading' ? 'Loading...' : 'Get Firebase Setup Instructions'}
              </button>
            </div>
            
            {status !== 'idle' && (
              <div className={`p-4 rounded-lg ${
                status === 'loading' ? 'bg-blue-900/20 text-blue-300' :
                status === 'success' ? 'bg-green-900/20 text-green-300' :
                'bg-red-900/20 text-red-300'
              }`}>
                <h3 className="font-bold mb-2">
                  {status === 'loading' ? 'Processing...' :
                   status === 'success' ? 'Success!' :
                   'Error'}
                </h3>
                <p className="mb-2">{message}</p>
                {error && <pre className="text-xs overflow-auto p-2 bg-black/30 rounded">{error}</pre>}
              </div>
            )}
            
            {steps.length > 0 && (
              <div className="mt-8 bg-[#0a0a0a] p-6 rounded-lg border border-[#b85a00]/20">
                <h3 className="text-xl font-bold text-white mb-4">Firebase Setup Instructions</h3>
                <ol className="list-decimal pl-5 space-y-3 text-gray-300">
                  {steps.map((step, index) => (
                    <li key={index} className="pl-2">{step}</li>
                  ))}
                </ol>
              </div>
            )}
            
            {status === 'success' && (
              <>
                <div className="mt-8 p-6 bg-[#0a0a0a] rounded-lg border border-[#b85a00]/20">
                  <h3 className="text-xl font-bold text-white mb-4">Add Sample Projects</h3>
                  <p className="text-gray-300 mb-4">
                    After setting up Firebase, you can add sample projects to your Firestore database to get started quickly.
                  </p>
                  
                  <button
                    onClick={handleAddSampleProjects}
                    disabled={addingProjects}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      addingProjects
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : 'bg-[#b85a00] text-white hover:bg-[#a04d00]'
                    }`}
                  >
                    {addingProjects ? 'Adding...' : 'Add Sample Projects'}
                  </button>
                  
                  {projectsMessage && (
                    <div className={`mt-4 p-3 rounded-lg ${
                      addingProjects ? 'bg-blue-900/20 text-blue-300' :
                      projectsAdded ? 'bg-green-900/20 text-green-300' :
                      'bg-yellow-900/20 text-yellow-300'
                    }`}>
                      <p>{projectsMessage}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-8">
                  <p className="text-gray-300 mb-4">
                    After completing the setup steps above, you can go to the projects page to see your projects.
                  </p>
                  <button
                    onClick={() => router.push('/projects')}
                    className="px-6 py-3 rounded-lg font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    Go to Projects
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 
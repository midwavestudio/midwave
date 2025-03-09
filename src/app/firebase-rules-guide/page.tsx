'use client';

import { useState } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Link from 'next/link';

export default function FirebaseRulesGuide() {
  const [copied, setCopied] = useState(false);

  const developmentRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Allow read/write access to all users during development
      allow read, write: if true;
    }
  }
}`;

  const productionRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to projects collection
    match /projects/{projectId} {
      allow read: if true;
      // Only allow write access to authenticated users (you can add more restrictions later)
      allow write: if request.auth != null;
    }
    
    // Default rule - deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`;

  const copyRules = (rules: string) => {
    navigator.clipboard.writeText(rules);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Firebase Security Rules Guide</h1>
            
            <div className="bg-[#0f0f13] rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Why am I seeing a permissions error?</h2>
              <p className="text-gray-300 mb-4">
                You're seeing a "Missing or insufficient permissions" error because your Firebase security rules are 
                currently restricting access to your Firestore database. Security rules protect your data from unauthorized 
                access, but during development, you might want to use less restrictive rules.
              </p>
            </div>
            
            <div className="bg-[#0f0f13] rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">How to update your Firebase security rules</h2>
              <ol className="list-decimal list-inside text-gray-300 space-y-4">
                <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-[#b85a00] hover:underline">Firebase Console</a></li>
                <li>Select your project "midwavestudio1"</li>
                <li>In the left sidebar, click on "Firestore Database"</li>
                <li>Click on the "Rules" tab</li>
                <li>Replace the current rules with the development rules below</li>
                <li>Click "Publish"</li>
              </ol>
            </div>
            
            <div className="bg-[#0f0f13] rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Development Rules (Less Secure)</h2>
              <p className="text-gray-300 mb-4">
                Use these rules during development to allow full access to your database. 
                <strong className="text-red-400"> Do not use these rules in production!</strong>
              </p>
              <div className="relative">
                <pre className="bg-[#1a1a1a] p-4 rounded-lg text-gray-300 overflow-x-auto">
                  <code>{developmentRules}</code>
                </pre>
                <button
                  onClick={() => copyRules(developmentRules)}
                  className="absolute top-2 right-2 px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            
            <div className="bg-[#0f0f13] rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Production Rules (More Secure)</h2>
              <p className="text-gray-300 mb-4">
                Use these rules (or similar) when deploying to production to protect your data.
              </p>
              <div className="relative">
                <pre className="bg-[#1a1a1a] p-4 rounded-lg text-gray-300 overflow-x-auto">
                  <code>{productionRules}</code>
                </pre>
                <button
                  onClick={() => copyRules(productionRules)}
                  className="absolute top-2 right-2 px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            
            <div className="flex justify-center mt-8">
              <Link 
                href="/admin/projects"
                className="px-6 py-3 bg-[#b85a00] text-white rounded-lg hover:bg-[#a04d00] transition-colors"
              >
                Return to Admin Projects
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 
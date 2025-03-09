'use client';

import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              className="bg-[#0f0f13] rounded-lg p-6 border border-[#b85a00]/20 hover:border-[#b85a00]/50 transition-colors cursor-pointer"
              onClick={() => router.push('/admin/projects')}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-[#b85a00]/10 rounded-lg mb-4">
                <svg className="w-6 h-6 text-[#b85a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Manage Projects</h2>
              <p className="text-gray-400">Add, edit, or delete projects in your portfolio.</p>
            </div>
            
            <div className="bg-[#0f0f13] rounded-lg p-6 border border-gray-800 opacity-50 cursor-not-allowed">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-800 rounded-lg mb-4">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Manage Blog</h2>
              <p className="text-gray-400">Coming soon: Add and manage blog posts.</p>
            </div>
            
            <div className="bg-[#0f0f13] rounded-lg p-6 border border-gray-800 opacity-50 cursor-not-allowed">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-800 rounded-lg mb-4">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Manage Team</h2>
              <p className="text-gray-400">Coming soon: Add and manage team members.</p>
            </div>
          </div>
          
          <div className="mt-12 p-6 bg-[#0f0f13] rounded-lg border border-[#b85a00]/20">
            <h2 className="text-xl font-bold text-white mb-4">Admin Instructions</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Welcome to the Midwave Studio admin dashboard. Here you can manage your portfolio projects
                and other content on your website.
              </p>
              <p>
                <strong>To manage projects:</strong> Click on the "Manage Projects" card above to add, edit, or delete projects.
                You can add project details and images using direct URLs from image hosting services like Unsplash.
              </p>
              <p>
                <strong>Note:</strong> This admin area is hidden from regular visitors. It can be accessed by pressing Alt+A on the keyboard
                while on any page of the site, which will reveal the Admin link in the navigation menu.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 
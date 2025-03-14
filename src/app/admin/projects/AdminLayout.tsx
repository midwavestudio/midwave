'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiFolder, FiSettings, FiLogOut } from 'react-icons/fi';
import BackgroundDesign from '@/app/components/BackgroundDesign';
import Footer from '@/app/components/Footer';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: FiHome },
    { name: 'Projects', href: '/admin/projects', icon: FiFolder },
    { name: 'Settings', href: '/admin/settings', icon: FiSettings },
  ];
  
  return (
    <div className="min-h-screen">
      <BackgroundDesign />
      
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-white hover:text-gray-300 transition-colors">
              <span className="text-sm">← Back to Site</span>
            </Link>
          </div>
          
          <nav className="flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/admin');
              
              return (
                <Link 
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-2 py-1 text-sm rounded-md transition-colors
                    ${isActive 
                      ? 'bg-[#b85a00]/20 text-[#b85a00] font-medium' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            <Link 
              href="/api/auth/signout"
              className="flex items-center gap-1.5 px-2 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors"
            >
              <FiLogOut size={16} />
              <span>Logout</span>
            </Link>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 relative z-10">
        <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-6">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
} 
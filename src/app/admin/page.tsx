'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BackgroundDesign from '../components/BackgroundDesign';

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Direct redirect to projects admin page, no authentication required
    router.push('/admin/projects');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <BackgroundDesign />
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b85a00]"></div>
    </div>
  );
} 
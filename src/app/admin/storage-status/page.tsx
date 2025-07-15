'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiCloud, FiDatabase, FiImage, FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';
import AdminDashboardLayout from '../AdminDashboardLayout';

interface StorageStatus {
  kv: {
    configured: boolean;
    message: string;
    details: {
      KV_REST_API_URL: string;
      KV_REST_API_TOKEN: string;
      KV_REST_API_READ_ONLY_TOKEN: string;
    };
  };
  blob: {
    configured: boolean;
    message: string;
  };
}

export default function StorageStatusPage() {
  const router = useRouter();
  const [status, setStatus] = useState<StorageStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkStorageStatus();
  }, []);

  const checkStorageStatus = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check Vercel KV status
      const kvResponse = await fetch('/api/projects/status');
      const kvData = await kvResponse.json();
      
      // Check Vercel Blob status
      const blobResponse = await fetch('/api/upload/test');
      const blobData = await blobResponse.json();
      
      setStatus({
        kv: {
          configured: kvData.configured,
          message: kvData.message,
          details: kvData.details
        },
        blob: {
          configured: blobData.tokenConfigured,
          message: blobData.message
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check storage status');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminDashboardLayout>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b85a00]"></div>
          <p className="text-gray-400">Checking storage status...</p>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (error) {
    return (
      <AdminDashboardLayout>
        <div className="p-6 bg-red-900/20 text-red-300 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={checkStorageStatus}
            className="mt-4 px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Storage Configuration Status</h1>
          <p className="text-gray-400">
            Check the status of your Vercel KV and Vercel Blob storage configurations.
          </p>
        </div>

        {status && (
          <div className="space-y-6">
            {/* Vercel KV Status */}
            <div className="bg-[#1a1a1a] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FiDatabase className="mr-2" />
                Vercel KV Database (Project Storage)
              </h2>
              
              <div className={`p-4 rounded-lg border ${
                status.kv.configured 
                  ? 'bg-green-900/20 border-green-500/20' 
                  : 'bg-red-900/20 border-red-500/20'
              }`}>
                <div className="flex items-center mb-3">
                  {status.kv.configured ? (
                    <FiCheck className="mr-2 text-green-500" />
                  ) : (
                    <FiX className="mr-2 text-red-500" />
                  )}
                  <span className={`font-medium ${
                    status.kv.configured ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {status.kv.configured ? 'Configured' : 'Not Configured'}
                  </span>
                </div>
                
                <p className="text-gray-300 mb-3">{status.kv.message}</p>
                
                <div className="text-sm text-gray-400 space-y-1">
                  <div>KV_REST_API_URL: {status.kv.details.KV_REST_API_URL}</div>
                  <div>KV_REST_API_TOKEN: {status.kv.details.KV_REST_API_TOKEN}</div>
                  <div>KV_REST_API_READ_ONLY_TOKEN: {status.kv.details.KV_REST_API_READ_ONLY_TOKEN}</div>
                </div>
                
                {!status.kv.configured && (
                  <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/20 rounded">
                    <div className="flex items-center mb-2">
                      <FiAlertTriangle className="mr-2 text-yellow-500" />
                      <span className="text-yellow-300 font-medium">Impact</span>
                    </div>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Cannot create new projects</li>
                      <li>• Cannot edit existing projects</li>
                      <li>• Projects stored in localStorage only</li>
                      <li>• Changes won't sync across devices</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Vercel Blob Status */}
            <div className="bg-[#1a1a1a] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FiImage className="mr-2" />
                Vercel Blob Storage (Image Storage)
              </h2>
              
              <div className={`p-4 rounded-lg border ${
                status.blob.configured 
                  ? 'bg-green-900/20 border-green-500/20' 
                  : 'bg-red-900/20 border-red-500/20'
              }`}>
                <div className="flex items-center mb-3">
                  {status.blob.configured ? (
                    <FiCheck className="mr-2 text-green-500" />
                  ) : (
                    <FiX className="mr-2 text-red-500" />
                  )}
                  <span className={`font-medium ${
                    status.blob.configured ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {status.blob.configured ? 'Configured' : 'Not Configured'}
                  </span>
                </div>
                
                <p className="text-gray-300 mb-3">{status.blob.message}</p>
                
                {!status.blob.configured && (
                  <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/20 rounded">
                    <div className="flex items-center mb-2">
                      <FiAlertTriangle className="mr-2 text-yellow-500" />
                      <span className="text-yellow-300 font-medium">Impact</span>
                    </div>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Cannot upload new images</li>
                      <li>• Cannot update project thumbnails</li>
                      <li>• Cannot add project gallery images</li>
                      <li>• Image editing features disabled</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Overall Status */}
            <div className="bg-[#1a1a1a] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FiCloud className="mr-2" />
                Overall Status
              </h2>
              
              <div className="space-y-3">
                {status.kv.configured && status.blob.configured && (
                  <div className="flex items-center text-green-300">
                    <FiCheck className="mr-2" />
                    <span>✅ Fully configured - All features available</span>
                  </div>
                )}
                
                {status.kv.configured && !status.blob.configured && (
                  <div className="flex items-center text-yellow-300">
                    <FiAlertTriangle className="mr-2" />
                    <span>⚠️ Partially configured - Project editing works, but no image uploads</span>
                  </div>
                )}
                
                {!status.kv.configured && status.blob.configured && (
                  <div className="flex items-center text-yellow-300">
                    <FiAlertTriangle className="mr-2" />
                    <span>⚠️ Partially configured - Image uploads work, but projects won't sync</span>
                  </div>
                )}
                
                {!status.kv.configured && !status.blob.configured && (
                  <div className="flex items-center text-red-300">
                    <FiX className="mr-2" />
                    <span>❌ Not configured - Limited functionality, localStorage only</span>
                  </div>
                )}
              </div>
            </div>

            {/* Setup Instructions */}
            <div className="bg-[#1a1a1a] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Setup Instructions</h2>
              
              <div className="space-y-4">
                {!status.kv.configured && (
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">1. Set up Vercel KV Database</h3>
                    <p className="text-gray-300 mb-2">
                      For project storage and cross-device sync, you need to configure Vercel KV.
                    </p>
                    <p className="text-sm text-gray-400">
                      See <code className="bg-gray-800 px-2 py-1 rounded">VERCEL_KV_SETUP.md</code> for detailed instructions.
                    </p>
                  </div>
                )}
                
                {!status.blob.configured && (
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">2. Set up Vercel Blob Storage</h3>
                    <p className="text-gray-300 mb-2">
                      For image uploads and storage, you need to configure Vercel Blob.
                    </p>
                    <p className="text-sm text-gray-400">
                      See <code className="bg-gray-800 px-2 py-1 rounded">VERCEL_BLOB_SETUP.md</code> for detailed instructions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={checkStorageStatus}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh Status
            </button>
            
            <button
              onClick={() => router.push('/admin/projects')}
              className="px-4 py-2 bg-[#b85a00] text-white rounded-lg hover:bg-[#a04a00]"
            >
              View Projects
            </button>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
} 
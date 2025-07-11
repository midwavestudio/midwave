import { NextResponse } from 'next/server';

export async function GET() {
  const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;
  
  return NextResponse.json({
    status: 'Vercel Blob Upload API',
    tokenConfigured: hasToken,
    message: hasToken 
      ? 'Vercel Blob token is configured and ready' 
      : 'Vercel Blob token is not configured. Please add BLOB_READ_WRITE_TOKEN to your environment variables.',
    timestamp: new Date().toISOString()
  });
} 
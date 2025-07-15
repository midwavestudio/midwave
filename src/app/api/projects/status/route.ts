import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hasKvUrl = !!process.env.KV_REST_API_URL;
    const hasKvToken = !!process.env.KV_REST_API_TOKEN;
    const hasKvReadOnlyToken = !!process.env.KV_REST_API_READ_ONLY_TOKEN;
    
    const isConfigured = hasKvUrl && hasKvToken;
    
    return NextResponse.json({
      status: 'Vercel KV Database Status',
      configured: isConfigured,
      details: {
        KV_REST_API_URL: hasKvUrl ? 'Set' : 'Missing',
        KV_REST_API_TOKEN: hasKvToken ? 'Set' : 'Missing',
        KV_REST_API_READ_ONLY_TOKEN: hasKvReadOnlyToken ? 'Set' : 'Missing (optional)'
      },
      message: isConfigured 
        ? 'Vercel KV is properly configured' 
        : 'Vercel KV is not configured. Please set up environment variables.',
      fallback: isConfigured ? 'Using cloud storage' : 'Using default projects as fallback',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'Error checking Vercel KV status',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
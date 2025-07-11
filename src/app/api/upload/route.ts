import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'Vercel Blob token not configured' },
        { status: 500 }
      );
    }
    
    // Generate filename if not provided
    const finalFilename = filename || `${Date.now()}-${file.name}`;
    
    // Upload to Vercel Blob
    const blob = await put(finalFilename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    return NextResponse.json({
      url: blob.url,
      filename: finalFilename
    });
    
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to upload file' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Upload endpoint - use POST with multipart/form-data' },
    { status: 200 }
  );
} 
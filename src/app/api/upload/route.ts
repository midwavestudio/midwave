import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

// Configure API route to handle larger files
export const maxDuration = 60; // 60 seconds timeout for large files
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string;
    
    console.log('File details:', {
      name: file?.name,
      size: file?.size ? `${(file.size / 1024 / 1024).toFixed(2)}MB` : 'unknown',
      type: file?.type,
      filename: filename
    });
    
    if (!file) {
      console.error('No file provided in request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('Vercel Blob token not configured');
      return NextResponse.json(
        { error: 'Vercel Blob token not configured' },
        { status: 500 }
      );
    }
    
    // Check file size (25MB limit)
    const maxSize = 25 * 1024 * 1024; // 25MB in bytes
    if (file.size > maxSize) {
      console.error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB > 25MB`);
      return NextResponse.json(
        { error: `File too large. Maximum size is 25MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.` },
        { status: 413 }
      );
    }
    
    // Generate filename if not provided
    const finalFilename = filename || `${Date.now()}-${file.name}`;
    
    console.log('Uploading to Vercel Blob:', finalFilename);
    
    // Upload to Vercel Blob
    const blob = await put(finalFilename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    console.log('Upload successful:', blob.url);
    
    return NextResponse.json({
      url: blob.url,
      filename: finalFilename
    });
    
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    
    // Handle specific Vercel Blob errors
    if (error instanceof Error) {
      if (error.message.includes('Request Entity Too Large')) {
        return NextResponse.json(
          { error: 'File too large for upload' },
          { status: 413 }
        );
      }
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: 'Vercel Blob token is invalid' },
          { status: 401 }
        );
      }
    }
    
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
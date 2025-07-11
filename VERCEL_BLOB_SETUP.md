# Vercel Blob Storage Setup

This project now uses Vercel Blob for image storage instead of Firebase Storage to avoid storage limitations.

## Setup Instructions

### 1. Get Your Vercel Blob Token

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Create a new environment variable:
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Your Vercel Blob read/write token

### 2. Local Development

Create a `.env.local` file in your project root and add:

```bash
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
```

### 3. Deployment

The environment variable should already be configured in your Vercel project settings. If not, add it there as well.

## Features

- ✅ Automatic image compression
- ✅ Multiple image upload support
- ✅ Thumbnail generation
- ✅ Loading states
- ✅ Error handling
- ✅ No storage limits (within Vercel Blob limits)

## Usage

The image upload functionality is now integrated into:

- **New Project Creation** (`/admin/projects/new`)
- **Project Editing** (`/admin/projects/edit/[id]`)

Images are automatically compressed and uploaded to Vercel Blob when you select them in the admin interface.

## API Endpoint

The upload functionality uses a server-side API route at `/api/upload` to securely handle uploads with your Blob token. 
# Vercel KV Database Setup

This project now uses Vercel KV (Key-Value store) for persistent cloud storage of projects, ensuring all changes are synchronized across all devices and users.

## What is Vercel KV?

Vercel KV is a serverless Redis-compatible database that provides:
- ✅ Global edge network for fast access
- ✅ Automatic scaling
- ✅ Built-in security
- ✅ Simple key-value storage perfect for project data

## Setup Instructions

### 1. Create Vercel KV Database

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Navigate to your project

2. **Create KV Database**
   - Go to the "Storage" tab
   - Click "Create Database"
   - Select "KV" (Key-Value store)
   - Choose a name like `midwave-projects-db`
   - Select your preferred region (closest to your users)

3. **Get Connection Details**
   - After creation, you'll see connection details
   - Copy the environment variables shown

### 2. Configure Environment Variables

Add these environment variables to your Vercel project:

**In Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Add the following variables (replace with your actual values):

```bash
# Vercel KV Database
KV_REST_API_URL=https://your-db-url.upstash.io
KV_REST_API_TOKEN=your-rest-api-token
KV_REST_API_READ_ONLY_TOKEN=your-read-only-token
```

**For Local Development (.env.local):**
```bash
# Vercel KV Database (for local development)
KV_REST_API_URL=https://your-db-url.upstash.io
KV_REST_API_TOKEN=your-rest-api-token
KV_REST_API_READ_ONLY_TOKEN=your-read-only-token
```

### 3. Deploy Changes

After setting up the environment variables:

1. **Deploy to Vercel**
   ```bash
   git add .
   git commit -m "Add Vercel KV database support"
   git push
   ```

2. **Verify Deployment**
   - Check that the build succeeds
   - Visit your site to ensure it loads

### 4. Migrate Existing Projects

If you have existing projects in localStorage:

1. **Visit Migration Page**
   - Go to `/admin/migrate-projects` on your live site
   - This page will show projects in localStorage vs cloud storage

2. **Run Migration**
   - Click "Migrate to Cloud Storage"
   - This will copy all localStorage projects to Vercel KV
   - localStorage will be cleared after successful migration

3. **Verify Migration**
   - Check that projects appear on all devices
   - Test creating/editing projects from different devices

## Features

### ✅ What's Now Cloud-Based:

- **Project Storage**: All projects stored in Vercel KV
- **Real-time Sync**: Changes visible across all devices instantly
- **Image Storage**: Already using Vercel Blob (configured separately)
- **Admin Operations**: Create, edit, delete projects in the cloud
- **Public Display**: Projects loaded from cloud storage

### ✅ Migration Support:

- **Automatic Migration**: localStorage projects automatically migrated on first load
- **Manual Migration**: Admin page for manual migration control
- **Fallback Support**: Falls back to localStorage if cloud is unavailable
- **Data Preservation**: Your existing 3 projects (arch viz, land development, marketing agency) will be preserved

## API Endpoints

The following API endpoints are now available:

- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create/update projects or migrate data
- `DELETE /api/projects` - Delete projects

## Troubleshooting

### Database Connection Issues

1. **Check Environment Variables**
   ```bash
   # Verify variables are set correctly
   echo $KV_REST_API_URL
   echo $KV_REST_API_TOKEN
   ```

2. **Test Database Connection**
   - Visit `/api/projects` to test the API
   - Should return JSON array of projects

3. **Check Vercel Logs**
   - Go to Vercel Dashboard → Functions
   - Check logs for any database errors

### Migration Issues

1. **Manual Migration**
   - Use `/admin/migrate-projects` page
   - Check browser console for errors

2. **Clear and Restart**
   - If needed, you can clear cloud storage and re-migrate
   - Use the debug page at `/debug-projects`

### Performance

- **Caching**: Vercel KV includes automatic caching
- **Edge Network**: Data served from global edge locations
- **Optimized Queries**: Simple key-value operations for fast access

## Security

- **Environment Variables**: Sensitive tokens stored securely in Vercel
- **API Protection**: Server-side only access to database
- **Admin Only**: Project management restricted to admin routes

## Cost

- **Vercel KV**: Free tier includes:
  - 30,000 requests per month
  - 256 MB storage
  - Should be more than sufficient for project data

## Next Steps

1. ✅ Set up Vercel KV database
2. ✅ Configure environment variables  
3. ✅ Deploy changes
4. ✅ Migrate existing projects
5. ✅ Test from multiple devices
6. ✅ Verify Vercel Blob is working for images

Your portfolio will now be fully cloud-based and synchronized across all devices! 
# Admin Dashboard Documentation

This document provides information about the admin dashboard features and functionality.

## Features

### Project Management
- **Add New Project**: Create portfolio projects with images and details
- **Manage Projects**: View, edit, and delete existing projects
- **Project Statistics**: View total projects, images, and featured projects

### UI Prototypes
- Browse modern UI designs for social media marketing
- View component showcases and prototypes

### GitHub Integration
- **Push to GitHub**: One-click deployment of changes to your GitHub repository
- Automatically commits all changes with a timestamp
- Provides real-time feedback on push status
- Requires `GITHUB_TOKEN` environment variable to be configured

### Settings
- Configure website settings and preferences
- Manage various dashboard options

## Environment Variables

The admin dashboard requires the following environment variables:

```env
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your-blob-token

# Vercel KV Database  
KV_REST_API_URL=your-kv-url
KV_REST_API_TOKEN=your-kv-token
KV_REST_API_READ_ONLY_TOKEN=your-kv-readonly-token

# Email Configuration
EMAIL_FROM=contact@mail.midwavestudio.com
EMAIL_TO=midwavestudio@gmail.com
RESEND_API_KEY=your-resend-api-key

# GitHub Integration
GITHUB_TOKEN=your-github-personal-access-token
```

## GitHub Setup

To use the GitHub push functionality:

1. **Create a Personal Access Token**:
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Generate a new token with `repo` permissions
   - Copy the token

2. **Add to Environment Variables**:
   - Add `GITHUB_TOKEN=your-token` to your `.env.local` file
   - Add the same variable to your Vercel project settings

3. **Usage**:
   - Click the "Push to GitHub" button in the admin dashboard
   - The system will automatically commit all changes and push to your repository
   - Status messages will show the progress and results

## Security

- All environment variables should be kept secure and never committed to version control
- The `.env.local` file is automatically ignored by Git
- Regularly rotate your API keys and tokens for security 
# Image Upload Guide for Midwave

This guide explains how to manage project images in the Midwave application without using Firebase Storage.

## Image Storage Options

Instead of using Firebase Storage buckets, you have the following options for storing and using project images:

### 1. Base64 Image Encoding (Built-in)

The application now includes built-in support for converting images to base64 strings, which are then stored directly in the project data. This approach:

- Requires no external services
- Works completely offline
- Makes projects fully self-contained
- Has size limitations (increases project data size)

When using the admin interface to create or edit projects, you can now directly upload images from your device. The application will automatically:
- Compress the images
- Convert them to base64 strings
- Save them within the project data

### 2. External Image Hosting Services

For production usage, we recommend using external image hosting services instead of base64 encoding for better performance. You can use any of these services:

1. **ImgBB** (https://imgbb.com/)
   - Free image hosting service
   - Provides direct image URLs
   - No account required for basic usage

2. **Cloudinary** (https://cloudinary.com/)
   - Robust image management platform
   - Free tier available
   - Supports image transformations

3. **Imgur** (https://imgur.com/)
   - Popular image hosting platform
   - API available for programmatic uploads
   - Free for basic usage

4. **Postimages** (https://postimages.org/)
   - Simple, free image hosting
   - No account required
   - Permanent image links

## How to Add Project Images

### Using the Admin Interface with Base64 (Easiest)

1. Go to Admin > Projects > New Project (or Edit an existing project)
2. Fill in the project details
3. In the "Upload Thumbnail" section, click to select an image from your device
4. In the "Add Project Images" section, click to select one or more images
5. The images will be automatically compressed and converted to base64
6. Save the project

### Using External Image Hosting Services

1. Upload your images to your preferred image hosting service
2. Copy the direct image URL provided by the service
3. Go to Admin > Projects > New Project (or Edit an existing project)
4. Paste the URL in the "Thumbnail URL" field
5. For project images, add each image to the project gallery by uploading additional images
6. Save the project

## Image Size Recommendations

For best performance, we recommend the following image sizes:

- **Thumbnails**: 600×400 pixels, JPEG or WebP format
- **Project Images**: 1200×800 pixels, JPEG or WebP format
- **File Size**: Keep images under 1MB each

## Troubleshooting

### Images Not Displaying

1. Check that the image URL is valid and accessible
2. For external images, ensure the URL starts with `https://`
3. Verify that the image format is supported (JPEG, PNG, WebP, GIF)

### Project Data Too Large

If you're storing many base64 images within a project, the project data might become very large. In this case:

1. Use fewer images per project
2. Compress images more aggressively before uploading
3. Consider switching to external image hosting services

## Technical Notes for Developers

The application now includes these utility functions for image handling:

- `compressImage()`: Compresses and resizes an image file
- `fileToBase64()`: Converts a File object to a base64 string
- `base64ToBlob()`: Converts a base64 string back to a Blob object
- `isValidUrl()`: Checks if a string is a valid URL or base64 image

To access these functions, import them from `@/lib/firebase/projectUtils`. 
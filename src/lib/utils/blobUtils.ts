/**
 * Convert a file to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Convert base64 string to blob
 */
export const base64ToBlob = (base64: string): Blob => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: 'image/jpeg' });
};

/**
 * Compress an image file and return as base64
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 800,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Upload image to Vercel Blob via API route
 */
export const uploadImageToBlob = async (
  file: File,
  filename?: string
): Promise<{ url: string; error?: string }> => {
  try {
    // Create FormData for the API call
    const formData = new FormData();
    formData.append('file', file);
    
    if (filename) {
      formData.append('filename', filename);
    }
    
    // Upload via API route
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Upload failed');
    }
    
    return { url: result.url };
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return { 
      url: '', 
      error: error instanceof Error ? error.message : 'Failed to upload image' 
    };
  }
};

/**
 * Upload compressed image to Vercel Blob
 */
export const uploadCompressedImageToBlob = async (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 800,
  quality: number = 0.8,
  filename?: string
): Promise<{ url: string; error?: string }> => {
  try {
    // Compress the image first
    const compressedBase64 = await compressImage(file, maxWidth, maxHeight, quality);
    
    // Convert base64 to blob
    const compressedBlob = base64ToBlob(compressedBase64);
    
    // Create a new file from the blob
    const compressedFile = new File([compressedBlob], file.name, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
    
    // Upload to Vercel Blob
    return await uploadImageToBlob(compressedFile, filename);
  } catch (error) {
    console.error('Error compressing and uploading image:', error);
    return { 
      url: '', 
      error: error instanceof Error ? error.message : 'Failed to process and upload image' 
    };
  }
};

/**
 * Upload multiple images to Vercel Blob
 */
export const uploadMultipleImagesToBlob = async (
  files: File[],
  maxWidth: number = 1200,
  maxHeight: number = 800,
  quality: number = 0.8
): Promise<{ urls: string[]; errors: string[] }> => {
  const urls: string[] = [];
  const errors: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filename = `${Date.now()}-${i}-${file.name}`;
    
    const result = await uploadCompressedImageToBlob(
      file,
      maxWidth,
      maxHeight,
      quality,
      filename
    );
    
    if (result.error) {
      errors.push(`${file.name}: ${result.error}`);
    } else {
      urls.push(result.url);
    }
  }
  
  return { urls, errors };
};

/**
 * Delete image from Vercel Blob (if needed)
 * Note: Vercel Blob doesn't have a direct delete API in the client,
 * but you can implement this server-side if needed
 */
export const deleteImageFromBlob = async (url: string): Promise<boolean> => {
  try {
    // This would need to be implemented server-side
    // For now, we'll just return true
    console.log('Delete image from blob:', url);
    return true;
  } catch (error) {
    console.error('Error deleting image from blob:', error);
    return false;
  }
}; 
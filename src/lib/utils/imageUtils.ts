/**
 * Utility functions for handling images
 */

/**
 * Compresses an image file and returns a base64 string
 * @param file The image file to compress
 * @param maxWidth The maximum width of the compressed image
 * @param maxHeight The maximum height of the compressed image
 * @param quality The quality of the compressed image (0-1)
 * @returns A promise that resolves to a base64 string
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 800,
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64
        const base64 = canvas.toDataURL('image/jpeg', quality);
        resolve(base64);
      };
      
      img.onerror = (error) => {
        reject(error);
      };
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

/**
 * Estimates the size of a base64 string in bytes
 * @param base64 The base64 string
 * @returns The estimated size in bytes
 */
export const estimateBase64Size = (base64: string): number => {
  // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
  const base64Data = base64.split(',')[1] || base64;
  
  // Each base64 character represents 6 bits, so 4 characters represent 3 bytes
  return Math.ceil((base64Data.length * 3) / 4);
};

/**
 * Checks if a string is a base64 encoded image
 * @param str The string to check
 * @returns True if the string is a base64 encoded image
 */
export const isBase64Image = (str: string): boolean => {
  return /^data:image\/[a-z]+;base64,/.test(str);
};

/**
 * Checks if a string is a URL
 * @param str The string to check
 * @returns True if the string is a URL
 */
export const isUrl = (str: string): boolean => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}; 
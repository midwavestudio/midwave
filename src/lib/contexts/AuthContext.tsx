'use client';

// Re-export the auth components from the new location
export { AuthProvider, useAuth } from '../firebase/auth';

// This file is kept for backward compatibility
// The actual implementation has been moved to ../firebase/auth.ts 
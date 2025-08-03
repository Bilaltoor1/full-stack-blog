'use client';

import Image from 'next/image';
import { isValidImageUrl } from '@/lib/utils/imageUtils';

/**
 * A safe wrapper around Next.js Image component that handles invalid URLs
 */
export default function SafeImage({ 
  src, 
  alt, 
  fallback = null,
  ...props 
}) {
  // If src is invalid, render fallback or nothing
  if (!isValidImageUrl(src)) {
    return fallback || (
      <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
        <svg 
          className="w-8 h-8 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      {...props}
    />
  );
}

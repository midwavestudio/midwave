'use client';

import { useState } from 'react';

interface ImageUrlHelperProps {
  onSelectImage: (url: string) => void;
}

const ImageUrlHelper = ({ onSelectImage }: ImageUrlHelperProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<Array<{ id: string; url: string; thumb: string; alt: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Sample image collections for quick access
  const quickCollections = [
    { name: 'Architecture', query: 'architecture' },
    { name: 'Technology', query: 'technology' },
    { name: 'Nature', query: 'nature' },
    { name: 'Business', query: 'business' },
    { name: 'Design', query: 'design' },
    { name: 'Minimal', query: 'minimal' },
  ];

  const searchUnsplash = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Using Unsplash Source API which doesn't require authentication
      // This is a simple approach that works for demo purposes
      const results = [];
      
      // Generate 9 "random" images based on the search query
      for (let i = 0; i < 9; i++) {
        const seed = `${query}-${i}`;
        const width = 1200;
        const height = 800;
        
        results.push({
          id: `${seed}-${i}`,
          // Using source.unsplash.com which redirects to a random image based on the query
          url: `https://source.unsplash.com/random/${width}x${height}?${query}&sig=${seed}`,
          thumb: `https://source.unsplash.com/random/300x200?${query}&sig=${seed}`,
          alt: `${query} image ${i + 1}`
        });
      }
      
      setImages(results);
    } catch (err) {
      console.error('Error searching for images:', err);
      setError('Failed to load images. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUnsplash(searchQuery);
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    searchUnsplash(query);
  };

  return (
    <div className="bg-[#0f0f13] rounded-lg p-4 border border-gray-800">
      <h3 className="text-lg font-medium text-white mb-4">Find Images</h3>
      
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for images..."
            className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00] focus:border-transparent"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#b85a00] text-white rounded-r-lg hover:bg-[#a04d00] transition-colors"
          >
            Search
          </button>
        </div>
      </form>
      
      <div className="mb-4">
        <p className="text-gray-400 text-sm mb-2">Quick collections:</p>
        <div className="flex flex-wrap gap-2">
          {quickCollections.map((collection) => (
            <button
              key={collection.query}
              onClick={() => handleQuickSearch(collection.query)}
              className="px-3 py-1 text-xs bg-gray-800 text-gray-300 rounded-full hover:bg-gray-700 transition-colors"
            >
              {collection.name}
            </button>
          ))}
        </div>
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b85a00]"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-900/20 text-red-300 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((image) => (
            <div 
              key={image.id}
              className="aspect-video bg-gray-800 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#b85a00] transition-all"
              onClick={() => onSelectImage(image.url)}
            >
              <img 
                src={image.thumb} 
                alt={image.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
      
      <p className="text-gray-400 text-xs mt-4">
        Images provided by Unsplash. Please respect their <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer" className="text-[#b85a00] hover:underline">license terms</a>.
      </p>
    </div>
  );
};

export default ImageUrlHelper; 
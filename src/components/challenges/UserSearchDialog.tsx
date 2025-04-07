'use client';

import React, { useState } from 'react';
import { FiSearch, FiX, FiLoader } from 'react-icons/fi';

interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

interface UserSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (userId: string) => void;
}

const UserSearchDialog: React.FC<UserSearchDialogProps> = ({
  isOpen,
  onClose,
  onSelectUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    // This is a placeholder - in a real implementation, this would query your database
    setTimeout(() => {
      setSearchResults([
        { id: 'user1', displayName: 'User One', email: 'user1@example.com' },
        { id: 'user2', displayName: 'User Two', email: 'user2@example.com' }
      ]);
      setIsSearching(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Find User</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="relative mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by name or email"
            className="w-full bg-gray-800 text-white px-4 py-2 pl-10 rounded-md"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <FiSearch className="text-gray-400" />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-600"
          >
            {isSearching ? <FiLoader className="animate-spin" /> : 'Search'}
          </button>
        </div>
        
        <div className="max-h-60 overflow-y-auto">
          {searchResults.length > 0 ? (
            <ul className="divide-y divide-gray-700">
              {searchResults.map((user) => (
                <li 
                  key={user.id}
                  className="py-2 hover:bg-gray-800 px-2 rounded cursor-pointer"
                  onClick={() => onSelectUser(user.id)}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full" />
                      ) : (
                        <span className="text-white text-sm">{user.displayName.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.displayName}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4 text-gray-400">
              {isSearching ? 'Searching...' : 'No users found'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearchDialog; 
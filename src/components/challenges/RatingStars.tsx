'use client';

import React from 'react';
import { FiStar } from 'react-icons/fi';

interface RatingStarsProps {
  rating: number;
  totalStars?: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  className?: string;
  interactive?: boolean;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  totalStars = 5,
  onRatingChange,
  size = 24,
  className = '',
  interactive = false
}) => {
  const handleClick = (selectedRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        const filled = starValue <= rating;
        
        return (
          <div
            key={`star-${index}`}
            className={`${
              interactive ? 'cursor-pointer' : ''
            } ${
              filled ? 'text-yellow-400' : 'text-gray-400'
            } mr-1`}
            onClick={() => handleClick(starValue)}
          >
            <FiStar
              size={size}
              className={filled ? 'fill-current' : ''}
            />
          </div>
        );
      })}
    </div>
  );
};

export default RatingStars; 
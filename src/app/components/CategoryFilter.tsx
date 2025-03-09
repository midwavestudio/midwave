'use client';

import { motion } from 'framer-motion';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-12">
      <FilterButton
        isActive={activeCategory === 'all'}
        onClick={() => onCategoryChange('all')}
      >
        All
      </FilterButton>
      
      {categories.map((category) => (
        <FilterButton
          key={category}
          isActive={activeCategory === category}
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </FilterButton>
      ))}
    </div>
  );
};

interface FilterButtonProps {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const FilterButton = ({ children, isActive, onClick }: FilterButtonProps) => {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        isActive
          ? 'bg-[#b85a00] text-white'
          : 'bg-[#0f0f13] text-gray-300 hover:bg-[#b85a00]/20 hover:text-white'
      }`}
    >
      {children}
    </motion.button>
  );
};

export default CategoryFilter; 
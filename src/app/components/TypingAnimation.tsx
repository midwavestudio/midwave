'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const words = ['Impact', 'Identity', 'Strategy'];

const TypingAnimation = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isWordComplete, setIsWordComplete] = useState(false);

  // Current word being typed/deleted
  const currentWord = words[currentWordIndex];

  // Typing speed settings
  const typingSpeed = 150; // Speed for typing (ms per character)
  const deletingSpeed = 100; // Speed for deleting (ms per character)
  const delayAfterWord = 1500; // Time to pause after a word is fully typed (ms)
  const delayBeforeDelete = 800; // Time to pause before starting to delete (ms)

  // Handle cursor blinking
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  // Handle typing animation
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    // If we're deleting and text is empty, switch to typing the next word
    if (isDeleting && displayedText === '') {
      setIsDeleting(false);
      setIsWordComplete(false);
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
      timeout = setTimeout(() => {}, typingSpeed);
    }
    // If we're typing and the text is complete, pause then start deleting
    else if (!isDeleting && displayedText === currentWord) {
      setIsWordComplete(true);
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, delayAfterWord);
    }
    // If we're deleting, remove one character
    else if (isDeleting) {
      setIsWordComplete(false);
      timeout = setTimeout(() => {
        setDisplayedText(currentWord.substring(0, displayedText.length - 1));
      }, deletingSpeed);
    }
    // If we're typing, add one character
    else {
      timeout = setTimeout(() => {
        setDisplayedText(currentWord.substring(0, displayedText.length + 1));
        // Check if word is now complete
        if (currentWord.substring(0, displayedText.length + 1) === currentWord) {
          setIsWordComplete(true);
        }
      }, typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentWord, currentWordIndex]);

  return (
    <span className="inline-flex items-center bg-clip-text text-transparent bg-gradient-to-r from-[#b85a00] to-amber-500">
      {displayedText}
      <motion.div 
        className="inline-block h-[1.1em] bg-gradient-to-r from-[#b85a00] to-amber-500"
        style={{ 
          width: '2px', 
          marginLeft: isWordComplete ? '0.25em' : '1px', // Add more space when word is complete
          marginBottom: '0.1em'
        }}
        animate={{ 
          opacity: cursorVisible ? 1 : 0 
        }}
        transition={{ duration: 0.2 }}
      />
    </span>
  );
};

export default TypingAnimation; 
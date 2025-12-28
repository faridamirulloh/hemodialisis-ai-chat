import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  onProgress?: () => void;
  isSkipped?: boolean;
}

const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 30, onComplete, onProgress, isSkipped = false }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Handle skip - show full text immediately
  useEffect(() => {
    if (isSkipped && !isComplete) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
      setIsComplete(true);
      onComplete?.();
    }
  }, [isSkipped, text, isComplete, onComplete]);

  useEffect(() => {
    if (isSkipped || isComplete) return;

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
        onProgress?.();
      }, speed);

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, onComplete, onProgress, isSkipped, isComplete]);

  return (
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }}>
      {displayedText}
    </motion.span>
  );
};

export default Typewriter;

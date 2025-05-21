import { useState, useEffect, useCallback } from 'react';
import { Trophy, Check, X } from "lucide-react";
import { motion } from 'framer-motion';

interface Color {
  name: string;
  hex: string;
}

const ColorMatcher = () => {
  const [colors, setColors] = useState<Color[]>([
    { name: '', hex: '#000000' },
    { name: '', hex: '#000000' },
    { name: '', hex: '#000000' },
    { name: '', hex: '#000000' }
  ]);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);

  const handleCardFlip = (index: number) => {
    if (!isActive || flippedCards.includes(index)) return;
    
    setFlippedCards(prev => [...prev, index]);
    
    if (flippedCards.length === 1) {
      setTimeout(() => {
        setFlippedCards([]);
      }, 1000);
    } else if (flippedCards.length === 2) {
      const [firstIndex, secondIndex] = flippedCards;
      const firstColor = colors[firstIndex];
      const secondColor = colors[secondIndex];
      
      if (firstColor.hex === secondColor.hex) {
        setScore(prev => prev + 1);
        setFlippedCards([]);
        if (score === 2) {
          setIsActive(false);
          setTimeLeft(30);
          setScore(0);
          setFlippedCards([]);
        }
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setTimeLeft(30);
    }
  }, [isActive, timeLeft]);

  const generateColors = useCallback(() => {
    const colors: Color[] = [];
    const colorPairs = 2;
    
    // Create pairs of colors
    for (let i = 0; i < colorPairs; i++) {
      const color = {
        name: getRandomColorName(),
        hex: getRandomHexColor()
      };
      colors.push(color, { ...color });
    }

    // Shuffle the colors
    setColors(shuffleArray(colors));
    setFlippedCards([]);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    generateColors();
  }, [isActive, generateColors]);

  const getRandomColorName = () => {
    const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 'Gray', 'Black'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getRandomHexColor = () => {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  };

  const shuffleArray = (array: any[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const handleColorClick = (color: Color) => {
    if (!isActive) return;

    if (color.name === colors[0].name) {
      setScore(score + 1);
      generateColors();
    } else {
      setScore(0);
      generateColors();
    }
  };

  const startGame = () => {
    setIsActive(true);
    setTimeLeft(30);
    setScore(0);
    generateColors();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Color Flipper</h2>
      <div className="mb-6">
        <h3 className="text-xl mb-2">Find matching color pairs</h3>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            <span>Score: {score}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Time: {timeLeft}</span>
            <button
              className="bg-arcade-green hover:bg-arcade-green/80"
              onClick={() => {
                setIsActive(!isActive);
                if (!isActive) {
                  setTimeLeft(30);
                  setScore(0);
                  setFlippedCards([]);
                  generateColors();
                }
              }}
            >
              {isActive ? 'Stop' : 'Start'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {colors.map((color, index) => (
          <motion.div
            key={index}
            className="relative"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className={`w-32 h-32 rounded-lg cursor-pointer transition-transform duration-300 ${
                flippedCards.includes(index) ? 'rotate-y-180' : ''
              }`}
              style={{ 
                backgroundColor: flippedCards.includes(index) ? color.hex : '#f3f4f6',
                transformStyle: 'preserve-3d'
              }}
              onClick={() => handleCardFlip(index)}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {flippedCards.includes(index) ? (
                  <div className="text-xl font-bold">{color.name}</div>
                ) : (
                  <div className="text-xl font-bold">?</div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export { ColorMatcher };
export default ColorMatcher;

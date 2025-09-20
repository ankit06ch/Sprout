import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Cloud, 
  Calendar, 
  BookOpen, 
  CreditCard, 
  Package
} from 'react-feather';

interface IconBoxProps {
  icon: React.ReactNode;
  label: string;
  x: number;
  y: number;
  scrollProgress: number;
  index: number;
}

const IconBox: React.FC<IconBoxProps> = ({ 
  icon, 
  label, 
  x, 
  y, 
  scrollProgress, 
  index 
}) => {
  // Calculate center point
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  // Move icons toward center as scroll progresses
  const translateX = x + (scrollProgress * (centerX - x));
  const translateY = y + (scrollProgress * (centerY - y));
  
  const rotation = scrollProgress * (360 + (index * 45));
  const scale = 0.8 + (scrollProgress * 0.4);
  const opacity = 0.9;

  return (
    <div
      className="absolute transition-all duration-300 ease-out"
      style={{
        left: 0,
        top: 0,
        transform: `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg) scale(${scale})`,
        opacity: opacity,
        zIndex: 10 + index,
      }}
    >
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl w-32 h-32 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="text-green-600">
            {icon}
          </div>
          <span className="text-sm font-semibold text-gray-800 text-center">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};

const ScrollIcons: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      const progress = Math.min(scrollTop / (documentHeight - windowHeight), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const icons = [
    { icon: <Activity size={32} />, label: 'Sports' },
    { icon: <Cloud size={32} />, label: 'Weather' },
    { icon: <Calendar size={32} />, label: 'Events' },
    { icon: <BookOpen size={32} />, label: 'School Terms' },
    { icon: <CreditCard size={32} />, label: 'POS' },
    { icon: <Package size={32} />, label: 'Product Data' },
  ];

  if (!isClient) {
    return null;
  }

  // Calculate symmetrical positions based on screen center
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const leftOffset = 575; // Distance from center for left side (25px more to the left)
  const rightOffset = 450; // Distance from center for right side (150px more to the right)
  const verticalSpacing = 150; // Space between icons vertically
  
  const positions = [
    // Left side (3 icons) - further to the left
    { x: centerX - leftOffset, y: centerY - verticalSpacing },  // Sports - top left
    { x: centerX - leftOffset, y: centerY },                    // Weather - middle left
    { x: centerX - leftOffset, y: centerY + verticalSpacing },  // Events - bottom left
    // Right side (3 icons) - closer to center
    { x: centerX + rightOffset, y: centerY - verticalSpacing }, // School Terms - top right
    { x: centerX + rightOffset, y: centerY },                   // POS - middle right
    { x: centerX + rightOffset, y: centerY + verticalSpacing }, // Product Data - bottom right
  ];

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 5 }}>
      {icons.map((item, index) => (
        <IconBox
          key={index}
          icon={item.icon}
          label={item.label}
          x={positions[index].x}
          y={positions[index].y}
          scrollProgress={scrollProgress}
          index={index}
        />
      ))}
    </div>
  );
};

export default ScrollIcons;
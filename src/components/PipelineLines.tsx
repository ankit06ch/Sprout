import React, { useEffect, useState } from 'react';

const PipelineLines: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    setIsClient(true);
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Calculate scroll progress (0 to 1)
      const progress = Math.min(scrollTop / (documentHeight - windowHeight), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isClient) {
    return null;
  }

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  // Icon positions (matching ScrollIcons component)
  const leftOffset = 575;
  const rightOffset = 450;
  const verticalSpacing = 150;
  
  const leftIconPositions = [
    { x: centerX - leftOffset, y: centerY - verticalSpacing },  // Sports - top left
    { x: centerX - leftOffset, y: centerY },                    // Weather - middle left
    { x: centerX - leftOffset, y: centerY + verticalSpacing },  // Events - bottom left
  ];
  
  const rightIconPositions = [
    { x: centerX + rightOffset, y: centerY - verticalSpacing }, // School Terms - top right
    { x: centerX + rightOffset, y: centerY },                   // POS - middle right
    { x: centerX + rightOffset, y: centerY + verticalSpacing }, // Product Data - bottom right
  ];

  // Video container position (50% width, centered, at bottom)
  const videoX = centerX;
  const videoY = window.innerHeight - 32; // -bottom-32 from hero section

  // Merge points for left and right sides (for future use)
  // const leftMergeX = centerX - 200;
  // const rightMergeX = centerX + 200;
  // const mergeY = centerY + 100;

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 4 }}>
      <svg className="w-full h-full">
        {/* Left side bracket-style lines */}
        {leftIconPositions.map((iconPos, index) => {
          // Start from the right edge of the icon box (icon box is 128px wide, so +64px from center)
          const startX = iconPos.x + 64 + 50; // Start from right edge of box + 50px right
          const startY = iconPos.y + 50; // Move 50px lower
          
          // Shift towards center as scroll progresses
          const shiftAmount = scrollProgress * 200; // Move 200px towards center
          const adjustedStartX = startX - shiftAmount; // Move left towards center
          
          // Create bracket-style path: horizontal right, then vertical down, then horizontal left
          const horizontal1X = adjustedStartX + 187.5; // First horizontal segment
          const verticalY = startY + 150; // Vertical segment
          const horizontal2X = videoX - 100 - shiftAmount; // Second horizontal segment (shifted towards center)
          const endX = videoX - 50 - shiftAmount; // Final connection point (shifted towards center)
          const endY = videoY - 50;
          
          
          return (
            <g key={`left-${index}`}>
              {/* Bracket-style path */}
              <path
                d={`M ${startX} ${startY} L ${horizontal1X} ${startY} L ${horizontal1X} ${verticalY} L ${horizontal2X} ${verticalY} L ${endX} ${endY}`}
                stroke="#10b981"
                strokeWidth="4"
                fill="none"
                className="animate-pulse"
                style={{
                  opacity: 0.7 - (scrollProgress * 0.7)
                }}
              />
              
            </g>
          );
        })}

        {/* Right side bracket-style lines */}
        {rightIconPositions.map((iconPos, index) => {
          // Start from the left edge of the icon box (icon box is 128px wide, so -64px from center)
          const startX = iconPos.x - 64 + 75; // Move 75px to the right
          const startY = iconPos.y + 50; // Move 50px lower
          
          // Shift towards center as scroll progresses
          const shiftAmount = scrollProgress * 200; // Move 200px towards center
          const adjustedStartX = startX + shiftAmount; // Move right towards center
          
          // Create bracket-style path: horizontal left, then vertical down, then horizontal right
          const horizontal1X = adjustedStartX - 200; // First horizontal segment
          const verticalY = startY + 150; // Vertical segment
          const horizontal2X = videoX + 100 - shiftAmount; // Second horizontal segment (shifted towards center)
          const endX = videoX + 50 - shiftAmount; // Final connection point (shifted towards center)
          const endY = videoY - 50;
          
          
          return (
            <g key={`right-${index}`}>
              {/* Bracket-style path */}
              <path
                d={`M ${startX} ${startY} L ${horizontal1X} ${startY} L ${horizontal1X} ${verticalY} L ${horizontal2X} ${verticalY} L ${endX} ${endY}`}
                stroke="#10b981"
                strokeWidth="4"
                fill="none"
                className="animate-pulse"
                style={{
                  opacity: 0.7 - (scrollProgress * 0.7)
                }}
              />
              
            </g>
          );
        })}

        {/* Connection lines to video container */}
        <g>
          {/* Calculate shift amount for final connections */}
          {(() => {
            const shiftAmount = scrollProgress * 200;
            return (
              <>
                {/* Left connection to video */}
                <line
                  x1={videoX - 150 - shiftAmount}
                  y1={videoY - 50}
                  x2={videoX - 100 - shiftAmount}
                  y2={videoY}
                  stroke="#10b981"
                  strokeWidth="6"
                  className="animate-pulse"
                  style={{
                    opacity: 0.8 - (scrollProgress * 0.8)
                  }}
                />
                
                {/* Right connection to video */}
                <line
                  x1={videoX + 150 - shiftAmount}
                  y1={videoY - 50}
                  x2={videoX + 100 - shiftAmount}
                  y2={videoY}
                  stroke="#10b981"
                  strokeWidth="6"
                  className="animate-pulse"
                  style={{
                    opacity: 0.8 - (scrollProgress * 0.8)
                  }}
                />
              </>
            );
          })()}
          
          {/* Final connection line across video */}
          <line
            x1={videoX - 100 - (scrollProgress * 200)}
            y1={videoY}
            x2={videoX + 100 - (scrollProgress * 200)}
            y2={videoY}
            stroke="#10b981"
            strokeWidth="8"
            className="animate-pulse"
                style={{
                  opacity: 0.9 - (scrollProgress * 0.9)
                }}
          />
          
        </g>
      </svg>
    </div>
  );
};

export default PipelineLines;
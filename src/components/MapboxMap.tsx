import React, { useState } from 'react';

interface MapboxMapProps {
  apiToken: string;
  className?: string;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ apiToken, className = '' }) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  
  // Use the iframe embed URL - simplified version
  const iframeSrc = `https://api.mapbox.com/styles/v1/achandra300/cmfsefhcs00j701s21535e7oy.html?title=false&access_token=${apiToken}&zoomwheel=false`;

  return (
    <div className={`relative ${className}`}>
      {/* Mapbox iframe embed */}
      <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-green-100 relative">
        <iframe 
          src={iframeSrc}
          className="absolute inset-0 w-full h-full border-none"
          title="Philadelphia Event Map"
          style={{ 
            border: 'none',
            borderRadius: '8px',
            background: 'white',
            maxWidth: '100%',
            maxHeight: '100%'
          }}
          allow="geolocation *; camera *; microphone *"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          onLoad={() => {
            console.log('Iframe loaded successfully');
            setIframeLoaded(true);
          }}
          onError={(e) => console.error('Iframe load error:', e)}
          onLoadStart={() => console.log('Iframe started loading')}
        />
        
        {/* Minimal fallback - just a subtle loading indicator */}
        {!iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 rounded-lg">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      {/* Map Legend */}
      <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm rounded-lg p-2 text-xs shadow-lg z-10">
        <div className="font-semibold mb-1">Legend</div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 bg-blue-600 rounded-full mr-2 border border-white"></div>
          <span>Business District</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 bg-green-600 rounded-full mr-2 border border-white"></div>
          <span>Food Markets</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-500 rounded-full mr-2 border border-white animate-pulse"></div>
          <span>Live Events</span>
        </div>
      </div>

      {/* Event Markers Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Philadelphia Food & Wine Festival */}
        <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-orange-500 rounded-full animate-pulse shadow-lg flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        
        {/* Pennsylvania Farm Show */}
        <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-blue-500 rounded-full animate-pulse shadow-lg flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        
        {/* Italian Market Festival */}
        <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        
        {/* Philadelphia Marathon */}
        <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-purple-500 rounded-full animate-pulse shadow-lg flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default MapboxMap;
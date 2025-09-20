import React, { useState } from 'react';

// Sample grocery store data structure
interface Product {
  id: string;
  name: string;
  category: string;
  aisle: string;
  shelf: string;
  position: { x: number; y: number };
  price: number;
  inStock: boolean;
}

interface Aisle {
  id: string;
  name: string;
  fullName: string;
  products: Product[];
  coordinates: { x: number; y: number }[];
}

interface MappedInGroceryStoreProps {
  className?: string;
  onSendChatMessage?: (message: string) => void;
}

export default function MappedInGroceryStore({ className = "", onSendChatMessage }: MappedInGroceryStoreProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  // Expanded grocery store data with rectangular aisles
  const groceryStoreData: Aisle[] = [
    {
      id: 'aisle-a1',
      name: 'A1',
      fullName: 'Fresh Produce',
      coordinates: [{ x: 100, y: 100 }, { x: 200, y: 100 }, { x: 200, y: 140 }, { x: 100, y: 140 }],
      products: [
        { id: '1', name: 'Organic Bananas', category: 'Fruits', aisle: 'A1', shelf: 'A1', position: { x: 120, y: 115 }, price: 2.99, inStock: true },
        { id: '2', name: 'Red Apples', category: 'Fruits', aisle: 'A1', shelf: 'A1', position: { x: 150, y: 115 }, price: 3.49, inStock: true },
        { id: '3', name: 'Carrots', category: 'Vegetables', aisle: 'A1', shelf: 'A1', position: { x: 180, y: 115 }, price: 1.99, inStock: true },
        { id: '4', name: 'Lettuce', category: 'Vegetables', aisle: 'A1', shelf: 'A1', position: { x: 120, y: 125 }, price: 2.49, inStock: false },
      ]
    },
    {
      id: 'aisle-a2',
      name: 'A2',
      fullName: 'Dairy & Eggs',
      coordinates: [{ x: 220, y: 100 }, { x: 320, y: 100 }, { x: 320, y: 140 }, { x: 220, y: 140 }],
      products: [
        { id: '5', name: 'Whole Milk', category: 'Dairy', aisle: 'A2', shelf: 'A2', position: { x: 240, y: 115 }, price: 4.99, inStock: true },
        { id: '6', name: 'Organic Eggs', category: 'Dairy', aisle: 'A2', shelf: 'A2', position: { x: 270, y: 115 }, price: 5.99, inStock: true },
        { id: '7', name: 'Greek Yogurt', category: 'Dairy', aisle: 'A2', shelf: 'A2', position: { x: 300, y: 115 }, price: 3.99, inStock: true },
        { id: '8', name: 'Cheddar Cheese', category: 'Dairy', aisle: 'A2', shelf: 'A2', position: { x: 240, y: 125 }, price: 6.99, inStock: false },
      ]
    },
    {
      id: 'aisle-a3',
      name: 'A3',
      fullName: 'Bakery',
      coordinates: [{ x: 340, y: 100 }, { x: 440, y: 100 }, { x: 440, y: 140 }, { x: 340, y: 140 }],
      products: [
        { id: '9', name: 'Whole Wheat Bread', category: 'Bakery', aisle: 'A3', shelf: 'A3', position: { x: 360, y: 115 }, price: 3.99, inStock: true },
        { id: '10', name: 'Croissants', category: 'Bakery', aisle: 'A3', shelf: 'A3', position: { x: 390, y: 115 }, price: 4.99, inStock: true },
        { id: '11', name: 'Bagels', category: 'Bakery', aisle: 'A3', shelf: 'A3', position: { x: 420, y: 115 }, price: 2.99, inStock: true },
      ]
    },
    {
      id: 'aisle-b1',
      name: 'B1',
      fullName: 'Meat & Seafood',
      coordinates: [{ x: 100, y: 160 }, { x: 200, y: 160 }, { x: 200, y: 200 }, { x: 100, y: 200 }],
      products: [
        { id: '12', name: 'Chicken Breast', category: 'Meat', aisle: 'B1', shelf: 'B1', position: { x: 120, y: 175 }, price: 8.99, inStock: true },
        { id: '13', name: 'Salmon Fillet', category: 'Seafood', aisle: 'B1', shelf: 'B1', position: { x: 150, y: 175 }, price: 12.99, inStock: true },
        { id: '14', name: 'Ground Beef', category: 'Meat', aisle: 'B1', shelf: 'B1', position: { x: 180, y: 175 }, price: 6.99, inStock: false },
      ]
    },
    {
      id: 'aisle-b2',
      name: 'B2',
      fullName: 'Pantry Staples',
      coordinates: [{ x: 220, y: 160 }, { x: 320, y: 160 }, { x: 320, y: 200 }, { x: 220, y: 200 }],
      products: [
        { id: '15', name: 'Pasta', category: 'Pantry', aisle: 'B2', shelf: 'B2', position: { x: 240, y: 175 }, price: 1.99, inStock: true },
        { id: '16', name: 'Rice', category: 'Pantry', aisle: 'B2', shelf: 'B2', position: { x: 270, y: 175 }, price: 3.99, inStock: true },
        { id: '17', name: 'Olive Oil', category: 'Pantry', aisle: 'B2', shelf: 'B2', position: { x: 300, y: 175 }, price: 7.99, inStock: true },
      ]
    },
    {
      id: 'aisle-b3',
      name: 'B3',
      fullName: 'Frozen Foods',
      coordinates: [{ x: 340, y: 160 }, { x: 440, y: 160 }, { x: 440, y: 200 }, { x: 340, y: 200 }],
      products: [
        { id: '18', name: 'Frozen Pizza', category: 'Frozen', aisle: 'B3', shelf: 'B3', position: { x: 360, y: 175 }, price: 4.99, inStock: true },
        { id: '19', name: 'Ice Cream', category: 'Frozen', aisle: 'B3', shelf: 'B3', position: { x: 390, y: 175 }, price: 5.99, inStock: true },
        { id: '20', name: 'Frozen Vegetables', category: 'Frozen', aisle: 'B3', shelf: 'B3', position: { x: 420, y: 175 }, price: 3.49, inStock: false },
      ]
    },
    {
      id: 'aisle-c1',
      name: 'C1',
      fullName: 'Beverages',
      coordinates: [{ x: 100, y: 220 }, { x: 200, y: 220 }, { x: 200, y: 260 }, { x: 100, y: 260 }],
      products: [
        { id: '21', name: 'Coca Cola', category: 'Beverages', aisle: 'C1', shelf: 'C1', position: { x: 120, y: 235 }, price: 2.99, inStock: true },
        { id: '22', name: 'Orange Juice', category: 'Beverages', aisle: 'C1', shelf: 'C1', position: { x: 150, y: 235 }, price: 4.49, inStock: true },
        { id: '23', name: 'Coffee Beans', category: 'Beverages', aisle: 'C1', shelf: 'C1', position: { x: 180, y: 235 }, price: 8.99, inStock: true },
      ]
    },
    {
      id: 'aisle-c2',
      name: 'C2',
      fullName: 'Snacks & Candy',
      coordinates: [{ x: 220, y: 220 }, { x: 320, y: 220 }, { x: 320, y: 260 }, { x: 220, y: 260 }],
      products: [
        { id: '24', name: 'Potato Chips', category: 'Snacks', aisle: 'C2', shelf: 'C2', position: { x: 240, y: 235 }, price: 3.99, inStock: true },
        { id: '25', name: 'Chocolate Bars', category: 'Candy', aisle: 'C2', shelf: 'C2', position: { x: 270, y: 235 }, price: 2.49, inStock: true },
        { id: '26', name: 'Nuts & Trail Mix', category: 'Snacks', aisle: 'C2', shelf: 'C2', position: { x: 300, y: 235 }, price: 6.99, inStock: false },
      ]
    },
    {
      id: 'aisle-c3',
      name: 'C3',
      fullName: 'Health & Beauty',
      coordinates: [{ x: 340, y: 220 }, { x: 440, y: 220 }, { x: 440, y: 260 }, { x: 340, y: 260 }],
      products: [
        { id: '27', name: 'Shampoo', category: 'Health', aisle: 'C3', shelf: 'C3', position: { x: 360, y: 235 }, price: 7.99, inStock: true },
        { id: '28', name: 'Toothpaste', category: 'Health', aisle: 'C3', shelf: 'C3', position: { x: 390, y: 235 }, price: 4.99, inStock: true },
        { id: '29', name: 'Vitamins', category: 'Health', aisle: 'C3', shelf: 'C3', position: { x: 420, y: 235 }, price: 12.99, inStock: true },
      ]
    }
  ];

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setTranslate({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newScale = Math.max(0.5, Math.min(3, scale + (e.deltaY > 0 ? -0.1 : 0.1)));
    setScale(newScale);
  };

  const handleProductClick = (product: Product) => {
    if (onSendChatMessage) {
      const message = `**${product.name}** - ${product.category}\n\n**Location:** ${product.aisle}, Shelf ${product.shelf}\n**Price:** $${product.price}\n**Stock Status:** ${product.inStock ? 'In Stock' : 'Out of Stock'}\n\nWould you like more information about this product or similar items?`;
      onSendChatMessage(message);
    }
  };

  const handleAisleClick = (aisle: Aisle) => {
    if (onSendChatMessage) {
      const inStockCount = aisle.products.filter(p => p.inStock).length;
      const totalCount = aisle.products.length;
      const stockStatus = `${inStockCount}/${totalCount} products in stock`;
      
      // Create a proper HTML table
      const tableRows = aisle.products.map(p => 
        `<tr class="border-b border-gray-200 hover:bg-gray-50">
          <td class="px-4 py-2 font-medium text-gray-900">${p.name}</td>
          <td class="px-4 py-2 text-gray-700">$${p.price}</td>
          <td class="px-4 py-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
              ${p.inStock ? '✅ In Stock' : '❌ Out of Stock'}
            </span>
          </td>
        </tr>`
      ).join('');
      
      const message = `**${aisle.name} - ${aisle.fullName}**\n\n**Inventory Status:** ${stockStatus}<div class="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 md:rounded-lg mt-2">
        <table class="min-w-full divide-y divide-gray-300">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${tableRows}
          </tbody>
        </table>
      </div>\n\nNeed help finding something specific in this aisle?`;
      onSendChatMessage(message);
    }
  };


  // Search products
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const results = groceryStoreData
      .flatMap(aisle => aisle.products)
      .filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        product.aisle.toLowerCase().includes(query.toLowerCase())
      );

    setSearchResults(results);
  };

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    setSearchQuery('');
    setSearchResults([]);
    
    if (onSendChatMessage) {
      const message = `**Found: ${product.name}** - ${product.category}\n\n**Location:** ${product.aisle}, Shelf ${product.shelf}\n**Price:** $${product.price}\n**Stock Status:** ${product.inStock ? 'In Stock' : 'Out of Stock'}\n\nThis product is located in the ${product.aisle} aisle. Need directions or more information?`;
      onSendChatMessage(message);
    }
  };

  return (
    <div className={`w-full h-full bg-white rounded-lg overflow-hidden relative ${className}`} style={{ minHeight: '400px' }}>
      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 pl-10 pr-4 border border-gray-300 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-30">
            {searchResults.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductSelect(product)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.aisle} • {product.shelf}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">${product.price}</div>
                    <div className={`text-xs ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Map Container */}
      <div 
        className="w-full h-full relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100"
        style={{ minHeight: '400px', height: '100%', cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Map Content */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale}) translate(-50%, -50%)`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Store Layout */}
          <div className="relative" style={{ width: '600px', height: '600px' }}>
            {/* Store Border */}
            <div 
              className="absolute border-4 border-gray-800 rounded-lg bg-gray-50"
              style={{
                left: '80px',
                top: '80px',
                width: '420px',
                height: '220px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                zIndex: 1
              }}
            >
              {/* Store Title */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-1 rounded-lg text-sm font-bold">
                FRESH MART GROCERY
              </div>
            </div>
            
            {/* Aisles */}
            {groceryStoreData.map((aisle, index) => (
              <div
                key={aisle.id}
                className="absolute border-2 border-blue-400 rounded-lg flex items-center justify-center text-sm font-bold text-gray-800 cursor-pointer hover:bg-blue-100 transition-colors"
                style={{
                  left: `${aisle.coordinates[0].x}px`,
                  top: `${aisle.coordinates[0].y}px`,
                  width: `${aisle.coordinates[2].x - aisle.coordinates[0].x}px`,
                  height: `${aisle.coordinates[2].y - aisle.coordinates[0].y}px`,
                  backgroundColor: index % 2 === 0 ? '#e8f4fd' : '#f0f8ff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  zIndex: 2
                }}
                onClick={() => handleAisleClick(aisle)}
                title={`${aisle.name} - ${aisle.fullName}`}
              >
                {aisle.name}
              </div>
            ))}

            {/* Product Markers */}
            {groceryStoreData.map((aisle) =>
              aisle.products.map((product) => (
                <div
                  key={product.id}
                  className="absolute w-3 h-3 rounded-full border-2 border-white cursor-pointer hover:scale-125 transition-transform shadow-md"
                  style={{
                    left: `${product.position.x - 6}px`,
                    top: `${product.position.y - 6}px`,
                    backgroundColor: product.inStock ? '#4CAF50' : '#f44336',
                    zIndex: 3
                  }}
                  onClick={() => handleProductClick(product)}
                  title={`${product.name} - $${product.price}`}
                />
              ))
            )}
          </div>
        </div>
      </div>


      {/* Store Legend */}
      <div className="absolute top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-20">
        <h4 className="font-medium text-gray-900 mb-2">Store Layout</h4>
        <div className="space-y-2 text-sm">
          {groceryStoreData.map((aisle) => (
            <div key={aisle.id} className="flex items-center">
              <div className="w-3 h-3 bg-blue-200 border border-blue-400 rounded mr-2"></div>
              <span className="text-gray-700">{aisle.name} - {aisle.fullName}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">In Stock</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Out of Stock</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/80 px-3 py-1 rounded-lg text-xs text-gray-600 z-20">
        Drag to move • Scroll to zoom • Click aisles or products to see info in chat
      </div>
    </div>
  );
}
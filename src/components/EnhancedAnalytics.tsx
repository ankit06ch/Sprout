import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react';
import AnalyticsFilters from './AnalyticsFilters';
import RealTimeMetrics from './RealTimeMetrics';
import ThreeDStore from './ThreeDStore';

// Types
interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface ChartDataPoint {
  date: string;
  value: number;
  predicted?: number;
  actual?: number;
}

interface ProductPerformance {
  name: string;
  category: string;
  sales: number;
  accuracy: number;
  trend: 'up' | 'down' | 'stable';
  margin: number;
}

interface StorePerformance {
  name: string;
  location: string;
  revenue: number;
  accuracy: number;
  growth: number;
  customerSatisfaction: number;
}

interface ForecastAccuracy {
  product: string;
  predicted: number;
  actual: number;
  accuracy: number;
  variance: number;
}

// Data generation functions
const generateSalesData = (timeRange: string, store: string, category: string): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const today = new Date();
  
  let days = 30;
  if (timeRange === '7d') days = 7;
  else if (timeRange === '90d') days = 90;
  else if (timeRange === '1y') days = 365;
  
  const storeData: { [key: string]: { dailyRevenue: number; accuracy: number; multiplier: number } } = {
    'All Stores': { dailyRevenue: 106240, accuracy: 91.4, multiplier: 1.0 },
    'Buford Main': { dailyRevenue: 28340, accuracy: 93.2, multiplier: 1.33 },
    'Chamblee Plaza': { dailyRevenue: 21680, accuracy: 89.8, multiplier: 1.02 },
    'Norcross Market': { dailyRevenue: 18920, accuracy: 91.7, multiplier: 0.89 },
    'Tucker Junction': { dailyRevenue: 14560, accuracy: 90.4, multiplier: 0.69 },
    'Duluth International': { dailyRevenue: 22740, accuracy: 92.8, multiplier: 1.07 }
  };
  
  const categoryMultipliers: { [key: string]: number } = {
    'All Categories': 1.0,
    'Asian Produce': 1.4,
    'Latin American': 1.2,
    'Fresh Seafood': 1.6,
    'International Dairy': 0.8,
    'Halal/Kosher Meats': 1.3,
    'Spices & Seasonings': 0.7,
    'Prepared Foods': 1.1,
    'Beverages': 0.6,
    'Pantry Staples': 1.0
  };
  
  const selectedStoreData = storeData[store] || storeData['All Stores'];
  const categoryMultiplier = categoryMultipliers[category] || 1.0;
  const baseDailyRevenue = selectedStoreData.dailyRevenue * categoryMultiplier;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.15 : 1.0;
    const baseValue = baseDailyRevenue * weekendMultiplier;
    const variation = 0.15;
    
    const predicted = baseValue * (1 + (Math.random() - 0.5) * variation);
    const accuracyVariation = selectedStoreData.accuracy / 100;
    const actual = predicted * (1 + (Math.random() - 0.5) * (1 - accuracyVariation) * 0.3);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(predicted), // For compatibility with other charts
      predicted: Math.round(predicted),
      actual: Math.round(actual)
    });
  }
  
  return data;
};

const generateProductPerformance = (category: string): ProductPerformance[] => {
  const products = [
    { name: "Kimchi (Napa Cabbage)", category: "Asian Produce", baseSales: 1200, accuracy: 94.2, trend: "up" as const, margin: 0.35 },
    { name: "Fresh Tofu (Silken)", category: "Asian Produce", baseSales: 980, accuracy: 91.8, trend: "stable" as const, margin: 0.28 },
    { name: "Miso Paste (White)", category: "Asian Produce", baseSales: 750, accuracy: 89.5, trend: "up" as const, margin: 0.42 },
    { name: "Sesame Oil (Toasted)", category: "Asian Produce", baseSales: 650, accuracy: 92.1, trend: "down" as const, margin: 0.38 },
    { name: "Rice Noodles (Fresh)", category: "Asian Produce", baseSales: 1100, accuracy: 88.7, trend: "up" as const, margin: 0.25 },
    { name: "Tortillas (Corn)", category: "Latin American", baseSales: 1500, accuracy: 93.4, trend: "up" as const, margin: 0.22 },
    { name: "Black Beans (Dried)", category: "Latin American", baseSales: 850, accuracy: 90.2, trend: "stable" as const, margin: 0.31 },
    { name: "Plantains (Green)", category: "Latin American", baseSales: 720, accuracy: 87.9, trend: "up" as const, margin: 0.29 },
    { name: "Cilantro (Fresh)", category: "Latin American", baseSales: 600, accuracy: 85.3, trend: "down" as const, margin: 0.45 },
    { name: "Lime (Key)", category: "Latin American", baseSales: 900, accuracy: 91.6, trend: "stable" as const, margin: 0.33 },
    { name: "Salmon (Whole)", category: "Fresh Seafood", baseSales: 1800, accuracy: 95.1, trend: "up" as const, margin: 0.48 },
    { name: "Shrimp (Head-On)", category: "Fresh Seafood", baseSales: 1600, accuracy: 92.8, trend: "up" as const, margin: 0.41 },
    { name: "Crab (Live)", category: "Fresh Seafood", baseSales: 2200, accuracy: 89.4, trend: "down" as const, margin: 0.52 },
    { name: "Mackerel (Fresh)", category: "Fresh Seafood", baseSales: 950, accuracy: 87.2, trend: "stable" as const, margin: 0.39 },
    { name: "Sea Bass (Whole)", category: "Fresh Seafood", baseSales: 1400, accuracy: 93.7, trend: "up" as const, margin: 0.46 },
    { name: "Feta (Bulgarian)", category: "International Dairy", baseSales: 800, accuracy: 91.3, trend: "stable" as const, margin: 0.37 },
    { name: "Yogurt (Greek)", category: "International Dairy", baseSales: 1200, accuracy: 88.9, trend: "up" as const, margin: 0.32 },
    { name: "Mozzarella (Fresh)", category: "International Dairy", baseSales: 1000, accuracy: 90.5, trend: "down" as const, margin: 0.34 },
    { name: "Butter (European)", category: "International Dairy", baseSales: 700, accuracy: 86.7, trend: "stable" as const, margin: 0.29 },
    { name: "Chicken (Halal)", category: "Halal/Kosher Meats", baseSales: 2000, accuracy: 94.6, trend: "up" as const, margin: 0.43 },
    { name: "Lamb (Halal)", category: "Halal/Kosher Meats", baseSales: 1500, accuracy: 92.1, trend: "up" as const, margin: 0.51 },
    { name: "Beef (Kosher)", category: "Halal/Kosher Meats", baseSales: 1800, accuracy: 89.8, trend: "stable" as const, margin: 0.47 },
    { name: "Turmeric (Ground)", category: "Spices & Seasonings", baseSales: 400, accuracy: 93.2, trend: "up" as const, margin: 0.58 },
    { name: "Cumin (Whole)", category: "Spices & Seasonings", baseSales: 350, accuracy: 90.7, trend: "stable" as const, margin: 0.62 },
    { name: "Cardamom (Green)", category: "Spices & Seasonings", baseSales: 280, accuracy: 87.4, trend: "down" as const, margin: 0.65 },
    { name: "Curry Powder", category: "Spices & Seasonings", baseSales: 320, accuracy: 91.9, trend: "up" as const, margin: 0.55 },
    { name: "Hummus (Fresh)", category: "Prepared Foods", baseSales: 900, accuracy: 88.3, trend: "up" as const, margin: 0.41 },
    { name: "Falafel (Frozen)", category: "Prepared Foods", baseSales: 750, accuracy: 85.6, trend: "stable" as const, margin: 0.38 },
    { name: "Baklava (Assorted)", category: "Prepared Foods", baseSales: 600, accuracy: 92.4, trend: "up" as const, margin: 0.52 },
    { name: "Tea (Jasmine)", category: "Beverages", baseSales: 500, accuracy: 89.1, trend: "stable" as const, margin: 0.44 },
    { name: "Coffee (Turkish)", category: "Beverages", baseSales: 650, accuracy: 86.8, trend: "down" as const, margin: 0.47 },
    { name: "Soda (Imported)", category: "Beverages", baseSales: 800, accuracy: 84.2, trend: "up" as const, margin: 0.35 },
    { name: "Rice (Basmati)", category: "Pantry Staples", baseSales: 1500, accuracy: 93.5, trend: "up" as const, margin: 0.26 },
    { name: "Lentils (Red)", category: "Pantry Staples", baseSales: 850, accuracy: 90.8, trend: "stable" as const, margin: 0.31 },
    { name: "Olive Oil (Extra Virgin)", category: "Pantry Staples", baseSales: 1200, accuracy: 91.7, trend: "up" as const, margin: 0.39 }
  ];
  
  const filteredProducts = category === 'All Categories' 
    ? products 
    : products.filter(p => p.category === category);
  
  return filteredProducts.map(product => ({
    ...product,
    sales: Math.round(product.baseSales * (0.8 + Math.random() * 0.4)),
    accuracy: product.accuracy + (Math.random() - 0.5) * 4,
    margin: product.margin + (Math.random() - 0.5) * 0.1
  }));
};

const generateStorePerformance = (store: string): StorePerformance[] => {
  const stores = [
    { name: "Buford Main", location: "Doraville, GA", baseRevenue: 850200, accuracy: 93.2, growth: 12.4, satisfaction: 4.6 },
    { name: "Chamblee Plaza", location: "Chamblee, GA", baseRevenue: 650400, accuracy: 89.8, growth: 8.7, satisfaction: 4.4 },
    { name: "Norcross Market", location: "Norcross, GA", baseRevenue: 567600, accuracy: 91.7, growth: 15.2, satisfaction: 4.5 },
    { name: "Tucker Junction", location: "Tucker, GA", baseRevenue: 436800, accuracy: 90.4, growth: 6.9, satisfaction: 4.3 },
    { name: "Duluth International", location: "Duluth, GA", baseRevenue: 682200, accuracy: 92.8, growth: 11.8, satisfaction: 4.7 }
  ];
  
  const filteredStores = store === 'All Stores' ? stores : stores.filter(s => s.name === store);
  
  return filteredStores.map(store => ({
    ...store,
    revenue: Math.round(store.baseRevenue * (0.9 + Math.random() * 0.2)),
    accuracy: store.accuracy + (Math.random() - 0.5) * 2,
    growth: store.growth + (Math.random() - 0.5) * 4,
    customerSatisfaction: store.satisfaction + (Math.random() - 0.5) * 0.3
  }));
};

const generateForecastAccuracy = (): ForecastAccuracy[] => [
  { product: "Kimchi (Napa Cabbage)", predicted: 1200, actual: 1156, accuracy: 96.3, variance: -3.7 },
  { product: "Fresh Tofu (Silken)", predicted: 980, actual: 1023, accuracy: 95.6, variance: 4.4 },
  { product: "Miso Paste (White)", predicted: 750, actual: 798, accuracy: 93.6, variance: 6.4 },
  { product: "Sesame Oil (Toasted)", predicted: 650, actual: 612, accuracy: 94.2, variance: -5.8 },
  { product: "Rice Noodles (Fresh)", predicted: 1100, actual: 1089, accuracy: 99.0, variance: -1.0 },
  { product: "Tortillas (Corn)", predicted: 1500, actual: 1567, accuracy: 95.5, variance: 4.5 },
  { product: "Black Beans (Dried)", predicted: 850, actual: 823, accuracy: 96.8, variance: -3.2 },
  { product: "Plantains (Green)", predicted: 720, actual: 745, accuracy: 96.5, variance: 3.5 },
  { product: "Cilantro (Fresh)", predicted: 600, actual: 567, accuracy: 94.5, variance: -5.5 },
  { product: "Lime (Key)", predicted: 900, actual: 934, accuracy: 96.2, variance: 3.8 },
  { product: "Salmon (Whole)", predicted: 1800, actual: 1756, accuracy: 97.6, variance: -2.4 },
  { product: "Shrimp (Head-On)", predicted: 1600, actual: 1634, accuracy: 97.9, variance: 2.1 },
  { product: "Crab (Live)", predicted: 2200, actual: 2089, accuracy: 94.9, variance: -5.0 },
  { product: "Mackerel (Fresh)", predicted: 950, actual: 978, accuracy: 97.1, variance: 2.9 },
  { product: "Sea Bass (Whole)", predicted: 1400, actual: 1434, accuracy: 97.6, variance: 2.4 },
  { product: "Feta (Bulgarian)", predicted: 800, actual: 789, accuracy: 98.6, variance: -1.4 },
  { product: "Yogurt (Greek)", predicted: 1200, actual: 1234, accuracy: 97.2, variance: 2.8 },
  { product: "Mozzarella (Fresh)", predicted: 1000, actual: 967, accuracy: 96.7, variance: -3.3 },
  { product: "Butter (European)", predicted: 700, actual: 723, accuracy: 96.7, variance: 3.3 },
  { product: "Chicken (Halal)", predicted: 2000, actual: 1956, accuracy: 97.8, variance: -2.2 },
  { product: "Lamb (Halal)", predicted: 1500, actual: 1534, accuracy: 97.7, variance: 2.3 },
  { product: "Beef (Kosher)", predicted: 1800, actual: 1767, accuracy: 98.2, variance: -1.8 },
  { product: "Turmeric (Ground)", predicted: 400, actual: 412, accuracy: 97.0, variance: 3.0 },
  { product: "Cumin (Whole)", predicted: 350, actual: 345, accuracy: 98.6, variance: -1.4 },
  { product: "Cardamom (Green)", predicted: 280, actual: 267, accuracy: 95.4, variance: -4.6 },
  { product: "Curry Powder", predicted: 320, actual: 334, accuracy: 95.6, variance: 4.4 },
  { product: "Hummus (Fresh)", predicted: 900, actual: 923, accuracy: 97.4, variance: 2.6 },
  { product: "Falafel (Frozen)", predicted: 750, actual: 734, accuracy: 97.9, variance: -2.1 },
  { product: "Baklava (Assorted)", predicted: 600, actual: 612, accuracy: 98.0, variance: 2.0 },
  { product: "Tea (Jasmine)", predicted: 500, actual: 489, accuracy: 97.8, variance: -2.2 },
  { product: "Coffee (Turkish)", predicted: 650, actual: 667, accuracy: 97.4, variance: 2.6 },
  { product: "Soda (Imported)", predicted: 800, actual: 789, accuracy: 98.6, variance: -1.4 },
  { product: "Rice (Basmati)", predicted: 1500, actual: 1534, accuracy: 97.7, variance: 2.3 },
  { product: "Lentils (Red)", predicted: 850, actual: 834, accuracy: 98.1, variance: -1.9 },
  { product: "Olive Oil (Extra Virgin)", predicted: 1200, actual: 1189, accuracy: 99.1, variance: -0.9 },
  { product: "Moon Cakes", predicted: 45, actual: 67, accuracy: 67.2, variance: 48.9 },
  { product: "Masa Harina", predicted: 90, actual: 78, accuracy: 86.7, variance: -13.3 },
  { product: "Dried Persimmons", predicted: 25, actual: 31, accuracy: 80.6, variance: 24.0 }
];

// Enhanced Line Chart component
const LineChart: React.FC<{ data: ChartDataPoint[]; height?: number }> = ({ data, height = 400 }) => {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">No data available</div>;
  }

  const maxValue = Math.max(...data.map(d => Math.max(d.predicted || 0, d.actual || 0)));
  const minValue = Math.min(...data.map(d => Math.min(d.predicted || 0, d.actual || 0)));
  const range = maxValue - minValue;
  
  // Add some padding to the range for better visualization
  const paddedMin = minValue - range * 0.1;
  const paddedMax = maxValue + range * 0.1;
  const paddedRange = paddedMax - paddedMin;
  
  // Use actual pixel coordinates instead of percentages
  const getY = (value: number) => height - ((value - paddedMin) / paddedRange) * height;
  const getX = (index: number) => (index / (data.length - 1)) * 800; // Use 800px width for calculations
  
  // Create the points string for the lines using pixel coordinates
  const predictedPoints = data.map((d, i) => `${getX(i)},${getY(d.predicted || 0)}`).join(' ');
  const actualPoints = data.map((d, i) => `${getX(i)},${getY(d.actual || 0)}`).join(' ');
  
  return (
    <div className="relative w-full" style={{ height: height + 60 }}>
      <svg width="100%" height={height} viewBox="0 0 800 400" className="overflow-visible">
        {/* Background gradient */}
        <defs>
          <linearGradient id="predictedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="actualGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1="0"
            y1={height * ratio}
            x2="800"
            y2={height * ratio}
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        ))}
        
        {/* Area under predicted line */}
        <polygon
          fill="url(#predictedGradient)"
          points={`0,${height} ${predictedPoints} 800,${height}`}
        />
        
        {/* Area under actual line */}
        <polygon
          fill="url(#actualGradient)"
          points={`0,${height} ${actualPoints} 800,${height}`}
        />
        
        {/* Predicted line */}
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={predictedPoints}
        />
        
        {/* Actual line */}
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={actualPoints}
        />
        
        {/* Data points with hover effects */}
        {data.map((d, i) => (
          <g key={i}>
            {/* Predicted point */}
            <circle
              cx={getX(i)}
              cy={getY(d.predicted || 0)}
              r="6"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="2"
              className="hover:r-8 transition-all duration-200 cursor-pointer"
            />
            {/* Actual point */}
            <circle
              cx={getX(i)}
              cy={getY(d.actual || 0)}
              r="6"
              fill="#10b981"
              stroke="white"
              strokeWidth="2"
              className="hover:r-8 transition-all duration-200 cursor-pointer"
            />
          </g>
        ))}
      </svg>
      
      {/* Enhanced Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-blue-500 rounded-full"></div>
          <span className="text-gray-700 font-medium">Predicted Sales</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-green-500 rounded-full"></div>
          <span className="text-gray-700 font-medium">Actual Sales</span>
        </div>
      </div>
    </div>
  );
};

// Main component
const EnhancedAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedStore, setSelectedStore] = useState('All Stores');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [refreshKey] = useState(0);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showAllForecasts, setShowAllForecasts] = useState(false);

  // Generate data based on filters
  const salesData = useMemo(() => generateSalesData(timeRange, selectedStore, selectedCategory), [refreshKey, timeRange, selectedStore, selectedCategory]);
  const productPerformance = useMemo(() => generateProductPerformance(selectedCategory), [refreshKey, selectedCategory]);
  const storePerformance = useMemo(() => generateStorePerformance(selectedStore), [refreshKey, selectedStore]);
  const forecastAccuracy = useMemo(() => generateForecastAccuracy(), [refreshKey]);
  
  // Calculate dynamic metrics based on filtered data
  const totalRevenue = salesData.reduce((sum, d) => sum + (d.actual || 0), 0);
  const totalPredicted = salesData.reduce((sum, d) => sum + (d.predicted || 0), 0);
  const accuracy = Math.round((1 - Math.abs(totalPredicted - totalRevenue) / totalPredicted) * 100);
  
  const handleFiltersChange = (filters: { timeRange: string; store: string; category: string }) => {
    setTimeRange(filters.timeRange);
    setSelectedStore(filters.store);
    setSelectedCategory(filters.category);
  };

  const handleExport = (format: string) => {
    console.log(`Exporting data in ${format} format`);
    // Implement export functionality
  };

  const keyMetrics: MetricCard[] = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      change: 12.5,
      changeType: "increase",
      icon: <DollarSign className="w-5 h-5" />,
      color: "text-green-600",
      description: "last 30 days"
    },
    {
      title: "Forecast Accuracy",
      value: `${accuracy}%`,
      change: 2.3,
      changeType: "increase",
      icon: <Target className="w-5 h-5" />,
      color: "text-blue-600",
      description: "prediction accuracy"
    },
    {
      title: "Active Products",
      value: productPerformance.length,
      change: 5.2,
      changeType: "increase",
      icon: <Package className="w-5 h-5" />,
      color: "text-purple-600",
      description: "tracked items"
    },
    {
      title: "Store Locations",
      value: storePerformance.length,
      change: 0,
      changeType: "neutral",
      icon: <Activity className="w-5 h-5" />,
      color: "text-indigo-600",
      description: "active locations"
    }
  ];

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* 3D Store Visualization */}
      <ThreeDStore />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metric.value}</p>
                <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
              </div>
              <div className={`p-3 rounded-full ${metric.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                {metric.icon}
              </div>
            </div>
            <div className="flex items-center mt-4">
              {metric.changeType === 'increase' ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : metric.changeType === 'decrease' ? (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              ) : (
                <div className="w-4 h-4 bg-gray-400 rounded-full mr-1" />
              )}
              <span className={`text-sm font-medium ${
                metric.changeType === 'increase' ? 'text-green-600' : 
                metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {metric.change > 0 ? '+' : ''}{metric.change}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Sales Forecast vs Actual Chart - Full Width */}
      <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-3xl font-bold text-gray-900">Sales Forecast vs Actual Performance</h3>
            <p className="text-gray-600 mt-1">Daily sales performance comparison across all Buford Highway locations</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Eye className="w-4 h-4" />
            {timeRange} view
          </div>
        </div>
        <div className="mb-8">
          <LineChart data={salesData} height={400} />
          {/* Debug info */}
          <div className="text-xs text-gray-500 mt-2">
            Data points: {salesData.length}, Sample: {JSON.stringify(salesData.slice(0, 2))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {Math.round(salesData.reduce((sum, d) => sum + (d.predicted || 0), 0) / salesData.length).toLocaleString()}
            </div>
            <div className="text-sm text-blue-600 font-medium">Avg Predicted</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {Math.round(salesData.reduce((sum, d) => sum + (d.actual || 0), 0) / salesData.length).toLocaleString()}
            </div>
            <div className="text-sm text-green-600 font-medium">Avg Actual</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{accuracy}%</div>
            <div className="text-sm text-purple-600 font-medium">Overall Accuracy</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600">
              {Math.round(Math.abs(totalPredicted - totalRevenue) / totalPredicted * 100)}%
            </div>
            <div className="text-sm text-orange-600 font-medium">Avg Variance</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnalyticsFilters onFiltersChange={handleFiltersChange} onExport={handleExport} />

      {/* Real-time Metrics */}
      <RealTimeMetrics />

      {/* Product Performance Table */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Top Performing Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Sales</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Accuracy</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Margin</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Trend</th>
              </tr>
            </thead>
            <tbody>
              {(showAllProducts ? productPerformance : productPerformance.slice(0, 7)).map((product, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{product.name}</td>
                  <td className="py-3 px-4 text-gray-600">{product.category}</td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">${product.sales.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.accuracy > 90 ? 'bg-green-100 text-green-800' :
                      product.accuracy > 80 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.accuracy.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">{(product.margin * 100).toFixed(1)}%</td>
                  <td className="py-3 px-4 text-center">
                    {product.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mx-auto" />
                    ) : product.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />
                    ) : (
                      <div className="w-4 h-4 bg-gray-400 rounded-full mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {productPerformance.length > 7 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAllProducts(!showAllProducts)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showAllProducts ? 'Show Less' : 'Show More'}
            </button>
          </div>
        )}
      </div>

      {/* Forecast Accuracy Table */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Forecast Accuracy by Product</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Predicted</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actual</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Accuracy</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Variance</th>
              </tr>
            </thead>
            <tbody>
              {(showAllForecasts ? forecastAccuracy : forecastAccuracy.slice(0, 7)).map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{item.product}</td>
                  <td className="py-3 px-4 text-right text-gray-600">{item.predicted.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-gray-600">{item.actual.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.accuracy > 95 ? 'bg-green-100 text-green-800' :
                      item.accuracy > 90 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.accuracy.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-semibold ${
                      item.variance > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.variance > 0 ? '+' : ''}{item.variance.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {forecastAccuracy.length > 7 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAllForecasts(!showAllForecasts)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showAllForecasts ? 'Show Less' : 'Show More'}
            </button>
          </div>
        )}
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">AI Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">High Performance</h4>
            </div>
            <p className="text-sm text-blue-800">
              Asian Produce category shows 94.2% accuracy with strong demand for Kimchi and Fresh Tofu. 
              Consider expanding inventory for these high-margin items.
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h4 className="font-semibold text-yellow-900">Attention Needed</h4>
            </div>
            <p className="text-sm text-yellow-800">
              Fresh Seafood category shows high variance (15.2%). Implement dynamic pricing 
              and better demand forecasting for live products.
            </p>
          </div>
        </div>
      </div>

      {/* Waste Reduction Analysis */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Waste Reduction Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">3.8%</div>
            <div className="text-sm text-green-600 font-medium">Waste Rate</div>
            <div className="text-xs text-green-600 mt-1">Industry avg: 8.2%</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">$2,340</div>
            <div className="text-sm text-blue-600 font-medium">Monthly Savings</div>
            <div className="text-xs text-blue-600 mt-1">vs. last quarter</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">87%</div>
            <div className="text-sm text-purple-600 font-medium">Efficiency Score</div>
            <div className="text-xs text-purple-600 mt-1">AI-optimized ordering</div>
          </div>
        </div>
      </div>

      {/* Customer Satisfaction Metrics */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Satisfaction Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {storePerformance.map((store, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{store.name}</div>
              <div className="text-2xl font-bold text-blue-600 mt-2">{store.customerSatisfaction.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Customer Rating</div>
              <div className="text-xs text-gray-500 mt-1">{store.location}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Seasonal Forecasting Patterns */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Seasonal Forecasting Patterns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Peak Season Trends</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Asian New Year: +45% increase in Asian Produce</li>
              <li>• Ramadan: +60% increase in Halal/Kosher Meats</li>
              <li>• Summer: +35% increase in Fresh Seafood</li>
              <li>• Holidays: +25% increase in Prepared Foods</li>
            </ul>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">AI Predictions</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Next 30 days: Stable demand across categories</li>
              <li>• Lunar New Year prep: Stock up on Asian ingredients</li>
              <li>• Weather impact: Monitor fresh produce closely</li>
              <li>• Supply chain: Diversify seafood suppliers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAnalytics;
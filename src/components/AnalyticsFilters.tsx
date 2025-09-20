import React, { useState } from 'react';
import { 
  Filter, 
  Download, 
  Calendar, 
  MapPin, 
  Package, 
  Users,
  TrendingUp,
  BarChart3,
  FileText,
  Settings
} from 'lucide-react';

interface AnalyticsFiltersProps {
  onFiltersChange: (filters: {
    timeRange: string;
    store: string;
    category: string;
    metric: string;
    exportFormat: string;
  }) => void;
  onExport: (format: string) => void;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({ onFiltersChange, onExport }) => {
  const [filters, setFilters] = useState({
    timeRange: '30d',
    store: 'All Stores',
    category: 'All Categories',
    metric: 'accuracy',
    exportFormat: 'csv'
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
    { value: 'custom', label: 'Custom range' }
  ];

  const stores = [
    { value: 'All Stores', label: 'All Stores' },
    { value: 'Buford Main', label: 'Buford Main (Doraville, GA)' },
    { value: 'Chamblee Plaza', label: 'Chamblee Plaza (Chamblee, GA)' },
    { value: 'Norcross Market', label: 'Norcross Market (Norcross, GA)' },
    { value: 'Tucker Junction', label: 'Tucker Junction (Tucker, GA)' },
    { value: 'Duluth International', label: 'Duluth International (Duluth, GA)' }
  ];

  const categories = [
    { value: 'All Categories', label: 'All Categories' },
    { value: 'Asian Produce', label: 'Asian Produce (Korean, Chinese, Vietnamese, Thai)' },
    { value: 'Latin American', label: 'Latin American (Mexican, Central/South American)' },
    { value: 'Fresh Seafood', label: 'Fresh Seafood (Live tanks, frozen imports)' },
    { value: 'International Dairy', label: 'International Dairy (Specialty cheeses, yogurts)' },
    { value: 'Halal/Kosher Meats', label: 'Halal/Kosher Meats' },
    { value: 'Spices & Seasonings', label: 'Spices & Seasonings' },
    { value: 'Prepared Foods', label: 'Prepared Foods (Hot bar, deli items)' },
    { value: 'Beverages', label: 'Beverages (Imported sodas, teas, specialty drinks)' },
    { value: 'Pantry Staples', label: 'Pantry Staples (Rice, noodles, sauces)' }
  ];

  const metrics = [
    { value: 'accuracy', label: 'Forecast Accuracy' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'volume', label: 'Sales Volume' },
    { value: 'waste', label: 'Waste Reduction' },
    { value: 'efficiency', label: 'Inventory Efficiency' },
    { value: 'cultural', label: 'Cultural Event Impact' },
    { value: 'seasonal', label: 'Seasonal Demand Patterns' }
  ];

  const exportFormats = [
    { value: 'csv', label: 'CSV', icon: FileText },
    { value: 'excel', label: 'Excel', icon: BarChart3 },
    { value: 'pdf', label: 'PDF Report', icon: FileText }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters & Export
        </h3>
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">Advanced Analytics</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Time Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Time Range
          </label>
          <select
            value={filters.timeRange}
            onChange={(e) => handleFilterChange('timeRange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>

        {/* Store */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            Store
          </label>
          <select
            value={filters.store}
            onChange={(e) => handleFilterChange('store', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {stores.map(store => (
              <option key={store.value} value={store.value}>{store.label}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Package className="w-4 h-4" />
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
        </div>

        {/* Metric */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Primary Metric
          </label>
          <select
            value={filters.metric}
            onChange={(e) => handleFilterChange('metric', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {metrics.map(metric => (
              <option key={metric.value} value={metric.value}>{metric.label}</option>
            ))}
          </select>
        </div>

        {/* Export */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Download className="w-4 h-4" />
            Export Format
          </label>
          <div className="flex gap-2">
            <select
              value={filters.exportFormat}
              onChange={(e) => setFilters(prev => ({ ...prev, exportFormat: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {exportFormats.map(format => (
                <option key={format.value} value={format.value}>{format.label}</option>
              ))}
            </select>
            <button
              onClick={() => onExport(filters.exportFormat)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors">
            Save View
          </button>
          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors">
            Share Dashboard
          </button>
          <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors">
            Schedule Report
          </button>
          <button className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm hover:bg-orange-200 transition-colors">
            Set Alerts
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFilters;

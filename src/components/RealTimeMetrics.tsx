import React, { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, Zap, TrendingUp, TrendingDown } from 'lucide-react';

interface RealTimeMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  color: string;
}

const RealTimeMetrics: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([
    { id: 'sales', label: 'Sales/Hour', value: 2847, unit: '$', trend: 'up', change: 18.3, color: 'text-green-600' },
    { id: 'accuracy', label: 'Live Accuracy', value: 91.4, unit: '%', trend: 'up', change: 2.1, color: 'text-blue-600' },
    { id: 'orders', label: 'Active Orders', value: 67, unit: '', trend: 'stable', change: 0, color: 'text-purple-600' },
    { id: 'waste', label: 'Waste Rate', value: 3.8, unit: '%', trend: 'down', change: -0.7, color: 'text-orange-600' }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prevMetrics => 
        prevMetrics.map(metric => {
          // Simulate small fluctuations
          const fluctuation = (Math.random() - 0.5) * 0.1;
          let newValue = metric.value + fluctuation;
          
          // Keep values within reasonable bounds
          if (metric.id === 'sales') {
            newValue = Math.max(800, Math.min(2000, newValue));
          } else if (metric.id === 'accuracy') {
            newValue = Math.max(85, Math.min(99, newValue));
          } else if (metric.id === 'orders') {
            newValue = Math.max(10, Math.min(50, newValue));
          } else if (metric.id === 'waste') {
            newValue = Math.max(0.5, Math.min(5, newValue));
          }
          
          // Determine trend based on change
          const change = newValue - metric.value;
          let trend: 'up' | 'down' | 'stable' = 'stable';
          if (change > 0.1) trend = 'up';
          else if (change < -0.1) trend = 'down';
          
          return {
            ...metric,
            value: Math.round(newValue * 10) / 10,
            trend,
            change: Math.round(change * 10) / 10
          };
        })
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Simulate connection status changes
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(Math.random() > 0.1); // 90% uptime
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-600" />
          Real-Time Metrics
        </h3>
        <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1 border border-gray-200">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-600" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-600" />
          )}
          <span className={`text-sm font-medium ${
            isConnected ? 'text-green-600' : 'text-red-600'
          }`}>
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.id} className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-center gap-1 mb-2">
              <span className={`text-sm font-medium ${metric.color.replace('text-', 'text-').replace('-600', '-700')}`}>
                {metric.label}
              </span>
              {metric.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
              {metric.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-600" />}
              {metric.trend === 'stable' && <div className="w-3 h-3 bg-gray-400 rounded-full" />}
            </div>
            <div className={`text-2xl font-bold ${metric.color.replace('text-', 'text-').replace('-600', '-700')} mb-1`}>
              {metric.unit}{metric.value.toLocaleString()}
            </div>
            <div className={`text-xs ${
              metric.change > 0 ? 'text-green-600' : 
              metric.change < 0 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {metric.change > 0 ? '+' : ''}{metric.change}{metric.unit === '%' ? '%' : ''}
            </div>
          </div>
        ))}
      </div>

      {/* Live Activity Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-gray-700">Live Updates</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-50 rounded-full px-2 py-1 border border-gray-200">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600">Updated 3s ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMetrics;

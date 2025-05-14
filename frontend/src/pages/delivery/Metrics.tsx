import React, { useState, useEffect } from 'react';
import { deliveryService, DeliveryMetrics } from '../../services/delivery.service';
import { 
  ChartBarIcon, 
  ClockIcon, 
  MapPinIcon, 
  ArrowTrendingUpIcon, 
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const DeliveryMetricsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<DeliveryMetrics | null>(null);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setIsLoading(true);
        const metricsData = await deliveryService.getDeliveryMetrics(timeframe);
        setMetrics(metricsData);
      } catch (err) {
        console.error('Error loading metrics data:', err);
        setError('Failed to load metrics data');
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, [timeframe]);

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Delivery Metrics</h1>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button
              onClick={() => setTimeframe('day')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                timeframe === 'day'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                timeframe === 'week'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                timeframe === 'month'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Daily Deliveries Chart */}
        <div className="mt-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Delivery Volume</h2>
              <ChartBarIcon className="h-6 w-6 text-gray-400" />
            </div>
            
            {metrics?.daily_deliveries && (
              <div className="relative h-60">
                {/* Basic bar chart - in a real app, you'd use a chart library like Chart.js or Recharts */}
                <div className="absolute inset-0 flex items-end justify-between space-x-2">
                  {metrics.daily_deliveries.map((day, i) => (
                    <div key={i} className="flex flex-col items-center w-full">
                      <div className="relative w-full flex-1 flex items-end">
                        <div
                          className="w-full bg-indigo-500 rounded-t"
                          style={{
                            height: `${Math.max(
                              5,
                              (day.count / Math.max(...metrics.daily_deliveries.map(d => d.count))) * 100
                            )}%`,
                          }}
                        >
                          <div className="absolute bottom-full w-full text-center mb-1">
                            <span className="text-xs font-medium text-gray-500">{day.count}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 truncate w-full text-center">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Performance by Agent and Delivery Areas */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Performance by Agent */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Agent Performance</h2>
              <ArrowTrendingUpIcon className="h-6 w-6 text-gray-400" />
            </div>
            
            {metrics?.performance_by_agent && (
              <div className="mt-4 divide-y divide-gray-200">
                {metrics.performance_by_agent.map((agent, i) => (
                  <div key={i} className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                          {agent.agent_name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">{agent.agent_name}</h3>
                          <p className="text-sm text-gray-500">{agent.delivered} deliveries</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{Math.round(agent.on_time / agent.delivered * 100)}% on time</p>
                        <p className="text-sm text-gray-500">{agent.late} late</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="relative h-2 bg-gray-100 rounded-full">
                        <div
                          className="absolute top-0 left-0 h-2 bg-green-500 rounded-full"
                          style={{ width: `${(agent.on_time / agent.delivered) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Areas */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Delivery Areas</h2>
              <MapPinIcon className="h-6 w-6 text-gray-400" />
            </div>
            
            {metrics?.delivery_areas && (
              <div className="mt-4 space-y-4">
                {metrics.delivery_areas.map((area, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{area.area}</h3>
                        <p className="text-sm text-gray-500">{area.count} deliveries</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{area.percentage}%</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="relative h-2 bg-gray-100 rounded-full">
                        <div
                          className="absolute top-0 left-0 h-2 bg-blue-500 rounded-full"
                          style={{ width: `${area.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tips for Improvement */}
        <div className="mt-8 bg-indigo-50 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ClockIcon className="h-6 w-6 text-indigo-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-indigo-800">Delivery Performance Insights</h3>
              <div className="mt-2 text-sm text-indigo-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Peak delivery times are between 10 AM and 2 PM.</li>
                  <li>Consider reallocating resources to busier delivery areas.</li>
                  <li>The on-time delivery rate has improved by 5% compared to the previous {timeframe}.</li>
                  <li>Consider additional training for agents with lower performance metrics.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryMetricsPage; 
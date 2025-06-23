'use client';

import { useState, useEffect } from 'react';
import { ordersApi } from '@/lib/api';
import toast from 'react-hot-toast';
import SalesCharts from './SalesCharts';

interface DashboardData {
  period: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalItemsSold: number;
  topProducts: Array<{
    name: string;
    category: string;
    quantity: number;
    revenue: number;
  }>;
  hourlySales: Array<{
    hour: number;
    sales: number;
    orders: number;
  }>;
}

export default function SalesDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await ordersApi.getDashboardAnalytics(selectedPeriod);
      
      if (response.success) {
        setDashboardData(response.data);
        setLastUpdated(new Date());
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  // Auto-refresh every 30 seconds for today's data
  useEffect(() => {
    if (selectedPeriod === 'today') {
      const interval = setInterval(() => {
        loadDashboardData();
      }, 30 * 1000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [selectedPeriod]);

  // Refresh when window gains focus (returning from POS tab)
  useEffect(() => {
    const handleFocus = () => {
      loadDashboardData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'today': return 'Today';
      case 'week': return 'Last 7 Days';
      case 'month': return 'This Month';
      default: return 'Today';
    }
  };

  const getGrowthIndicator = (current: number, isPositive: boolean = true) => {
    if (selectedPeriod === 'today') return null;
    
    // Simulate growth data (in a real app, you'd get this from the API)
    const growth = Math.floor(Math.random() * 20) - 5; // -5% to +15%
    const color = growth >= 0 ? '#22C55E' : '#EF4444';
    const arrow = growth >= 0 ? '↗️' : '↘️';
    
    return (
      <div className="flex items-center text-xs mt-1">
        <span style={{ color }}>{arrow} {Math.abs(growth)}%</span>
        <span className="text-gray-400 ml-1">vs last period</span>
      </div>
    );
  };

  const getCategoryBreakdown = () => {
    if (!dashboardData?.topProducts) return [];
    
    const categoryTotals: { [key: string]: { quantity: number; revenue: number; color: string } } = {};
    const colors = ['#7F55B1', '#F49BAB', '#FFE1E0', '#B8A9FF', '#FFB3C6', '#FFF0EF'];
    
    dashboardData.topProducts.forEach((product, index) => {
      if (!categoryTotals[product.category]) {
        categoryTotals[product.category] = {
          quantity: 0,
          revenue: 0,
          color: colors[index % colors.length]
        };
      }
      categoryTotals[product.category].quantity += product.quantity;
      categoryTotals[product.category].revenue += product.revenue;
    });
    
    return Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .map(([category, data]) => ({ category, ...data }));
  };

  const getPeakHour = () => {
    if (!dashboardData?.hourlySales || selectedPeriod !== 'today') return null;
    
    const peakHour = dashboardData.hourlySales.reduce((max, hour) => 
      hour.sales > max.sales ? hour : max, 
      { hour: 0, sales: 0, orders: 0 }
    );
    
    if (peakHour.sales === 0) return null;
    
    return {
      time: `${peakHour.hour}:00 - ${peakHour.hour + 1}:00`,
      sales: peakHour.sales,
      orders: peakHour.orders
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderColor: '#7F55B1'}}></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No dashboard data available</p>
      </div>
    );
  }

  const categoryBreakdown = getCategoryBreakdown();
  const peakHour = getPeakHour();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" style={{color: '#7F55B1'}}>
            📊 Sales Dashboard
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
            {selectedPeriod === 'today' && <span className="ml-2 text-green-600 font-medium">🔄 Auto-refreshing (30s)</span>}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadDashboardData}
            className="px-3 py-1 text-sm rounded-lg border hover:bg-gray-50 transition-colors"
            style={{borderColor: '#FFE1E0'}}
            disabled={isLoading}
          >
            🔄 Refresh
          </button>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
            style={{borderColor: '#FFE1E0', focusRingColor: '#7F55B1'}}
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 hover:shadow-xl transition-shadow" style={{borderColor: '#FFE1E0'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold" style={{color: '#7F55B1'}}>
                {formatCurrency(dashboardData.totalRevenue)}
              </p>
              {getGrowthIndicator(dashboardData.totalRevenue)}
            </div>
            <div className="p-3 rounded-full" style={{backgroundColor: '#FFE1E0'}}>
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 hover:shadow-xl transition-shadow" style={{borderColor: '#FFE1E0'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold" style={{color: '#7F55B1'}}>
                {dashboardData.totalOrders}
              </p>
              {getGrowthIndicator(dashboardData.totalOrders)}
            </div>
            <div className="p-3 rounded-full" style={{backgroundColor: '#FFE1E0'}}>
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 hover:shadow-xl transition-shadow" style={{borderColor: '#FFE1E0'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Order Value</p>
              <p className="text-2xl font-bold" style={{color: '#7F55B1'}}>
                {formatCurrency(dashboardData.averageOrderValue)}
              </p>
              {getGrowthIndicator(dashboardData.averageOrderValue)}
            </div>
            <div className="p-3 rounded-full" style={{backgroundColor: '#FFE1E0'}}>
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        {/* Items Sold */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 hover:shadow-xl transition-shadow" style={{borderColor: '#FFE1E0'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Items Sold</p>
              <p className="text-2xl font-bold" style={{color: '#7F55B1'}}>
                {dashboardData.totalItemsSold}
              </p>
              {getGrowthIndicator(dashboardData.totalItemsSold)}
            </div>
            <div className="p-3 rounded-full" style={{backgroundColor: '#FFE1E0'}}>
              <span className="text-2xl">🧁</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      {(peakHour || categoryBreakdown.length > 0) && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2" style={{borderColor: '#FFE1E0'}}>
          <h3 className="text-lg font-bold mb-4" style={{color: '#7F55B1'}}>
            ⚡ Quick Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {peakHour && (
              <div className="text-center">
                <p className="text-2xl mb-1">🕒</p>
                <p className="font-semibold">Peak Hour</p>
                <p className="text-sm text-gray-600">{peakHour.time}</p>
                <p className="text-sm" style={{color: '#7F55B1'}}>
                  {formatCurrency(peakHour.sales)} • {peakHour.orders} orders
                </p>
              </div>
            )}
            {categoryBreakdown.length > 0 && (
              <div className="text-center">
                <p className="text-2xl mb-1">🏆</p>
                <p className="font-semibold">Top Category</p>
                <p className="text-sm text-gray-600">{categoryBreakdown[0].category}</p>
                <p className="text-sm" style={{color: '#7F55B1'}}>
                  {formatCurrency(categoryBreakdown[0].revenue)}
                </p>
              </div>
            )}
            <div className="text-center">
              <p className="text-2xl mb-1">⭐</p>
              <p className="font-semibold">Performance</p>
              <p className="text-sm text-gray-600">
                {dashboardData.totalOrders > 20 ? 'Excellent' : 
                 dashboardData.totalOrders > 10 ? 'Good' : 
                 dashboardData.totalOrders > 0 ? 'Fair' : 'Slow'}
              </p>
              <p className="text-sm" style={{color: '#7F55B1'}}>
                {getPeriodLabel(selectedPeriod)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2" style={{borderColor: '#FFE1E0'}}>
          <h3 className="text-xl font-bold mb-4" style={{color: '#7F55B1'}}>
            🏆 Top Products ({getPeriodLabel(selectedPeriod)})
          </h3>
          {dashboardData.topProducts.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors" style={{backgroundColor: '#FAFAFA'}}>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-white" 
                         style={{backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#7F55B1'}}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-500">{product.category}</p>
                        <span className="w-2 h-2 rounded-full" style={{backgroundColor: getCategoryBreakdown().find(c => c.category === product.category)?.color || '#7F55B1'}}></span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{color: '#7F55B1'}}>{product.quantity} sold</p>
                    <p className="text-sm text-gray-500">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No sales data for this period</p>
          )}
        </div>

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2" style={{borderColor: '#FFE1E0'}}>
            <h3 className="text-xl font-bold mb-4" style={{color: '#7F55B1'}}>
              📊 Sales by Category
            </h3>
            <div className="space-y-4">
              {categoryBreakdown.map((category, index) => {
                const percentage = Math.round((category.revenue / dashboardData.totalRevenue) * 100);
                return (
                  <div key={category.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full" style={{backgroundColor: category.color}}></span>
                        <span className="font-medium">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{color: '#7F55B1'}}>{formatCurrency(category.revenue)}</p>
                        <p className="text-xs text-gray-500">{percentage}% of total</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500" 
                        style={{
                          backgroundColor: category.color,
                          width: `${percentage}%`
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hourly Sales Chart (Today only) */}
        {selectedPeriod === 'today' && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2" style={{borderColor: '#FFE1E0'}}>
            <h3 className="text-xl font-bold mb-4" style={{color: '#7F55B1'}}>
              ⏰ Hourly Sales (Today)
            </h3>
            {dashboardData.hourlySales.length > 0 ? (
              <div className="space-y-2">
                {dashboardData.hourlySales
                  .filter(hour => hour.orders > 0)
                  .map((hour) => {
                    const maxSales = Math.max(...dashboardData.hourlySales.map(h => h.sales));
                    const percentage = maxSales > 0 ? (hour.sales / maxSales) * 100 : 0;
                    
                    return (
                      <div key={hour.hour} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">
                            {hour.hour.toString().padStart(2, '0')}:00
                          </span>
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-600">{hour.orders} orders</span>
                            <span className="font-semibold" style={{color: '#7F55B1'}}>
                              {formatCurrency(hour.sales)}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="h-1.5 rounded-full transition-all duration-500" 
                            style={{
                              background: `linear-gradient(90deg, #7F55B1, #F49BAB)`,
                              width: `${percentage}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                {dashboardData.hourlySales.every(hour => hour.orders === 0) && (
                  <p className="text-gray-500 text-center py-8">No sales recorded today</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No hourly data available</p>
            )}
          </div>
        )}

        {/* Period Summary (Week/Month) */}
        {selectedPeriod !== 'today' && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2" style={{borderColor: '#FFE1E0'}}>
            <h3 className="text-xl font-bold mb-4" style={{color: '#7F55B1'}}>
              📈 {getPeriodLabel(selectedPeriod)} Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg" style={{backgroundColor: '#FAFAFA'}}>
                <span className="font-medium">Daily Average Revenue:</span>
                <span className="font-bold" style={{color: '#7F55B1'}}>
                  {formatCurrency(dashboardData.totalRevenue / (selectedPeriod === 'week' ? 7 : 30))}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{backgroundColor: '#FAFAFA'}}>
                <span className="font-medium">Daily Average Orders:</span>
                <span className="font-bold" style={{color: '#7F55B1'}}>
                  {Math.round(dashboardData.totalOrders / (selectedPeriod === 'week' ? 7 : 30))}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{backgroundColor: '#FAFAFA'}}>
                <span className="font-medium">Daily Average Items:</span>
                <span className="font-bold" style={{color: '#7F55B1'}}>
                  {Math.round(dashboardData.totalItemsSold / (selectedPeriod === 'week' ? 7 : 30))}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                <span className="font-medium">Business Health:</span>
                <span className="font-bold" style={{color: '#7F55B1'}}>
                  {dashboardData.totalRevenue > 1000 ? '🟢 Excellent' : 
                   dashboardData.totalRevenue > 500 ? '🟡 Good' : 
                   dashboardData.totalRevenue > 100 ? '🟠 Fair' : '🔴 Needs Attention'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Charts */}
      <SalesCharts 
        hourlySales={dashboardData.hourlySales}
        categoryBreakdown={categoryBreakdown}
        topProducts={dashboardData.topProducts}
        period={selectedPeriod}
      />
    </div>
  );
} 
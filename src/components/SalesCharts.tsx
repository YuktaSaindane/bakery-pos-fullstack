'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface SalesChartsProps {
  hourlySales: Array<{
    hour: number;
    sales: number;
    orders: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    revenue: number;
    quantity: number;
    color: string;
  }>;
  topProducts: Array<{
    name: string;
    category: string;
    quantity: number;
    revenue: number;
  }>;
  period: string;
}

export default function SalesCharts({ 
  hourlySales, 
  categoryBreakdown, 
  topProducts, 
  period 
}: SalesChartsProps) {
  
  // Chart options with PopStreet Bakes theme
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#374151',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#7F55B1',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: '#F3F4F6',
        },
        ticks: {
          color: '#6B7280',
        },
      },
      y: {
        grid: {
          color: '#F3F4F6',
        },
        ticks: {
          color: '#6B7280',
        },
      },
    },
  };

  // Hourly Sales Line Chart Data
  const hourlyLineData = {
    labels: hourlySales.map(h => `${h.hour.toString().padStart(2, '0')}:00`),
    datasets: [
      {
        label: 'Sales ($)',
        data: hourlySales.map(h => h.sales),
        borderColor: '#7F55B1',
        backgroundColor: 'rgba(127, 85, 177, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#7F55B1',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // Category Doughnut Chart Data
  const categoryDoughnutData = {
    labels: categoryBreakdown.map(c => c.category),
    datasets: [
      {
        data: categoryBreakdown.map(c => c.revenue),
        backgroundColor: categoryBreakdown.map(c => c.color),
        borderColor: '#FFFFFF',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 10,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#374151',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#7F55B1',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '60%',
  };

  // Top Products Bar Chart Data
  const topProductsBarData = {
    labels: topProducts.slice(0, 5).map(p => p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name),
    datasets: [
      {
        label: 'Revenue ($)',
        data: topProducts.slice(0, 5).map(p => p.revenue),
        backgroundColor: 'rgba(127, 85, 177, 0.8)',
        borderColor: '#7F55B1',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Quantity Sold',
        data: topProducts.slice(0, 5).map(p => p.quantity),
        backgroundColor: 'rgba(244, 155, 171, 0.8)',
        borderColor: '#F49BAB',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        yAxisID: 'y1',
      },
    ],
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#6B7280',
        },
      },
    },
  };

  if (period !== 'today' && (!categoryBreakdown.length && !topProducts.length)) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Hourly Sales Chart - Only for today */}
      {period === 'today' && hourlySales.length > 0 && hourlySales.some(h => h.sales > 0) && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2" style={{borderColor: '#FFE1E0'}}>
          <h3 className="text-xl font-bold mb-4" style={{color: '#7F55B1'}}>
            📈 Sales Trend - Today
          </h3>
          <div className="h-80">
            <Line data={hourlyLineData} options={chartOptions} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Chart */}
        {categoryBreakdown.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2" style={{borderColor: '#FFE1E0'}}>
            <h3 className="text-xl font-bold mb-4" style={{color: '#7F55B1'}}>
              🍰 Revenue by Category
            </h3>
            <div className="h-80">
              <Doughnut data={categoryDoughnutData} options={doughnutOptions} />
            </div>
          </div>
        )}

        {/* Top Products Chart */}
        {topProducts.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2" style={{borderColor: '#FFE1E0'}}>
            <h3 className="text-xl font-bold mb-4" style={{color: '#7F55B1'}}>
              🏆 Top 5 Products Performance
            </h3>
            <div className="h-80">
              <Bar data={topProductsBarData} options={barOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
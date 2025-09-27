import React from 'react'
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { TrendingUp, Star, MessageSquare, Package } from 'lucide-react'
import { useAnalytics } from '../hooks/useSupabaseData'
import LoadingSpinner from '../components/LoadingSpinner'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const Analytics: React.FC = () => {
  const { analytics, loading } = useAnalytics()

  const usersBySchoolData = {
    labels: analytics.usersBySchool.map(d => d.school),
    datasets: [
      {
        data: analytics.usersBySchool.map(d => d.count),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  }

  const merchantStatusData = {
    labels: analytics.merchantsByVerificationStatus.map(d => d.status),
    datasets: [
      {
        data: analytics.merchantsByVerificationStatus.map(d => d.count),
        backgroundColor: [
          '#10B981', // Verified - Green
          '#EF4444', // Unverified - Red
          '#F59E0B'  // Pending - Yellow
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  }

  const revenueByMonthData = {
    labels: analytics.revenueByMonth.map(d => d.month),
    datasets: [
      {
        label: 'Revenue (₦)',
        data: analytics.revenueByMonth.map(d => d.revenue),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }

  const topCategoriesData = {
    labels: analytics.topCategories.map(d => d.category),
    datasets: [
      {
        label: 'Products',
        data: analytics.topCategories.map(d => d.count),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 4
      }
    ]
  }

  const requestsByUniversityData = {
    labels: analytics.requestsByUniversity.map(d => d.university),
    datasets: [
      {
        data: analytics.requestsByUniversity.map(d => d.count),
        backgroundColor: [
          '#8B5CF6',
          '#F59E0B'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      }
    }
  }

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  const revenueOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return '₦' + value.toLocaleString()
          }
        }
      }
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive insights into platform performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Requests</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{analytics.totalRequests.toLocaleString()}</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">
              <MessageSquare size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{analytics.totalProducts.toLocaleString()}</h3>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              <Package size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Average Rating</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{analytics.averageRating}/5</h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              <Star size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Growth Rate</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">+12%</h3>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend (12 Months)</h2>
          <div className="h-80">
            <Line data={revenueByMonthData} options={revenueOptions} />
          </div>
        </div>

        {/* Top Product Categories */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Product Categories</h2>
          <div className="h-80">
            <Bar data={topCategoriesData} options={barOptions} />
          </div>
        </div>

        {/* Users by School */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Users by University</h2>
          <div className="h-80">
            <Doughnut data={usersBySchoolData} options={doughnutOptions} />
          </div>
        </div>

        {/* Merchant Verification Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Merchant Verification Status</h2>
          <div className="h-80">
            <Pie data={merchantStatusData} options={doughnutOptions} />
          </div>
        </div>

        {/* Requests by University */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Requests by University</h2>
          <div className="h-80">
            <Doughnut data={requestsByUniversityData} options={doughnutOptions} />
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Platform Health</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">User Engagement</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-sm font-medium">85%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Merchant Activity</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                </div>
                <span className="text-sm font-medium">72%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Transaction Success</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
                <span className="text-sm font-medium">94%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">System Uptime</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '99%' }}></div>
                </div>
                <span className="text-sm font-medium">99%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Category Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.topCategories.slice(0, 5).map((category, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {((category.count / analytics.totalProducts) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* University Stats */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">University Statistics</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">University</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.usersBySchool.map((school, index) => {
                  const requests = analytics.requestsByUniversity.find(r => r.university === school.school)?.count || 0
                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {school.school}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {school.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {requests}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
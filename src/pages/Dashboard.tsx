import React from 'react'
import { Line, Bar } from 'react-chartjs-2'
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
  Filler
} from 'chart.js'
import { Users, ShoppingCart, DollarSign, Clock, TrendingUp, UserPlus, AlertCircle, Search, Bell } from 'lucide-react'
import { useDashboardStats } from '../hooks/useSupabaseData'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDistanceToNow } from 'date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const Dashboard: React.FC = () => {
  const { stats, recentActivity, loading } = useDashboardStats()

  type GrowthEntry = { month: string; users: number; merchants: number; visitors?: number }
  const growth = stats.userGrowthData as GrowthEntry[]
  const userGrowthData = {
    labels: growth.map(d => d.month),
    datasets: [
      {
        label: 'Users',
        data: growth.map(d => d.users),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Merchants',
        data: growth.map(d => d.merchants),
        borderColor: 'rgb(124, 58, 237)',
        backgroundColor: 'rgba(124, 58, 237, 0.05)',
        tension: 0.4,
        fill: true
      }
      // ,{
      //   label: 'Visitors',
      //   data: growth.map(d => d.visitors || 0),
      //   borderColor: 'rgb(16, 185, 129)',
      //   backgroundColor: 'rgba(16, 185, 129, 0.05)',
      //   tension: 0.4,
      //   fill: true
      // }
    ]
  }

  const revenueData = {
    labels: stats.revenueData.map(d => d.month),
    datasets: [
      {
        label: 'Revenue (₦)',
        data: stats.revenueData.map(d => d.revenue),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 4
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
    },
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
          // Chart.js expects (this, tickValue, index, ticks)
          callback: function (this: any, tickValue: string | number) {
            const v = typeof tickValue === 'string' ? Number(tickValue) : tickValue
            return '\u20a6' + (isNaN(Number(v)) ? String(v) : (v as number).toLocaleString())
          }
        }
      }
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered': return UserPlus
      case 'merchant_registered': return ShoppingCart
      case 'invoice_created': return DollarSign
      case 'verification_request': return AlertCircle
      default: return UserPlus
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_registered': return 'blue'
      case 'merchant_registered': return 'green'
      case 'invoice_created': return 'purple'
      case 'verification_request': return 'yellow'
      default: return 'blue'
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="flex items-center space-x-4">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            <Bell size={18} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.totalUsers.toLocaleString()}</h3>
              <p className="text-sm text-green-500 mt-1 flex items-center">
                <TrendingUp size={16} className="mr-1" />
                <span>Active users</span>
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Merchants</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.totalMerchants.toLocaleString()}</h3>
              <p className="text-sm text-green-500 mt-1 flex items-center">
                <TrendingUp size={16} className="mr-1" />
                <span>Active merchants</span>
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              <ShoppingCart size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Visitors</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{(stats as unknown as any).totalVisitors ? Number((stats as unknown as any).totalVisitors).toLocaleString() : 0}</h3>
              <p className="text-sm text-green-500 mt-1 flex items-center">
                <TrendingUp size={16} className="mr-1" />
                <span>Guest visitors</span>
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <UserPlus size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">₦{stats.totalRevenue.toLocaleString()}</h3>
              <p className="text-sm text-green-500 mt-1 flex items-center">
                <TrendingUp size={16} className="mr-1" />
                <span>From transactions</span>
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Verifications</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.pendingVerifications}</h3>
              <p className="text-sm text-red-500 mt-1 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                <span>Needs attention</span>
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              <Clock size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">User Growth</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded">Monthly</button>
            </div>
          </div>
          <div className="h-64">
            <Line data={userGrowthData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Revenue Breakdown</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded">Monthly</button>
            </div>
          </div>
          <div className="h-64">
            <Bar data={revenueData} options={revenueOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
        </div>
        <div className="divide-y">
          {recentActivity.map((activity) => {
            const Icon = getActivityIcon(activity.type)
            const color = getActivityColor(activity.type)
            return (
              <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start">
                  <div className={`p-2 rounded-full bg-${color}-100 text-${color}-500 mr-3 flex-shrink-0`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500 truncate">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="px-6 py-3 bg-gray-50 text-center">
          <a href="/analytics" className="text-sm font-medium text-blue-600 hover:text-blue-500">View detailed analytics</a>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

// There's a problem with my charts, they are not showing the right months for the data
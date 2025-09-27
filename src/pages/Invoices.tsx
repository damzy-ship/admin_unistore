import React, { useState } from 'react'
import { Search, Download, Filter, RefreshCw } from 'lucide-react'
import { useInvoices } from '../hooks/useSupabaseData'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import { formatDistanceToNow } from 'date-fns'

const Invoices: React.FC = () => {
  const [filters, setFilters] = useState({
    status: 'All',
    date_from: '',
    date_to: '',
    min_amount: undefined as number | undefined,
    max_amount: undefined as number | undefined
  })
  
  const [searchTerm, setSearchTerm] = useState('')
  const { invoices, loading, error } = useInvoices(filters)

  const filteredInvoices = invoices.filter(invoice => 
    invoice.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.merchant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Invoices Management</h1>
          <p className="text-gray-600">Manage all transactions and invoices on the platform</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            />
          </div>
          <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download size={16} className="mr-2" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All</option>
              <option>paid</option>
              <option>pending</option>
              <option>failed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount Range</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.min_amount || ''}
                onChange={(e) => handleFilterChange('min_amount', e.target.value ? Number(e.target.value) : undefined)}
                className="border rounded-lg px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.max_amount || ''}
                onChange={(e) => handleFilterChange('max_amount', e.target.value ? Number(e.target.value) : undefined)}
                className="border rounded-lg px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="flex items-center space-x-2">
              <input 
                type="date" 
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <span>to</span>
              <input 
                type="date" 
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>
          <div className="ml-auto">
            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Filter size={16} className="mr-2" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">All Invoices</h2>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700 transition-colors">
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      INV-{invoice.id.slice(-8).toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-500">
                      REF: {invoice.payment_reference || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {invoice.customer_name || 'Unknown Customer'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {invoice.customer_email || 'No email'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {invoice.merchant_name || 'Unknown Merchant'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {invoice.merchant_number || 'No phone'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {invoice.invoice_amount ? `₦${parseFloat(invoice.invoice_amount.replace(/[^\d.-]/g, '') || '0').toLocaleString()}` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={invoice.invoice_status || 'unknown'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDistanceToNow(new Date(invoice.created_at), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3 transition-colors">View</button>
                    <button className="text-gray-600 hover:text-gray-900 transition-colors">Print</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredInvoices.length}</span> of{' '}
            <span className="font-medium">{invoices.length}</span> invoices
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 border rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              1
            </button>
            <button className="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              2
            </button>
            <button className="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              3
            </button>
            <button className="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Invoices
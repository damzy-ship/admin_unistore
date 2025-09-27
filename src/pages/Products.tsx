import React, { useState } from 'react'
import { Search, Plus, RefreshCw, Download, Filter, Eye, Edit, Trash2 } from 'lucide-react'
import { useProducts } from '../hooks/useSupabaseData'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import { formatDistanceToNow } from 'date-fns'

const Products: React.FC = () => {
  const [filters, setFilters] = useState({
    is_available: undefined as boolean | undefined,
    is_featured: undefined as boolean | undefined
  })
  
  const [searchTerm, setSearchTerm] = useState('')
  const { products, loading, error } = useProducts(filters)

  const filteredProducts = products.filter(product => 
    product.product_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.search_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_categories?.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleFilterChange = (key: string, value: boolean | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
          <p className="text-gray-600">Manage all products listed by merchants</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            />
          </div>
          <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={16} className="mr-2" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
            <select 
              value={filters.is_available === undefined ? 'All' : filters.is_available.toString()}
              onChange={(e) => handleFilterChange('is_available', e.target.value === 'All' ? undefined : e.target.value === 'true')}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All</option>
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
            <select 
              value={filters.is_featured === undefined ? 'All' : filters.is_featured.toString()}
              onChange={(e) => handleFilterChange('is_featured', e.target.value === 'All' ? undefined : e.target.value === 'true')}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All</option>
              <option value="true">Featured</option>
              <option value="false">Not Featured</option>
            </select>
          </div>
          <div className="ml-auto">
            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Filter size={16} className="mr-2" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={product.image_urls?.[0] || 'https://images.pexels.com/photos/4465831/pexels-photo-4465831.jpeg?auto=compress&cs=tinysrgb&w=400&h=300'}
                alt={product.product_description || 'Product'}
                className="w-full h-48 object-cover"
              />
              {product.is_featured && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                  Featured
                </div>
              )}
              <div className="absolute top-2 right-2">
                <StatusBadge status={product.is_available ? 'available' : 'unavailable'} />
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                {product.product_description || 'No description'}
              </h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold text-green-600">
                  ₦{product.product_price ? parseFloat(product.product_price.replace(/[^\d.-]/g, '') || '0').toLocaleString() : 'N/A'}
                </span>
                {product.discount_price && (
                  <span className="text-sm text-gray-500 line-through">
                    ₦{parseFloat(product.discount_price.replace(/[^\d.-]/g, '') || '0').toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {product.product_categories?.slice(0, 2).map((category, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {category}
                  </span>
                ))}
                {product.product_categories && product.product_categories.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{product.product_categories.length - 2} more
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Added {formatDistanceToNow(new Date(product.created_at), { addSuffix: true })}
              </p>
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    <Eye size={16} />
                  </button>
                  <button className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors">
                    <Edit size={16} />
                  </button>
                  <button className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Products Table for larger screens */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">All Products</h2>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700 transition-colors">
              <RefreshCw size={20} />
            </button>
            <button className="text-gray-500 hover:text-gray-700 transition-colors">
              <Download size={20} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.slice(0, 10).map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={product.image_urls?.[0] || 'https://images.pexels.com/photos/4465831/pexels-photo-4465831.jpeg?auto=compress&cs=tinysrgb&w=100&h=100'}
                          alt="Product"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {product.product_description || 'No description'}
                        </div>
                        {product.is_featured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₦{product.product_price ? parseFloat(product.product_price.replace(/[^\d.-]/g, '') || '0').toLocaleString() : 'N/A'}
                    </div>
                    {product.discount_price && (
                      <div className="text-sm text-gray-500 line-through">
                        ₦{parseFloat(product.discount_price.replace(/[^\d.-]/g, '') || '0').toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {product.product_categories?.slice(0, 2).map((category, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {category}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={product.is_available ? 'available' : 'unavailable'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDistanceToNow(new Date(product.created_at), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3 transition-colors">View</button>
                    <button className="text-gray-600 hover:text-gray-900 transition-colors">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(10, filteredProducts.length)}</span> of{' '}
            <span className="font-medium">{products.length}</span> products
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 border rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              1
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

export default Products
import React, { useState } from 'react'
import { Search, Star, RefreshCw, Filter, Eye, Trash2 } from 'lucide-react'
import { useReviews } from '../hooks/useSupabaseData'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDistanceToNow } from 'date-fns'

const Reviews: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState('All')
  const [featuredFilter, setFeaturedFilter] = useState('All')
  const [page, setPage] = useState(1)
  const limit = 10
  const { reviews, loading, error, total, refetch } = useReviews()

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.review_text?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRating = ratingFilter === 'All' || review.rating.toString() === ratingFilter
    const matchesFeatured = featuredFilter === 'All' || 
                           (featuredFilter === 'true' && review.is_featured) ||
                           (featuredFilter === 'false' && !review.is_featured)
    
    return matchesSearch && matchesRating && matchesFeatured
  })

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ))
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(review => review.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(review => review.rating === rating).length / reviews.length) * 100 : 0
  }))

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reviews Management</h1>
          <p className="text-gray-600">Manage all user reviews and ratings</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Reviews</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{reviews.length}</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">
              <Star size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Average Rating</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{averageRating.toFixed(1)}/5</h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              <Star size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Featured Reviews</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {reviews.filter(r => r.is_featured).length}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <Star size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">5-Star Reviews</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {reviews.filter(r => r.rating === 5).length}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              <Star size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Rating Distribution</h2>
        <div className="space-y-3">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center">
              <div className="flex items-center w-20">
                <span className="text-sm font-medium text-gray-700 mr-2">{rating}</span>
                <Star size={16} className="text-yellow-400 fill-current" />
              </div>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-16 text-right">
                <span className="text-sm text-gray-600">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <select 
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
            <select 
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Reviews</option>
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

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">All Reviews</h2>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700 transition-colors">
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredReviews.map((review) => (
            <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <img
                      className="h-10 w-10 rounded-full object-cover mr-3"
                      src={`https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200`}
                      alt="User"
                    />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{review.user_name}</h3>
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-sm text-gray-500">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.review_text && (
                    <p className="text-gray-700 mb-2">{review.review_text}</p>
                  )}
                  {review.is_featured && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Featured Review
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    <Eye size={16} />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, total || 0)}</span> of{' '}
            <span className="font-medium">{total || 0}</span> reviews
          </div>
          <div className="flex space-x-2">
            <button disabled={page <= 1} onClick={() => { setPage(p => Math.max(1, p - 1)); refetch(page - 1, limit) }} className="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50">
              Previous
            </button>
            {Array.from({ length: Math.max(1, Math.ceil((total || 0) / limit)) }).map((_, i) => (
              <button key={i} onClick={() => { setPage(i + 1); refetch(i + 1, limit) }} className={`px-3 py-1 border rounded-md text-sm font-medium ${page === i + 1 ? 'text-white bg-blue-600' : 'text-gray-700 bg-white hover:bg-gray-50'}`}>
                {i + 1}
              </button>
            ))}
            <button disabled={page >= Math.ceil((total || 0) / limit)} onClick={() => { setPage(p => Math.min(Math.ceil((total || 0) / limit), p + 1)); refetch(page + 1, limit) }} className="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reviews
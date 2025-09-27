import React from 'react'
import { X, Check, XCircle, User, Building } from 'lucide-react'
import { UniqueVisitor } from '../lib/supabase'
import { updateVerificationStatus } from '../hooks/useSupabaseData'
interface VerificationModalProps {
  user: UniqueVisitor | null
  isOpen: boolean
  onClose: () => void
  onVerificationUpdate: () => void
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  user,
  isOpen,
  onClose,
  onVerificationUpdate
}) => {
  const [loading, setLoading] = React.useState(false)

  if (!isOpen || !user) return null

  const handleVerification = async (status: 'verified' | 'unverified') => {
    setLoading(true)
    try {
      await updateVerificationStatus(user.id, status)
      onVerificationUpdate()
      onClose()
    } catch (error) {
      console.error('Error updating verification status:', error)
      alert('Failed to update verification status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              {user.user_type === 'merchant' ? (
                <Building className="w-6 h-6 text-blue-500 mr-2" />
              ) : (
                <User className="w-6 h-6 text-blue-500 mr-2" />
              )}
              <h3 className="text-lg font-medium text-gray-900">
                Verification Request - {user.user_type === 'merchant' ? 'Merchant' : 'User'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* User Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">User Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{user.full_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{user.email || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <p className="mt-1 text-sm text-gray-900">{user.phone_number || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID</label>
                  <p className="mt-1 text-sm text-gray-900">{user.user_id}</p>
                </div>
                {user.user_type === 'merchant' && user.brand_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Brand Name</label>
                    <p className="mt-1 text-sm text-gray-900">{user.brand_name}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Status</label>
                  <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.verification_status === 'verified' 
                      ? 'bg-green-100 text-green-800'
                      : user.verification_status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.verification_status.charAt(0).toUpperCase() + user.verification_status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Document */}
            {user.verification_id && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Verification Document</h4>
                <div className="border rounded-lg p-4">
                  <img
                    src={user.verification_id}
                    alt="Verification Document"
                    className="max-w-full h-auto rounded-lg shadow-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'https://images.pexels.com/photos/4465831/pexels-photo-4465831.jpeg?auto=compress&cs=tinysrgb&w=400&h=300'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {user.verification_status === 'pending' && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => handleVerification('verified')}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Check size={16} className="mr-2" />
                  {loading ? 'Processing...' : 'Approve Verification'}
                </button>
                <button
                  onClick={() => handleVerification('unverified')}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <XCircle size={16} className="mr-2" />
                  {loading ? 'Processing...' : 'Reject Verification'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerificationModal
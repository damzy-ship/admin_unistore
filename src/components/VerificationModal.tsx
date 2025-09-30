import React from 'react'
import { X, Check, XCircle, User, Building, Home, BedSingle } from 'lucide-react'
import { UniqueVisitor, Hostel } from '../lib/supabase'
import {
  updateVerificationStatus,
  fetchHostelsBySchoolId, // Import new functions
  updateHostelMerchantStatus // Import new functions
} from '../hooks/useSupabaseData'
import { supabase } from '../lib/supabase'

interface VerificationModalProps {
  // Assuming UniqueVisitor interface has been updated to include:
  // is_hostel_merchant?: boolean
  user: UniqueVisitor & { is_hostel_merchant?: boolean } | null // Augment type locally for immediate use
  isOpen: boolean
  onClose: () => void
  onVerificationUpdate: (updated?: Partial<UniqueVisitor> | null) => void
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  user,
  isOpen,
  onClose,
  onVerificationUpdate
}) => {
  const [loading, setLoading] = React.useState(false)
  const [hostelLoading, setHostelLoading] = React.useState(false)
  const [message, setMessage] = React.useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

  // New state for hostel-related properties
  const [isHostelMerchant, setIsHostelMerchant] = React.useState(user?.is_hostel_merchant ?? false)
  const [selectedHostelId, setSelectedHostelId] = React.useState<string | null>(user?.hostel_id || null)
  const [roomNumber, setRoomNumber] = React.useState<string>(user?.room ?? '')
  const [hostels, setHostels] = React.useState<Hostel[]>([])

  // Load initial state and fetch hostels
  React.useEffect(() => {
    if (isOpen && user) {
      // Set initial values from user prop
      setIsHostelMerchant(user.is_hostel_merchant ?? false)
      setSelectedHostelId(user.hostel_id || null)
      setRoomNumber(user.room || '')

      // Fetch hostels if merchant and school_id exists
      if (user.user_type === 'merchant' && user.school_id) {
        setHostelLoading(true)
        fetchHostelsBySchoolId(user.school_id)
          .then(data => {
            setHostels(data)
            // Ensure selectedHostelId is valid after fetching
            if (user.hostel_id && !data.find(h => h.id === user.hostel_id)) {
              setSelectedHostelId(null)
            }
          })
          .catch(err => {
            console.error('Error fetching hostels:', err)
            setMessage({ type: 'error', text: 'Unable to load hostels. Try again later.' })
          })
          .finally(() => {
            setHostelLoading(false)
          })
      }
    }
  }, [isOpen, user])


  // Helper to clear messages after a short timeout
  React.useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), 4000)
    return () => clearTimeout(t)
  }, [message])

  if (!isOpen || !user) return null

  // Handler for verification status update (Approve/Reject)
  const handleVerification = async (status: 'verified' | 'unverified') => {
    setLoading(true)
    try {
      await updateVerificationStatus(user.id, status)
      // fetch updated user and notify parent for immediate sync
      try {
        const { data: updatedUser, error } = await supabase
          .from('unique_visitors')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (error) {
          console.warn('Unable to fetch updated user after verification update', error)
          onVerificationUpdate(null)
        } else {
          onVerificationUpdate(updatedUser || null)
        }
      } catch (err) {
        console.warn('Unable to fetch updated user after verification update', err)
        onVerificationUpdate(null)
      }
      setMessage({ type: 'success', text: `User ${status === 'verified' ? 'approved' : 'rejected'} successfully.` })
      onClose()
    } catch (error) {
      console.error('Error updating verification status:', error)
      setMessage({ type: 'error', text: 'Failed to update verification status' })
    } finally {
      setLoading(false)
    }
  }

  // **NEW:** Handler for hostel merchant status update
  const handleHostelUpdate = async () => {
    if (!user) return

    // Validation
    let finalHostelId = selectedHostelId
    let finalRoomNumber = roomNumber ? roomNumber.trim() : null

    if (isHostelMerchant) {
      if (!finalHostelId) {
        setMessage({ type: 'error', text: 'Please select a hostel.' })
        return
      }
      if (!finalRoomNumber) {
        setMessage({ type: 'error', text: 'Please enter a room number.' })
        return
      }
    } else {
      // Clear values if no longer a hostel merchant
      finalHostelId = null
      finalRoomNumber = null
    }

    setLoading(true)
    try {
      await updateHostelMerchantStatus(
        user.id,
        isHostelMerchant,
        finalHostelId,
        finalRoomNumber
      )



      // Update local state immediately so UI reflects changes without waiting for parent re-fetch
      setIsHostelMerchant(isHostelMerchant)
      setSelectedHostelId(finalHostelId)
      setRoomNumber(finalRoomNumber ?? '')

      // Fetch the updated user record so parent can update immediately
      try {
        const { data: updatedUser, error } = await supabase
          .from('unique_visitors')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (error) {
          console.warn('Unable to fetch updated user after hostel update', error)
          onVerificationUpdate(null)
        } else {
          onVerificationUpdate(updatedUser || null)
        }
      } catch (err) {
        console.warn('Unable to fetch updated user after hostel update', err)
        onVerificationUpdate(null)
      }

      setMessage({ type: 'success', text: 'Hostel merchant status updated successfully.' })
      // Do not close the modal here, as the user might want to continue verification
    } catch (error) {
      console.error('Error updating hostel status:', error)
      setMessage({ type: 'error', text: 'Failed to update hostel merchant status' })
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
                {/* ... existing user info fields ... */}
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
                  <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.verification_status === 'verified'
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

            {/* **NEW:** Hostel Merchant Configuration */}
            {user.user_type === 'merchant' && (
              <div className="bg-gray-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-4 flex items-center">
                  <Home className="w-5 h-5 mr-2" /> Hostel Merchant Configuration
                </h4>

                {/* Toggle Button */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <label htmlFor="hostel-merchant-toggle" className="text-sm font-medium text-gray-700">
                    Is Hostel Merchant?
                  </label>
                  <button
                    id="hostel-merchant-toggle"
                    onClick={() => setIsHostelMerchant(prev => !prev)}
                    className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isHostelMerchant ? 'bg-blue-600' : 'bg-gray-200'}`}
                    disabled={loading}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${isHostelMerchant ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                </div>

                {/* Hostel and Room Inputs (Conditional) */}
                {isHostelMerchant && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Hostel Dropdown */}
                    <div>
                      <label htmlFor="hostel-select" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Associated Hostel
                      </label>
                      <div className="relative">
                        <select
                          id="hostel-select"
                          value={selectedHostelId || ''}
                          onChange={(e) => setSelectedHostelId(e.target.value || null)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          disabled={hostelLoading || loading}
                        >
                          {hostelLoading ? (
                            <option>Loading Hostels...</option>
                          ) : (
                            <>
                              <option value="">Select a Hostel</option>
                              {hostels.map(hostel => (
                                <option key={hostel.id} value={hostel.id}>
                                  {hostel.name}
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Room Input */}
                    <div>
                      <label htmlFor="room-input" className="block text-sm font-medium text-gray-700 mb-1">
                        Room Number / Identifier
                      </label>
                      <div className="relative flex items-center">
                        <BedSingle className="absolute left-3 w-4 h-4 text-gray-400" />
                        <input
                          id="room-input"
                          type="text"
                          value={roomNumber}
                          onChange={(e) => setRoomNumber(e.target.value)}
                          className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="e.g., Abel 13"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Message Alert */}
                {message && (
                  <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-50 text-green-800' : message.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
                    {message.text}
                  </div>
                )}

                {/* Hostel Update Button */}
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleHostelUpdate}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {loading ? 'Updating...' : 'Save Hostel Configuration'}
                  </button>
                </div>

              </div>
            )}

            {/* Verification Document (Existing) */}
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

            {/* Action Buttons (Existing) */}
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
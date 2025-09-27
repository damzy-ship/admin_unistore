import { useState, useEffect } from 'react'
import { supabase, UniqueVisitor, Invoice, MerchantProduct } from '../lib/supabase'

export interface RecentActivity {
  id: string
  type: 'user_registered' | 'merchant_registered' | 'invoice_created' | 'verification_request'
  title: string
  description: string
  created_at: string
  user_name?: string
  amount?: string
}

export interface SiteReview {
  id: string
  user_id: string
  user_name: string
  rating: number
  review_text?: string
  is_featured: boolean
  created_at: string
}

export interface RequestLog {
  id: string
  user_id: string
  university: string
  request_text: string
  created_at: string
  matched_seller_ids?: string[]
  generated_categories?: string[]
}

export const useUsers = (filters?: {
  verification_status?: string
  school?: string
  date_from?: string
  date_to?: string
}) => {
  const [users, setUsers] = useState<UniqueVisitor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('unique_visitors')
        .select(`
          *,
          schools (
            name,
            short_name
          )
        `)
        .eq('user_type', 'user')
        .order('created_at', { ascending: false })

      if (filters?.verification_status && filters.verification_status !== 'All') {
        query = query.eq('verification_status', filters.verification_status.toLowerCase())
      }

      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from)
      }

      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to)
      }

      const { data, error } = await query

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [filters])

  return { users, loading, error, refetch: fetchUsers }
}

export const useMerchants = (filters?: {
  verification_status?: string
  date_from?: string
  date_to?: string
}) => {
  const [merchants, setMerchants] = useState<UniqueVisitor[]>([])
  const [merchantProducts, setMerchantProducts] = useState<Record<string, MerchantProduct[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMerchants = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('unique_visitors')
        .select(`
          *,
          schools (
            name,
            short_name
          )
        `)
        .eq('user_type', 'merchant')
        .order('created_at', { ascending: false })

      if (filters?.verification_status && filters.verification_status !== 'All') {
        query = query.eq('verification_status', filters.verification_status.toLowerCase())
      }

      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from)
      }

      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to)
      }

      const { data: merchantsData, error } = await query

      if (error) throw error

      // Fetch products for each merchant
      const merchantIds = merchantsData?.map(m => m.id) || []
      if (merchantIds.length > 0) {
        const { data: productsData } = await supabase
          .from('merchant_products')
          .select('*')
          .in('merchant_id', merchantIds)

        const productsByMerchant = productsData?.reduce((acc, product) => {
          if (!acc[product.merchant_id]) {
            acc[product.merchant_id] = []
          }
          acc[product.merchant_id].push(product)
          return acc
        }, {} as Record<string, MerchantProduct[]>) || {}

        setMerchantProducts(productsByMerchant)
      }

      setMerchants(merchantsData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMerchants()
  }, [filters])

  return { merchants, merchantProducts, loading, error, refetch: fetchMerchants }
}

export const useProducts = (filters?: {
  merchant_id?: string
  is_available?: boolean
  is_featured?: boolean
  page?: number
  limit?: number
  search?: string
}) => {
  const [products, setProducts] = useState<MerchantProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        let query = supabase
          .from('merchant_products')
          .select(`*,
            unique_visitors (
              *,
              schools (name, short_name)
            )`)
          .order('created_at', { ascending: false })



        if (filters?.merchant_id) {
          query = query.eq('merchant_id', filters.merchant_id)
        }

        if (filters?.is_available !== undefined) {
          query = query.eq('is_available', filters.is_available)
        }

        if (filters?.is_featured !== undefined) {
          query = query.eq('is_featured', filters.is_featured)
        }

        const from = (options.page - 1) * options.limit
        const to = from + options.limit - 1
        query = query.range(from, to).order('created_at', { ascending: false })

        const { data, error } = await query;

        console.log(data)

        if (error) throw error
        setProducts(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filters])

  return { products, loading, error }
}

export const useInvoices = (filters?: {
  status?: string
  date_from?: string
  date_to?: string
  min_amount?: number
  max_amount?: number
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true)
      try {
        let query = supabase
          .from('invoices')
          .select('*')
          .order('created_at', { ascending: false })

        if (filters?.status && filters.status !== 'All') {
          query = query.eq('invoice_status', filters.status.toLowerCase())
        }

        if (filters?.date_from) {
          query = query.gte('created_at', filters.date_from)
        }

        if (filters?.date_to) {
          query = query.lte('created_at', filters.date_to)
        }

        const { data, error } = await query

        if (error) throw error

        let filteredData = data || []

        // Client-side filtering for amount range since it's stored as text
        if (filters?.min_amount !== undefined || filters?.max_amount !== undefined) {
          filteredData = filteredData.filter(invoice => {
            const amount = parseFloat(invoice.invoice_amount?.replace(/[^\d.-]/g, '') || '0')
            if (filters.min_amount !== undefined && amount < filters.min_amount) return false
            if (filters.max_amount !== undefined && amount > filters.max_amount) return false
            return true
          })
        }

        setInvoices(filteredData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [filters])

  return { invoices, loading, error }
}

export const useReviews = () => {
  const [reviews, setReviews] = useState<SiteReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('site_reviews')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setReviews(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  return { reviews, loading, error }
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMerchants: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
    userGrowthData: [] as { month: string; users: number; merchants: number }[],
    revenueData: [] as { month: string; revenue: number }[]
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get user count
        const { count: userCount } = await supabase
          .from('unique_visitors')
          .select('*', { count: 'exact', head: true })
          .eq('user_type', 'user')

        // Get merchant count
        const { count: merchantCount } = await supabase
          .from('unique_visitors')
          .select('*', { count: 'exact', head: true })
          .eq('user_type', 'merchant')

        // Get pending verifications
        const { count: pendingCount } = await supabase
          .from('unique_visitors')
          .select('*', { count: 'exact', head: true })
          .eq('verification_status', 'pending')

        // Get total revenue from invoices
        const { data: invoices } = await supabase
          .from('invoices')
          .select('invoice_amount, created_at')
          .eq('invoice_status', 'paid')

        const totalRevenue = invoices?.reduce((sum, invoice) => {
          const amount = parseFloat(invoice.invoice_amount?.replace(/[^\d.-]/g, '') || '0')
          return sum + amount
        }, 0) || 0

        // Get user growth data (last 7 months)
        const userGrowthData = []
        const revenueData = []
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

          // Users for this month
          const { count: monthlyUsers } = await supabase
            .from('unique_visitors')
            .select('*', { count: 'exact', head: true })
            .eq('user_type', 'user')
            .gte('created_at', monthStart.toISOString())
            .lte('created_at', monthEnd.toISOString())

          // Merchants for this month
          const { count: monthlyMerchants } = await supabase
            .from('unique_visitors')
            .select('*', { count: 'exact', head: true })
            .eq('user_type', 'merchant')
            .gte('created_at', monthStart.toISOString())
            .lte('created_at', monthEnd.toISOString())

          // Revenue for this month
          const { data: monthlyInvoices } = await supabase
            .from('invoices')
            .select('invoice_amount')
            .eq('invoice_status', 'paid')
            .gte('created_at', monthStart.toISOString())
            .lte('created_at', monthEnd.toISOString())

          const monthlyRevenue = monthlyInvoices?.reduce((sum, invoice) => {
            const amount = parseFloat(invoice.invoice_amount?.replace(/[^\d.-]/g, '') || '0')
            return sum + amount
          }, 0) || 0

          userGrowthData.push({
            month: months[6 - i],
            users: monthlyUsers || 0,
            merchants: monthlyMerchants || 0
          })

          revenueData.push({
            month: months[6 - i],
            revenue: monthlyRevenue
          })
        }

        // Get recent activity
        const activity: RecentActivity[] = []

        // Recent users
        const { data: recentUsers } = await supabase
          .from('unique_visitors')
          .select('*')
          .eq('user_type', 'user')
          .order('created_at', { ascending: false })
          .limit(3)

        recentUsers?.forEach(user => {
          activity.push({
            id: user.id,
            type: 'user_registered',
            title: 'New user registered',
            description: `${user.full_name || 'Unknown User'} just created an account`,
            created_at: user.created_at,
            user_name: user.full_name
          })
        })

        // Recent merchants
        const { data: recentMerchants } = await supabase
          .from('unique_visitors')
          .select('*')
          .eq('user_type', 'merchant')
          .order('created_at', { ascending: false })
          .limit(2)

        recentMerchants?.forEach(merchant => {
          activity.push({
            id: merchant.id,
            type: 'merchant_registered',
            title: 'New merchant added',
            description: `${merchant.brand_name || merchant.full_name || 'Unknown Merchant'} joined as a merchant`,
            created_at: merchant.created_at,
            user_name: merchant.brand_name || merchant.full_name
          })
        })

        // Recent invoices
        const { data: recentInvoices } = await supabase
          .from('invoices')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(2)

        recentInvoices?.forEach(invoice => {
          activity.push({
            id: invoice.id,
            type: 'invoice_created',
            title: 'New transaction',
            description: `₦${parseFloat(invoice.invoice_amount?.replace(/[^\d.-]/g, '') || '0').toLocaleString()} payment from ${invoice.customer_name || 'Unknown Customer'}`,
            created_at: invoice.created_at,
            amount: invoice.invoice_amount
          })
        })

        // Recent verification requests
        const { data: pendingVerifications } = await supabase
          .from('unique_visitors')
          .select('*')
          .eq('verification_status', 'pending')
          .order('created_at', { ascending: false })
          .limit(2)

        pendingVerifications?.forEach(user => {
          activity.push({
            id: user.id,
            type: 'verification_request',
            title: 'Verification request',
            description: `${user.brand_name || user.full_name || 'Unknown User'} submitted verification documents`,
            created_at: user.created_at,
            user_name: user.brand_name || user.full_name
          })
        })

        // Sort activity by date
        activity.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        setStats({
          totalUsers: userCount || 0,
          totalMerchants: merchantCount || 0,
          totalRevenue,
          pendingVerifications: pendingCount || 0,
          userGrowthData,
          revenueData
        })

        setRecentActivity(activity.slice(0, 6))
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, recentActivity, loading }
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    usersBySchool: [] as { school: string; count: number }[],
    merchantsByVerificationStatus: [] as { status: string; count: number }[],
    revenueByMonth: [] as { month: string; revenue: number }[],
    topCategories: [] as { category: string; count: number }[],
    requestsByUniversity: [] as { university: string; count: number }[],
    averageRating: 0,
    totalRequests: 0,
    totalProducts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Users by school
        const { data: schools } = await supabase
          .from('schools')
          .select('short_name, id')

        const usersBySchool = []
        for (const school of schools || []) {
          const { count } = await supabase
            .from('unique_visitors')
            .select(`*
             schools (
              name,
              short_name
            )
            `, { count: 'exact', head: true })
            .eq('school_id', school.id)

          usersBySchool.push({
            school: school.short_name,
            count: count || 0
          })
        }

        // Merchants by verification status
        const statuses = ['verified', 'unverified', 'pending']
        const merchantsByVerificationStatus = []
        for (const status of statuses) {
          const { count } = await supabase
            .from('unique_visitors')
            .select('*', { count: 'exact', head: true })
            .eq('user_type', 'merchant')
            .eq('verification_status', status)

          merchantsByVerificationStatus.push({
            status: status.charAt(0).toUpperCase() + status.slice(1),
            count: count || 0
          })
        }

        // Revenue by month (last 12 months)
        const revenueByMonth = []
        for (let i = 11; i >= 0; i--) {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

          const { data: monthlyInvoices } = await supabase
            .from('invoices')
            .select('invoice_amount')
            .eq('invoice_status', 'paid')
            .gte('created_at', monthStart.toISOString())
            .lte('created_at', monthEnd.toISOString())

          const monthlyRevenue = monthlyInvoices?.reduce((sum, invoice) => {
            const amount = parseFloat(invoice.invoice_amount?.replace(/[^\d.-]/g, '') || '0')
            return sum + amount
          }, 0) || 0

          revenueByMonth.push({
            month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            revenue: monthlyRevenue
          })
        }

        // Top categories from products
        const { data: products } = await supabase
          .from('merchant_products')
          .select('product_categories')

        const categoryCount: Record<string, number> = {}
        products?.forEach(product => {
          product.product_categories?.forEach((category: string) => {
            categoryCount[category] = (categoryCount[category] || 0) + 1
          })
        })

        const topCategories = Object.entries(categoryCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([category, count]) => ({ category, count }))

        // Requests by university
        const { data: requests } = await supabase
          .from('request_logs')
          .select('university')

        const requestsByUniversity = requests?.reduce((acc, request) => {
          const existing = acc.find(item => item.university === request.university)
          if (existing) {
            existing.count++
          } else {
            acc.push({ university: request.university, count: 1 })
          }
          return acc
        }, [] as { university: string; count: number }[]) || []

        // Average rating
        const { data: reviews } = await supabase
          .from('site_reviews')
          .select('rating')

        const averageRating = reviews?.length ?
          reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

        // Total counts
        const { count: totalRequests } = await supabase
          .from('request_logs')
          .select('*', { count: 'exact', head: true })

        const { count: totalProducts } = await supabase
          .from('merchant_products')
          .select('*', { count: 'exact', head: true })

        setAnalytics({
          usersBySchool,
          merchantsByVerificationStatus,
          revenueByMonth,
          topCategories,
          requestsByUniversity,
          averageRating: Math.round(averageRating * 10) / 10,
          totalRequests: totalRequests || 0,
          totalProducts: totalProducts || 0
        })
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  return { analytics, loading }
}

export const updateVerificationStatus = async (userId: string, status: 'verified' | 'unverified') => {
  const updateData: any = { verification_status: status }
  if (status === 'unverified') {
    updateData.verification_id = null
  }

  const { error } = await supabase
    .from('unique_visitors')
    .update(updateData)
    .eq('id', userId)

  if (error) throw error
}
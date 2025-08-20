import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from 'boot/axios'

export const useAdminAuthStore = defineStore('adminAuth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('admin_token') || null)
  const loading = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => {
    return !!token.value && !!user.value && user.value.role === 'Admin'
  })

  const isAdmin = computed(() => {
    return user.value && user.value.role === 'Admin'
  })

  // Initialize auth state from localStorage
  const initializeAuth = () => {
    const storedToken = localStorage.getItem('admin_token')
    const storedUser = localStorage.getItem('admin_user')

    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }
  }

  // Initialize auth state immediately
  initializeAuth()

  const setUser = (userData) => {
    user.value = userData
  }

  const setLoading = (loadingState) => {
    loading.value = loadingState
  }

  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = ''
  }

  const adminLogin = async (credentials) => {
    setLoading(true)
    clearError()

    try {
      const response = await api.post('/api/v2/admin/login', credentials)

      if (response.data.status) {
        const userData = response.data.data.user
        const authToken = response.data.data.token

        setUser(userData)
        token.value = authToken
        localStorage.setItem('admin_user', JSON.stringify(userData))
        localStorage.setItem('admin_token', authToken)
        return { success: true, data: response.data }
      } else {
        setError(response.data.message || 'Login failed')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Get current user data
  const fetchUser = async () => {
    if (!token.value) {
      return { success: false, error: 'No token available' }
    }

    setLoading(true)
    clearError()

    try {
      const response = await api.get('/api/v2/admin/user')

      if (response.data.status) {
        user.value = response.data.data.user
        localStorage.setItem('admin_user', JSON.stringify(response.data.data.user))
        return { success: true, data: response.data.data.user }
      } else {
        setError(response.data.message || 'Failed to fetch user')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch user'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const adminLogout = async () => {
    setLoading(true)

    try {
      if (token.value) {
        await api.post('/api/v2/admin/logout')
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      token.value = null
      localStorage.removeItem('admin_user')
      localStorage.removeItem('admin_token')
      setLoading(false)
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    setUser,
    setLoading,
    setError,
    clearError,
    adminLogin,
    fetchUser,
    adminLogout,
    initializeAuth,
  }
})

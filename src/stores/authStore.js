import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from 'boot/axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => {
    return !!token.value && !!user.value
  })

  const setLoading = (loadingState) => {
    loading.value = loadingState
  }

  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = ''
  }

  // Login function
  const login = async (credentials) => {
    setLoading(true)
    clearError()

    try {
      const response = await api.post('/api/v2/admin/login', credentials)

      if (response.data.status) {
        const { user: userData } = response.data.data
        user.value = userData
        token.value = response.data.data.token || 'admin-token' // Use a placeholder token for admin
        localStorage.setItem('token', token.value)
        localStorage.setItem('user', JSON.stringify(userData))
        return { success: true, data: userData }
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
      const response = await api.get('/api/user')

      if (response.data.status) {
        user.value = response.data.data.user
        localStorage.setItem('user', JSON.stringify(response.data.data.user))
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

  // Logout function
  const logout = async () => {
    setLoading(true)

    try {
      // Call logout API if needed
      if (token.value) {
        await api.post('/api/v2/admin/logout')
      }
    } catch (err) {
      console.error('Logout API error:', err)
    } finally {
      // Clear local data
      user.value = null
      token.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setLoading(false)
    }
  }

  // Initialize auth state from localStorage
  const initializeAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    setLoading,
    setError,
    clearError,
    login,
    fetchUser,
    logout,
    initializeAuth,
  }
})

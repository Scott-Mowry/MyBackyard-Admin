import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref('')
  const status = ref('')
  const users = ref([])
  const usersLoading = ref(false)

  // Initialize auth state from localStorage
  const initializeAuth = async () => {
    const storedToken = localStorage.getItem('token')

    if (storedToken) {
      try {
        token.value = storedToken
        // Set the token in axios headers
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`

        // Verify token is still valid by making a request to get user data
        const response = await api.get('/user')
        // The /user endpoint returns user data directly, not wrapped in a data property
        user.value = response.data
        return true
      } catch {
        // Token is invalid, clear everything
        logout()
        return false
      }
    }
    return false
  }

  // Get user data from backend
  const fetchUserData = async () => {
    try {
      const response = await api.get('/user')
      // The /user endpoint returns user data directly, not wrapped in a data property
      user.value = response.data
      return true
    } catch (error) {
      // Check if it's a maintenance mode error
      if (error.response?.data?.maintenance_mode) {
        throw error // Re-throw maintenance mode errors
      }
      return false
    }
  }

  // Validate token and fetch user data
  const validateAndFetchUser = async () => {
    const storedToken = localStorage.getItem('token')

    if (!storedToken) {
      return false
    }

    try {
      // Set the token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
      token.value = storedToken

      // Fetch user data to validate token
      const success = await fetchUserData()
      if (success) {
        return true
      } else {
        // Token is invalid, clear everything
        logout()
        return false
      }
    } catch (error) {
      // Check if it's a maintenance mode error
      if (error.response?.data?.maintenance_mode) {
        throw error // Re-throw maintenance mode errors
      }

      // For other errors, clear auth and return false
      logout()
      return false
    }
  }

  // Actions
  const setUser = (userData) => {
    user.value = userData
  }

  const setToken = (tokenData) => {
    token.value = tokenData
    if (tokenData) {
      localStorage.setItem('token', tokenData)
      // Set the token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenData}`
    } else {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    }
  }

  const setLoading = (loadingState) => {
    loading.value = loadingState
  }

  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  const setStatus = (statusMessage) => {
    status.value = statusMessage
  }

  const clearError = () => {
    error.value = ''
  }

  const clearStatus = () => {
    status.value = ''
  }

  // API Methods
  const login = async (credentials) => {
    setLoading(true)
    clearError()
    clearStatus()
    try {
      const response = await api.post('/login', credentials)
      const {
        user: userData,
        token: tokenData,
        refresh_token: refreshToken,
        requires_2fa,
      } = response.data.data

      // Check if 2FA is required
      if (requires_2fa) {
        // Store temporary user data for 2FA verification
        setUser(userData)
        // Don't set the token yet - wait for 2FA verification
        setStatus('2fa_required')
        return { success: true, requires2FA: true, data: response.data }
      }

      // Normal login flow
      setUser(userData)
      setToken(tokenData)

      // Store refresh token if provided
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken)
      }

      setStatus('success')
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Admin login function
  const adminLogin = async (credentials) => {
    setLoading(true)
    clearError()
    clearStatus()
    try {
      const response = await api.post('/v2/admin/login', credentials)

      if (response.data.status) {
        const userData = response.data.data.user
        setUser(userData)
        // For admin login, we'll store the user data in localStorage
        localStorage.setItem('admin_user', JSON.stringify(userData))
        setStatus('success')
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

  const handleLoginRedirect = (router) => {
    // Check if 2FA is required
    if (status.value === '2fa_required') {
      router.push({
        path: '/auth/2fa',
        query: {
          email: user.value?.email,
          redirect: router.currentRoute.value.query.redirect,
        },
      })
      return
    }

    // Normal redirect
    const redirect = router.currentRoute.value.query.redirect
    if (redirect) {
      router.push(redirect)
    } else {
      router.push('/dashboard')
    }
  }

  const register = async (userData) => {
    setLoading(true)
    clearError()
    clearStatus()
    try {
      const response = await api.post('/register', userData)
      const { user: newUser, token: tokenData, refresh_token: refreshToken } = response.data.data
      setUser(newUser)
      setToken(tokenData)

      // Store refresh token if provided
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken)
      }

      setStatus('success')
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        await api.post('/logout')
      }
    } catch {
      // ignore
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('refresh_token')
      clearError()
      clearStatus()
    }
  }

  const forgotPassword = async (email) => {
    setLoading(true)
    clearError()
    clearStatus()
    try {
      const response = await api.post('/forgot-password', { email })
      setStatus('success')
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset link'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (resetData) => {
    setLoading(true)
    clearError()
    clearStatus()
    try {
      const response = await api.post('/reset-password', resetData)
      setStatus('success')
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password reset failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const verifyEmail = async (verificationData) => {
    setLoading(true)
    clearError()
    clearStatus()
    try {
      const response = await api.post('/verify-email', verificationData)

      // Update user data if verification was successful
      if (response.data.data?.user) {
        setUser(response.data.data.user)
      }

      setStatus('success')
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Email verification failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const resendVerification = async (email) => {
    setLoading(true)
    clearError()
    clearStatus()
    try {
      const response = await api.post('/resend-verification', { email })
      setStatus('success')
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to resend verification email'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const refreshToken = async () => {
    try {
      const response = await api.post('/refresh')
      const { user: userData, token: tokenData } = response.data.data
      setUser(userData)
      setToken(tokenData)
      return { success: true, data: response.data }
    } catch {
      logout()
      return { success: false, error: 'Token refresh failed' }
    }
  }

  const updateProfile = async (profileData) => {
    setLoading(true)
    clearError()
    clearStatus()
    try {
      const response = await api.put('/profile/', profileData)
      const { user: userData } = response.data.data
      setUser(userData)
      setStatus('success')
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Profile update failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (passwordData) => {
    setLoading(true)
    clearError()
    clearStatus()
    try {
      const response = await api.put('/profile/password', passwordData)
      setStatus('success')
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password change failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Profile Methods
  const getProfile = async () => {
    try {
      const response = await api.get('/profile/')
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to get profile'
      return { success: false, error: errorMessage }
    }
  }

  const uploadProfileImage = async (formData) => {
    setLoading(true)
    clearError()
    clearStatus()
    try {
      const response = await api.post('/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Handle the response format from ProfileController
      if (response.data.status === 'success' && response.data.data?.user) {
        setUser(response.data.data.user)
        setStatus('success')
        return { success: true, data: response.data }
      } else {
        throw new Error(response.data.message || 'Upload failed')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Image upload failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const removeProfileImage = async () => {
    setLoading(true)
    clearError()
    clearStatus()
    try {
      const response = await api.delete('/profile/image')

      // Handle the response format from ProfileController
      if (response.data.status === 'success' && response.data.data?.user) {
        setUser(response.data.data.user)
        setStatus('success')
        return { success: true, data: response.data }
      } else {
        throw new Error(response.data.message || 'Remove failed')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to remove image'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // 2FA Methods
  const getTwoFactorStatus = async () => {
    try {
      const response = await api.get('/2fa/status')
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to get 2FA status'
      return { success: false, error: errorMessage }
    }
  }

  const enableTwoFactor = async () => {
    setLoading(true)
    clearError()
    clearStatus()
    try {
      const response = await api.post('/2fa/enable')
      setStatus('success')
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to enable 2FA'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const confirmTwoFactor = async (code) => {
    setLoading(true)
    clearError()
    clearStatus()
    try {
      const response = await api.post('/2fa/confirm', { code })
      const { user: userData } = response.data.data
      setUser(userData)
      setStatus('success')
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to confirm 2FA'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const disableTwoFactor = async () => {
    setLoading(true)
    clearError()
    clearStatus()
    try {
      const response = await api.delete('/2fa/disable')
      const { user: userData } = response.data.data
      setUser(userData)
      setStatus('success')
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to disable 2FA'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const cancelTwoFactorSetup = async () => {
    try {
      const response = await api.delete('/2fa/enable')
      if (response.data.data?.user) {
        setUser(response.data.data.user)
      }
      return { success: true, data: response.data }
    } catch (err) {
      // Ignore errors when canceling setup
      return { success: false, error: err.message }
    }
  }

  const getQrCode = async () => {
    try {
      const response = await api.get('/2fa/qr-code')
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to get QR code'
      return { success: false, error: errorMessage }
    }
  }

  const refreshQrCode = async () => {
    try {
      const response = await api.get('/2fa/qr-code')
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to refresh QR code'
      return { success: false, error: errorMessage }
    }
  }

  // 2FA Methods
  const verifyTwoFactor = async (verificationData) => {
    setLoading(true)
    clearError()
    clearStatus()
    try {
      const response = await api.post('/2fa/verify', verificationData)
      const { user: userData, token: tokenData, refresh_token: refreshToken } = response.data.data

      // Complete the login process
      setUser(userData)
      setToken(tokenData)

      // Store refresh token if provided
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken)
      }

      setStatus('success')
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || '2FA verification failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const resendTwoFactorCode = async (email) => {
    setLoading(true)
    clearError()
    clearStatus()
    try {
      const response = await api.post('/2fa/resend', { email })
      setStatus('success')
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to resend 2FA code'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Getters
  const isAuthenticated = () => {
    const result = !!token.value && !!user.value
    return result
  }

  const hasRole = (role) => {
    return user.value?.role === role
  }

  const isSuperAdmin = () => {
    return user.value?.role === 'super-admin'
  }

  // Admin Methods
  const getUsers = async (params = {}) => {
    try {
      const response = await api.get('/admin/users', { params })
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch users'
      return { success: false, error: errorMessage }
    }
  }

  const loadAllUsers = async () => {
    try {
      usersLoading.value = true
      // Get all users without pagination
      const response = await api.get('/admin/users', {
        params: {
          per_page: 1000, // Get a large number to get all users
        },
      })

      if (response.data.data) {
        users.value = response.data.data
      }
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch users'
      return { success: false, error: errorMessage }
    } finally {
      usersLoading.value = false
    }
  }

  const getFilteredUsers = (filters = {}, pagination = { page: 1, rowsPerPage: 10 }) => {
    let filteredUsers = [...users.value]

    // Apply search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search),
      )
    }

    // Apply role filter
    if (filters.role) {
      filteredUsers = filteredUsers.filter((user) => user.role === filters.role)
    }

    // Apply status filter
    if (filters.status) {
      if (filters.status === 'verified') {
        filteredUsers = filteredUsers.filter((user) => user.email_verified_at)
      } else if (filters.status === 'unverified') {
        filteredUsers = filteredUsers.filter((user) => !user.email_verified_at)
      }
    }

    // Apply 2FA filter
    if (filters.two_factor) {
      filteredUsers = filteredUsers.filter((user) =>
        filters.two_factor === 'enabled' ? user.two_factor_enabled : !user.two_factor_enabled,
      )
    }

    // Apply date range filter
    if (filters.date_from) {
      filteredUsers = filteredUsers.filter(
        (user) => new Date(user.created_at) >= new Date(filters.date_from),
      )
    }
    if (filters.date_to) {
      filteredUsers = filteredUsers.filter(
        (user) => new Date(user.created_at) <= new Date(filters.date_to),
      )
    }

    // Apply sorting
    if (filters.sort_by) {
      const sortDirection = filters.sort_direction || 'asc'
      filteredUsers.sort((a, b) => {
        let aVal = a[filters.sort_by]
        let bVal = b[filters.sort_by]

        // Handle date sorting
        if (filters.sort_by === 'created_at' || filters.sort_by === 'updated_at') {
          aVal = new Date(aVal)
          bVal = new Date(bVal)
        }

        if (sortDirection === 'desc') {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
        } else {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
        }
      })
    }

    // Apply pagination
    const total = filteredUsers.length
    const startIndex = (pagination.page - 1) * pagination.rowsPerPage
    const endIndex = startIndex + pagination.rowsPerPage
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    return {
      data: paginatedUsers,
      pagination: {
        current_page: pagination.page,
        last_page: Math.ceil(total / pagination.rowsPerPage),
        per_page: pagination.rowsPerPage,
        total: total,
        from: total > 0 ? startIndex + 1 : 0,
        to: Math.min(endIndex, total),
      },
    }
  }

  const createUser = async (userData) => {
    try {
      const response = await api.post('/admin/users', userData)
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create user'
      return { success: false, error: errorMessage }
    }
  }

  const updateUser = async (userId, userData) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData)
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update user'
      return { success: false, error: errorMessage }
    }
  }

  const deleteUser = async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`)
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete user'
      return { success: false, error: errorMessage }
    }
  }

  const getUser = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`)
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch user'
      return { success: false, error: errorMessage }
    }
  }

  const getUserStats = async () => {
    try {
      const response = await api.get('/admin/users/stats')
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch user stats'
      return { success: false, error: errorMessage }
    }
  }

  const exportUsers = async (params = {}) => {
    try {
      const response = await api.get('/admin/users/export', {
        params,
        responseType: 'blob',
      })
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to export users'
      return { success: false, error: errorMessage }
    }
  }

  const bulkActionUsers = async (action, userIds, additionalData = {}) => {
    try {
      const response = await api.post('/admin/users/bulk-action', {
        action,
        user_ids: userIds,
        ...additionalData,
      })
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to perform bulk action'
      return { success: false, error: errorMessage }
    }
  }

  return {
    user,
    token,
    loading,
    error,
    status,
    users,
    usersLoading,
    setUser,
    setToken,
    setLoading,
    setError,
    setStatus,
    clearError,
    clearStatus,
    initializeAuth,
    fetchUserData,
    validateAndFetchUser,
    login,
    adminLogin,
    handleLoginRedirect,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    refreshToken,
    updateProfile,
    changePassword,
    getProfile,
    uploadProfileImage,
    removeProfileImage,
    getTwoFactorStatus,
    enableTwoFactor,
    confirmTwoFactor,
    disableTwoFactor,
    cancelTwoFactorSetup,
    getQrCode,
    refreshQrCode,
    verifyTwoFactor,
    resendTwoFactorCode,
    isAuthenticated,
    hasRole,
    isSuperAdmin,
    getUsers,
    loadAllUsers,
    getFilteredUsers,
    createUser,
    updateUser,
    deleteUser,
    getUser,
    getUserStats,
    exportUsers,
    bulkActionUsers,
  }
})

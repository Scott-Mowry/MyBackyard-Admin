import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/axios'

export const useUserStore = defineStore('user', () => {
  const users = ref([])
  const loading = ref(false)
  const error = ref('')
  const pagination = ref({
    page: 1,
    rowsPerPage: 30,
    rowsNumber: 0,
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

  // Get all users
  const fetchUsers = async (params = {}) => {
    setLoading(true)
    clearError()

    try {
      const queryParams = new URLSearchParams()

      // Add pagination params
      if (params.page) queryParams.append('page', params.page)
      if (params.per_page) queryParams.append('per_page', params.per_page)

      // Add filter params
      if (params.search) queryParams.append('search', params.search)
      if (params.role) queryParams.append('role', params.role)
      if (params.status) queryParams.append('status', params.status)

      const queryString = queryParams.toString()
      const url = `/api/v2/admin/users${queryString ? `?${queryString}` : ''}`

      const response = await api.get(url)

      if (response.data.status) {
        users.value = response.data.data
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message || 'Failed to fetch users')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch users'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Get user by ID
  const fetchUserById = async (userId) => {
    setLoading(true)
    clearError()

    try {
      const response = await api.get(`/v2/admin/users/${userId}`)

      if (response.data.status) {
        return { success: true, data: response.data.data }
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

  // Action user (block/unblock)
  const actionUser = async (userId, status) => {
    setLoading(true)
    clearError()

    try {
      const response = await api.get(`/api/v2/admin/users/action/${userId}/${status}`)

      if (response.data.status) {
        // Refresh users list after action
        await fetchUsers()
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message || 'Failed to update user')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update user'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Create new user
  const createUser = async (userData) => {
    setLoading(true)
    clearError()

    try {
      const response = await api.post('/api/v2/admin/users', userData)

      if (response.data.status) {
        // Refresh users list after creation
        await fetchUsers()
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message || 'Failed to create user')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create user'
      const validationErrors = err.response?.data?.errors || null

      // Handle authentication errors
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.')
        // The axios interceptor will handle the redirect
      } else {
        setError(errorMessage)
      }

      return {
        success: false,
        error: errorMessage,
        validationErrors: validationErrors,
      }
    } finally {
      setLoading(false)
    }
  }

  // Update user
  const updateUser = async (userId, userData) => {
    setLoading(true)
    clearError()

    try {
      const response = await api.put(`/api/v2/admin/users/${userId}`, userData)

      if (response.data.status) {
        // Refresh users list after update
        await fetchUsers()
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message || 'Failed to update user')
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update user'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Get filtered users
  const getFilteredUsers = (filters = {}) => {
    let filteredUsers = [...users.value]

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm) ||
          user.phone?.toLowerCase().includes(searchTerm),
      )
    }

    // Filter by status
    if (filters.status) {
      filteredUsers = filteredUsers.filter((user) => user.status === filters.status)
    }

    return filteredUsers
  }

  // Get user statistics
  const getUserStats = () => {
    const totalUsers = users.value.length
    const activeUsers = users.value.filter((user) => user.status === 'Active').length
    const blockedUsers = users.value.filter((user) => user.status === 'Block').length

    return {
      total: totalUsers,
      active: activeUsers,
      blocked: blockedUsers,
    }
  }

  return {
    users,
    loading,
    error,
    pagination,
    setLoading,
    setError,
    clearError,
    fetchUsers,
    fetchUserById,
    actionUser,
    createUser,
    updateUser,
    getFilteredUsers,
    getUserStats,
  }
})

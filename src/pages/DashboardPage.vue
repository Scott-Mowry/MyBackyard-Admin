<template>
  <q-page class="dashboard-page">
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="text-h4 text-weight-bold text-grey-9">Admin Dashboard</h1>
          <p class="text-body1 text-grey-6">Welcome back, {{ adminUser?.name || 'Admin' }}</p>
        </div>
        <div class="header-actions">
          <q-btn label="Logout" color="negative" outline @click="handleLogout" :loading="loading" />
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <q-card class="stat-card">
          <q-card-section>
            <div class="stat-content">
              <div class="stat-icon">
                <q-icon name="people" size="48px" color="primary" />
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.totalUsers || 0 }}</div>
                <div class="stat-label">Total Users</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="stat-card">
          <q-card-section>
            <div class="stat-content">
              <div class="stat-icon">
                <q-icon name="check_circle" size="48px" color="positive" />
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.totalActiveUsers || 0 }}</div>
                <div class="stat-label">Active Users</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="stat-card">
          <q-card-section>
            <div class="stat-content">
              <div class="stat-icon">
                <q-icon name="credit_card" size="48px" color="warning" />
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.totalpayingCustomer || 0 }}</div>
                <div class="stat-label">Paying Customers</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="stat-card">
          <q-card-section>
            <div class="stat-content">
              <div class="stat-icon">
                <q-icon name="category" size="48px" color="info" />
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.totalCategories || 0 }}</div>
                <div class="stat-label">Categories</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2 class="text-h5 text-weight-bold text-grey-9 q-mb-md">Quick Actions</h2>
        <div class="actions-grid">
          <q-card class="action-card" clickable @click="navigateTo('/users')">
            <q-card-section>
              <div class="action-content">
                <q-icon name="people" size="32px" color="primary" />
                <div class="action-text">Manage Users</div>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="action-card" clickable @click="navigateTo('/categories')">
            <q-card-section>
              <div class="action-content">
                <q-icon name="category" size="32px" color="info" />
                <div class="action-text">Manage Categories</div>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="action-card" clickable @click="navigateTo('/promocodes')">
            <q-card-section>
              <div class="action-content">
                <q-icon name="local_offer" size="32px" color="warning" />
                <div class="action-text">Promo Codes</div>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="action-card" clickable @click="navigateTo('/places')">
            <q-card-section>
              <div class="action-content">
                <q-icon name="place" size="32px" color="positive" />
                <div class="action-text">Manage Places</div>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="action-card" clickable @click="navigateTo('/cms')">
            <q-card-section>
              <div class="action-content">
                <q-icon name="article" size="32px" color="secondary" />
                <div class="action-text">CMS Content</div>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="action-card" clickable @click="navigateTo('/stock-images')">
            <q-card-section>
              <div class="action-content">
                <q-icon name="image" size="32px" color="accent" />
                <div class="action-text">Stock Images</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { useAdminAuthStore } from 'stores/adminAuth'
import { useRouter } from 'vue-router'

const authStore = useAdminAuthStore()
const router = useRouter()

const stats = ref({
  totalUsers: 0,
  totalActiveUsers: 0,
  totalInactiveUsers: 0,
  totalpayingCustomer: 0,
  totalCategories: 0,
})

const loading = ref(false)

// Computed property for admin user
const adminUser = computed(() => authStore.user)

const fetchDashboardStats = async () => {
  try {
    const response = await api.get('/api/v2/admin/dashboard')
    if (response.data.status) {
      stats.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
  }
}

const handleLogout = async () => {
  loading.value = true
  try {
    await authStore.adminLogout()
    router.push('/auth/login')
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    loading.value = false
  }
}

const navigateTo = (path) => {
  router.push(path)
}

onMounted(() => {
  // Initialize auth state
  authStore.initializeAuth()

  // Check authentication before loading dashboard
  if (authStore.isAuthenticated) {
    fetchDashboardStats()
  } else {
    router.push('/auth/login')
  }
})
</script>

<style scoped>
.dashboard-page {
  background: #f8fafc;
  min-height: 100vh;
}

.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content h1 {
  margin: 0 0 8px 0;
}

.header-content p {
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.quick-actions {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-card {
  border-radius: 8px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  cursor: pointer;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.action-text {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}
</style>

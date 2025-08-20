<template>
  <q-page class="q-pa-lg">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="q-mb-xl">
        <div class="row items-center justify-between">
          <div class="col">
            <h1 class="text-h4 text-weight-bold text-grey-9 q-mb-xs">User Management</h1>
            <p class="text-body1 text-grey-6">Manage all users in the system</p>
          </div>
          <div class="col-auto">
            <q-btn
              label="New User"
              color="primary"
              icon="person_add"
              @click="showCreateDialog = true"
            />
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row q-col-gutter-lg q-mb-xl">
        <div class="col-12 col-md-4">
          <q-card class="stat-card">
            <q-card-section>
              <div class="row items-center">
                <div class="col-auto">
                  <q-icon name="people" size="48px" color="primary" />
                </div>
                <div class="col q-ml-md">
                  <div class="text-h4 text-weight-bold text-grey-9">{{ stats.total }}</div>
                  <div class="text-body2 text-grey-6">Total Users</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card class="stat-card">
            <q-card-section>
              <div class="row items-center">
                <div class="col-auto">
                  <q-icon name="check_circle" size="48px" color="positive" />
                </div>
                <div class="col q-ml-md">
                  <div class="text-h4 text-weight-bold text-grey-9">{{ stats.active }}</div>
                  <div class="text-body2 text-grey-6">Active Users</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-3">
          <q-card class="stat-card">
            <q-card-section>
              <div class="row items-center">
                <div class="col-auto">
                  <q-icon name="block" size="48px" color="negative" />
                </div>
                <div class="col q-ml-md">
                  <div class="text-h4 text-weight-bold text-grey-9">{{ stats.blocked }}</div>
                  <div class="text-body2 text-grey-6">Blocked Users</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Filters -->
      <q-card flat bordered class="q-mb-lg">
        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input
                v-model="filters.search"
                placeholder="Search users..."
                outlined
                dense
                clearable
                @update:model-value="onSearchChange"
              >
                <template #prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="filters.role"
                :options="roleOptions"
                emit-value
                map-options
                outlined
                dense
                clearable
                label="Filter by role"
                @update:model-value="onFilterChange"
              />
            </div>

            <div class="col-12 col-md-2">
              <q-btn
                label="Clear"
                color="primary"
                outline
                @click="clearFilters"
                class="full-width"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Users Table -->
      <q-card flat bordered>
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between q-mb-lg">
            <div class="col">
              <h3 class="text-h6 text-weight-bold text-grey-9">
                Users ({{ filteredUsers.length }})
              </h3>
            </div>
            <div class="col-auto">
              <q-btn-group flat>
                <q-btn icon="refresh" @click="loadUsers" :loading="loading" />
                <q-btn icon="download" @click="exportUsers" :loading="loading" />
              </q-btn-group>
            </div>
          </div>

          <q-table
            :rows="filteredUsers"
            :columns="columns"
            :loading="loading"
            :pagination="{ ...pagination, rowsNumber: filteredUsers.length }"
            @request="onRequest"
            row-key="id"
            flat
            bordered
          >
            <!-- Role Column -->
            <template #body-cell-role="props">
              <q-td :props="props">
                <q-chip
                  :color="getRoleColor(props.value)"
                  :icon="getRoleIcon(props.value)"
                  size="sm"
                  dense
                >
                  {{ props.value }}
                </q-chip>
              </q-td>
            </template>

            <!-- Status Column -->
            <template #body-cell-status="props">
              <q-td :props="props">
                <q-chip
                  :color="props.value === 'Active' ? 'positive' : 'negative'"
                  :icon="props.value === 'Active' ? 'check_circle' : 'block'"
                  size="sm"
                  dense
                >
                  {{ props.value }}
                </q-chip>
              </q-td>
            </template>

            <!-- Actions Column -->
            <template #body-cell-actions="props">
              <q-td :props="props">
                <q-btn-group flat>
                  <q-btn
                    icon="visibility"
                    size="sm"
                    @click="viewUser(props.row)"
                    color="grey-7"
                    outline
                  />
                  <q-btn
                    icon="edit"
                    size="sm"
                    @click="editUser(props.row)"
                    color="grey-7"
                    outline
                  />
                  <q-btn
                    v-if="props.row.status === 'Active'"
                    icon="block"
                    size="sm"
                    @click="toggleUserStatus(props.row)"
                    color="negative"
                    outline
                  />
                  <q-btn
                    v-if="props.row.status === 'Block'"
                    icon="check_circle"
                    size="sm"
                    @click="toggleUserStatus(props.row)"
                    color="positive"
                    outline
                  />
                </q-btn-group>
              </q-td>
            </template>

            <!-- Created At Column -->
            <template #body-cell-created_at="props">
              <q-td :props="props">
                {{ formatDate(props.value) }}
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- Create/Edit User Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="q-pb-none">
          <h3 class="text-h6 text-weight-bold text-grey-9">
            {{ editingUser ? 'Edit User' : 'Add User' }}
          </h3>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="saveUser" class="q-gutter-md">
            <q-input
              v-model="userForm.name"
              label="Full Name"
              outlined
              dense
              :rules="[(val) => !!val || 'Name is required']"
            />

            <q-input
              v-model="userForm.email"
              label="Email"
              type="email"
              outlined
              dense
              :rules="[
                (val) => !!val || 'Email is required',
                (val) => validateEmail(val) || 'Please enter a valid email',
              ]"
            />

            <q-input
              v-model="userForm.password"
              label="Password"
              type="password"
              outlined
              dense
              :rules="[
                (val) => editingUser || !!val || 'Password is required for new users',
                (val) => !val || val.length >= 6 || 'Password must be at least 6 characters',
              ]"
              :hint="editingUser ? 'Leave blank to keep current password' : 'Password is required'"
              persistent-hint
            />

            <q-select
              v-model="userForm.role"
              :options="roleOptions"
              emit-value
              map-options
              label="Role"
              outlined
              dense
              :rules="[(val) => !!val || 'Role is required']"
            />

            <q-input v-model="userForm.phone" label="Phone" outlined dense />

            <div class="q-gutter-sm">
              <q-btn
                :label="editingUser ? 'Update User' : 'Add User'"
                type="submit"
                color="primary"
                :loading="saving"
              />
              <q-btn label="Cancel" flat @click="closeUserDialog" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- View User Dialog -->
    <q-dialog v-model="showUserDialog">
      <q-card style="min-width: 500px; max-width: 600px">
        <q-card-section class="q-pb-none">
          <h3 class="text-h6 text-weight-bold text-grey-9">User Details</h3>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Name</label>
                <div class="detail-value">{{ selectedUser?.name }}</div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Email</label>
                <div class="detail-value">{{ selectedUser?.email }}</div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Phone</label>
                <div class="detail-value">{{ selectedUser?.phone || 'Not provided' }}</div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Role</label>
                <div class="detail-value">
                  <q-chip
                    :color="getRoleColor(selectedUser?.role)"
                    :icon="getRoleIcon(selectedUser?.role)"
                    size="sm"
                    dense
                  >
                    {{ selectedUser?.role }}
                  </q-chip>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Status</label>
                <div class="detail-value">
                  <q-chip
                    :color="selectedUser?.status === 'Active' ? 'positive' : 'negative'"
                    :icon="selectedUser?.status === 'Active' ? 'check_circle' : 'block'"
                    size="sm"
                    dense
                  >
                    {{ selectedUser?.status }}
                  </q-chip>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Created</label>
                <div class="detail-value">{{ formatDate(selectedUser?.created_at) }}</div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Close" flat @click="showUserDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useUserStore } from 'stores/userStore'
import { useAdminAuthStore } from 'stores/adminAuth'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const userStore = useUserStore()
const authStore = useAdminAuthStore()
const router = useRouter()

// State
const loading = ref(false)
const saving = ref(false)
const users = ref([])
const showCreateDialog = ref(false)
const showUserDialog = ref(false)
const editingUser = ref(null)
const selectedUser = ref(null)

// Computed properties
const filteredUsers = computed(() => {
  let filtered = users.value

  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter(
      (user) =>
        (user.name && user.name.toLowerCase().includes(searchTerm)) ||
        (user.email && user.email.toLowerCase().includes(searchTerm)) ||
        (user.phone && user.phone.toLowerCase().includes(searchTerm)) ||
        (user.role && user.role.toLowerCase().includes(searchTerm)),
    )
  }

  // Apply role filter
  if (filters.role) {
    filtered = filtered.filter((user) => user.role && user.role === filters.role)
  }

  // Apply status filter
  if (filters.status) {
    filtered = filtered.filter((user) => user.status && user.status === filters.status)
  }

  return filtered
})

const stats = computed(() => {
  const total = users.value.length
  const active = users.value.filter((user) => user.status === 'Active').length
  const blocked = users.value.filter((user) => user.status === 'Block').length

  return {
    total,
    active,
    blocked,
  }
})

// Filters
const filters = reactive({
  search: '',
  role: null,
  status: null,
})

// Pagination
const pagination = reactive({
  page: 1,
  rowsPerPage: 30,
  total: 0,
})

// Form
const userForm = reactive({
  name: '',
  email: '',
  password: '',
  role: 'User',
  phone: '',
})

// Options
const roleOptions = [
  { label: 'All', value: null },
  { label: 'User', value: 'User' },
  { label: 'Business', value: 'Business' },
  { label: 'Admin', value: 'Admin' },
]

// Table columns
const columns = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    sortable: true,
    align: 'left',
  },
  {
    name: 'name',
    label: 'Name',
    field: 'name',
    sortable: true,
    align: 'left',
  },
  {
    name: 'email',
    label: 'Email',
    field: 'email',
    sortable: true,
    align: 'left',
  },
  {
    name: 'phone',
    label: 'Phone',
    field: 'phone',
    sortable: true,
    align: 'left',
  },
  {
    name: 'role',
    label: 'Role',
    field: 'role',
    sortable: true,
    align: 'center',
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    sortable: true,
    align: 'center',
  },
  {
    name: 'created_at',
    label: 'Created',
    field: 'created_at',
    sortable: true,
    align: 'left',
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center',
  },
]

// Methods
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getRoleColor(role) {
  switch (role) {
    case 'Admin':
      return 'negative'
    case 'Business':
      return 'warning'
    case 'User':
      return 'primary'
    default:
      return 'grey'
  }
}

function getRoleIcon(role) {
  switch (role) {
    case 'Admin':
      return 'admin_panel_settings'
    case 'Business':
      return 'business'
    case 'User':
      return 'person'
    default:
      return 'help'
  }
}

async function loadUsers() {
  try {
    loading.value = true

    const result = await userStore.fetchUsers()
    if (result.success) {
      users.value = result.data
      pagination.total = result.data.length
    } else {
      $q.notify({
        type: 'negative',
        message: result.error || 'Failed to load users',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Failed to load users:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load users',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

function onRequest(props) {
  pagination.page = props.pagination.page
  pagination.rowsPerPage = props.pagination.rowsPerPage
  loadUsers()
}

function clearFilters() {
  filters.search = ''
  filters.role = null
  filters.status = null
  pagination.page = 1
}

function onSearchChange() {
  pagination.page = 1
}

function onFilterChange() {
  pagination.page = 1
}

async function exportUsers() {
  try {
    loading.value = true

    // Create CSV content
    const csvContent = [
      // CSV headers
      ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Created At'].join(','),
      // CSV data
      ...filteredUsers.value.map((user) =>
        [
          user.id,
          `"${user.name}"`,
          user.email,
          user.phone || '',
          user.role,
          user.status,
          user.created_at,
        ].join(','),
      ),
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    $q.notify({
      type: 'positive',
      message: 'Users exported successfully',
      position: 'top',
    })
  } catch (error) {
    console.error('Failed to export users:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to export users',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

function viewUser(user) {
  selectedUser.value = user
  showUserDialog.value = true
}

function editUser(user) {
  selectedUser.value = user
  editingUser.value = true
  userForm.name = user.name
  userForm.email = user.email
  userForm.password = ''
  userForm.role = user.role
  userForm.phone = user.phone || ''
  showCreateDialog.value = true
}

async function toggleUserStatus(user) {
  const status = user.status === 'Active' ? 1 : 0
  const action = user.status === 'Active' ? 'block' : 'activate'

  try {
    const result = await userStore.actionUser(user.id, status)
    if (result.success) {
      $q.notify({
        type: 'positive',
        message: `User ${action}d successfully`,
        position: 'top',
      })
      loadUsers() // Reload users to update status in table
    } else {
      $q.notify({
        type: 'negative',
        message: result.error || `Failed to ${action} user`,
        position: 'top',
      })
    }
  } catch {
    $q.notify({
      type: 'negative',
      message: 'An error occurred while updating user status',
      position: 'top',
    })
  }
}

async function saveUser() {
  const isNewUser = !editingUser.value
  const userId = selectedUser.value?.id

  try {
    saving.value = true

    const userData = {
      name: userForm.name,
      email: userForm.email,
      password: userForm.password,
      role: userForm.role,
      phone: userForm.phone,
    }

    if (isNewUser) {
      const result = await userStore.createUser(userData)
      if (result.success) {
        $q.notify({
          type: 'positive',
          message: 'User created successfully!',
          position: 'top',
        })
        closeUserDialog()
        loadUsers()
      } else {
        if (result.validationErrors) {
          const errorMessages = Object.values(result.validationErrors).flat().join(', ')
          $q.notify({
            type: 'negative',
            message: `Validation failed: ${errorMessages}`,
            position: 'top',
          })
        } else {
          $q.notify({
            type: 'negative',
            message: result.error || 'Failed to create user',
            position: 'top',
          })
        }
      }
    } else {
      const result = await userStore.updateUser(userId, userData)
      if (result.success) {
        $q.notify({
          type: 'positive',
          message: 'User updated successfully!',
          position: 'top',
        })
        closeUserDialog()
        loadUsers()
      } else {
        $q.notify({
          type: 'negative',
          message: result.error || 'Failed to update user',
          position: 'top',
        })
      }
    }
  } catch (error) {
    console.error('Error saving user:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'An error occurred while saving user changes',
      position: 'top',
    })
  } finally {
    saving.value = false
  }
}

function closeUserDialog() {
  showCreateDialog.value = false
  editingUser.value = false
  userForm.name = ''
  userForm.email = ''
  userForm.password = ''
  userForm.role = 'User'
  userForm.phone = ''
  selectedUser.value = null
}

// Lifecycle
onMounted(() => {
  // Initialize auth state
  authStore.initializeAuth()

  // Check authentication before loading users
  if (authStore.isAuthenticated) {
    loadUsers()
  } else {
    router.push('/auth/login')
  }
})
</script>

<style scoped>
.max-w-7xl {
  max-width: 1200px;
}

.q-mb-xl {
  margin-bottom: 48px;
}

.q-mb-lg {
  margin-bottom: 24px;
}

.q-pa-lg {
  padding: 24px;
}

.q-col-gutter-md {
  column-gap: 16px;
}

.q-col-gutter-lg {
  column-gap: 32px;
}

.q-btn-group {
  display: flex;
  gap: 8px;
}

.full-width {
  width: 100%;
}

.detail-item {
  margin-bottom: 12px;
}

.detail-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
  display: block;
}

.detail-value {
  color: #6b7280;
  font-size: 0.9em;
}

/* Stat Cards Styling */
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

.stat-card .q-card-section {
  padding: 24px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .q-col-gutter-md {
    column-gap: 12px;
  }

  .q-col-gutter-lg {
    column-gap: 16px;
  }

  .q-btn-group {
    flex-direction: column;
    gap: 12px;
  }

  .full-width {
    width: auto;
  }
}
</style>

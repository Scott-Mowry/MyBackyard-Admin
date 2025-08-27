<template>
  <q-page class="q-pa-lg">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="q-mb-xl">
        <div class="row items-center justify-between">
          <div class="col">
            <h1 class="text-h4 text-weight-bold text-grey-9 q-mb-xs">
              Subscribed Users Management
            </h1>
            <p class="text-body1 text-grey-6">Manage all subscribed users in the system</p>
          </div>
          <div class="col-auto">
            <q-btn
              label="Apply Promo Code"
              color="primary"
              icon="subscriptions"
              @click="showAssignSubscriptionDialog = true"
            />
          </div>
        </div>
      </div>

      <!-- Stats Cards -->

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

      <!-- Subscribed Users Table -->
      <q-card flat bordered>
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between q-mb-lg">
            <div class="col">
              <h3 class="text-h6 text-weight-bold text-grey-9">
                Subscribed Users ({{ filteredUsers.length }})
              </h3>
            </div>
            <div class="col-auto">
              <q-btn-group flat>
                <q-btn icon="refresh" @click="loadSubscribedUsers" :loading="loading" />
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

            <!-- Type Column -->
            <template #body-cell-type="props">
              <q-td :props="props">
                <q-chip :color="props.value === 'Annual' ? 'primary' : 'secondary'" size="sm" dense>
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
                <div class="detail-value">{{ selectedUser?.phone }}</div>
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
                <label class="detail-label">Subscription Type</label>
                <div class="detail-value">
                  <q-chip
                    :color="selectedUser?.type === 'Annual' ? 'primary' : 'secondary'"
                    size="sm"
                    dense
                  >
                    {{ selectedUser?.type }}
                  </q-chip>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Subscription ID</label>
                <div class="detail-value">{{ selectedUser?.sub_id }}</div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Created</label>
                <div class="detail-value">{{ formatDate(selectedUser?.created_at) }}</div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Updated</label>
                <div class="detail-value">{{ formatDate(selectedUser?.updated_at) }}</div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Close" flat @click="showUserDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Apply Promo Code Dialog -->
    <q-dialog v-model="showAssignSubscriptionDialog" persistent>
      <q-card style="min-width: 600px">
        <q-card-section class="q-pb-none">
          <h3 class="text-h6 text-weight-bold text-grey-9">Apply Promo Code</h3>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="submitAssignSubscription" class="q-gutter-md">
            <q-select
              v-model="assignSubscriptionForm.user_id"
              :options="filteredUserOptions"
              label="Select User"
              outlined
              dense
              use-input
              input-debounce="0"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              @filter="filterUsers"
              :rules="[(val) => !!val || 'User selection is required']"
              behavior="menu"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey"> No users found </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-select
              v-model="assignSubscriptionForm.subscription_id"
              :options="subscriptionOptions"
              label="Select Subscription"
              outlined
              dense
              option-label="label"
              option-value="value"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Subscription selection is required']"
              @update:model-value="onSubscriptionSelect"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey"> No subscriptions found </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-select
              v-model="assignSubscriptionForm.promo_code_id"
              :options="promoCodeOptions"
              label="Select Promo Code (Free Trial)"
              outlined
              dense
              option-label="label"
              option-value="value"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Promo code selection is required']"
              @update:model-value="onPromoCodeSelect"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey"> No promo codes found </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-input
              v-model="assignSubscriptionForm.sub_id"
              label="Subscription ID (Auto-filled from selection above)"
              outlined
              dense
              type="number"
              min="1"
              readonly
              :rules="[
                (val) => !!val || 'Subscription ID is required',
                (val) => val > 0 || 'Subscription ID must be greater than 0',
              ]"
              hint="Subscription ID is automatically filled when you select a subscription above"
              persistent-hint
            />

            <div class="q-gutter-sm">
              <q-btn
                label="Apply Promo Code"
                type="submit"
                color="primary"
                :loading="assigningSubscription"
              />
              <q-btn label="Cancel" flat @click="closeAssignSubscriptionDialog" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAdminAuthStore } from 'stores/adminAuth'
import { api } from 'boot/axios'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const authStore = useAdminAuthStore()
const router = useRouter()

// State
const loading = ref(false)
const assigningSubscription = ref(false)
const users = ref([])
const showUserDialog = ref(false)
const showAssignSubscriptionDialog = ref(false)
const selectedUser = ref(null)

// Computed properties
const filteredUsers = computed(() => {
  let filtered = users.value

  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm) ||
        user.price.toLowerCase().includes(searchTerm) ||
        user.type.toLowerCase().includes(searchTerm),
    )
  }

  // Apply status filter
  if (filters.status) {
    filtered = filtered.filter((user) => user.status === filters.status)
  }

  // Apply type filter
  if (filters.type) {
    filtered = filtered.filter((user) => user.type === filters.type)
  }

  return filtered
})

// Filters
const filters = reactive({
  search: '',
  status: '',
  type: '',
})

// Promo Code Form
const assignSubscriptionForm = reactive({
  user_id: '',
  subscription_id: '',
  sub_id: '',
  promo_code_id: '',
})

// User options for subscription assignment dialog
const userOptions = ref([])
const filteredUserOptions = ref([])

// Subscription options for assignment dialog
const subscriptionOptions = ref([])

// Promo code options for assignment dialog
const promoCodeOptions = ref([])

// Initialize user options when users are loaded
const initializeUserOptions = async () => {
  try {
    // Load all users (both User and Business types) for promo code selection
    const response = await api.get('/api/v2/admin/users')
    if (response.data.status) {
      userOptions.value = response.data.data.map((user) => ({
        label: `${user.name} (${user.email}) - ${user.role}`,
        value: user.id,
      }))
      filteredUserOptions.value = userOptions.value
    }
  } catch (error) {
    console.error('Failed to load all users for promo code selection:', error)
  }
}

// Load available subscriptions
const loadSubscriptions = async () => {
  try {
    const response = await api.get('/api/v2/admin/subscriptions')
    if (response.data.status) {
      subscriptionOptions.value = response.data.data.map((subscription) => ({
        label: `${subscription.name} - $${subscription.price} (${subscription.billing_cycle || subscription.type})`,
        value: subscription.id,
      }))
    }
  } catch (error) {
    console.error('Failed to load subscriptions:', error)
  }
}

// Load available promo codes
const loadPromoCodes = async () => {
  try {
    const response = await api.get('/api/v2/admin/business-promocodes')
    if (response.data.status) {
      // Filter only free trial promo codes
      const freeTrialPromoCodes = response.data.data.filter(
        (promoCode) => promoCode.discount_type === 'free_trial' && promoCode.status === 'active',
      )

      promoCodeOptions.value = freeTrialPromoCodes.map((promoCode) => ({
        label: `${promoCode.code} - ${promoCode.name} (${promoCode.free_days} days free trial)`,
        value: promoCode.id,
      }))
    }
  } catch (error) {
    console.error('Failed to load promo codes:', error)
  }
}

// Handle subscription selection
const onSubscriptionSelect = (subscriptionId) => {
  if (subscriptionId) {
    assignSubscriptionForm.sub_id = subscriptionId
  } else {
    assignSubscriptionForm.sub_id = ''
  }
}

// Handle promo code selection
const onPromoCodeSelect = (promoCodeId) => {
  if (promoCodeId) {
    assignSubscriptionForm.promo_code_id = promoCodeId
  } else {
    assignSubscriptionForm.promo_code_id = ''
  }
}

// Filter users function
const filterUsers = (val, update) => {
  update(() => {
    if (val === '') {
      filteredUserOptions.value = userOptions.value
    } else {
      const needle = val.toLowerCase()
      filteredUserOptions.value = userOptions.value.filter(
        (user) => user.label.toLowerCase().indexOf(needle) > -1,
      )
    }
  })
}

// Pagination
const pagination = reactive({
  page: 1,
  rowsPerPage: 30,
  total: 0,
})

// Table columns
const columns = [
  {
    name: 'id',
    label: 'S.No',
    field: 'id',
    sortable: true,
    align: 'left',
  },
  {
    name: 'role',
    label: 'Role',
    field: 'role',
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
    name: 'price',
    label: 'Price',
    field: 'price',
    sortable: true,
    align: 'left',
  },
  {
    name: 'type',
    label: 'Type',
    field: 'type',
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
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center',
  },
]

// Methods
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

async function loadSubscribedUsers() {
  try {
    loading.value = true

    const response = await api.get('/api/v2/admin/subscribedUsers')

    if (response.data.status) {
      users.value = response.data.data
      pagination.total = response.data.data.length
      await initializeUserOptions() // Initialize user options for subscription assignment dialog
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.message || 'Failed to load subscribed users',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Failed to load subscribed users:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load subscribed users',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

function onRequest(props) {
  pagination.page = props.pagination.page
  pagination.rowsPerPage = props.pagination.rowsPerPage
}

function clearFilters() {
  filters.search = ''
  filters.status = ''
  filters.type = ''
  pagination.page = 1
}

function onSearchChange() {
  pagination.page = 1
}

async function exportUsers() {
  try {
    loading.value = true

    // Create CSV content
    const csvContent = [
      // CSV headers
      ['S.No', 'Role', 'Name', 'Email', 'Price', 'Type', 'Status'].join(','),
      // CSV data
      ...filteredUsers.value.map((user) =>
        [
          user.id,
          user.role,
          `"${user.name}"`,
          `"${user.email}"`,
          user.price,
          user.type,
          user.status,
        ].join(','),
      ),
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscribed_users_export_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    $q.notify({
      type: 'positive',
      message: 'Subscribed users exported successfully',
      position: 'top',
    })
  } catch (error) {
    console.error('Failed to export subscribed users:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to export subscribed users',
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

async function submitAssignSubscription() {
  try {
    assigningSubscription.value = true

    // Debug: Log the form data being sent
    console.log('Sending apply promo code data:', {
      user_id: assignSubscriptionForm.user_id,
      subscription_id: assignSubscriptionForm.subscription_id,
      promo_code_id: assignSubscriptionForm.promo_code_id,
    })

    const response = await api.post('/api/v2/admin/applyPromoCode', {
      user_id: assignSubscriptionForm.user_id,
      subscription_id: assignSubscriptionForm.subscription_id,
      promo_code_id: assignSubscriptionForm.promo_code_id,
    })

    // Debug: Log the response
    console.log('Apply promo code response:', response.data)

    if (response.data.status) {
      $q.notify({
        type: 'positive',
        message: 'Promo code applied successfully!',
        position: 'top',
      })
      closeAssignSubscriptionDialog()
      loadSubscribedUsers() // Reload users to update the table
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.message || 'Failed to apply promo code',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Error applying promo code:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'An error occurred while applying the promo code',
      position: 'top',
    })
  } finally {
    assigningSubscription.value = false
  }
}

function closeAssignSubscriptionDialog() {
  showAssignSubscriptionDialog.value = false
  assignSubscriptionForm.user_id = ''
  assignSubscriptionForm.subscription_id = ''
  assignSubscriptionForm.sub_id = ''
  assignSubscriptionForm.promo_code_id = ''
}

// Lifecycle
onMounted(async () => {
  // Initialize auth state
  authStore.initializeAuth()

  // Check authentication before loading users
  if (authStore.isAuthenticated) {
    await loadSubscribedUsers()
    await initializeUserOptions() // Initialize user options for subscription assignment dialog
    await loadSubscriptions() // Load subscriptions for the dialog
    await loadPromoCodes() // Load promo codes for the dialog
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

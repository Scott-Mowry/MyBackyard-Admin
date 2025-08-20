<template>
  <q-page class="q-pa-lg">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="q-mb-xl">
        <div class="row items-center justify-between">
          <div class="col">
            <h1 class="text-h4 text-weight-bold text-grey-9 q-mb-xs">Receipts Management</h1>
            <p class="text-body1 text-grey-6">View and manage all payment receipts in the system</p>
          </div>
          <div class="col-auto">
            <q-btn
              label="Export Data"
              color="primary"
              icon="download"
              @click="exportReceipts"
              :loading="loading"
              class="q-mr-md"
            />
          </div>
        </div>
      </div>

      <!-- Filters -->
      <q-card flat bordered class="q-mb-lg">
        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-3">
              <q-input
                v-model="filters.search"
                placeholder="Search by user name or email..."
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
              <q-select
                v-model="filters.status"
                :options="statusOptions"
                placeholder="Status"
                outlined
                dense
                clearable
                @update:model-value="onFilterChange"
              />
            </div>

            <div class="col-12 col-md-2">
              <q-select
                v-model="filters.payment_type"
                :options="paymentTypeOptions"
                placeholder="Payment Type"
                outlined
                dense
                clearable
                @update:model-value="onFilterChange"
              />
            </div>

            <div class="col-12 col-md-2">
              <q-input
                v-model="filters.date_from"
                placeholder="From Date"
                outlined
                dense
                type="date"
                @update:model-value="onFilterChange"
              />
            </div>

            <div class="col-12 col-md-2">
              <q-input
                v-model="filters.date_to"
                placeholder="To Date"
                outlined
                dense
                type="date"
                @update:model-value="onFilterChange"
              />
            </div>

            <div class="col-12 col-md-1">
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

      <!-- Receipts Table -->
      <q-card flat bordered>
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between q-mb-lg">
            <div class="col">
              <h3 class="text-h6 text-weight-bold text-grey-9">
                Receipts ({{ tablePagination.rowsNumber }})
              </h3>
            </div>
            <div class="col-auto">
              <q-btn-group flat>
                <q-btn icon="refresh" @click="loadReceipts" :loading="loading" />
              </q-btn-group>
            </div>
          </div>

          <q-table
            :rows="receipts"
            :columns="columns"
            :loading="loading"
            v-model:pagination="tablePagination"
            @request="onTableRequest"
            row-key="id"
            flat
            bordered
            :rows-per-page-options="[10, 25, 50, 100]"
            :rows-per-page-label="'Records per page:'"
            :no-data-label="'No receipts found'"
            :loading-label="'Loading receipts...'"
          >
            <!-- User Column -->
            <template #body-cell-user="props">
              <q-td :props="props">
                <div class="column">
                  <div class="text-weight-medium">{{ props.value.name }}</div>
                  <div class="text-caption text-grey-6">{{ props.value.email }}</div>
                  <q-chip
                    :color="props.value.role === 'Business' ? 'primary' : 'secondary'"
                    size="sm"
                    dense
                  >
                    {{ props.value.role }}
                  </q-chip>
                </div>
              </q-td>
            </template>

            <!-- Subscription Column -->
            <template #body-cell-subscription="props">
              <q-td :props="props">
                <div class="column">
                  <div class="text-weight-medium">{{ props.value.name }}</div>
                  <div class="text-caption text-grey-6">{{ props.value.type }}</div>
                  <div class="text-caption text-primary">${{ props.value.price }}</div>
                </div>
              </q-td>
            </template>

            <!-- Amount Column -->
            <template #body-cell-amount="props">
              <q-td :props="props">
                <span class="text-weight-medium" :class="getAmountClass(props.value)">
                  ${{ formatAmount(props.value) }}
                </span>
              </q-td>
            </template>

            <!-- Status Column -->
            <template #body-cell-status="props">
              <q-td :props="props">
                <q-chip
                  :color="getStatusColor(props.row)"
                  size="sm"
                  dense
                  :label="getStatusLabel(props.row)"
                />
              </q-td>
            </template>

            <!-- Payment Type Column -->
            <template #body-cell-payment_type="props">
              <q-td :props="props">
                <q-chip
                  :color="getPaymentTypeColor(props.value)"
                  size="sm"
                  dense
                  :label="props.value"
                />
              </q-td>
            </template>

            <!-- Actions Column -->
            <template #body-cell-actions="props">
              <q-td :props="props">
                <q-btn-group flat>
                  <q-btn
                    icon="visibility"
                    size="sm"
                    @click="viewReceipt(props.row)"
                    color="primary"
                    outline
                  />
                  <q-btn
                    icon="receipt"
                    size="sm"
                    @click="downloadReceipt(props.row)"
                    color="secondary"
                    outline
                  />
                </q-btn-group>
              </q-td>
            </template>

            <!-- Pagination Slot -->
            <template #bottom>
              <div class="row items-center justify-between q-pa-md">
                <div class="text-caption">
                  Showing {{ (tablePagination.page - 1) * tablePagination.rowsPerPage + 1 }} to
                  {{
                    Math.min(
                      tablePagination.page * tablePagination.rowsPerPage,
                      tablePagination.rowsNumber,
                    )
                  }}
                  of {{ tablePagination.rowsNumber }} records
                </div>
                <div class="row items-center q-gutter-sm">
                  <q-btn
                    flat
                    round
                    dense
                    :disable="tablePagination.page === 1"
                    @click="goToPage(1)"
                    icon="first_page"
                  />
                  <q-btn
                    flat
                    round
                    dense
                    :disable="tablePagination.page === 1"
                    @click="goToPage(tablePagination.page - 1)"
                    icon="chevron_left"
                  />
                  <span class="text-caption q-px-sm">
                    Page {{ tablePagination.page }} of
                    {{ Math.ceil(tablePagination.rowsNumber / tablePagination.rowsPerPage) }}
                  </span>
                  <q-btn
                    flat
                    round
                    dense
                    :disable="
                      tablePagination.page >=
                      Math.ceil(tablePagination.rowsNumber / tablePagination.rowsPerPage)
                    "
                    @click="goToPage(tablePagination.page + 1)"
                    icon="chevron_right"
                  />
                  <q-btn
                    flat
                    round
                    dense
                    :disable="
                      tablePagination.page >=
                      Math.ceil(tablePagination.rowsNumber / tablePagination.rowsPerPage)
                    "
                    @click="
                      goToPage(Math.ceil(tablePagination.rowsNumber / tablePagination.rowsPerPage))
                    "
                    icon="last_page"
                  />
                </div>
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <!-- Receipt Details Dialog -->
      <q-dialog v-model="showReceiptDialog" maximized>
        <q-card>
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Receipt Details</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section v-if="selectedReceipt">
            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6">
                <h6 class="text-weight-bold q-mb-md">User Information</h6>
                <q-list>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>Name</q-item-label>
                      <q-item-label>{{ selectedReceipt.user.name }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>Email</q-item-label>
                      <q-item-label>{{ selectedReceipt.user.email }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>Role</q-item-label>
                      <q-item-label>
                        <q-chip
                          :color="
                            selectedReceipt.user.role === 'Business' ? 'primary' : 'secondary'
                          "
                          size="sm"
                        >
                          {{ selectedReceipt.user.role }}
                        </q-chip>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>

              <div class="col-12 col-md-6">
                <h6 class="text-weight-bold q-mb-md">Subscription Details</h6>
                <q-list>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>Plan Name</q-item-label>
                      <q-item-label>{{ selectedReceipt.subscription.name }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>Type</q-item-label>
                      <q-item-label>{{ selectedReceipt.subscription.type }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>Price</q-item-label>
                      <q-item-label class="text-primary text-weight-bold"
                        >${{ selectedReceipt.subscription.price }}</q-item-label
                      >
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>

              <div class="col-12">
                <h6 class="text-weight-bold q-mb-md">Payment Information</h6>
                <q-list>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>Amount Paid</q-item-label>
                      <q-item-label class="text-primary text-weight-bold"
                        >${{ formatAmount(selectedReceipt.amount) }}</q-item-label
                      >
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>Payment Date</q-item-label>
                      <q-item-label>{{ formatDate(selectedReceipt.payment_date) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>Payment Type</q-item-label>
                      <q-item-label>
                        <q-chip
                          :color="getPaymentTypeColor(selectedReceipt.payment_type)"
                          size="sm"
                        >
                          {{ selectedReceipt.payment_type }}
                        </q-chip>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item v-if="selectedReceipt.is_recurring">
                    <q-item-section>
                      <q-item-label caption>Recurring Subscription ID</q-item-label>
                      <q-item-label>{{ selectedReceipt.recurring_subscription_id }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item v-if="selectedReceipt.authorize_transaction_id">
                    <q-item-section>
                      <q-item-label caption>Transaction ID</q-item-label>
                      <q-item-label class="text-caption">{{
                        selectedReceipt.authorize_transaction_id
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()

// Data
const receipts = ref([])
const loading = ref(false)
const showReceiptDialog = ref(false)
const selectedReceipt = ref(null)

// Filters
const filters = ref({
  search: '',
  status: '',
  payment_type: '',
  date_from: '',
  date_to: '',
})

// Quasar Table Pagination
const tablePagination = ref({
  sortBy: 'payment_date',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

// Options
const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Cancelled', value: 'cancelled' },
]

const paymentTypeOptions = [
  { label: 'One Time', value: 'one_time' },
  { label: 'Recurring', value: 'recurring' },
  { label: 'Promo', value: 'promo' },
]

// Table columns
const columns = [
  {
    name: 'user',
    label: 'User',
    field: 'user',
    align: 'left',
    sortable: false,
  },
  {
    name: 'subscription',
    label: 'Subscription',
    field: 'subscription',
    align: 'left',
    sortable: false,
  },
  {
    name: 'amount',
    label: 'Amount',
    field: 'amount',
    align: 'right',
    sortable: true,
  },
  {
    name: 'payment_date',
    label: 'Payment Date',
    field: 'payment_date',
    align: 'left',
    sortable: true,
    format: (val) => formatDate(val),
  },
  {
    name: 'payment_type',
    label: 'Payment Type',
    field: 'payment_type',
    align: 'center',
    sortable: true,
  },
  {
    name: 'next_billing_date',
    label: 'Next Billing',
    field: 'next_billing_date',
    align: 'left',
    sortable: true,
    format: (val) => formatDate(val),
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center',
    sortable: false,
  },
]

// Methods
const loadReceipts = async () => {
  loading.value = true
  try {
    const params = {
      page: tablePagination.value.page,
      per_page: tablePagination.value.rowsPerPage,
      ...filters.value,
    }

    // Remove empty filters
    Object.keys(params).forEach((key) => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await api.get('/api/v2/admin/receipts', { params })

    if (response.data.status) {
      receipts.value = response.data.data.receipts
      const paginationData = response.data.data.pagination

      // Update pagination state - only rowsNumber is needed for Quasar
      tablePagination.value.rowsNumber = paginationData.total
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.message || 'Failed to load receipts',
      })
    }
  } catch (error) {
    console.error('Error loading receipts:', error)

    // Show sample data for testing when API fails
    if (receipts.value.length === 0) {
      receipts.value = getSampleReceipts()

      // Update pagination for sample data
      tablePagination.value.rowsNumber = receipts.value.length

      $q.notify({
        type: 'info',
        message: 'Showing sample data. Backend API not accessible.',
        timeout: 5000,
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Failed to load receipts. Please try again.',
      })
    }
  } finally {
    loading.value = false
  }
}

const onSearchChange = () => {
  tablePagination.value.page = 1
  loadReceipts()
}

const onFilterChange = () => {
  tablePagination.value.page = 1
  loadReceipts()
}

const clearFilters = () => {
  filters.value = {
    search: '',
    status: '',
    payment_type: '',
    date_from: '',
    date_to: '',
  }
  tablePagination.value.page = 1
  loadReceipts()
}

const onTableRequest = (props) => {
  console.log('Table request:', props)

  // Quasar automatically updates the pagination via v-model
  // We just need to load new data
  loadReceipts()
}

const goToPage = (page) => {
  tablePagination.value.page = page
  loadReceipts()
}

const viewReceipt = (receipt) => {
  selectedReceipt.value = receipt
  showReceiptDialog.value = true
}

const downloadReceipt = () => {
  // Implement receipt download functionality
  $q.notify({
    type: 'info',
    message: 'Receipt download feature coming soon!',
  })
}

const exportReceipts = () => {
  // Implement export functionality
  $q.notify({
    type: 'info',
    message: 'Export feature coming soon!',
  })
}

const getStatusColor = (receipt) => {
  if (receipt.cancelled) return 'negative'
  if (receipt.is_recurring) return 'warning'
  return 'positive'
}

const getStatusLabel = (receipt) => {
  if (receipt.cancelled) return 'Cancelled'
  if (receipt.is_recurring) return 'Recurring'
  return 'Active'
}

const getPaymentTypeColor = (type) => {
  switch (type) {
    case 'one_time':
      return 'primary'
    case 'recurring':
      return 'warning'
    case 'promo':
      return 'positive'
    default:
      return 'grey'
  }
}

const formatAmount = (amount) => {
  if (amount === null || amount === undefined || amount === '') {
    return '0.00'
  }
  const numAmount = parseFloat(amount)
  if (isNaN(numAmount)) {
    return '0.00'
  }
  return numAmount.toFixed(2)
}

const getAmountClass = (amount) => {
  if (amount === null || amount === undefined || amount === '') {
    return 'text-grey-6'
  }
  const numAmount = parseFloat(amount)
  if (isNaN(numAmount) || numAmount === 0) {
    return 'text-grey-6'
  }
  return 'text-primary'
}

const getSampleReceipts = () => {
  return [
    {
      id: 1,
      user: {
        id: 101,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Business',
      },
      subscription: {
        id: 201,
        name: 'Business Premium',
        price: 99.99,
        type: 'Monthly',
      },
      amount: 99.99,
      payment_date: '2025-01-15T10:30:00Z',
      payment_type: 'recurring',
      cancelled: false,
      is_recurring: true,
      recurring_subscription_id: 'ARB_12345',
      authorize_transaction_id: 'TXN_67890',
      billing_cycle_number: 1,
      next_billing_date: '2025-02-15T10:30:00Z',
      created_at: '2025-01-15T10:30:00Z',
      updated_at: '2025-01-15T10:30:00Z',
    },
    {
      id: 2,
      user: {
        id: 102,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'User',
      },
      subscription: {
        id: 202,
        name: 'User Basic',
        price: 29.99,
        type: 'Monthly',
      },
      amount: 29.99,
      payment_date: '2025-01-14T14:20:00Z',
      payment_type: 'one_time',
      cancelled: false,
      is_recurring: false,
      recurring_subscription_id: null,
      authorize_transaction_id: 'TXN_67891',
      billing_cycle_number: null,
      next_billing_date: null,
      created_at: '2025-01-14T14:20:00Z',
      updated_at: '2025-01-14T14:20:00Z',
    },
    {
      id: 3,
      user: {
        id: 103,
        name: 'Bob Wilson',
        email: 'bob@example.com',
        role: 'Business',
      },
      subscription: {
        id: 203,
        name: 'Business Starter',
        price: 49.99,
        type: 'Monthly',
      },
      amount: 0,
      payment_date: '2025-01-13T09:15:00Z',
      payment_type: 'promo',
      cancelled: false,
      is_recurring: false,
      recurring_subscription_id: null,
      authorize_transaction_id: 'PROMO_FREE30_123',
      billing_cycle_number: null,
      next_billing_date: null,
      created_at: '2025-01-13T09:15:00Z',
      updated_at: '2025-01-13T09:15:00Z',
    },
    {
      id: 4,
      user: {
        id: 104,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'Business',
      },
      subscription: {
        id: 204,
        name: 'Business Enterprise',
        price: 199.99,
        type: 'Annually',
      },
      amount: 199.99,
      payment_date: '2025-01-12T11:45:00Z',
      payment_type: 'recurring',
      cancelled: false,
      is_recurring: true,
      recurring_subscription_id: 'ARB_12346',
      authorize_transaction_id: 'TXN_67892',
      billing_cycle_number: 1,
      next_billing_date: '2026-01-12T11:45:00Z',
      created_at: '2025-01-12T11:45:00Z',
      updated_at: '2025-01-12T11:45:00Z',
    },
    {
      id: 5,
      user: {
        id: 105,
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        role: 'User',
      },
      subscription: {
        id: 205,
        name: 'User Pro',
        price: 59.99,
        type: 'Monthly',
      },
      amount: 59.99,
      payment_date: '2025-01-11T16:30:00Z',
      payment_type: 'one_time',
      cancelled: false,
      is_recurring: false,
      recurring_subscription_id: null,
      authorize_transaction_id: 'TXN_67893',
      billing_cycle_number: null,
      next_billing_date: null,
      created_at: '2025-01-11T16:30:00Z',
      updated_at: '2025-01-11T16:30:00Z',
    },
    {
      id: 6,
      user: {
        id: 106,
        name: 'Diana Prince',
        email: 'diana@example.com',
        role: 'Business',
      },
      subscription: {
        id: 206,
        name: 'Business Basic',
        price: 79.99,
        type: 'Monthly',
      },
      amount: 79.99,
      payment_date: '2025-01-10T09:20:00Z',
      payment_type: 'recurring',
      cancelled: false,
      is_recurring: true,
      recurring_subscription_id: 'ARB_12347',
      authorize_transaction_id: 'TXN_67894',
      billing_cycle_number: 1,
      next_billing_date: '2025-02-10T09:20:00Z',
      created_at: '2025-01-10T09:20:00Z',
      updated_at: '2025-01-10T09:20:00Z',
    },
    {
      id: 7,
      user: {
        id: 107,
        name: 'Edward Norton',
        email: 'edward@example.com',
        role: 'User',
      },
      subscription: {
        id: 207,
        name: 'User Starter',
        price: 19.99,
        type: 'Monthly',
      },
      amount: 19.99,
      payment_date: '2025-01-09T14:15:00Z',
      payment_type: 'one_time',
      cancelled: false,
      is_recurring: false,
      recurring_subscription_id: null,
      authorize_transaction_id: 'TXN_67895',
      billing_cycle_number: null,
      next_billing_date: null,
      created_at: '2025-01-09T14:15:00Z',
      updated_at: '2025-01-09T14:15:00Z',
    },
    {
      id: 8,
      user: {
        id: 108,
        name: 'Fiona Gallagher',
        email: 'fiona@example.com',
        role: 'Business',
      },
      subscription: {
        id: 208,
        name: 'Business Pro',
        price: 149.99,
        type: 'Monthly',
      },
      amount: 149.99,
      payment_date: '2025-01-08T10:00:00Z',
      payment_type: 'recurring',
      cancelled: false,
      is_recurring: true,
      recurring_subscription_id: 'ARB_12348',
      authorize_transaction_id: 'TXN_67896',
      billing_cycle_number: 1,
      next_billing_date: '2025-02-08T10:00:00Z',
      created_at: '2025-01-08T10:00:00Z',
      updated_at: '2025-01-08T10:00:00Z',
    },
    {
      id: 9,
      user: {
        id: 109,
        name: 'George Lucas',
        email: 'george@example.com',
        role: 'User',
      },
      subscription: {
        id: 209,
        name: 'User Premium',
        price: 39.99,
        type: 'Monthly',
      },
      amount: 39.99,
      payment_date: '2025-01-07T13:45:00Z',
      payment_type: 'one_time',
      cancelled: false,
      is_recurring: false,
      recurring_subscription_id: null,
      authorize_transaction_id: 'TXN_67897',
      billing_cycle_number: null,
      next_billing_date: null,
      created_at: '2025-01-07T13:45:00Z',
      updated_at: '2025-01-07T13:45:00Z',
    },
    {
      id: 10,
      user: {
        id: 110,
        name: 'Helen Keller',
        email: 'helen@example.com',
        role: 'Business',
      },
      subscription: {
        id: 210,
        name: 'Business Ultimate',
        price: 299.99,
        type: 'Annually',
      },
      amount: 299.99,
      payment_date: '2025-01-06T08:30:00Z',
      payment_type: 'recurring',
      cancelled: false,
      is_recurring: true,
      recurring_subscription_id: 'ARB_12349',
      authorize_transaction_id: 'TXN_67898',
      billing_cycle_number: 1,
      next_billing_date: '2026-01-06T08:30:00Z',
      created_at: '2025-01-06T08:30:00Z',
      updated_at: '2025-01-06T08:30:00Z',
    },
    {
      id: 11,
      user: {
        id: 111,
        name: 'Ian Fleming',
        email: 'ian@example.com',
        role: 'User',
      },
      subscription: {
        id: 211,
        name: 'User Enterprise',
        price: 89.99,
        type: 'Monthly',
      },
      amount: 89.99,
      payment_date: '2025-01-05T12:20:00Z',
      payment_type: 'one_time',
      cancelled: false,
      is_recurring: false,
      recurring_subscription_id: null,
      authorize_transaction_id: 'TXN_67899',
      billing_cycle_number: null,
      next_billing_date: null,
      created_at: '2025-01-05T12:20:00Z',
      updated_at: '2025-01-05T12:20:00Z',
    },
    {
      id: 12,
      user: {
        id: 112,
        name: 'Julia Roberts',
        email: 'julia@example.com',
        role: 'Business',
      },
      subscription: {
        id: 212,
        name: 'Business Elite',
        price: 399.99,
        type: 'Annually',
      },
      amount: 399.99,
      payment_date: '2025-01-04T15:10:00Z',
      payment_type: 'recurring',
      cancelled: false,
      is_recurring: true,
      recurring_subscription_id: 'ARB_12350',
      authorize_transaction_id: 'TXN_67900',
      billing_cycle_number: 1,
      next_billing_date: '2026-01-04T15:10:00Z',
      created_at: '2025-01-04T15:10:00Z',
      updated_at: '2025-01-04T15:10:00Z',
    },
  ]
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Lifecycle
onMounted(() => {
  loadReceipts()
})
</script>

<style scoped>
.max-w-7xl {
  max-width: 80rem;
}
</style>

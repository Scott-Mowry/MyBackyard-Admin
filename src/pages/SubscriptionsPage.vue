<template>
  <q-page class="q-pa-lg">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="q-mb-xl">
        <div class="row items-center justify-between">
          <div class="col">
            <h1 class="text-h4 text-weight-bold text-grey-9 q-mb-xs">Subscription Management</h1>
            <p class="text-body1 text-grey-6">Manage all subscription packages in the system</p>
          </div>
          <div class="col-auto">
            <q-btn
              label="New Subscription"
              color="primary"
              icon="add"
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
                  <q-icon name="subscriptions" size="48px" color="primary" />
                </div>
                <div class="col q-ml-md">
                  <div class="text-h4 text-weight-bold text-grey-9">{{ stats.total }}</div>
                  <div class="text-body2 text-grey-6">Total Subscriptions</div>
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
                  <div class="text-body2 text-grey-6">Active Subscriptions</div>
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
                  <q-icon name="block" size="48px" color="negative" />
                </div>
                <div class="col q-ml-md">
                  <div class="text-h4 text-weight-bold text-grey-9">{{ stats.deprecated }}</div>
                  <div class="text-body2 text-grey-6">Deprecated Subscriptions</div>
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
                placeholder="Search subscriptions..."
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
                v-model="filters.status"
                :options="statusOptions"
                emit-value
                map-options
                outlined
                dense
                clearable
                label="Filter by status"
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

      <!-- Subscriptions Table -->
      <q-card flat bordered>
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between q-mb-lg">
            <div class="col">
              <h3 class="text-h6 text-weight-bold text-grey-9">
                Subscriptions ({{ filteredSubscriptions.length }})
              </h3>
            </div>
            <div class="col-auto">
              <q-btn-group flat>
                <q-btn icon="refresh" @click="loadSubscriptions" :loading="loading" />
                <q-btn icon="download" @click="exportSubscriptions" :loading="loading" />
              </q-btn-group>
            </div>
          </div>

          <q-table
            :rows="filteredSubscriptions"
            :columns="columns"
            :loading="loading"
            :pagination="{ ...pagination, rowsNumber: filteredSubscriptions.length }"
            @request="onRequest"
            row-key="id"
            flat
            bordered
          >
            <!-- Billing Cycle Column -->
            <template #body-cell-billing_cycle="props">
              <q-td :props="props">
                <q-chip
                  :color="getBillingCycleColor(getBillingCycleValue(props.row))"
                  :icon="getBillingCycleIcon(getBillingCycleValue(props.row))"
                  size="sm"
                  dense
                  outline
                >
                  {{ getBillingCycleValue(props.row) || 'N/A' }}
                </q-chip>
              </q-td>
            </template>

            <!-- Description Column -->
            <template #body-cell-description="props">
              <q-td :props="props">
                <div v-if="props.value" class="text-caption text-grey-7">
                  {{ props.value.length > 50 ? props.value.substring(0, 50) + '...' : props.value }}
                </div>
                <div v-else class="text-grey-6 text-caption">No description</div>
              </q-td>
            </template>

            <!-- Popular Column -->
            <template #body-cell-is_popular="props">
              <q-td :props="props">
                <q-icon
                  :name="props.value ? 'star' : 'star_border'"
                  :color="props.value ? 'amber' : 'grey-5'"
                  size="20px"
                />
              </q-td>
            </template>

            <!-- Visible Column -->
            <template #body-cell-on_show="props">
              <q-td :props="props">
                <q-icon
                  :name="props.value ? 'visibility' : 'visibility_off'"
                  :color="props.value ? 'positive' : 'grey-5'"
                  size="20px"
                />
              </q-td>
            </template>

            <!-- Sort Order Column -->
            <template #body-cell-sort_order="props">
              <q-td :props="props">
                <q-chip :color="props.value ? 'blue-grey' : 'grey-5'" size="sm" dense outline>
                  {{ props.value || '0' }}
                </q-chip>
              </q-td>
            </template>

            <!-- Status Column -->
            <template #body-cell-status="props">
              <q-td :props="props">
                <div class="row items-center q-gutter-xs">
                  <q-chip
                    :color="props.value === 'Active' ? 'positive' : 'negative'"
                    :icon="props.value === 'Active' ? 'check_circle' : 'block'"
                    size="sm"
                    dense
                  >
                    {{ props.value }}
                  </q-chip>
                  <q-chip
                    v-if="isProtectedSubscription(props.row.id)"
                    color="warning"
                    icon="lock"
                    size="sm"
                    dense
                  >
                    Protected
                  </q-chip>
                </div>
              </q-td>
            </template>

            <!-- Price Column -->
            <template #body-cell-price="props">
              <q-td :props="props">
                <span class="text-weight-bold">{{ props.value }}</span>
              </q-td>
            </template>

            <!-- Sub Points Column -->
            <template #body-cell-sub_points="props">
              <q-td :props="props">
                <div v-if="props.value && props.value.length > 0">
                  <div class="row q-gutter-xs">
                    <q-chip
                      v-for="point in props.value"
                      :key="point"
                      :label="point"
                      size="sm"
                      dense
                      color="primary"
                      outline
                    />
                  </div>
                </div>
                <div v-else class="text-grey-6 text-caption">No features</div>
              </q-td>
            </template>

            <!-- Actions Column -->
            <template #body-cell-actions="props">
              <q-td :props="props">
                <q-btn-group flat>
                  <q-btn
                    icon="visibility"
                    size="sm"
                    @click="viewSubscription(props.row)"
                    color="grey-7"
                    outline
                  />
                  <q-btn
                    icon="edit"
                    size="sm"
                    @click="editSubscription(props.row)"
                    color="grey-7"
                    outline
                  />
                  <q-btn
                    v-if="!isProtectedSubscription(props.row.id)"
                    icon="delete"
                    size="sm"
                    @click="deleteSubscription(props.row)"
                    color="negative"
                    outline
                  />
                  <q-btn
                    v-else
                    icon="lock"
                    size="sm"
                    color="grey-5"
                    outline
                    disable
                    title="Protected subscription - cannot be deleted"
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

    <!-- Create/Edit Subscription Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card class="subscription-dialog" style="min-width: 700px; max-width: 800px">
        <!-- Header -->
        <q-card-section class="dialog-header q-pb-none">
          <div class="row items-center q-gutter-md">
            <div class="col-auto">
              <q-avatar color="primary" icon="subscriptions" size="48px" />
            </div>
            <div class="col">
              <h3 class="text-h5 text-weight-bold text-grey-9 q-mb-xs">
                {{ editingSubscription ? 'Edit Subscription' : 'Create New Subscription' }}
              </h3>
              <p class="text-body2 text-grey-6 q-ma-none">
                {{
                  editingSubscription
                    ? 'Update subscription details'
                    : 'Add a new subscription package to the system'
                }}
              </p>
            </div>
          </div>
        </q-card-section>

        <!-- Form Content -->
        <q-card-section class="q-pt-lg">
          <q-form @submit.prevent="saveSubscription" class="subscription-form">
            <!-- Basic Information Section -->
            <div class="form-section">
              <div class="section-header">
                <q-icon name="info" color="primary" size="20px" />
                <span class="text-subtitle1 text-weight-bold text-grey-8">Basic Information</span>
              </div>

              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="subscriptionForm.name"
                    label="Subscription Name"
                    outlined
                    dense
                    class="form-input"
                    :rules="[(val) => !!val || 'Name is required']"
                    placeholder="e.g., Business Premium, User Basic"
                  >
                    <template #prepend>
                      <q-icon name="label" color="primary" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="subscriptionForm.type"
                    label="Subscription Type"
                    outlined
                    dense
                    class="form-input"
                    :rules="[(val) => !!val || 'Type is required']"
                    placeholder="e.g., Premium, Basic, Enterprise"
                  >
                    <template #prepend>
                      <q-icon name="category" color="primary" />
                    </template>
                  </q-input>
                </div>
              </div>

              <div class="row q-col-gutter-lg q-mt-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model.number="subscriptionForm.price"
                    label="Price"
                    type="number"
                    step="0.01"
                    outlined
                    dense
                    class="form-input"
                    :rules="[
                      (val) => !!val || 'Price is required',
                      (val) => val >= 0 || 'Price must be positive',
                    ]"
                    placeholder="0.00"
                  >
                    <template #prepend>
                      <q-icon name="attach_money" color="primary" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="subscriptionForm.billing_cycle"
                    :options="billingCycleOptions"
                    label="Billing Cycle"
                    outlined
                    dense
                    class="form-input"
                    :rules="[(val) => !!val || 'Billing cycle is required']"
                    placeholder="Select billing cycle"
                    emit-value
                    map-options
                  >
                    <template #prepend>
                      <q-icon name="schedule" color="primary" />
                    </template>
                  </q-select>
                  <div class="text-caption text-grey-7 q-mt-xs">
                    Note: Daily billing cycles are not available for recurring subscriptions due to
                    payment processor limitations.
                  </div>
                </div>
              </div>

              <div class="row q-col-gutter-lg q-mt-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model.number="subscriptionForm.sort_order"
                    label="Sort Order"
                    type="number"
                    outlined
                    dense
                    class="form-input"
                    :rules="[(val) => val >= 0 || 'Sort order must be positive']"
                    placeholder="0"
                  >
                    <template #prepend>
                      <q-icon name="sort" color="primary" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="subscriptionForm.description"
                    label="Description"
                    type="textarea"
                    outlined
                    dense
                    class="form-input"
                    rows="2"
                    placeholder="Enter a brief description of this subscription..."
                  >
                    <template #prepend>
                      <q-icon name="description" color="primary" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- Settings Section -->
            <div class="form-section q-mt-lg">
              <div class="section-header">
                <q-icon name="settings" color="primary" size="20px" />
                <span class="text-subtitle1 text-weight-bold text-grey-8">Settings</span>
              </div>

              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-4">
                  <div class="toggle-item">
                    <q-toggle
                      v-model="subscriptionForm.is_popular"
                      label="Popular"
                      color="amber"
                      size="lg"
                    />
                    <p class="toggle-description">Mark as featured subscription</p>
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="toggle-item">
                    <q-toggle
                      v-model="subscriptionForm.on_show"
                      label="Visible"
                      color="positive"
                      size="lg"
                    />
                    <p class="toggle-description">Show to users</p>
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="toggle-item">
                    <q-toggle
                      v-model="subscriptionForm.is_depreciated"
                      label="Deprecated"
                      color="negative"
                      size="lg"
                    />
                    <p class="toggle-description">Mark as discontinued</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Features Section -->
            <div class="form-section q-mt-lg">
              <div class="section-header">
                <q-icon name="star" color="primary" size="20px" />
                <span class="text-subtitle1 text-weight-bold text-grey-8">Features</span>
              </div>

              <div class="features-container">
                <div
                  v-for="(point, index) in subscriptionForm.sub_points"
                  :key="index"
                  class="feature-item"
                >
                  <div class="feature-input">
                    <q-input
                      v-model="subscriptionForm.sub_points[index]"
                      :label="`Feature ${index + 1}`"
                      outlined
                      dense
                      clearable
                      placeholder="Enter feature description..."
                    >
                      <template #prepend>
                        <q-icon name="check_circle" color="primary" />
                      </template>
                    </q-input>
                  </div>
                  <div class="feature-actions">
                    <q-btn
                      v-if="subscriptionForm.sub_points.length > 1"
                      icon="remove"
                      size="sm"
                      color="negative"
                      outline
                      round
                      @click="removeSubPoint(index)"
                      title="Remove feature"
                    />
                  </div>
                </div>

                <div class="add-feature-btn">
                  <q-btn
                    icon="add"
                    label="Add Feature"
                    size="sm"
                    color="primary"
                    outline
                    @click="addSubPoint"
                    class="full-width"
                  />
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="form-actions q-mt-xl">
              <div class="row q-gutter-md justify-end">
                <q-btn
                  label="Cancel"
                  flat
                  color="grey-7"
                  @click="closeSubscriptionDialog"
                  class="action-btn"
                />
                <q-btn
                  :label="editingSubscription ? 'Update Subscription' : 'Create Subscription'"
                  type="submit"
                  color="primary"
                  :loading="saving"
                  class="action-btn"
                  :icon="editingSubscription ? 'update' : 'add'"
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- View Subscription Dialog -->
    <q-dialog v-model="showSubscriptionDialog">
      <q-card style="min-width: 500px; max-width: 600px">
        <q-card-section class="q-pb-none">
          <h3 class="text-h6 text-weight-bold text-grey-9">Subscription Details</h3>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Name</label>
                <div class="detail-value">{{ selectedSubscription?.name }}</div>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Billing Cycle</label>
                <div class="detail-value">
                  <q-chip
                    :color="getBillingCycleColor(selectedSubscription?.billing_cycle)"
                    :icon="getBillingCycleIcon(selectedSubscription?.billing_cycle)"
                    size="sm"
                    dense
                    outline
                  >
                    {{ selectedSubscription?.billing_cycle || 'N/A' }}
                  </q-chip>
                  <div
                    v-if="selectedSubscription?.billing_cycle === 'Daily'"
                    class="text-caption text-warning q-mt-xs"
                  >
                    ⚠️ This subscription is billed weekly due to payment processor limitations
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Price</label>
                <div class="detail-value">${{ selectedSubscription?.price }}</div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Status</label>
                <div class="detail-value">
                  <q-chip
                    :color="selectedSubscription?.status === 'Active' ? 'positive' : 'negative'"
                    :icon="selectedSubscription?.status === 'Active' ? 'check_circle' : 'block'"
                    size="sm"
                    dense
                  >
                    {{ selectedSubscription?.status }}
                  </q-chip>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Popular</label>
                <div class="detail-value">
                  <q-icon
                    :name="selectedSubscription?.is_popular ? 'star' : 'star_border'"
                    :color="selectedSubscription?.is_popular ? 'amber' : 'grey-5'"
                    size="20px"
                  />
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Visible</label>
                <div class="detail-value">
                  <q-icon
                    :name="selectedSubscription?.on_show ? 'visibility' : 'visibility_off'"
                    :color="selectedSubscription?.on_show ? 'positive' : 'grey-5'"
                    size="20px"
                  />
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Sort Order</label>
                <div class="detail-value">{{ selectedSubscription?.sort_order || '0' }}</div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Created</label>
                <div class="detail-value">{{ formatDate(selectedSubscription?.created_at) }}</div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Updated</label>
                <div class="detail-value">{{ formatDate(selectedSubscription?.updated_at) }}</div>
              </div>
            </div>
            <div class="col-12">
              <div class="detail-item">
                <label class="detail-label">Description</label>
                <div class="detail-value">
                  {{ selectedSubscription?.description || 'No description available' }}
                </div>
              </div>
            </div>
            <div class="col-12">
              <div class="detail-item">
                <label class="detail-label">Features</label>
                <div class="detail-value">
                  <div
                    v-if="
                      selectedSubscription?.sub_points && selectedSubscription.sub_points.length > 0
                    "
                  >
                    <div class="row q-gutter-xs">
                      <q-chip
                        v-for="point in selectedSubscription.sub_points"
                        :key="point"
                        :label="point"
                        size="sm"
                        dense
                        color="primary"
                        outline
                      />
                    </div>
                  </div>
                  <div v-else class="text-grey-6">No features</div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Close" flat @click="showSubscriptionDialog = false" />
        </q-card-actions>
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
const saving = ref(false)
const subscriptions = ref([])
const showCreateDialog = ref(false)
const showSubscriptionDialog = ref(false)
const editingSubscription = ref(null)
const selectedSubscription = ref(null)

// Computed properties
const filteredSubscriptions = computed(() => {
  let filtered = subscriptions.value

  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter(
      (subscription) =>
        (subscription.name && subscription.name.toLowerCase().includes(searchTerm)) ||
        (subscription.type && subscription.type.toLowerCase().includes(searchTerm)) ||
        (subscription.price && subscription.price.toString().includes(searchTerm)),
    )
  }

  // Apply status filter
  if (filters.status) {
    filtered = filtered.filter((subscription) => subscription.status === filters.status)
  }

  return filtered
})

const stats = computed(() => {
  const total = subscriptions.value.length
  const active = subscriptions.value.filter(
    (subscription) => subscription.status === 'Active',
  ).length
  const deprecated = subscriptions.value.filter(
    (subscription) => subscription.status === 'Deprecated',
  ).length

  return {
    total,
    active,
    deprecated,
  }
})

// Filters
const filters = reactive({
  search: '',
  status: null,
})

// Pagination
const pagination = reactive({
  page: 1,
  rowsPerPage: 30,
  total: 0,
})

// Form
const subscriptionForm = reactive({
  name: '',
  type: '',
  price: 0,
  description: '',
  billing_cycle: '',
  is_popular: false,
  on_show: true,
  sort_order: 0,
  is_depreciated: false,
  sub_points: [''],
})

// Options
const statusOptions = [
  { label: 'All', value: null },
  { label: 'Active', value: 'Active' },
  { label: 'Deprecated', value: 'Deprecated' },
]

const billingCycleOptions = [
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Annually', value: 'Annually' },
  { label: 'Weekly', value: 'Weekly' },
  { label: 'One-time', value: 'One-time' },
]

// Table columns
const columns = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    sortable: true,
    align: 'left',
    style: 'width: 60px',
  },
  {
    name: 'name',
    label: 'Name',
    field: 'name',
    sortable: true,
    align: 'left',
  },

  {
    name: 'type',
    label: 'Type',
    field: 'type',
    sortable: true,
    align: 'left',
    style: 'width: 120px',
  },
  {
    name: 'price',
    label: 'Price',
    field: 'price',
    sortable: true,
    align: 'right',
    style: 'width: 100px',
  },
  {
    name: 'billing_cycle',
    label: 'Billing',
    field: 'billing_cycle',
    sortable: true,
    align: 'center',
    style: 'width: 100px',
  },

  {
    name: 'description',
    label: 'Description',
    field: 'description',
    sortable: false,
    align: 'left',
    style: 'max-width: 200px',
  },
  {
    name: 'is_popular',
    label: 'Popular',
    field: 'is_popular',
    sortable: true,
    align: 'center',
    style: 'width: 80px',
  },
  {
    name: 'on_show',
    label: 'Visible',
    field: 'on_show',
    sortable: true,
    align: 'center',
    style: 'width: 80px',
  },
  {
    name: 'sort_order',
    label: 'Order',
    field: 'sort_order',
    sortable: true,
    align: 'center',
    style: 'width: 80px',
  },
  {
    name: 'sub_points',
    label: 'Features',
    field: 'sub_points',
    sortable: false,
    align: 'left',
    style: 'max-width: 150px',
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    sortable: true,
    align: 'center',
    style: 'width: 100px',
  },
  {
    name: 'created_at',
    label: 'Created',
    field: 'created_at',
    sortable: true,
    align: 'left',
    style: 'width: 120px',
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center',
    style: 'width: 120px',
  },
]

// Methods
function isProtectedSubscription(id) {
  const protectedIds = [1, 2, 3, 5]
  return protectedIds.includes(id)
}

function getBillingCycleColor(cycle) {
  if (!cycle) return 'grey-5'
  const cycleLower = cycle.toLowerCase()
  if (cycleLower.includes('month')) return 'blue'
  if (cycleLower.includes('year') || cycleLower.includes('annual')) return 'green'
  if (cycleLower.includes('week')) return 'orange'
  if (cycleLower.includes('day')) return 'purple'
  return 'grey-7'
}

function getBillingCycleIcon(cycle) {
  if (!cycle) return 'schedule'
  const cycleLower = cycle.toLowerCase()
  if (cycleLower.includes('month')) return 'calendar_month'
  if (cycleLower.includes('year') || cycleLower.includes('annual')) return 'calendar_today'
  if (cycleLower.includes('week')) return 'view_week'
  if (cycleLower.includes('day')) return 'today'
  return 'schedule'
}

function getBillingCycleValue(subscription) {
  // Try different possible field names for billing cycle
  const possibleFields = [
    'billing_cycle',
    'billingCycle',
    'billing_cycle_type',
    'cycle',
    'billing_type',
    'subscription_cycle',
    'recurring_type',
  ]

  for (const field of possibleFields) {
    if (subscription[field]) {
      const value = subscription[field]
      // Handle existing daily subscriptions gracefully
      if (value === 'Daily') {
        return 'Daily (Weekly Billing)'
      }
      return value
    }
  }

  return null
}

function addSubPoint() {
  subscriptionForm.sub_points.push('')
}

function removeSubPoint(index) {
  subscriptionForm.sub_points.splice(index, 1)
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

async function loadSubscriptions() {
  try {
    loading.value = true
    const response = await api.get('/api/v2/admin/subscriptions')
    if (response.data.status) {
      subscriptions.value = response.data.data
      pagination.total = response.data.data.length
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.message || 'Failed to load subscriptions',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Failed to load subscriptions:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load subscriptions',
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
  filters.status = null
  pagination.page = 1
}

function onSearchChange() {
  pagination.page = 1
}

function onFilterChange() {
  pagination.page = 1
}

async function exportSubscriptions() {
  try {
    loading.value = true

    const csvContent = [
      [
        'ID',
        'Name',
        'Type',
        'Price',
        'Billing Cycle',
        'Description',
        'Popular',
        'Visible',
        'Sort Order',
        'Features',
        'Status',
        'Created At',
      ].join(','),
      ...filteredSubscriptions.value.map((subscription) =>
        [
          subscription.id,
          `"${subscription.name}"`,
          subscription.type,
          subscription.price,
          subscription.billing_cycle === 'Daily'
            ? 'Daily (Weekly Billing)'
            : subscription.billing_cycle || 'N/A',
          subscription.description ? `"${subscription.description}"` : '',
          subscription.is_popular ? 'Yes' : 'No',
          subscription.on_show ? 'Yes' : 'No',
          subscription.sort_order || '0',
          subscription.sub_points ? `"${subscription.sub_points.join('; ')}"` : '',
          subscription.status,
          subscription.created_at,
        ].join(','),
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscriptions_export_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    $q.notify({
      type: 'positive',
      message: 'Subscriptions exported successfully',
      position: 'top',
    })
  } catch (error) {
    console.error('Failed to export subscriptions:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to export subscriptions',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

function viewSubscription(subscription) {
  selectedSubscription.value = subscription
  showSubscriptionDialog.value = true
}

function editSubscription(subscription) {
  selectedSubscription.value = subscription
  editingSubscription.value = true
  subscriptionForm.name = subscription.name || ''
  subscriptionForm.type = subscription.type || ''
  subscriptionForm.price = subscription.price || 0
  subscriptionForm.description = subscription.description || ''
  subscriptionForm.billing_cycle = subscription.billing_cycle || ''
  subscriptionForm.is_popular = subscription.is_popular || false
  subscriptionForm.on_show = subscription.on_show !== undefined ? subscription.on_show : true
  subscriptionForm.sort_order = subscription.sort_order || 0
  subscriptionForm.is_depreciated = subscription.status === 'Deprecated'
  subscriptionForm.sub_points =
    subscription.sub_points && subscription.sub_points.length > 0
      ? [...subscription.sub_points, '']
      : ['']
  showCreateDialog.value = true
}

async function deleteSubscription(subscription) {
  try {
    $q.dialog({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete subscription "${subscription.name}"? This action cannot be undone.`,
      cancel: true,
      persistent: true,
      ok: {
        label: 'Delete',
        color: 'negative',
      },
    }).onOk(async () => {
      const response = await api.delete(`/api/v2/admin/subscriptions/${subscription.id}`)
      if (response.data.status) {
        $q.notify({
          type: 'positive',
          message: 'Subscription deleted successfully!',
          position: 'top',
        })
        loadSubscriptions()
      } else {
        $q.notify({
          type: 'negative',
          message: response.data.message || 'Failed to delete subscription',
          position: 'top',
        })
      }
    })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'An error occurred while deleting the subscription',
      position: 'top',
    })
  }
}

async function saveSubscription() {
  const isNewSubscription = !editingSubscription.value
  const subscriptionId = selectedSubscription.value?.id

  try {
    saving.value = true

    // Debug: Log the billing cycle value
    console.log('Billing cycle value:', subscriptionForm.billing_cycle)
    console.log('Billing cycle type:', typeof subscriptionForm.billing_cycle)

    const subscriptionData = {
      name: subscriptionForm.name,
      type: subscriptionForm.type,
      price: subscriptionForm.price,
      description: subscriptionForm.description,
      billing_cycle: subscriptionForm.billing_cycle,
      is_popular: subscriptionForm.is_popular,
      on_show: subscriptionForm.on_show,
      sort_order: subscriptionForm.sort_order,
      is_depreciated: subscriptionForm.is_depreciated,
      sub_points: subscriptionForm.sub_points.filter((point) => point.trim() !== ''),
    }

    if (isNewSubscription) {
      const response = await api.post('/api/v2/admin/subscriptions/add', subscriptionData)
      if (response.data.status) {
        $q.notify({
          type: 'positive',
          message: 'Subscription created successfully!',
          position: 'top',
        })
        closeSubscriptionDialog()
        loadSubscriptions()
      } else {
        $q.notify({
          type: 'negative',
          message: response.data.message || 'Failed to create subscription',
          position: 'top',
        })
      }
    } else {
      const response = await api.put(
        `/api/v2/admin/subscriptions/${subscriptionId}`,
        subscriptionData,
      )
      if (response.data.status) {
        $q.notify({
          type: 'positive',
          message: 'Subscription updated successfully!',
          position: 'top',
        })
        closeSubscriptionDialog()
        loadSubscriptions()
      } else {
        $q.notify({
          type: 'negative',
          message: response.data.message || 'Failed to update subscription',
          position: 'top',
        })
      }
    }
  } catch (error) {
    console.error('Error saving subscription:', error)
    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message || 'An error occurred while saving subscription changes',
      position: 'top',
    })
  } finally {
    saving.value = false
  }
}

function closeSubscriptionDialog() {
  showCreateDialog.value = false
  editingSubscription.value = false
  subscriptionForm.name = ''
  subscriptionForm.type = ''
  subscriptionForm.price = 0
  subscriptionForm.description = ''
  subscriptionForm.billing_cycle = ''
  subscriptionForm.is_popular = false
  subscriptionForm.on_show = true
  subscriptionForm.sort_order = 0
  subscriptionForm.is_depreciated = false
  subscriptionForm.sub_points = ['']
  selectedSubscription.value = null
}

// Lifecycle
onMounted(() => {
  authStore.initializeAuth()
  if (authStore.isAuthenticated) {
    loadSubscriptions()
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

/* Subscription Dialog Styling */
.subscription-dialog {
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e2e8f0;
  border-radius: 16px 16px 0 0;
}

.form-section {
  background: #fafbfc;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.form-input {
  transition: all 0.2s ease;
}

.form-input:hover {
  transform: translateY(-1px);
}

.toggle-item {
  text-align: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.toggle-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.toggle-description {
  margin: 8px 0 0 0;
  font-size: 0.8em;
  color: #6b7280;
  text-align: center;
}

.features-container {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.feature-input {
  flex: 1;
}

.feature-actions {
  flex-shrink: 0;
}

.add-feature-btn {
  margin-top: 16px;
}

.form-actions {
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
}

.action-btn {
  min-width: 120px;
  border-radius: 8px;
  font-weight: 600;
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

  .subscription-dialog {
    min-width: 95vw !important;
    max-width: 95vw !important;
  }

  .form-section {
    padding: 16px;
  }

  .toggle-item {
    padding: 12px;
  }
}
</style>

<template>
  <q-page class="q-pa-lg">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="q-mb-xl">
        <div class="row items-center justify-between">
          <div class="col">
            <h1 class="text-h4 text-weight-bold text-grey-9 q-mb-xs">
              Business Promo Codes Management
            </h1>
            <p class="text-body1 text-grey-6">Manage all business promo codes and discounts</p>
          </div>
          <div class="col-auto">
            <q-btn
              label="New Promo Code"
              color="primary"
              icon="add"
              @click="showCreateDialog = true"
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
                placeholder="Search promo codes..."
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
                label="Status"
                outlined
                dense
                clearable
                emit-value
                map-options
                @update:model-value="onFilterChange"
              />
            </div>

            <div class="col-12 col-md-2">
              <q-select
                v-model="filters.targetRole"
                :options="targetRoleOptions"
                label="Target Role"
                outlined
                dense
                clearable
                emit-value
                map-options
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

      <!-- Promo Codes Table -->
      <q-card flat bordered>
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between q-mb-lg">
            <div class="col">
              <h3 class="text-h6 text-weight-bold text-grey-9">
                Promo Codes ({{ pagination.total }})
              </h3>
            </div>
            <div class="col-auto">
              <q-btn-group flat>
                <q-btn icon="refresh" @click="loadPromoCodes" :loading="loading" />
                <q-btn icon="download" @click="exportPromoCodes" :loading="loading" />
              </q-btn-group>
            </div>
          </div>

          <q-table
            :rows="promoCodes"
            :columns="columns"
            :loading="loading"
            :pagination="tablePagination"
            @request="onTableRequest"
            row-key="id"
            flat
            bordered
          >
            <!-- Status Column -->
            <template #body-cell-status="props">
              <q-td :props="props">
                <q-chip :color="getStatusColor(props.value)" text-color="white" size="sm" dense>
                  {{ props.value }}
                </q-chip>
              </q-td>
            </template>

            <!-- Target Role Column -->
            <template #body-cell-target_role="props">
              <q-td :props="props">
                <q-chip :color="getTargetRoleColor(props.value)" text-color="white" size="sm" dense>
                  {{ props.value }}
                </q-chip>
              </q-td>
            </template>

            <!-- Discount Column -->
            <template #body-cell-discount="props">
              <q-td :props="props">
                <div class="text-weight-medium">
                  {{ getDiscountDisplay(props.row) }}
                </div>
              </q-td>
            </template>

            <!-- Usage Column -->
            <template #body-cell-usage="props">
              <q-td :props="props">
                <div class="text-caption">
                  {{ props.row.usage_count }}/{{ props.row.usage_limit || '∞' }}
                </div>
                <q-linear-progress
                  :value="getUsagePercentage(props.row)"
                  :color="getUsageColor(props.row)"
                  size="sm"
                  class="q-mt-xs"
                />
              </q-td>
            </template>

            <!-- Featured Column -->
            <template #body-cell-is_featured="props">
              <q-td :props="props">
                <q-icon
                  :name="props.value ? 'star' : 'star_border'"
                  :color="props.value ? 'amber' : 'grey-5'"
                  size="sm"
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
                    @click="viewPromoCode(props.row)"
                    color="primary"
                    outline
                  />
                  <q-btn
                    icon="edit"
                    size="sm"
                    @click="editPromoCode(props.row)"
                    color="secondary"
                    outline
                  />
                  <q-btn
                    icon="toggle_on"
                    size="sm"
                    @click="toggleStatus(props.row)"
                    :color="props.row.status === 'active' ? 'negative' : 'positive'"
                    outline
                  />
                  <q-btn
                    icon="delete"
                    size="sm"
                    @click="deletePromoCode(props.row)"
                    color="negative"
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

            <!-- Expires At Column -->
            <template #body-cell-expires_at="props">
              <q-td :props="props">
                <div v-if="props.value">
                  {{ formatDate(props.value) }}
                  <q-chip
                    v-if="isExpired(props.value)"
                    color="negative"
                    text-color="white"
                    size="xs"
                    dense
                    class="q-ml-xs"
                  >
                    Expired
                  </q-chip>
                </div>
                <span v-else class="text-grey-6">No expiry</span>
              </q-td>
            </template>
          </q-table>

          <!-- Custom Pagination -->
          <template #bottom>
            <div class="row items-center justify-between q-pa-md">
              <div class="text-caption text-grey-7">
                Showing {{ pagination.from || 0 }} to {{ pagination.to || 0 }} of
                {{ pagination.total }} records
              </div>
              <div class="row items-center q-gutter-sm">
                <q-btn
                  icon="first_page"
                  size="sm"
                  flat
                  :disable="pagination.current_page === 1"
                  @click="goToPage(1)"
                />
                <q-btn
                  icon="chevron_left"
                  size="sm"
                  flat
                  :disable="pagination.current_page === 1"
                  @click="goToPage(pagination.current_page - 1)"
                />
                <span class="text-caption q-px-sm">
                  Page {{ pagination.current_page }} of {{ pagination.last_page }}
                </span>
                <q-btn
                  icon="chevron_right"
                  size="sm"
                  flat
                  :disable="pagination.current_page === pagination.last_page"
                  @click="goToPage(pagination.current_page + 1)"
                />
                <q-btn
                  icon="last_page"
                  size="sm"
                  flat
                  :disable="pagination.current_page === pagination.last_page"
                  @click="goToPage(pagination.last_page)"
                />
              </div>
            </div>
          </template>
        </q-card-section>
      </q-card>
    </div>

    <!-- Create/Edit Promo Code Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 600px; max-width: 600px">
        <q-card-section class="q-pb-none">
          <div class="row items-center justify-between">
            <h3 class="text-h6 text-weight-bold text-grey-9">
              {{ isEditing ? 'Edit Promo Code' : 'Add New Promo Code' }}
            </h3>
            <q-btn icon="close" flat round dense @click="closePromoCodeDialog" />
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit.prevent="savePromoCode" class="q-gutter-lg">
            <div class="row q-col-gutter-lg">
              <!-- Basic Information -->
              <div class="col-12 q-ma-md">
                <q-card flat bordered class="q-pa-md">
                  <div class="text-subtitle1 text-weight-medium q-mb-md">Basic Information</div>

                  <q-input
                    v-model="promoCodeForm.code"
                    label="Promo Code *"
                    outlined
                    dense
                    :rules="[(val) => !!val || 'Promo code is required']"
                    :disable="isEditing"
                  >
                    <template #prepend>
                      <q-icon name="code" color="primary" />
                    </template>
                  </q-input>

                  <q-input
                    v-model="promoCodeForm.name"
                    label="Name *"
                    outlined
                    dense
                    class="q-mt-md"
                    :rules="[(val) => !!val || 'Name is required']"
                  >
                    <template #prepend>
                      <q-icon name="label" color="primary" />
                    </template>
                  </q-input>

                  <q-input
                    v-model="promoCodeForm.description"
                    label="Description"
                    outlined
                    dense
                    type="textarea"
                    rows="3"
                    class="q-mt-md"
                  >
                    <template #prepend>
                      <q-icon name="description" color="primary" />
                    </template>
                  </q-input>
                </q-card>
              </div>

              <!-- Discount Configuration -->
              <div class="col-12 q-ma-md">
                <q-card flat bordered class="q-pa-md">
                  <div class="text-subtitle1 text-weight-medium q-mb-md">
                    Discount Configuration
                  </div>

                  <q-select
                    v-model="promoCodeForm.discount_type"
                    :options="discountTypeOptions"
                    label="Discount Type *"
                    outlined
                    dense
                    emit-value
                    map-options
                    :rules="[(val) => !!val || 'Discount type is required']"
                    @update:model-value="onDiscountTypeChange"
                  >
                    <template #prepend>
                      <q-icon name="discount" color="primary" />
                    </template>
                  </q-select>

                  <q-input
                    v-if="promoCodeForm.discount_type === 'percentage'"
                    v-model.number="promoCodeForm.discount_value"
                    label="Discount Percentage *"
                    outlined
                    dense
                    type="number"
                    min="0"
                    max="100"
                    suffix="%"
                    class="q-mt-md"
                    :rules="[
                      (val) => !!val || 'Discount percentage is required',
                      (val) => (val >= 0 && val <= 100) || 'Percentage must be between 0 and 100',
                    ]"
                  >
                    <template #prepend>
                      <q-icon name="percent" color="primary" />
                    </template>
                  </q-input>

                  <q-input
                    v-if="promoCodeForm.discount_type === 'fixed_amount'"
                    v-model.number="promoCodeForm.discount_value"
                    label="Discount Amount *"
                    outlined
                    dense
                    type="number"
                    min="0"
                    step="0.01"
                    prefix="$"
                    class="q-mt-md"
                    :rules="[
                      (val) => !!val || 'Discount amount is required',
                      (val) => val > 0 || 'Amount must be greater than 0',
                    ]"
                  >
                    <template #prepend>
                      <q-icon name="attach_money" color="primary" />
                    </template>
                  </q-input>

                  <q-input
                    v-if="promoCodeForm.discount_type === 'free_trial'"
                    v-model.number="promoCodeForm.free_days"
                    label="Free Days *"
                    outlined
                    dense
                    type="number"
                    min="1"
                    suffix="days"
                    class="q-mt-md"
                    :rules="[
                      (val) => !!val || 'Free days is required',
                      (val) => val >= 1 || 'Must be at least 1 day',
                    ]"
                  >
                    <template #prepend>
                      <q-icon name="calendar_today" color="primary" />
                    </template>
                  </q-input>
                </q-card>
              </div>

              <!-- Usage Limits -->
              <div class="col-12 q-ma-md">
                <q-card flat bordered class="q-pa-md">
                  <div class="text-subtitle1 text-weight-medium q-mb-md">Usage Limits</div>

                  <q-input
                    v-model.number="promoCodeForm.usage_limit"
                    label="Total Usage Limit"
                    outlined
                    dense
                    type="number"
                    min="1"
                    hint="Leave empty for unlimited usage"
                  >
                    <template #prepend>
                      <q-icon name="group" color="primary" />
                    </template>
                  </q-input>

                  <q-input
                    v-model.number="promoCodeForm.per_user_limit"
                    label="Per User Limit"
                    outlined
                    dense
                    type="number"
                    min="1"
                    class="q-mt-md"
                    hint="Leave empty for unlimited per user"
                  >
                    <template #prepend>
                      <q-icon name="person" color="primary" />
                    </template>
                  </q-input>
                </q-card>
              </div>

              <!-- Targeting & Settings -->
              <div class="col-12 q-ma-md">
                <q-card flat bordered class="q-pa-md">
                  <div class="text-subtitle1 text-weight-medium q-mb-md">Targeting & Settings</div>

                  <q-select
                    v-model="promoCodeForm.target_role"
                    :options="targetRoleOptions"
                    label="Target Role *"
                    outlined
                    dense
                    emit-value
                    map-options
                    :rules="[(val) => !!val || 'Target role is required']"
                  >
                    <template #prepend>
                      <q-icon name="target" color="primary" />
                    </template>
                  </q-select>

                  <q-select
                    v-model="promoCodeForm.status"
                    :options="statusOptions"
                    label="Status *"
                    outlined
                    dense
                    emit-value
                    map-options
                    :rules="[(val) => !!val || 'Status is required']"
                    class="q-mt-md"
                  >
                    <template #prepend>
                      <q-icon name="toggle_on" color="primary" />
                    </template>
                  </q-select>

                  <q-toggle
                    v-model="promoCodeForm.is_featured"
                    label="Featured Promo Code"
                    color="primary"
                    class="q-mt-md"
                  />

                  <q-input
                    v-model.number="promoCodeForm.sort_order"
                    label="Sort Order"
                    outlined
                    dense
                    type="number"
                    min="0"
                    class="q-mt-md"
                    hint="Lower numbers appear first"
                  >
                    <template #prepend>
                      <q-icon name="sort" color="primary" />
                    </template>
                  </q-input>
                </q-card>
              </div>

              <!-- Validity Period -->
              <div class="col-12 q-ma-md">
                <q-card flat bordered class="q-pa-md">
                  <div class="text-subtitle1 text-weight-medium q-mb-md">Validity Period</div>

                  <q-input
                    v-model="promoCodeForm.starts_at"
                    label="Start Date"
                    outlined
                    dense
                    type="datetime-local"
                    hint="Leave empty to start immediately"
                  >
                    <template #prepend>
                      <q-icon name="schedule" color="primary" />
                    </template>
                  </q-input>

                  <q-input
                    v-model="promoCodeForm.expires_at"
                    label="Expiry Date"
                    outlined
                    dense
                    type="datetime-local"
                    class="q-mt-md"
                    hint="Leave empty for no expiry"
                  >
                    <template #prepend>
                      <q-icon name="event_busy" color="primary" />
                    </template>
                  </q-input>
                </q-card>
              </div>

              <!-- Admin Notes -->
              <div class="col-12 q-ma-md">
                <q-card flat bordered class="q-pa-md">
                  <div class="text-subtitle1 text-weight-medium q-mb-md">Admin Notes</div>

                  <q-input
                    v-model="promoCodeForm.admin_notes"
                    label="Internal Notes"
                    outlined
                    dense
                    type="textarea"
                    rows="4"
                    hint="Internal notes for admin use only"
                  >
                    <template #prepend>
                      <q-icon name="note" color="primary" />
                    </template>
                  </q-input>
                </q-card>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="row justify-end q-gutter-md q-mt-lg">
              <q-btn label="Cancel" flat @click="closePromoCodeDialog" />
              <q-btn
                :label="isEditing ? 'Update Promo Code' : 'Create Promo Code'"
                type="submit"
                color="primary"
                :loading="saving"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- View Promo Code Dialog -->
    <q-dialog v-model="showViewDialog" maximized>
      <q-card>
        <q-card-section class="q-pb-none">
          <div class="row items-center justify-between">
            <h3 class="text-h6 text-weight-bold text-grey-9">Promo Code Details</h3>
            <q-btn icon="close" flat round dense @click="showViewDialog = false" />
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div v-if="selectedPromoCode" class="row q-col-gutter-lg">
            <div class="col-12 col-md-6">
              <q-card flat bordered class="q-pa-md">
                <div class="text-subtitle1 text-weight-medium q-mb-md">Basic Information</div>
                <div class="detail-item">
                  <span class="detail-label">Code:</span>
                  <span class="detail-value">{{ selectedPromoCode.code }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">{{ selectedPromoCode.name }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Description:</span>
                  <span class="detail-value">{{
                    selectedPromoCode.description || 'No description'
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Status:</span>
                  <q-chip
                    :color="getStatusColor(selectedPromoCode.status)"
                    text-color="white"
                    size="sm"
                    dense
                  >
                    {{ selectedPromoCode.status }}
                  </q-chip>
                </div>
              </q-card>
            </div>

            <div class="col-12 col-md-6">
              <q-card flat bordered class="q-pa-md">
                <div class="text-subtitle1 text-weight-medium q-mb-md">Discount Details</div>
                <div class="detail-item">
                  <span class="detail-label">Type:</span>
                  <span class="detail-value">{{ selectedPromoCode.discount_type }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Value:</span>
                  <span class="detail-value">{{ getDiscountDisplay(selectedPromoCode) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Target Role:</span>
                  <q-chip
                    :color="getTargetRoleColor(selectedPromoCode.target_role)"
                    text-color="white"
                    size="sm"
                    dense
                  >
                    {{ selectedPromoCode.target_role }}
                  </q-chip>
                </div>
              </q-card>
            </div>

            <div class="col-12 col-md-6">
              <q-card flat bordered class="q-pa-md">
                <div class="text-subtitle1 text-weight-medium q-mb-md">Usage Statistics</div>
                <div class="detail-item">
                  <span class="detail-label">Total Usage:</span>
                  <span class="detail-value"
                    >{{ selectedPromoCode.usage_count }}/{{
                      selectedPromoCode.usage_limit || '∞'
                    }}</span
                  >
                </div>
                <div class="detail-item">
                  <span class="detail-label">Per User Limit:</span>
                  <span class="detail-value">{{ selectedPromoCode.per_user_limit || '∞' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Featured:</span>
                  <span class="detail-value">
                    <q-icon
                      :name="selectedPromoCode.is_featured ? 'star' : 'star_border'"
                      :color="selectedPromoCode.is_featured ? 'amber' : 'grey-5'"
                      size="sm"
                    />
                    {{ selectedPromoCode.is_featured ? 'Yes' : 'No' }}
                  </span>
                </div>
              </q-card>
            </div>

            <div class="col-12 col-md-6">
              <q-card flat bordered class="q-pa-md">
                <div class="text-subtitle1 text-weight-medium q-mb-md">Validity Period</div>
                <div class="detail-item">
                  <span class="detail-label">Start Date:</span>
                  <span class="detail-value">{{
                    selectedPromoCode.starts_at
                      ? formatDate(selectedPromoCode.starts_at)
                      : 'Immediate'
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Expiry Date:</span>
                  <span class="detail-value">
                    {{
                      selectedPromoCode.expires_at
                        ? formatDate(selectedPromoCode.expires_at)
                        : 'No expiry'
                    }}
                    <q-chip
                      v-if="selectedPromoCode.expires_at && isExpired(selectedPromoCode.expires_at)"
                      color="negative"
                      text-color="white"
                      size="xs"
                      dense
                      class="q-ml-xs"
                    >
                      Expired
                    </q-chip>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Created:</span>
                  <span class="detail-value">{{ formatDate(selectedPromoCode.created_at) }}</span>
                </div>
              </q-card>
            </div>

            <div class="col-12" v-if="selectedPromoCode.admin_notes">
              <q-card flat bordered class="q-pa-md">
                <div class="text-subtitle1 text-weight-medium q-mb-md">Admin Notes</div>
                <div class="detail-value">{{ selectedPromoCode.admin_notes }}</div>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
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
const promoCodes = ref([])
const showCreateDialog = ref(false)
const showViewDialog = ref(false)
const isEditing = ref(false)
const selectedPromoCode = ref(null)

// Form
const promoCodeForm = reactive({
  code: '',
  name: '',
  description: '',
  discount_type: '',
  discount_value: null,
  free_days: null,
  usage_limit: null,
  per_user_limit: null,
  starts_at: '',
  expires_at: '',
  target_role: '',
  applicable_subscriptions: [],
  status: 'active',
  is_featured: false,
  sort_order: 0,
  admin_notes: '',
})

// Filters
const filters = reactive({
  search: '',
  status: '',
  targetRole: '',
})

// Options
const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Expired', value: 'expired' },
  { label: 'Draft', value: 'draft' },
]

const targetRoleOptions = [
  { label: 'Business', value: 'Business' },
  { label: 'User', value: 'User' },
  { label: 'Both', value: 'Both' },
]

const discountTypeOptions = [
  { label: 'Percentage Discount', value: 'percentage' },
  { label: 'Fixed Amount Discount', value: 'fixed_amount' },
  { label: 'Free Trial', value: 'free_trial' },
]

// Pagination
const pagination = reactive({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: 0,
  to: 0,
})

const tablePagination = reactive({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

// Table columns
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
  { name: 'code', label: 'Code', field: 'code', sortable: true, align: 'left' },
  { name: 'name', label: 'Name', field: 'name', sortable: true, align: 'left' },
  { name: 'discount', label: 'Discount', field: 'discount', sortable: false, align: 'left' },
  {
    name: 'target_role',
    label: 'Target Role',
    field: 'target_role',
    sortable: true,
    align: 'center',
  },
  { name: 'status', label: 'Status', field: 'status', sortable: true, align: 'center' },
  { name: 'usage', label: 'Usage', field: 'usage', sortable: false, align: 'center' },
  { name: 'is_featured', label: 'Featured', field: 'is_featured', sortable: true, align: 'center' },
  { name: 'expires_at', label: 'Expires', field: 'expires_at', sortable: true, align: 'left' },
  { name: 'created_at', label: 'Created', field: 'created_at', sortable: true, align: 'left' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
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

function isExpired(dateString) {
  if (!dateString) return false
  return new Date(dateString) < new Date()
}

function getStatusColor(status) {
  switch (status) {
    case 'active':
      return 'positive'
    case 'inactive':
      return 'grey-6'
    case 'expired':
      return 'negative'
    case 'draft':
      return 'warning'
    default:
      return 'grey-6'
  }
}

function getTargetRoleColor(role) {
  switch (role) {
    case 'Business':
      return 'primary'
    case 'User':
      return 'secondary'
    case 'Both':
      return 'accent'
    default:
      return 'grey-6'
  }
}

function getDiscountDisplay(promoCode) {
  switch (promoCode.discount_type) {
    case 'percentage':
      return `${promoCode.discount_value}%`
    case 'fixed_amount':
      return `$${promoCode.discount_value}`
    case 'free_trial':
      return `${promoCode.free_days} days free`
    default:
      return 'N/A'
  }
}

function getUsagePercentage(promoCode) {
  if (!promoCode.usage_limit) return 0
  return Math.min(promoCode.usage_count / promoCode.usage_limit, 1)
}

function getUsageColor(promoCode) {
  const percentage = getUsagePercentage(promoCode)
  if (percentage >= 0.9) return 'negative'
  if (percentage >= 0.7) return 'warning'
  return 'positive'
}

function onDiscountTypeChange() {
  // Reset related fields when discount type changes
  promoCodeForm.discount_value = null
  promoCodeForm.free_days = null
}

async function loadPromoCodes() {
  try {
    loading.value = true
    const params = {
      page: pagination.current_page,
      per_page: pagination.per_page,
      search: filters.search,
      status: filters.status,
      target_role: filters.targetRole,
    }

    const response = await api.get('/api/v2/admin/business-promocodes', { params })

    if (response.data.status) {
      promoCodes.value = response.data.data
      pagination.current_page = response.data.pagination.current_page
      pagination.last_page = response.data.pagination.last_page
      pagination.per_page = response.data.pagination.per_page
      pagination.total = response.data.pagination.total
      pagination.from = response.data.pagination.from
      pagination.to = response.data.pagination.to

      // Update table pagination
      tablePagination.page = pagination.current_page
      tablePagination.rowsPerPage = pagination.per_page
      tablePagination.rowsNumber = pagination.total
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.message || 'Failed to load promo codes',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Failed to load promo codes:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load promo codes',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

function onTableRequest(props) {
  pagination.current_page = props.pagination.page
  pagination.per_page = props.pagination.rowsPerPage
  loadPromoCodes()
}

function goToPage(page) {
  pagination.current_page = page
  loadPromoCodes()
}

function clearFilters() {
  filters.search = ''
  filters.status = ''
  filters.targetRole = ''
  pagination.current_page = 1
  loadPromoCodes()
}

function onSearchChange() {
  pagination.current_page = 1
  loadPromoCodes()
}

function onFilterChange() {
  pagination.current_page = 1
  loadPromoCodes()
}

async function exportPromoCodes() {
  try {
    loading.value = true
    const csvContent = [
      [
        'ID',
        'Code',
        'Name',
        'Description',
        'Discount Type',
        'Discount Value',
        'Target Role',
        'Status',
        'Usage Count',
        'Usage Limit',
        'Featured',
        'Created At',
        'Expires At',
      ].join(','),
      ...promoCodes.value.map((promo) =>
        [
          promo.id,
          `"${promo.code}"`,
          `"${promo.name}"`,
          `"${promo.description || ''}"`,
          promo.discount_type,
          promo.discount_value || '',
          promo.target_role,
          promo.status,
          promo.usage_count,
          promo.usage_limit || '∞',
          promo.is_featured ? 'Yes' : 'No',
          promo.created_at,
          promo.expires_at || 'No expiry',
        ].join(','),
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `business_promocodes_export_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    $q.notify({
      type: 'positive',
      message: 'Promo codes exported successfully',
      position: 'top',
    })
  } catch (error) {
    console.error('Failed to export promo codes:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to export promo codes',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

function viewPromoCode(promo) {
  selectedPromoCode.value = promo
  showViewDialog.value = true
}

function editPromoCode(promo) {
  isEditing.value = true
  selectedPromoCode.value = promo

  // Populate form
  Object.keys(promoCodeForm).forEach((key) => {
    if (promo[key] !== undefined) {
      promoCodeForm[key] = promo[key]
    }
  })

  // Convert dates to local datetime format
  if (promo.starts_at) {
    promoCodeForm.starts_at = new Date(promo.starts_at).toISOString().slice(0, 16)
  }
  if (promo.expires_at) {
    promoCodeForm.expires_at = new Date(promo.expires_at).toISOString().slice(0, 16)
  }

  showCreateDialog.value = true
}

async function savePromoCode() {
  try {
    saving.value = true

    const endpoint = isEditing.value
      ? `/api/v2/admin/business-promocodes/${selectedPromoCode.value?.id}`
      : '/api/v2/admin/business-promocodes'

    const method = isEditing.value ? 'put' : 'post'

    const response = await api[method](endpoint, promoCodeForm)

    if (response.data.status) {
      $q.notify({
        type: 'positive',
        message: `Promo code ${isEditing.value ? 'updated' : 'created'} successfully!`,
        position: 'top',
      })
      closePromoCodeDialog()
      loadPromoCodes()
    } else {
      $q.notify({
        type: 'negative',
        message:
          response.data.message || `Failed to ${isEditing.value ? 'update' : 'create'} promo code`,
        position: 'top',
      })
    }
  } catch (error) {
    console.error(`Error ${isEditing.value ? 'updating' : 'creating'} promo code:`, error)
    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        `An error occurred while ${isEditing.value ? 'updating' : 'creating'} promo code`,
      position: 'top',
    })
  } finally {
    saving.value = false
  }
}

async function toggleStatus(promo) {
  try {
    const response = await api.patch(`/api/v2/admin/business-promocodes/${promo.id}/toggle-status`)

    if (response.data.status) {
      $q.notify({
        type: 'positive',
        message: 'Promo code status updated successfully!',
        position: 'top',
      })
      loadPromoCodes()
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.message || 'Failed to update promo code status',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Error toggling promo code status:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'An error occurred while updating status',
      position: 'top',
    })
  }
}

async function deletePromoCode(promo) {
  try {
    $q.dialog({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete promo code "${promo.code}"? This action cannot be undone.`,
      cancel: true,
      persistent: true,
      ok: {
        label: 'Delete',
        color: 'negative',
      },
    }).onOk(async () => {
      const response = await api.delete(`/api/v2/admin/business-promocodes/${promo.id}`)

      if (response.data.status) {
        $q.notify({
          type: 'positive',
          message: 'Promo code deleted successfully!',
          position: 'top',
        })
        loadPromoCodes()
      } else {
        $q.notify({
          type: 'negative',
          message: response.data.message || 'Failed to delete promo code',
          position: 'top',
        })
      }
    })
  } catch (error) {
    console.error('Error deleting promo code:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'An error occurred while deleting the promo code',
      position: 'top',
    })
  }
}

function closePromoCodeDialog() {
  showCreateDialog.value = false
  showViewDialog.value = false
  isEditing.value = false
  selectedPromoCode.value = null

  // Reset form
  Object.keys(promoCodeForm).forEach((key) => {
    if (key === 'status') {
      promoCodeForm[key] = 'active'
    } else if (key === 'is_featured') {
      promoCodeForm[key] = false
    } else if (key === 'sort_order') {
      promoCodeForm[key] = 0
    } else if (
      key === 'discount_value' ||
      key === 'free_days' ||
      key === 'usage_limit' ||
      key === 'per_user_limit'
    ) {
      promoCodeForm[key] = null
    } else {
      promoCodeForm[key] = ''
    }
  })
}

// Lifecycle
onMounted(() => {
  authStore.initializeAuth()
  if (authStore.isAuthenticated) {
    loadPromoCodes()
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
</style>

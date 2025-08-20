<template>
  <q-page class="q-pa-lg">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="q-mb-xl">
        <div class="row items-center justify-between">
          <div class="col">
            <h1 class="text-h4 text-weight-bold text-grey-9 q-mb-xs">Places Management</h1>
            <p class="text-body1 text-grey-6">Manage all allowed places in the system</p>
          </div>
          <div class="col-auto">
            <q-btn label="New Place" color="primary" icon="add" @click="showCreateDialog = true" />
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row q-col-gutter-lg q-mb-lg">
        <div class="col-12 col-md-4">
          <q-card class="stat-card bg-primary text-white">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h4 text-weight-bold">{{ stats.total }}</div>
                  <div class="text-subtitle2">Total Places</div>
                </div>
                <div class="col-auto">
                  <q-icon name="place" size="48px" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card class="stat-card bg-positive text-white">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h4 text-weight-bold">{{ stats.allowed }}</div>
                  <div class="text-subtitle2">Allowed Places</div>
                </div>
                <div class="col-auto">
                  <q-icon name="check_circle" size="48px" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card class="stat-card bg-negative text-white">
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-h4 text-weight-bold">{{ stats.notAllowed }}</div>
                  <div class="text-subtitle2">Not Allowed Places</div>
                </div>
                <div class="col-auto">
                  <q-icon name="block" size="48px" />
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
                placeholder="Search places..."
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

      <!-- Places Table -->
      <q-card flat bordered>
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between q-mb-lg">
            <div class="col">
              <h3 class="text-h6 text-weight-bold text-grey-9">
                Places ({{ filteredPlaces.length }})
              </h3>
            </div>
            <div class="col-auto">
              <q-btn-group flat>
                <q-btn icon="refresh" @click="loadPlaces" :loading="loading" />
                <q-btn icon="download" @click="exportPlaces" :loading="loading" />
              </q-btn-group>
            </div>
          </div>

          <q-table
            :rows="filteredPlaces"
            :columns="columns"
            :loading="loading"
            :pagination="{ ...pagination, rowsNumber: filteredPlaces.length }"
            @request="onRequest"
            row-key="id"
            flat
            bordered
          >
            <!-- Status Column -->
            <template #body-cell-status="props">
              <q-td :props="props">
                <q-chip
                  :color="props.value === 'Allowed' ? 'positive' : 'negative'"
                  :icon="props.value === 'Allowed' ? 'check_circle' : 'block'"
                  size="sm"
                  dense
                >
                  {{ props.value }}
                </q-chip>
              </q-td>
            </template>

            <!-- Coordinates Column -->
            <template #body-cell-coordinates="props">
              <q-td :props="props">
                <div class="text-caption">
                  <div>
                    Top Left: {{ props.row.top_left_latitude }}, {{ props.row.top_left_longitude }}
                  </div>
                  <div>
                    Bottom Right: {{ props.row.bottom_right_latitude }},
                    {{ props.row.bottom_right_longitude }}
                  </div>
                </div>
              </q-td>
            </template>

            <!-- Actions Column -->
            <template #body-cell-actions="props">
              <q-td :props="props">
                <q-btn-group flat>
                  <q-btn
                    icon="visibility"
                    size="sm"
                    @click="viewPlace(props.row)"
                    color="grey-7"
                    outline
                  />
                  <q-btn
                    :icon="props.row.status === 'Allowed' ? 'block' : 'check_circle'"
                    size="sm"
                    @click="togglePlaceStatus(props.row)"
                    :color="props.row.status === 'Allowed' ? 'negative' : 'positive'"
                    outline
                  />
                  <q-btn
                    icon="delete"
                    size="sm"
                    @click="deletePlace(props.row)"
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
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- Create Place Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="q-pb-none">
          <h3 class="text-h6 text-weight-bold text-grey-9">Add New Place</h3>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="savePlace" class="q-gutter-md">
            <q-input
              v-model="placeForm.name"
              label="Place Name"
              outlined
              dense
              :rules="[(val) => !!val || 'Place name is required']"
            />

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="placeForm.top_left_latitude"
                  label="Top Left Latitude"
                  outlined
                  dense
                  type="number"
                  step="any"
                  :rules="[(val) => !!val || 'Latitude is required']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="placeForm.top_left_longitude"
                  label="Top Left Longitude"
                  outlined
                  dense
                  type="number"
                  step="any"
                  :rules="[(val) => !!val || 'Longitude is required']"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="placeForm.bottom_right_latitude"
                  label="Bottom Right Latitude"
                  outlined
                  dense
                  type="number"
                  step="any"
                  :rules="[(val) => !!val || 'Latitude is required']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="placeForm.bottom_right_longitude"
                  label="Bottom Right Longitude"
                  outlined
                  dense
                  type="number"
                  step="any"
                  :rules="[(val) => !!val || 'Longitude is required']"
                />
              </div>
            </div>

            <div class="q-gutter-sm">
              <q-btn label="Add Place" type="submit" color="primary" :loading="saving" />
              <q-btn label="Cancel" flat @click="closePlaceDialog" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- View Place Dialog -->
    <q-dialog v-model="showPlaceDialog">
      <q-card style="min-width: 500px; max-width: 600px">
        <q-card-section class="q-pb-none">
          <h3 class="text-h6 text-weight-bold text-grey-9">Place Details</h3>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Name</label>
                <div class="detail-value">{{ selectedPlace?.name }}</div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Status</label>
                <div class="detail-value">
                  <q-chip
                    :color="selectedPlace?.status === 'Allowed' ? 'positive' : 'negative'"
                    :icon="selectedPlace?.status === 'Allowed' ? 'check_circle' : 'block'"
                    size="sm"
                    dense
                  >
                    {{ selectedPlace?.status }}
                  </q-chip>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Top Left Latitude</label>
                <div class="detail-value">{{ selectedPlace?.top_left_latitude }}</div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Top Left Longitude</label>
                <div class="detail-value">{{ selectedPlace?.top_left_longitude }}</div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Bottom Right Latitude</label>
                <div class="detail-value">{{ selectedPlace?.bottom_right_latitude }}</div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Bottom Right Longitude</label>
                <div class="detail-value">{{ selectedPlace?.bottom_right_longitude }}</div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Created</label>
                <div class="detail-value">{{ formatDate(selectedPlace?.created_at) }}</div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Updated</label>
                <div class="detail-value">{{ formatDate(selectedPlace?.updated_at) }}</div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Close" flat @click="showPlaceDialog = false" />
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
const places = ref([])
const showCreateDialog = ref(false)
const showPlaceDialog = ref(false)
const selectedPlace = ref(null)

// Computed properties
const filteredPlaces = computed(() => {
  let filtered = places.value

  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter((place) => place.name.toLowerCase().includes(searchTerm))
  }

  // Apply status filter
  if (filters.status) {
    filtered = filtered.filter((place) => place.status === filters.status)
  }

  return filtered
})

const stats = computed(() => {
  const total = places.value.length
  const allowed = places.value.filter((place) => place.status === 'Allowed').length
  const notAllowed = places.value.filter((place) => place.status === 'Not Allowed').length

  return { total, allowed, notAllowed }
})

// Filters
const filters = reactive({
  search: '',
  status: '',
})

// Pagination
const pagination = reactive({
  page: 1,
  rowsPerPage: 30,
  total: 0,
})

// Form
const placeForm = reactive({
  name: '',
  top_left_latitude: '',
  top_left_longitude: '',
  bottom_right_latitude: '',
  bottom_right_longitude: '',
})

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
    name: 'coordinates',
    label: 'Coordinates',
    field: 'coordinates',
    sortable: false,
    align: 'left',
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

async function loadPlaces() {
  try {
    loading.value = true

    const response = await api.get('/api/v2/admin/places')

    if (response.data.status) {
      places.value = response.data.data
      pagination.total = response.data.data.length
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.message || 'Failed to load places',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Failed to load places:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load places',
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
  pagination.page = 1
}

function onSearchChange() {
  pagination.page = 1
}

async function exportPlaces() {
  try {
    loading.value = true

    // Create CSV content
    const csvContent = [
      // CSV headers
      [
        'ID',
        'Name',
        'Top Left Latitude',
        'Top Left Longitude',
        'Bottom Right Latitude',
        'Bottom Right Longitude',
        'Status',
        'Created At',
      ].join(','),
      // CSV data
      ...filteredPlaces.value.map((place) =>
        [
          place.id,
          `"${place.name}"`,
          place.top_left_latitude,
          place.top_left_longitude,
          place.bottom_right_latitude,
          place.bottom_right_longitude,
          place.status,
          place.created_at,
        ].join(','),
      ),
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `places_export_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    $q.notify({
      type: 'positive',
      message: 'Places exported successfully',
      position: 'top',
    })
  } catch (error) {
    console.error('Failed to export places:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to export places',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

function viewPlace(place) {
  selectedPlace.value = place
  showPlaceDialog.value = true
}

async function togglePlaceStatus(place) {
  try {
    const newStatus = place.status === 'Allowed' ? 0 : 1
    const actionText = place.status === 'Allowed' ? 'block' : 'allow'

    $q.dialog({
      title: 'Confirm Action',
      message: `Are you sure you want to ${actionText} "${place.name}"?`,
      cancel: true,
      persistent: true,
      ok: {
        label: actionText === 'block' ? 'Block' : 'Allow',
        color: actionText === 'block' ? 'negative' : 'positive',
      },
    }).onOk(async () => {
      const response = await api.get(`/api/v2/admin/places/action/${place.id}/${newStatus}`)

      if (response.data.status) {
        $q.notify({
          type: 'positive',
          message: `Place ${actionText}ed successfully!`,
          position: 'top',
        })
        loadPlaces() // Reload places to update the table
      } else {
        $q.notify({
          type: 'negative',
          message: response.data.message || `Failed to ${actionText} place`,
          position: 'top',
        })
      }
    })
  } catch (error) {
    console.error('Error toggling place status:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'An error occurred while updating place status',
      position: 'top',
    })
  }
}

async function deletePlace(place) {
  try {
    const confirmed = await $q.dialog({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete "${place.name}"? This action cannot be undone.`,
      cancel: true,
      persistent: true,
      ok: {
        label: 'Delete',
        color: 'negative',
      },
    })

    if (confirmed) {
      const response = await api.get(`/api/v2/admin/places/delete/${place.id}`)

      if (response.data.status) {
        $q.notify({
          type: 'positive',
          message: 'Place deleted successfully!',
          position: 'top',
        })
        loadPlaces() // Reload places to update the table
      } else {
        $q.notify({
          type: 'negative',
          message: response.data.message || 'Failed to delete place',
          position: 'top',
        })
      }
    }
  } catch (error) {
    console.error('Error deleting place:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'An error occurred while deleting the place',
      position: 'top',
    })
  }
}

async function savePlace() {
  try {
    saving.value = true

    const response = await api.post('/api/v2/admin/places/add', placeForm)

    if (response.data.status) {
      $q.notify({
        type: 'positive',
        message: 'Place added successfully!',
        position: 'top',
      })
      closePlaceDialog()
      loadPlaces()
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.message || 'Failed to add place',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Error saving place:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'An error occurred while saving place',
      position: 'top',
    })
  } finally {
    saving.value = false
  }
}

function closePlaceDialog() {
  showCreateDialog.value = false
  placeForm.name = ''
  placeForm.top_left_latitude = ''
  placeForm.top_left_longitude = ''
  placeForm.bottom_right_latitude = ''
  placeForm.bottom_right_longitude = ''
}

// Lifecycle
onMounted(() => {
  // Initialize auth state
  authStore.initializeAuth()

  // Check authentication before loading places
  if (authStore.isAuthenticated) {
    loadPlaces()
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

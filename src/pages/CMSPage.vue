<template>
  <q-page class="q-pa-lg">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="q-mb-xl">
        <div class="row items-center justify-between">
          <div class="col">
            <h1 class="text-h4 text-weight-bold text-grey-9 q-mb-xs">CMS Management</h1>
            <p class="text-body1 text-grey-6">Manage all CMS pages in the system</p>
          </div>
          <div class="col-auto">
            <q-btn
              label="New CMS Page"
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
            <div class="col-12 col-md-4">
              <q-input
                v-model="filters.search"
                placeholder="Search CMS pages..."
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

      <!-- CMS Pages Table -->
      <q-card flat bordered>
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between q-mb-lg">
            <div class="col">
              <h3 class="text-h6 text-weight-bold text-grey-9">
                CMS Pages ({{ filteredPages.length }})
              </h3>
            </div>
            <div class="col-auto">
              <q-btn-group flat>
                <q-btn icon="refresh" @click="loadCMSPages" :loading="loading" />
                <q-btn icon="download" @click="exportPages" :loading="loading" />
              </q-btn-group>
            </div>
          </div>

          <q-table
            :rows="filteredPages"
            :columns="columns"
            :loading="loading"
            :pagination="{ ...pagination, rowsNumber: filteredPages.length }"
            @request="onRequest"
            row-key="id"
            flat
            bordered
          >
            <!-- Type Column -->
            <template #body-cell-type="props">
              <q-td :props="props">
                <q-chip :color="getTypeColor(props.value)" size="sm" dense>
                  {{ props.row.type_label }}
                </q-chip>
              </q-td>
            </template>

            <!-- Content Column -->
            <template #body-cell-content="props">
              <q-td :props="props">
                <div class="text-caption text-truncate" style="max-width: 300px">
                  {{ truncateText(props.value, 100) }}
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
                    @click="viewPage(props.row)"
                    color="grey-7"
                    outline
                  />
                  <q-btn
                    icon="edit"
                    size="sm"
                    @click="editPage(props.row)"
                    color="grey-7"
                    outline
                  />
                  <q-btn
                    icon="delete"
                    size="sm"
                    @click="deletePage(props.row)"
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

    <!-- Create/Edit CMS Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section class="q-pb-none">
          <h3 class="text-h6 text-weight-bold text-grey-9">
            {{ editingPage ? 'Edit CMS Page' : 'Add CMS Page' }}
          </h3>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="savePage" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="pageForm.type"
                  :options="typeOptions"
                  label="Page Type"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Page type is required']"
                />
              </div>
            </div>

            <q-input
              v-model="pageForm.detail"
              label="Content"
              outlined
              type="textarea"
              rows="15"
              :rules="[(val) => !!val || 'Content is required']"
            />

            <div class="q-gutter-sm">
              <q-btn
                :label="editingPage ? 'Update Page' : 'Add Page'"
                type="submit"
                color="primary"
                :loading="saving"
              />
              <q-btn label="Cancel" flat @click="closePageDialog" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- View Page Dialog -->
    <q-dialog v-model="showPageDialog">
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section class="q-pb-none">
          <h3 class="text-h6 text-weight-bold text-grey-9">CMS Page Details</h3>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Page Type</label>
                <div class="detail-value">
                  <q-chip :color="getTypeColor(selectedPage?.type)" size="sm" dense>
                    {{ selectedPage?.type_label }}
                  </q-chip>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Created</label>
                <div class="detail-value">{{ formatDate(selectedPage?.created_at) }}</div>
              </div>
            </div>
            <div class="col-12">
              <div class="detail-item">
                <label class="detail-label">Content</label>
                <div
                  class="detail-value"
                  style="white-space: pre-wrap; max-height: 400px; overflow-y: auto"
                >
                  {{ selectedPage?.detail }}
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Updated</label>
                <div class="detail-value">{{ formatDate(selectedPage?.updated_at) }}</div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Close" flat @click="showPageDialog = false" />
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
const pages = ref([])
const showCreateDialog = ref(false)
const showPageDialog = ref(false)
const editingPage = ref(null)
const selectedPage = ref(null)

// Computed properties
const filteredPages = computed(() => {
  let filtered = pages.value

  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter(
      (page) =>
        page.type_label.toLowerCase().includes(searchTerm) ||
        page.detail.toLowerCase().includes(searchTerm),
    )
  }

  // Apply type filter
  if (filters.type) {
    filtered = filtered.filter((page) => page.type === filters.type)
  }

  return filtered
})

// Filters
const filters = reactive({
  search: '',
  type: '',
})

// Filter options
const typeOptions = [
  { label: 'Terms & Conditions', value: 'tc' },
  { label: 'Privacy Policy', value: 'pp' },
  { label: 'About Us', value: 'au' },
]

// Pagination
const pagination = reactive({
  page: 1,
  rowsPerPage: 30,
  total: 0,
})

// Form
const pageForm = reactive({
  type: '',
  detail: '',
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
    name: 'type',
    label: 'Page Type',
    field: 'type',
    sortable: true,
    align: 'center',
  },
  {
    name: 'content',
    label: 'Content',
    field: 'detail',
    sortable: false,
    align: 'left',
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

function truncateText(text, maxLength) {
  if (!text) return '---'
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

function getTypeColor(type) {
  switch (type) {
    case 'tc':
      return 'primary'
    case 'pp':
      return 'secondary'
    case 'au':
      return 'positive'
    default:
      return 'grey'
  }
}

async function loadCMSPages() {
  try {
    loading.value = true

    const response = await api.get('/api/v2/admin/cms')

    if (response.data.status) {
      pages.value = response.data.data
      pagination.total = response.data.data.length
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.message || 'Failed to load CMS pages',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Failed to load CMS pages:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load CMS pages',
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
  filters.type = ''
  pagination.page = 1
}

function onSearchChange() {
  pagination.page = 1
}

async function exportPages() {
  try {
    loading.value = true

    // Create CSV content
    const csvContent = [
      // CSV headers
      ['ID', 'Page Type', 'Content', 'Created At'].join(','),
      // CSV data
      ...filteredPages.value.map((page) =>
        [
          page.id,
          `"${page.type_label}"`,
          `"${page.detail.replace(/"/g, '""')}"`,
          page.created_at,
        ].join(','),
      ),
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cms_pages_export_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    $q.notify({
      type: 'positive',
      message: 'CMS pages exported successfully',
      position: 'top',
    })
  } catch (error) {
    console.error('Failed to export CMS pages:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to export CMS pages',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

function viewPage(page) {
  selectedPage.value = page
  showPageDialog.value = true
}

function editPage(page) {
  selectedPage.value = page
  editingPage.value = true
  pageForm.type = page.type
  pageForm.detail = page.detail
  showCreateDialog.value = true
}

async function savePage() {
  try {
    saving.value = true

    const response = await api.post('/api/v2/admin/cms/add', pageForm)

    if (response.data.status) {
      $q.notify({
        type: 'positive',
        message: `CMS page ${editingPage.value ? 'updated' : 'added'} successfully!`,
        position: 'top',
      })
      closePageDialog()
      loadCMSPages()
    } else {
      $q.notify({
        type: 'negative',
        message:
          response.data.message || `Failed to ${editingPage.value ? 'update' : 'add'} CMS page`,
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Error saving CMS page:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'An error occurred while saving CMS page',
      position: 'top',
    })
  } finally {
    saving.value = false
  }
}

async function deletePage(page) {
  try {
    $q.dialog({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete this ${page.type_label} page? This action cannot be undone.`,
      cancel: true,
      persistent: true,
      ok: {
        label: 'Delete',
        color: 'negative',
      },
    }).onOk(async () => {
      // Note: The current API doesn't have a delete endpoint, so we'll just show a notification
      $q.notify({
        type: 'info',
        message: 'Delete functionality not implemented in backend yet',
        position: 'top',
      })
    })
  } catch (error) {
    console.error('Error deleting CMS page:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'An error occurred while deleting the CMS page',
      position: 'top',
    })
  }
}

function closePageDialog() {
  showCreateDialog.value = false
  editingPage.value = false
  pageForm.type = ''
  pageForm.detail = ''
  selectedPage.value = null
}

// Lifecycle
onMounted(() => {
  // Initialize auth state
  authStore.initializeAuth()

  // Check authentication before loading pages
  if (authStore.isAuthenticated) {
    loadCMSPages()
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

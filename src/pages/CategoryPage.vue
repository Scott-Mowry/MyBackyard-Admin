<template>
  <q-page class="q-pa-lg">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="q-mb-xl">
        <div class="row items-center justify-between">
          <div class="col">
            <h1 class="text-h4 text-weight-bold text-grey-9 q-mb-xs">Category Management</h1>
            <p class="text-body1 text-grey-6">Manage all categories in the system</p>
          </div>
          <div class="col-auto">
            <q-btn
              label="New Category"
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
            <div class="col-12 col-md-6">
              <q-input
                v-model="filters.search"
                placeholder="Search categories..."
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

      <!-- Categories Table -->
      <q-card flat bordered>
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between q-mb-lg">
            <div class="col">
              <h3 class="text-h6 text-weight-bold text-grey-9">
                Categories ({{ filteredCategories.length }})
              </h3>
            </div>
            <div class="col-auto">
              <q-btn-group flat>
                <q-btn icon="refresh" @click="loadCategories" :loading="loading" />
                <q-btn icon="download" @click="exportCategories" :loading="loading" />
              </q-btn-group>
            </div>
          </div>

          <q-table
            :rows="filteredCategories"
            :columns="columns"
            :loading="loading"
            :pagination="{ ...pagination, rowsNumber: filteredCategories.length }"
            @request="onRequest"
            row-key="id"
            flat
            bordered
          >
            <!-- Icon Column -->
            <template #body-cell-icon="props">
              <q-td :props="props">
                <q-img
                  v-if="props.value"
                  :src="`${api.defaults.baseURL}${props.value}`"
                  style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover"
                  spinner-color="primary"
                  spinner-size="20px"
                  @error="
                    (err) =>
                      console.log(
                        'Image error for:',
                        props.value,
                        'URL:',
                        `${api.defaults.baseURL}${props.value}`,
                      )
                  "
                  @load="() => console.log('Image loaded successfully for:', props.value)"
                />
                <q-icon v-else name="image" size="40px" color="grey-5" />
              </q-td>
            </template>

            <!-- Actions Column -->
            <template #body-cell-actions="props">
              <q-td :props="props">
                <q-btn-group flat>
                  <q-btn
                    icon="visibility"
                    size="sm"
                    @click="viewCategory(props.row)"
                    color="grey-7"
                    outline
                  />
                  <q-btn
                    icon="edit"
                    size="sm"
                    @click="editCategory(props.row)"
                    color="grey-7"
                    outline
                  />
                  <q-btn
                    icon="delete"
                    size="sm"
                    @click="deleteCategory(props.row)"
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

    <!-- Create/Edit Category Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="q-pb-none">
          <h3 class="text-h6 text-weight-bold text-grey-9">
            {{ editingCategory ? 'Edit Category' : 'Add Category' }}
          </h3>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="saveCategory" class="q-gutter-md">
            <q-input
              v-model="categoryForm.category_name"
              label="Category Name"
              outlined
              dense
              :rules="[(val) => !!val || 'Category name is required']"
            />

            <q-file
              v-model="selectedIconFile"
              label="Category Icon"
              outlined
              dense
              accept=".jpg,.jpeg,.png,.gif,.svg"
              :rules="[
                (val) => !val || val.size <= 5 * 1024 * 1024 || 'File size must be less than 5MB',
              ]"
              @update:model-value="onIconFileSelected"
              hint="Upload an icon image (Max 5MB)"
            >
              <template #prepend>
                <q-icon name="upload_file" color="grey-6" />
              </template>
              <template #append>
                <q-icon name="image" color="grey-6" />
              </template>
            </q-file>

            <div v-if="iconPreviewUrl" class="q-mt-md">
              <div class="text-caption text-grey-6">Preview:</div>
              <img
                :src="iconPreviewUrl"
                style="max-width: 100px; max-height: 100px; border-radius: 8px; object-fit: cover"
              />
            </div>

            <div class="q-gutter-sm">
              <q-btn
                :label="editingCategory ? 'Update Category' : 'Add Category'"
                type="submit"
                color="primary"
                :loading="saving"
              />
              <q-btn label="Cancel" flat @click="closeCategoryDialog" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- View Category Dialog -->
    <q-dialog v-model="showCategoryDialog">
      <q-card style="min-width: 500px; max-width: 600px">
        <q-card-section class="q-pb-none">
          <h3 class="text-h6 text-weight-bold text-grey-9">Category Details</h3>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Name</label>
                <div class="detail-value">{{ selectedCategory?.category_name }}</div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Status</label>
                <div class="detail-value">
                  <q-chip
                    :color="
                      selectedCategory?.status === 'Active' || selectedCategory?.status === '---'
                        ? 'positive'
                        : 'negative'
                    "
                    :icon="
                      selectedCategory?.status === 'Active' || selectedCategory?.status === '---'
                        ? 'check_circle'
                        : 'block'
                    "
                    size="sm"
                    dense
                  >
                    {{ selectedCategory?.status === '---' ? 'Active' : selectedCategory?.status }}
                  </q-chip>
                </div>
              </div>
            </div>
            <div class="col-12">
              <div class="detail-item">
                <label class="detail-label">Icon</label>
                <div class="detail-value">
                  {{ selectedCategory?.category_icon || 'No icon provided' }}
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Created</label>
                <div class="detail-value">{{ formatDate(selectedCategory?.created_at) }}</div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-item">
                <label class="detail-label">Updated</label>
                <div class="detail-value">{{ formatDate(selectedCategory?.updated_at) }}</div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Close" flat @click="showCategoryDialog = false" />
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
const categories = ref([])
const showCreateDialog = ref(false)
const showCategoryDialog = ref(false)
const editingCategory = ref(null)
const selectedCategory = ref(null)

// Computed properties
const filteredCategories = computed(() => {
  let filtered = categories.value

  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter(
      (category) =>
        category.category_name.toLowerCase().includes(searchTerm) ||
        category.category_icon?.toLowerCase().includes(searchTerm),
    )
  }

  return filtered
})

// Filters
const filters = reactive({
  search: '',
})

// Pagination
const pagination = reactive({
  page: 1,
  rowsPerPage: 30,
  total: 0,
})

// Form
const categoryForm = reactive({
  category_name: '',
  category_icon: null,
})

// File upload state
const selectedIconFile = ref(null)
const iconPreviewUrl = ref('')

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
    field: 'category_name',
    sortable: true,
    align: 'left',
  },
  {
    name: 'icon',
    label: 'Icon',
    field: 'category_icon',
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

async function loadCategories() {
  try {
    loading.value = true

    const response = await api.get('/api/v2/admin/categories')

    if (response.data.status) {
      categories.value = response.data.data
      pagination.total = response.data.data.length
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.message || 'Failed to load categories',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Failed to load categories:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load categories',
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
  pagination.page = 1
}

function onSearchChange() {
  pagination.page = 1
}

async function exportCategories() {
  try {
    loading.value = true

    // Create CSV content
    const csvContent = [
      // CSV headers
      ['ID', 'Name', 'Icon', 'Created At'].join(','),
      // CSV data
      ...filteredCategories.value.map((category) =>
        [
          category.id,
          `"${category.category_name}"`,
          `"${category.category_icon || ''}"`,
          category.created_at,
        ].join(','),
      ),
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `categories_export_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    $q.notify({
      type: 'positive',
      message: 'Categories exported successfully',
      position: 'top',
    })
  } catch (error) {
    console.error('Failed to export categories:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to export categories',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

function viewCategory(category) {
  selectedCategory.value = category
  showCategoryDialog.value = true
}

function editCategory(category) {
  selectedCategory.value = category
  editingCategory.value = true
  categoryForm.category_name = category.category_name
  categoryForm.category_icon = category.category_icon || null
  selectedIconFile.value = null
  iconPreviewUrl.value = category.category_icon || ''
  showCreateDialog.value = true
}

async function saveCategory() {
  const isNewCategory = !editingCategory.value
  const categoryId = selectedCategory.value?.id

  try {
    saving.value = true

    // Create FormData for file upload
    const formData = new FormData()
    formData.append('category_name', categoryForm.category_name)
    // Add icon file if selected
    if (selectedIconFile.value) {
      formData.append('category_icon', selectedIconFile.value)
    }
    // Add ID for updates
    if (!isNewCategory) {
      formData.append('id', categoryId)
    }
    const endpoint = isNewCategory
      ? '/api/v2/admin/categories/add'
      : '/api/v2/admin/categories/update'
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.data.status) {
      $q.notify({
        type: 'positive',
        message: `Category ${isNewCategory ? 'created' : 'updated'} successfully!`,
        position: 'top',
      })
      closeCategoryDialog()
      loadCategories()
    } else {
      $q.notify({
        type: 'negative',
        message:
          response.data.message || `Failed to ${isNewCategory ? 'create' : 'update'} category`,
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Error saving category:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'An error occurred while saving category changes',
      position: 'top',
    })
  } finally {
    saving.value = false
  }
}

function onIconFileSelected(file) {
  if (file) {
    iconPreviewUrl.value = URL.createObjectURL(file)
  } else {
    iconPreviewUrl.value = ''
  }
}

function closeCategoryDialog() {
  showCreateDialog.value = false
  editingCategory.value = false
  categoryForm.category_name = ''
  categoryForm.category_icon = null
  selectedCategory.value = null
  selectedIconFile.value = null
  iconPreviewUrl.value = ''
}

async function deleteCategory(category) {
  try {
    $q.dialog({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete "${category.category_name}"? This action cannot be undone.`,
      cancel: true,
      persistent: true,
      ok: {
        label: 'Delete',
        color: 'negative',
      },
    }).onOk(async () => {
      const response = await api.delete(`/api/v2/admin/categories/${category.id}`)

      if (response.data.status) {
        $q.notify({
          type: 'positive',
          message: 'Category deleted successfully!',
          position: 'top',
        })
        loadCategories() // Reload categories to update the table
      } else {
        $q.notify({
          type: 'negative',
          message: response.data.message || 'Failed to delete category',
          position: 'top',
        })
      }
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'An error occurred while deleting the category',
      position: 'top',
    })
  }
}

// Lifecycle
onMounted(() => {
  // Initialize auth state
  authStore.initializeAuth()

  // Check authentication before loading categories
  if (authStore.isAuthenticated) {
    loadCategories()
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

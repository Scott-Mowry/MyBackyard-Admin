<template>
  <q-page class="q-pa-lg">
    <div class="max-w-4xl mx-auto">
      <!-- Header Section -->
      <div class="text-center q-mb-xl">
        <h1 class="text-h3 text-weight-bold text-grey-9 q-mb-sm">Profile Settings</h1>
        <p class="text-body1 text-grey-6">Manage your account information and preferences</p>
      </div>

      <div class="row q-col-gutter-lg">
        <!-- Profile Image Section -->
        <div class="col-12 col-md-4">
          <q-card flat bordered class="profile-image-card">
            <q-card-section class="text-center q-pa-xl">
              <div class="profile-image-container q-mb-lg">
                <q-avatar size="150px" class="profile-avatar">
                  <img
                    v-if="form.profile_image"
                    :src="form.profile_image"
                    style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%"
                    @error="(err) => console.log('Image error:', err)"
                    @load="() => console.log('Image loaded successfully')"
                  />
                  <q-icon v-else name="person" size="80px" color="grey-5" />
                </q-avatar>
                <q-btn
                  icon="edit"
                  color="primary"
                  round
                  size="sm"
                  class="edit-image-btn"
                  @click="editImage = true"
                />
              </div>
              <div class="text-h6 text-weight-bold text-grey-9 q-mb-xs">
                {{ form.name || 'Admin User' }}
              </div>
              <div class="text-body2 text-grey-6 q-mb-md">
                {{ form.email || 'admin@example.com' }}
              </div>

              <q-chip
                :color="auth.user?.role === 'Admin' ? 'primary' : 'grey'"
                :icon="auth.user?.role === 'Admin' ? 'admin_panel_settings' : 'person'"
                size="sm"
                dense
              >
                {{ auth.user?.role || 'Admin' }}
              </q-chip>
            </q-card-section>
          </q-card>
        </div>

        <!-- Form Section -->
        <div class="col-12 col-md-8">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h5 text-weight-bold text-grey-9 q-mb-lg">Personal Information</div>
              <q-form @submit.prevent="onSubmit" class="q-gutter-md">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-12 q-ml-md q-pr-md">
                    <q-input
                      v-model="form.name"
                      label="Name"
                      outlined
                      dense
                      :rules="[(val) => !!val || 'First name is required']"
                      class="form-input"
                    >
                      <template #prepend>
                        <q-icon name="person" color="grey-6" />
                      </template>
                    </q-input>
                  </div>
                  <!-- <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.last_name"
                      label="Last Name"
                      outlined
                      dense
                      class="form-input"
                    >
                      <template #prepend>
                        <q-icon name="person_outline" color="grey-6" />
                      </template>
                    </q-input>
                  </div> -->
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-5 q-ml-md">
                    <q-input
                      v-model="form.email"
                      label="Email Address"
                      outlined
                      dense
                      type="email"
                      :rules="[
                        (val) => !!val || 'Email is required',
                        (val) => validateEmail(val) || 'Please enter a valid email',
                      ]"
                      class="form-input"
                    >
                      <template #prepend>
                        <q-icon name="email" color="grey-6" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.phone"
                      label="Phone Number"
                      outlined
                      dense
                      class="form-input"
                    >
                      <template #prepend>
                        <q-icon name="phone" color="grey-6" />
                      </template>
                    </q-input>
                  </div>
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-12 q-ml-md q-pr-md">
                    <q-input
                      v-model="form.address"
                      label="Address"
                      outlined
                      dense
                      class="form-input"
                    >
                      <template #prepend>
                        <q-icon name="location_on" color="grey-6" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-md-6 q-ml-md">
                    <q-input
                      v-model="form.zip_code"
                      label="Zip Code"
                      outlined
                      dense
                      class="form-input"
                    >
                      <template #prepend>
                        <q-icon name="markunread_mailbox" color="grey-6" />
                      </template>
                    </q-input>
                  </div>
                </div>

                <q-input
                  v-model="form.description"
                  label="Bio / Description"
                  outlined
                  dense
                  type="textarea"
                  rows="3"
                  class="form-input"
                  hint="Tell us a bit about yourself"
                >
                  <template #prepend>
                    <q-icon name="description" color="grey-6" />
                  </template>
                </q-input>

                <q-separator class="q-my-lg" />

                <div class="text-h6 text-weight-bold text-grey-9 q-mb-md">Security</div>
                <q-input
                  v-model="form.password"
                  label="New Password"
                  outlined
                  dense
                  :type="showPassword ? 'text' : 'password'"
                  hint="Leave blank to keep current password"
                  class="form-input"
                >
                  <template #prepend>
                    <q-icon name="lock" color="grey-6" />
                  </template>
                  <template #append>
                    <q-icon
                      :name="showPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showPassword = !showPassword"
                    />
                  </template>
                </q-input>

                <div class="row q-col-gutter-md q-mt-lg">
                  <div class="col-12 col-md-6 q-ml-md">
                    <q-btn
                      label="Save Changes"
                      type="submit"
                      color="primary"
                      :loading="saving"
                      class="full-width"
                      size="lg"
                    />
                  </div>
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Image Upload Dialog -->
    <q-dialog v-model="editImage" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="q-pb-none">
          <div class="text-h6 text-weight-bold text-grey-9">Update Profile Image</div>
        </q-card-section>

        <q-card-section>
          <div class="text-body2 text-grey-6 q-mb-md">
            Upload a new profile image. Supported formats: JPG, PNG, GIF (Max 5MB)
          </div>

          <q-file
            v-model="selectedFile"
            label="Choose Image"
            outlined
            dense
            accept=".jpg,.jpeg,.png,.gif"
            :rules="[
              (val) => !val || val.size <= 5 * 1024 * 1024 || 'File size must be less than 5MB',
            ]"
            @update:model-value="onFileSelected"
          >
            <template #prepend>
              <q-icon name="upload_file" color="grey-6" />
            </template>
            <template #append>
              <q-icon name="image" color="grey-6" />
            </template>
          </q-file>

          <div v-if="selectedFile" class="q-mt-md">
            <div class="text-caption text-grey-6">Preview:</div>
            <img
              :src="previewUrl"
              style="max-width: 200px; max-height: 200px; border-radius: 8px; object-fit: cover"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cancel" flat @click="cancelImageUpload" />
          <q-btn
            label="Upload"
            color="primary"
            :loading="uploading"
            :disable="!selectedFile"
            @click="uploadImage"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAdminAuthStore } from 'stores/adminAuth'
import { useUserStore } from 'stores/userStore'
import { api } from 'boot/axios'

const $q = useQuasar()
const auth = useAdminAuthStore()
const userStore = useUserStore()
const saving = ref(false)
const editImage = ref(false)
const showPassword = ref(false)
const selectedFile = ref(null)
const previewUrl = ref('')
const uploading = ref(false)

const form = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  zip_code: '',
  profile_image: '',
  description: '',
  password: '',
})

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function loadProfile() {
  if (auth.user) {
    // Construct full URL for profile image if it's a relative path
    let profileImageUrl = auth.user.profile_image || ''
    if (profileImageUrl && profileImageUrl.startsWith('/storage/')) {
      profileImageUrl = `${api.defaults.baseURL}${profileImageUrl}`
    }

    form.value = {
      name: auth.user.name || '',
      email: auth.user.email || '',
      phone: auth.user.phone || '',
      address: auth.user.address || '',
      zip_code: auth.user.zip_code || '',
      profile_image: profileImageUrl,
      description: auth.user.description || '',
      password: '',
    }
    console.log('Profile loaded, image URL:', form.value.profile_image)
  }
}

function resetForm() {
  loadProfile()
}

function onFileSelected(file) {
  if (file) {
    previewUrl.value = URL.createObjectURL(file)
  } else {
    previewUrl.value = ''
  }
}

function cancelImageUpload() {
  selectedFile.value = null
  previewUrl.value = ''
  editImage.value = false
}

async function uploadImage() {
  if (!selectedFile.value) return

  uploading.value = true
  try {
    // Create FormData for file upload
    const formData = new FormData()
    formData.append('profile_image', selectedFile.value)

    // Upload to backend
    const response = await api.post('/api/v2/admin/users/upload-profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.data.status) {
      // Construct the full URL for the image
      const imageUrl = `${api.defaults.baseURL}${response.data.data.profile_image}`
      form.value.profile_image = imageUrl
      console.log('Profile image URL set to:', imageUrl)

      // Update the auth store user data
      if (auth.user) {
        auth.user.profile_image = imageUrl
        localStorage.setItem('admin_user', JSON.stringify(auth.user))
      }

      // Close the dialog
      editImage.value = false
      selectedFile.value = null
      previewUrl.value = ''

      $q.notify({
        type: 'positive',
        message: 'Profile image uploaded successfully!',
        position: 'top',
        icon: 'check_circle',
      })
    } else {
      throw new Error(response.data.message || 'Upload failed')
    }
  } catch (error) {
    console.error('Upload error:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to upload image',
      position: 'top',
      icon: 'error',
    })
  } finally {
    uploading.value = false
  }
}

async function onSubmit() {
  saving.value = true
  try {
    const updateData = { ...form.value }

    // Remove empty fields to avoid validation errors
    if (!updateData.password) delete updateData.password
    if (!updateData.address || updateData.address.trim() === '') delete updateData.address
    if (!updateData.zip_code || updateData.zip_code.trim() === '') delete updateData.zip_code
    if (!updateData.description || updateData.description.trim() === '')
      delete updateData.description
    if (!updateData.profile_image || updateData.profile_image.trim() === '')
      delete updateData.profile_image

    const result = await userStore.updateUser(auth.user.id, updateData)
    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Profile updated successfully!',
        position: 'top',
        icon: 'check_circle',
      })

      // Update the local user data with the response data
      if (result.data) {
        auth.setUser(result.data)
        localStorage.setItem('admin_user', JSON.stringify(result.data))
      }

      resetForm()
    } else {
      $q.notify({
        type: 'negative',
        message: result.error || 'Failed to update profile',
        position: 'top',
        icon: 'error',
      })
    }
  } catch {
    $q.notify({
      type: 'negative',
      message: 'An error occurred',
      position: 'top',
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.max-w-4xl {
  max-width: 1200px;
}

.profile-image-card {
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.profile-image-container {
  position: relative;
  display: inline-block;
}

.profile-avatar {
  border: 4px solid #e5e7eb;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.edit-image-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  transform: translate(25%, 25%);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.form-input {
  border-radius: 8px;
}

.form-input :deep(.q-field__control) {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  transition: all 0.2s ease;
}

.form-input :deep(.q-field__control:hover) {
  border-color: #9ca3af;
}

.form-input :deep(.q-field--focused .q-field__control) {
  border-color: var(--q-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgb(var(--q-primary-rgb, 59 130 246) / 0.1);
}

.q-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.q-separator {
  background: #e5e7eb;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .profile-image-container {
    margin-bottom: 24px;
  }

  .q-col-gutter-md {
    column-gap: 12px;
  }
}
</style>

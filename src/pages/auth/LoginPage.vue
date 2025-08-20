<template>
  <q-page class="flex flex-center auth-page" style="min-height: 100vh">
    <div class="auth-container">
      <!-- Logo/Brand Section -->
      <div class="text-center q-mb-xl">
        <div class="q-mb-lg">
          <q-avatar size="200px" class="q-mb-md">
            <img src="/logo.png" alt="App Logo" @error="handleLogoError" />
          </q-avatar>
        </div>
        <div class="text-h4 text-weight-bold text-grey-9 q-mb-xs">Welcome back</div>
        <div class="text-body1 text-grey-6">Enter your credentials to access your account</div>
      </div>
      <q-card flat bordered class="auth-card">
        <q-card-section class="q-pa-lg">
          <q-form @submit.prevent="onSubmit" class="auth-form">
            <!-- Email Field -->
            <div class="form-field">
              <label class="form-label">Email</label>
              <q-input
                v-model="email"
                type="email"
                placeholder="Enter your email"
                outlined
                dense
                class="form-input"
                :rules="[
                  (val) => !!val || 'Email is required',
                  (val) => validateEmail(val) || 'Please enter a valid email',
                ]"
                hide-bottom-space
              >
                <template #prepend>
                  <q-icon name="email" size="18px" color="grey-6" />
                </template>
              </q-input>
            </div>
            <!-- Password Field -->
            <div class="form-field">
              <label class="form-label">Password</label>
              <q-input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                outlined
                dense
                class="form-input"
                :rules="[(val) => !!val || 'Password is required']"
                hide-bottom-space
              >
                <template #prepend>
                  <q-icon name="lock" size="18px" color="grey-6" />
                </template>
                <template #append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    size="18px"
                    color="grey-6"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>
            </div>
            <!-- Error Message -->
            <div v-if="auth.error" class="error-message q-mt-md">
              <q-icon name="error" size="16px" />
              <span>{{ auth.error }}</span>
            </div>
            <!-- Submit Button -->
            <q-btn
              label="Sign in"
              type="submit"
              color="primary"
              class="submit-btn q-mt-lg"
              unelevated
              size="lg"
              :loading="auth.loading"
            />
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useAdminAuthStore } from 'stores/adminAuth'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const auth = useAdminAuthStore()
const router = useRouter()
const $q = useQuasar()

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function handleLogoError() {
  // If logo fails to load, we can handle it here
  console.warn('Logo failed to load')
}

async function onSubmit() {
  console.log('Admin auth store:', auth)
  console.log('Available methods:', Object.keys(auth))

  const result = await auth.adminLogin({
    email: email.value,
    password: password.value,
  })

  console.log('Login result:', result)
  console.log('Auth user after login:', auth.user)

  if (result.success) {
    // Show success message
    $q.notify({
      type: 'positive',
      message: 'Login successful! Redirecting...',
      position: 'top',
    })

    // Redirect to admin dashboard
    router.push('/dashboard')
  } else {
    // Show error message
    $q.notify({
      type: 'negative',
      message: result.error || 'Login failed',
      position: 'top',
      timeout: 5000, // Show blocked account message longer
    })
  }
}
</script>

<style scoped>
.auth-page {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.auth-container {
  width: 100%;
  max-width: 420px;
  padding: 0 20px;
}

.app-logo {
  max-width: 200px;
  object-fit: contain;
  border-radius: 8px;
}

.auth-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1);
  background: white;
}

.auth-form {
  width: 100%;
}

.form-field {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
  line-height: 1.4;
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

.form-input :deep(.q-field__native) {
  padding: 12px 16px;
  font-size: 14px;
  color: #111827;
}

.form-input :deep(.q-field__prepend) {
  padding-left: 16px;
}

.form-input :deep(.q-field__append) {
  padding-right: 16px;
}

.forgot-password-btn {
  font-size: 14px;
  font-weight: 500;
  color: var(--q-primary, #3b82f6);
  text-decoration: none;
  padding: 0;
  min-height: unset;
}

.forgot-password-btn:hover {
  color: var(--q-primary-dark, #2563eb);
  text-decoration: underline;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
}

.submit-btn {
  width: 100%;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.025em;
  padding: 12px 24px;
  background: var(--q-primary, #3b82f6);
  color: white;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background: var(--q-primary-dark, #2563eb);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgb(var(--q-primary-rgb, 59 130 246) / 0.3);
}

.divider {
  position: relative;
  text-align: center;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb;
}

.divider-text {
  background: white;
  padding: 0 16px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.link-btn {
  font-size: 14px;
  font-weight: 500;
  color: var(--q-primary, #3b82f6);
  text-decoration: none;
  padding: 0;
  min-height: unset;
}

.link-btn:hover {
  color: var(--q-primary-dark, #2563eb);
  text-decoration: underline;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .auth-container {
    padding: 0 16px;
  }

  .auth-card {
    border-radius: 8px;
  }
}
</style>

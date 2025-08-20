<template>
  <q-layout view="lHh Lpr lFf" class="main-layout">
    <q-header elevated class="bg-white text-grey-9">
      <q-toolbar>
        <q-toolbar-title class="text-weight-bold">
          <q-btn flat @click="leftDrawerOpen = !leftDrawerOpen" class="text-weight-bold">
            <q-icon name="menu" />
          </q-btn>
          Admin Portal
        </q-toolbar-title>

        <div class="toolbar-actions">
          <q-btn-dropdown flat color="grey-7" icon="account_circle">
            <q-list>
              <q-item clickable v-close-popup @click="goToProfile">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>
                  <div class="text-weight-bold">{{ auth.user?.name || 'Admin' }}</div>
                  <div class="text-caption text-grey-6">{{ auth.user?.email }}</div>
                </q-item-section>
              </q-item>
              <q-separator />
              <!-- <q-item clickable v-close-popup @click="goToProfile">
                <q-item-section avatar>
                  <q-icon name="edit" />
                </q-item-section>
                <q-item-section>Edit Profile</q-item-section>
              </q-item> -->
              <q-item clickable v-close-popup @click="handleLogout">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-white">
      <q-list>
        <img
          src="/logo.png"
          alt="App Logo"
          class="logo q-mt-md q-ml-xl"
          style="width: 200px; height: 200px"
        />
        <q-item-label header class="text-weight-bold text-grey-8"> Menu </q-item-label>

        <q-item clickable v-ripple to="/dashboard" active-class="bg-primary text-white">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/users" active-class="bg-primary text-white">
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>Users</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/subscribed-users" active-class="bg-primary text-white">
          <q-item-section avatar>
            <q-icon name="how_to_reg" />
          </q-item-section>
          <q-item-section>Subscribed Users</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/subscriptions" active-class="bg-primary text-white">
          <q-item-section avatar>
            <q-icon name="subscriptions" />
          </q-item-section>
          <q-item-section>Subscriptions</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/categories" active-class="bg-primary text-white">
          <q-item-section avatar>
            <q-icon name="category" />
          </q-item-section>
          <q-item-section>Categories</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/promocodes" active-class="bg-primary text-white">
          <q-item-section avatar>
            <q-icon name="local_offer" />
          </q-item-section>
          <q-item-section>Promo Codes</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/receipts" active-class="bg-primary text-white">
          <q-item-section avatar>
            <q-icon name="receipt" />
          </q-item-section>
          <q-item-section>Receipts</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/places" active-class="bg-primary text-white">
          <q-item-section avatar>
            <q-icon name="place" />
          </q-item-section>
          <q-item-section>Places</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/cms" active-class="bg-primary text-white">
          <q-item-section avatar>
            <q-icon name="article" />
          </q-item-section>
          <q-item-section>CMS</q-item-section>
        </q-item>

        <!-- <q-item clickable v-ripple to="/stock-images" active-class="bg-primary text-white">
          <q-item-section avatar>
            <q-icon name="image" />
          </q-item-section>
          <q-item-section>Stock Images</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/manage-words" active-class="bg-primary text-white">
          <q-item-section avatar>
            <q-icon name="translate" />
          </q-item-section>
          <q-item-section>Manage Words</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/upload-files" active-class="bg-primary text-white">
          <q-item-section avatar>
            <q-icon name="upload_file" />
          </q-item-section>
          <q-item-section>Upload Files</q-item-section>
        </q-item> -->
      </q-list>
    </q-drawer>

    <q-page-container :class="{ transitioning: isTransitioning }">
      <router-view v-slot="{ Component }">
        <transition
          :name="transitionName"
          @enter="onTransitionEnter"
          @after-enter="onTransitionAfterEnter"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

    <!-- Mobile Footer Navigation -->
    <q-footer elevated class="bg-white mobile-footer">
      <q-tabs
        v-model="activeTab"
        active-color="primary"
        indicator-color="transparent"
        align="justify"
        narrow-indicator
        class="text-grey-8"
      >
        <q-tab
          name="dashboard"
          icon="dashboard"
          label="Dashboard"
          @click="navigateTo('/dashboard')"
        />
        <q-tab name="users" icon="people" label="Users" @click="navigateTo('/users')" />
        <q-tab
          name="subscriptions"
          icon="subscriptions"
          label="Plans"
          @click="navigateTo('/subscriptions')"
        />
        <q-tab
          name="categories"
          icon="category"
          label="Categories"
          @click="navigateTo('/categories')"
        />
        <q-tab name="more" icon="more_horiz" label="More" @click="showMoreMenu" />
      </q-tabs>
    </q-footer>

    <!-- More Menu Dialog for Mobile -->
    <q-dialog v-model="showMoreDialog" position="bottom">
      <q-card class="full-width">
        <q-card-section class="q-pa-none">
          <q-list>
            <q-item-label header class="text-weight-bold">More Options</q-item-label>

            <q-item clickable v-close-popup @click="navigateTo('/subscribed-users')">
              <q-item-section avatar>
                <q-icon name="how_to_reg" />
              </q-item-section>
              <q-item-section>Subscribed Users</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="navigateTo('/promocodes')">
              <q-item-section avatar>
                <q-icon name="local_offer" />
              </q-item-section>
              <q-item-section>Promo Codes</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="navigateTo('/receipts')">
              <q-item-section avatar>
                <q-icon name="receipt" />
              </q-item-section>
              <q-item-section>Receipts</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="navigateTo('/places')">
              <q-item-section avatar>
                <q-icon name="place" />
              </q-item-section>
              <q-item-section>Places</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="navigateTo('/cms')">
              <q-item-section avatar>
                <q-icon name="article" />
              </q-item-section>
              <q-item-section>CMS</q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable v-close-popup @click="goToProfile">
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>
              <q-item-section>Profile</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="handleLogout">
              <q-item-section avatar>
                <q-icon name="logout" color="negative" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-negative">Logout</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdminAuthStore } from 'stores/adminAuth'

const router = useRouter()
const route = useRoute()
const auth = useAdminAuthStore()
const leftDrawerOpen = ref(true)

// Mobile footer navigation
const activeTab = ref('dashboard')
const showMoreDialog = ref(false)

// Transition state management
const transitionName = ref('slide-right')
const isTransitioning = ref(false)

// Define page hierarchy for smart transitions
const pageHierarchy = {
  '/dashboard': 0,
  '/users': 1,
  '/subscribed-users': 2,
  '/subscriptions': 3,
  '/categories': 4,
  '/promocodes': 5,
  '/receipts': 6,
  '/places': 7,
  '/cms': 8,
  '/profile': 9,
}

// Update active tab based on current route
watch(
  () => route.path,
  (newPath) => {
    // Map routes to tab names
    const routeToTabMap = {
      '/dashboard': 'dashboard',
      '/users': 'users',
      '/subscriptions': 'subscriptions',
      '/categories': 'categories',
      '/subscribed-users': 'more',
      '/promocodes': 'more',
      '/receipts': 'more',
      '/places': 'more',
      '/cms': 'more',
      '/profile': 'more',
    }

    activeTab.value = routeToTabMap[newPath] || 'dashboard'
  },
  { immediate: true },
)

// Watch route changes to determine transition direction
watch([() => route.path], ([newPath], [oldPath]) => {
  if (newPath && oldPath) {
    const newLevel = pageHierarchy[newPath] ?? 0
    const oldLevel = pageHierarchy[oldPath] ?? 0

    if (newLevel > oldLevel) {
      transitionName.value = 'slide-right'
    } else if (newLevel < oldLevel) {
      transitionName.value = 'slide-left'
    } else {
      transitionName.value = 'slide-right' // Default
    }
  }
})

// Navigation functions
const navigateTo = (path) => {
  router.push(path)
}

const showMoreMenu = () => {
  showMoreDialog.value = true
}

const handleLogout = async () => {
  try {
    await auth.adminLogout()
    router.push('/auth/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

const goToProfile = () => {
  router.push('/profile')
}

// Transition event handlers
const onTransitionEnter = () => {
  isTransitioning.value = true
}

const onTransitionAfterEnter = () => {
  isTransitioning.value = false
}
</script>

<style scoped>
.main-layout {
  background: #f8fafc;
}

.q-header {
  border-bottom: 1px solid #e5e7eb;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.q-drawer {
  border-right: 1px solid #e5e7eb;
}

.q-item {
  border-radius: 8px;
  margin: 4px 8px;
}

.q-item:hover {
  background: #f3f4f6;
}

.q-item.active-class {
  background: var(--q-primary, #3b82f6);
  color: white;
}

/* Slide-right page transitions */
.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

/* Slide Right - Forward navigation */
.slide-right-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Slide Left - Backward navigation */
.slide-left-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Add depth with shadows during transition */
.slide-right-enter-active,
.slide-left-enter-active {
  z-index: 2;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
}

.slide-right-leave-active,
.slide-left-leave-active {
  z-index: 1;
}

/* Ensure page container has relative positioning for absolute positioned transitions */
.q-page-container {
  position: relative;
  overflow: hidden;

  /* Add a subtle background during transitions */
  background: #f8fafc;
}

/* Optional: Add a loading state style */
.q-page-container.transitioning {
  pointer-events: none;
}

/* Mobile-specific optimizations */
@media (max-width: 768px) {
  .slide-right-enter-active,
  .slide-right-leave-active,
  .slide-left-enter-active,
  .slide-left-leave-active {
    transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  /* Reduce shadow on mobile for better performance */
  .slide-right-enter-active,
  .slide-left-enter-active {
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.08);
  }

  /* Show mobile footer and hide desktop drawer */
  .mobile-footer {
    display: block !important;
  }

  .q-drawer {
    display: none !important;
  }

  /* Add bottom padding to account for footer */
  .q-page-container {
    padding-bottom: 70px !important;
  }
}

/* Desktop - hide mobile footer */
@media (min-width: 769px) {
  .mobile-footer {
    display: none !important;
  }
}

/* Mobile footer styling */
.mobile-footer {
  border-top: 1px solid #e5e7eb;
  z-index: 1000;
}

.mobile-footer .q-tabs {
  height: 70px;
  background-color: white !important;
}

.mobile-footer .q-tab {
  min-height: 70px;
  padding: 8px 4px;
  color: #6b7280 !important;
  transition: color 0.2s ease;
}

.mobile-footer .q-tab:hover {
  color: var(--q-primary) !important;
}

.mobile-footer .q-tab__content {
  flex-direction: column;
  gap: 4px;
}

.mobile-footer .q-tab__icon {
  font-size: 20px;
  margin-bottom: 2px;
  color: #6b7280 !important;
  transition: color 0.2s ease;
}

.mobile-footer .q-tab__label {
  font-size: 11px;
  font-weight: 500;
  line-height: 1.2;
  color: #6b7280 !important;
  transition: color 0.2s ease;
}

/* Active tab styling */
.mobile-footer .q-tab--active {
  color: var(--q-primary) !important;
}

.mobile-footer .q-tab--active .q-tab__icon {
  color: var(--q-primary) !important;
}

.mobile-footer .q-tab--active .q-tab__label {
  font-weight: 600;
  color: var(--q-primary) !important;
}

/* More menu dialog styling */
.q-dialog .q-card {
  border-radius: 16px 16px 0 0;
}

.q-dialog .q-item {
  padding: 12px 16px;
  border-radius: 8px;
  margin: 4px 8px;
}

.q-dialog .q-item:hover {
  background: #f3f4f6;
}
</style>

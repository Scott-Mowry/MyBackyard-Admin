import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useAdminAuthStore } from 'stores/adminAuth'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach((to, from, next) => {
    const authStore = useAdminAuthStore()
    const publicPages = ['/auth/login']
    const isPublic = publicPages.includes(to.path)
    const isLoggedIn = authStore.isAuthenticated

    // Check if user is authenticated and has Admin role
    if (!isLoggedIn && !isPublic) {
      next({ path: '/auth/login' })
    } else if (isLoggedIn && isPublic) {
      next({ path: '/dashboard' })
    } else if (isLoggedIn && !isPublic) {
      // Additional check: ensure user has Admin role
      if (authStore.user && authStore.user.role !== 'Admin') {
        // User is logged in but not an Admin, redirect to login
        authStore.adminLogout()
        next({ path: '/auth/login' })
      } else {
        next()
      }
    } else {
      next()
    }
  })

  return Router
})

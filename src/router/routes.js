const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', component: () => import('pages/DashboardPage.vue') },
      { path: 'users', component: () => import('pages/UserPageIndex.vue') },
      { path: 'categories', component: () => import('pages/CategoryPage.vue') },
      { path: 'subscribed-users', component: () => import('pages/SubscribedUsersPage.vue') },
      { path: 'places', component: () => import('pages/AllowedPlace.vue') },
      { path: 'cms', component: () => import('pages/CMSPage.vue') },
      { path: 'profile', component: () => import('pages/ProfilePage.vue') },
      { path: 'promocodes', component: () => import('pages/PromoCodesPage.vue') },
      { path: 'receipts', component: () => import('pages/ReceiptsPage.vue') },
      { path: 'subscriptions', component: () => import('pages/SubscriptionsPage.vue') },
    ],
  },
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: 'login', component: () => import('pages/auth/LoginPage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes

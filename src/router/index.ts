import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => {
    // always scroll to top
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
      meta: {
        layout: 'content',
      },
    },
    {
      path: '/blank',
      name: 'blank',
      component: () => import('@/views/Blank.vue'),
      meta: {
        layout: 'blank',
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: {
        layout: 'blank',
      },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue'),
      meta: {
        layout: 'blank',
      },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/ForgotPassword.vue'),
      meta: {
        layout: 'blank',
      },
    },
    {
  path: '/philpen-assessments',
  name: 'philpen-assessments',
  component: () => import('@/views/PhilpenAssessments.vue'),
  meta: {
    layout: 'content',
  },
},
{
  path: '/annual-medical-exams',
  name: 'annual-medical-exams',
  component: () => import('@/views/AnnualMedicalExams.vue'),
  meta: {
    layout: 'content',
  },
},
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue'),
      meta: {
        layout: 'blank',
      },
    },
  ],
})

router.beforeEach(to => {
  const isLoggedIn = !!localStorage.getItem('user')

  // Not logged in: only the login page is allowed
  if (!isLoggedIn && to.name !== 'login')
    return { name: 'login' }

  // Already logged in: skip the login page
  if (isLoggedIn && to.name === 'login')
    return { name: 'home' }
})

export default router

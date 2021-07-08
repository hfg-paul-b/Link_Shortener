import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Redirect from '../views/Redirect.vue'
import Unknown from '../views/Unknown.vue'
import Admin from '../views/Admin.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },

  {
    path: '/:short',
    name: 'Redirect',
    component: Redirect
  },

  {
    path: '/admin/:short',
    name: 'Admin',
    component: Admin
  },

  {
    path: '/unknown/:short',
    name: 'Unknown',
    component: Unknown
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router

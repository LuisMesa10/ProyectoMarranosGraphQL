import { createRouter, createWebHistory } from 'vue-router'
import ListaClientes from '@/views/ListaClientes.vue'
import DetalleCliente from '@/views/DetalleCliente.vue'
import Reportes from '@/views/Reportes.vue'

const routes = [
  {
    path: '/',
    name: 'ListaClientes',
    component: ListaClientes,
    meta: {
      title: 'Lista de Clientes'
    }
  },
  {
    path: '/cliente/:id',
    name: 'DetalleCliente',
    component: DetalleCliente,
    props: true,
    meta: {
      title: 'Detalle Cliente'
    }
  },
  {
    path: '/reportes',
    name: 'Reportes',
    component: Reportes,
    meta: {
      title: 'Reportes'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Actualizar el título de la página
  if (to.meta.title) {
    document.title = `${to.meta.title} - La Granja S.A.`
  }
  next()
})

export default router
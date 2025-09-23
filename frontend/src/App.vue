<template>
  <div id="app">
    <!-- Header/Navbar -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <h1 class="header-title">
            <i class="fas fa-pig"></i>
            La Granja S.A.
          </h1>
          <nav class="header-nav">
            <router-link to="/" class="nav-link" active-class="active">
              <i class="fas fa-users"></i>
              Clientes
            </router-link>
            <router-link to="/reportes" class="nav-link" active-class="active">
              <i class="fas fa-chart-bar"></i>
              Reportes
            </router-link>
          </nav>
        </div>
      </div>
    </header>

    <!-- Breadcrumb -->
    <nav class="breadcrumb" v-if="breadcrumb.length > 0">
      <div class="container">
        <div class="breadcrumb-content">
          <router-link
            v-for="(item, index) in breadcrumb"
            :key="index"
            :to="item.path"
            :class="{ 'active': index === breadcrumb.length - 1 }"
          >
            {{ item.name }}
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <router-view />
      </div>
    </main>

    <!-- Global Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Cargando...</p>
    </div>

    <!-- Global Notifications -->
    <div class="notifications">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification', `notification--${notification.type}`]"
      >
        <i :class="getNotificationIcon(notification.type)"></i>
        {{ notification.message }}
        <button @click="removeNotification(notification.id)" class="notification-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useGlobalStore } from '@/stores/globalStore'

export default {
  name: 'App',
  setup() {
    const route = useRoute()
    const globalStore = useGlobalStore()

    // Computed properties
    const breadcrumb = computed(() => {
      const crumbs = []

      if (route.name === 'ClienteDetalle') {
        crumbs.push({ name: 'Clientes', path: '/' })
        crumbs.push({ name: 'Detalle Cliente', path: route.path })
      } else if (route.name === 'Reportes') {
        crumbs.push({ name: 'Reportes', path: '/reportes' })
      }

      return crumbs
    })

    const isLoading = computed(() => globalStore.isLoading)
    const notifications = computed(() => globalStore.notifications)

    // Methods
    const getNotificationIcon = (type) => {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
      }
      return icons[type] || icons.info
    }

    const removeNotification = (id) => {
      globalStore.removeNotification(id)
    }

    onMounted(() => {
      // Verificar conexión con el backend al iniciar la app
      globalStore.checkBackendConnection()
    })

    return {
      breadcrumb,
      isLoading,
      notifications,
      getNotificationIcon,
      removeNotification
    }
  }
}
</script>

<style>
/* Variables CSS */
:root {
  --primary-color: #2e7d5e;
  --secondary-color: #4a90b8;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
  --white: #ffffff;
  --gray-100: #f8f9fa;
  --gray-200: #e9ecef;
  --gray-300: #dee2e6;
  --gray-400: #ced4da;
  --gray-500: #adb5bd;
  --gray-600: #6c757d;
  --border-radius: 0.375rem;
  --box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  --box-shadow-lg: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

/* Reset y base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  line-height: 1.6;
  color: var(--dark-color);
  background-color: var(--gray-100);
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Header */
.header {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--white);
  box-shadow: var(--box-shadow);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-nav {
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: var(--white);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link:hover,
.nav-link.active {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Breadcrumb */
.breadcrumb {
  background-color: var(--white);
  border-bottom: 1px solid var(--gray-200);
  padding: 0.75rem 0;
}

.breadcrumb-content {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.breadcrumb-content a {
  color: var(--primary-color);
  text-decoration: none;
  position: relative;
}

.breadcrumb-content a:not(.active):after {
  content: '/';
  margin-left: 0.5rem;
  color: var(--gray-400);
}

.breadcrumb-content a.active {
  color: var(--gray-600);
  font-weight: 500;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 2rem 0;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  color: var(--white);
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid var(--white);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Notifications */
.notifications {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1050;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notification {
  background: var(--white);
  padding: 1rem;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow-lg);
  min-width: 300px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  border-left: 4px solid;
}

.notification--success {
  border-left-color: var(--success-color);
  color: var(--success-color);
}

.notification--error {
  border-left-color: var(--danger-color);
  color: var(--danger-color);
}

.notification--warning {
  border-left-color: var(--warning-color);
  color: var(--warning-color);
}

.notification--info {
  border-left-color: var(--info-color);
  color: var(--info-color);
}

.notification-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--border-radius);
}

.notification-close:hover {
  background-color: var(--gray-100);
}

/* Utilidades */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--border-radius);
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  white-space: nowrap;
}

.btn-primary {
  background-color: var(--primary-color);
  color: var(--white);
}

.btn-primary:hover {
  background-color: #267049;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: var(--white);
}

.btn-success {
  background-color: var(--success-color);
  color: var(--white);
}

.btn-danger {
  background-color: var(--danger-color);
  color: var(--white);
}

.btn-outline {
  background-color: transparent;
  border: 1px solid currentColor;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 0.5rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .header-nav {
    width: 100%;
    justify-content: center;
  }

  .main-content {
    padding: 1rem 0;
  }

  .notifications {
    left: 0.5rem;
    right: 0.5rem;
  }

  .notification {
    min-width: auto;
  }
}
</style>

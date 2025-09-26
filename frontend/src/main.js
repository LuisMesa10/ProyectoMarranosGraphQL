
// src/main.js
import { createApp, provide, h } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import App from './App.vue'
import router from './router'
import apolloClient from '../apollo/apolloClient'

const app = createApp({
  setup() {
    // Proporcionar Apollo Client a todos los componentes
    provide(DefaultApolloClient, apolloClient)
  },
  render: () => h(App),
})

app.use(router)
app.mount('#app')

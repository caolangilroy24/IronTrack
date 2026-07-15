import { createApp } from 'vue'
import { Notify, Quasar } from 'quasar'
import App from './App.vue'
import router from './router'
import 'quasar/dist/quasar.css'
import '@quasar/extras/material-icons/material-icons.css'

const app = createApp(App)

app.use(Quasar, {
  plugins: {
    Notify,
  },
  config: {
    dark: true,
    brand: {
      primary: '#FF5722',
      secondary: '#FF5722',
      accent: '#FF5722',
    },
  },
})

app.use(router)

app.mount('#app')

import { createApp } from 'vue'
import { Quasar } from 'quasar'
import App from './App.vue'
import 'quasar/dist/quasar.css'

const app = createApp(App)

app.use(Quasar, {
  config: {
    dark: true,
    brand: {
      primary: '#FF5722',
      secondary: '#FF5722',
      accent: '#FF5722',
    },
  },
})

app.mount('#app')

import '@unocss/reset/tailwind-compat.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '../src/App.vue'
import router from './router'
import { Quasar } from 'quasar'
import { createHead } from '@unhead/vue'
import { quasarConfig } from '@/utils/quasar'
import '@/utils/quasar'
import 'virtual:uno.css'
import '@/assets/scss/main.scss'

const app = createApp(App)
const pinia = createPinia()
const head = createHead()

app.use(head)
app.use(pinia)
app.use(router)
app.use(Quasar, quasarConfig)

app.mount('#app')

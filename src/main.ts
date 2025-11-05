import { createApp } from 'vue'
import App from './App.vue'
import './styles/tailwind.css'
import { initializeTheme } from './composables/useTheme'
import { reveal } from './directives/reveal'

initializeTheme()
const app = createApp(App)
app.directive('reveal', reveal)
app.mount('#app')

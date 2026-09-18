import { createApp } from 'vue'
import App from './App.vue'
import './styles/tailwind.css'
import { initializeTheme } from './composables/useTheme'
import { initializeLocalization } from './composables/useTranslation'
import { reveal } from './directives/reveal'

initializeLocalization()
initializeTheme()
const app = createApp(App)
app.directive('reveal', reveal)
app.mount('#app')

import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import LoginPage from './components/LoginPage.vue';

const app = createApp(App)

app.component('LoginPage', LoginPage);
app.use(router)

app.mount('#app')

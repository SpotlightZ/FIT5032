import './assets/main.css'
// import '@/assets/style.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { initializeApp } from "firebase/app";

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import router from './router'


// if (window.location.protocol !== 'https:') {
//   window.location.href = 'https://' + window.location.hostname + window.location.pathname + window.location.search;
// }

const firebaseConfig = {
  apiKey: "AIzaSyD1hDSjHg5c6QqwRATzI9gshFU07RKbRwU",
  authDomain: "sub3-yiting.firebaseapp.com",
  projectId: "sub3-yiting",
  storageBucket: "sub3-yiting.appspot.com",
  messagingSenderId: "992185057116",
  appId: "1:992185057116:web:7fc4385fcce42c4ee7cb99"
};

initializeApp(firebaseConfig);

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(PrimeVue, { theme: { preset: Aura } })
app.use(router)
app.use(pinia)

// app.component('DataTable', DataTable)
// app.component('Column', Column)

app.mount('#app')

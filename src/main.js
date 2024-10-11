import './assets/main.css'
// import '@/assets/style.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'

import PrimeVue from 'primevue/config'

// // PrimeVue 样式
// import 'primevue/resources/themes/saga-blue/theme.css';      // 主题
// import 'primevue/resources/primevue.min.css';                // 样式
// import 'primeicons/primeicons.css';    

import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Button from 'primevue/button';
import Aura from '@primevue/themes/aura'
import router from './router'
import InputText from 'primevue/inputtext'
import Paginator from 'primevue/paginator'
import Textarea from 'primevue/textarea';
import Dialog from 'primevue/dialog';
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';
import Card from 'primevue/card';
import Chart from 'primevue/chart';
import Dropdown from 'primevue/dropdown';
import Avatar from 'primevue/avatar'; // 用于显示头像
import FileUpload from 'primevue/fileupload'; // 用于显示头像

import { initializeApp } from "firebase/app";
import 'primeicons/primeicons.css'; 


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
app.use(ToastService);
// app.use(Textarea);

app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Button', Button)
app.component('InputText', InputText)
app.component('Textarea', Textarea)
app.component('Paginator', Paginator);
app.component('Dialog', Dialog);
app.component('Toast', Toast);
app.component('Chart', Chart);
app.component('Dropdown', Dropdown);
app.component('Avatar', Avatar);
app.component('FileUpload', FileUpload);
app.component('Card', Card);

app.mount('#app')

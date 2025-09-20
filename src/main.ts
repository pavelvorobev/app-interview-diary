import 'primeicons/primeicons.css';
import 'primeflex/primeflex.scss';

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { initializeApp } from "firebase/app";

import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';


import Menubar from 'primevue/menubar';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'
import Tooltip from 'primevue/tooltip'
import ProgressSpinner from 'primevue/progressspinner'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ConfirmDialog from 'primevue/confirmdialog'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import DatePicker from 'primevue/datepicker';
import Radio from 'primevue/radiobutton'
import Badge from 'primevue/badge'
import Chart from 'primevue/chart'

import App from './App.vue'
import router from './router'

// Firebase configurati
const firebaseConfig = {
  apiKey: "AIzaSyBht3f-qyF2grS1WqBtcT-fJHtvXPeI-EQ",
  authDomain: "interviews-c4208.firebaseapp.com",
  projectId: "interviews-c4208",
  storageBucket: "interviews-c4208.firebasestorage.app",
  messagingSenderId: "390365158902",
  appId: "1:390365158902:web:770a44a20c877d73287bd7"
};
initializeApp(firebaseConfig);

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: 'is-dark',
      cssLayer: false
    }
  }
})
app.use(ToastService)
app.use(ConfirmationService)
app.directive('tooltip', Tooltip)
app.component('PMenubar', Menubar)
app.component('PButton', Button)
app.component('PInputText', InputText)
app.component('PToast', Toast)
app.component('PProgressSpinner', ProgressSpinner)
app.component('PCard', Card)
app.component('PDataTable', DataTable)
app.component('PColumn', Column)
app.component('PConfirmDialog', ConfirmDialog)
app.component('PInputNumber', InputNumber)
app.component('PTextarea', Textarea)
app.component('PDatePicker', DatePicker)
app.component('PRadio', Radio)
app.component('PBadge', Badge)
app.component('PChart', Chart)

app.mount('#app')

import DatePicker from 'primevue/datepicker';

declare module 'vue' {
  export interface GlobalComponents {
    'PDatePicker': typeof DatePicker
  }
}

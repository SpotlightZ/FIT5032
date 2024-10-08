<template>
    <div>
      <!-- FullCalendar Component -->
      <FullCalendar
        :plugins="[dayGridPlugin, interactionPlugin]"
        :initialView="'dayGridMonth'"
        :selectable="true"
        :events="events"
        @dateClick="handleDateSelect"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import FullCalendar from '@fullcalendar/vue3'
  import dayGridPlugin from '@fullcalendar/daygrid'
  import interactionPlugin from '@fullcalendar/interaction'
  
  const events = ref([])  // Events to display in the calendar
  
  // Props to pass from the parent
  const props = defineProps({
    fetchAppointments: Function,
    bookAppointment: Function
  })
  
  // Watch for updates in appointments and update calendar
//   watch(
//     () => props.fetchAppointments(),
//     (newEvents) => {
//       console.log(newEvents,'=========newEvents');
//       events.value = newEvents.map(appointment => ({
//         title: `Appointment for ${appointment.firstname}`,
//         start: appointment.date,
//         extendedProps: appointment
//       }))
//     },
//     { immediate: true }
//   )

  watch(
  async () => {
    // 等待 fetchAppointments 的 Promise 解析
    const newEvents = await props.fetchAppointments(); 
    return newEvents;
  },
  (newEvents) => {
    if (Array.isArray(newEvents)) {
      events.value = newEvents.map(appointment => ({
        title: `Appointment for ${appointment.firstname}`,
        start: appointment.date,
        extendedProps: appointment
      }));
    } else {
      console.error('fetchAppointments did not return an array:', newEvents);
    }
  },
  { immediate: true }
);

  



  // Handle date selection and pass the selected date back to parent
  const handleDateSelect = (info) => {
    const selectedDate = info.startStr
    props.bookAppointment(selectedDate)
  }
  </script>
  
  <style scoped>
  .fc {
    margin-top: 20px;
  }
  </style>
  
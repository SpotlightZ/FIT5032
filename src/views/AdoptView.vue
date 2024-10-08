<script setup>
import { ref } from 'vue'
// Firebase imports
import { getFirestore, collection, addDoc } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import axios from 'axios';
import { onBeforeMount } from 'vue';

import FullCalendar from '@/components/FullCalendar.vue'

// Initialize Firebase (make sure Firebase is initialized in your project)
// import { initializeApp } from 'firebase/app'
// const firebaseConfig = { /* Your Firebase config */ }
// const app = initializeApp(firebaseConfig)
const db = getFirestore()
const functions = getFunctions()
const formDataList = ref([]);

const functionURL = import.meta.env.VITE_FUNCTION_URL;

const formData = ref({
  user: '',
  firstname: '',
  lastname: '',
  email: '',
  isAustralian: false,
  reason: '',
  gender: '',
  suburb: ''
})

const calendarEvents = ref([])

formData.value.user = JSON.parse(localStorage.getItem('loggedInUser')).email;

const submittedCards = ref([])

const submitForm = async () => {
  validateFName(true);
  validateLName(true);
  validateEmail(true);
  if (!errors.value.firstname && !errors.value.lastname && !errors.value.email) {
    try {
      const userExists = await checkUserExists(formData.value.user);
      
      if (userExists) {
        alert('You have already submitted a claim application, please wait.');
      } else {
        await axios.post(`${functionURL}/saveFormData`, formData.value, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        alert('Data saved successfully!');
        clearForm();
      }
    } catch (error) {
      console.error('Error saving data: ', error);
      alert('Error saving data');
    }
  }
};

const fetchFormData = async () => {
  try {
    const response = await axios.get(`${functionURL}/getFormData`);
    formDataList.value = response.data;
  } catch (error) {
    console.error('Error fetching data: ', error);
  }
};

const checkUserExists = async (email) => {
  try {
    const response = await axios.post(`${functionURL}/checkUserExists`, { email }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data.exists;
  } catch (error) {
    console.error('Error checking user: ', error);
    return false;
  }
};

// 获取用户数据的函数
const fetchUserData = async (email) => {
  try {
    const response = await axios.post(`${functionURL}/getUserData`, { email }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user data: ', error);
    return null;
  }
};

const clearForm = () => {
  formData.value = {
    firstname: '',
    lastname: '',
    email: '',
    isAustralian: false,
    reason: '',
    gender: '',
    suburb: ''
  }
}

const errors = ref({
  user: null,
  firstname: null,
  lastname: null,
  email: null,
  resident: null,
  gender: null,
  reason: null,
  suburb: null
})

const validateEmail = (blur) => {
  const email = formData.value.email
  const minLength = 5
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const emailVerify = emailPattern.test(email)

  if (email.length < minLength) {
    if (blur) errors.value.email = 'Password must be at least ${minLength} characters long.'
  } else if (!emailVerify) {
    if (blur) errors.value.email = 'The entered email format is incorrect.'
  } else {
    errors.value.email = null
  }
}

const validateFName = (blur) => {
  if (formData.value.firstname.length < 3) {
    if (blur) errors.value.firstname = 'First Name must be at least 3 characters'
  } else {
    errors.value.firstname = null
  }
}

const validateLName = (blur) => {
  if (formData.value.lastname.length < 3) {
    if (blur) errors.value.lastname = 'Last Name must be at least 3 characters'
  } else {
    errors.value.lastname = null
  }
}

// **Firebase Functions**

const saveDataToFirebase = async () => {
  try {
    await addDoc(collection(db, 'formSubmissions'), formData.value)
    alert('Data saved to Firebase!')
  } catch (error) {
    console.error('Error adding document: ', error)
  }
}

// If using a Firebase Function
const processFormData = async () => {
  const processData = httpsCallable(functions, 'processFormData')
  try {
    const result = await processData(formData.value)
    console.log(result.data)
    alert('Data processed via Firebase Function!')
  } catch (error) {
    console.error('Error calling function: ', error)
  }
}

// Fetch existing appointments from Firebase Functions
// const fetchAppointments = async () => {
//   try {
//     const response = await axios.get(`${functionURL}/getAppointments`)
//     return response.data.map(appointment => ({
//       firstname: appointment.firstname,
//       date: appointment.date
//     }))
//   } catch (error) {
//     console.error('Error fetching appointments:', error)
//     return []
//   }
// }


// 硬编码的预约数据
const fetchAppointments = async () => {
  const appointments = [
    {
      firstname: 'John',
      lastname: 'Doe',
      date: '2024-10-10T09:00:00'
    },
    {
      firstname: 'Jane',
      lastname: 'Smith',
      date: '2024-10-12T14:00:00'
    }
  ]
  
  console.log('Fetched appointments:', appointments); // 确保这里返回的是一个数组
  return appointments;
}

// Book a new appointment by calling Firebase Functions
const bookAppointment = async (selectedDate) => {
  const appointmentData = {
    ...formData.value,
    date: selectedDate
  }
  try {
    const response = await axios.post(`${functionURL}/bookAppointment`, appointmentData, {
      headers: { 'Content-Type': 'application/json' }
    })
    alert('Appointment booked successfully!')
    fetchAppointments() // Refresh appointments after booking
  } catch (error) {
    if (error.response && error.response.status === 400) {
      alert(error.response.data.message) // 显示预约冲突错误信息
    } else {
      console.error('Error booking appointment: ', error)
      alert('Error booking appointment')
    }
  }
}
</script>


<template>
  <!-- 🗄️ W3. Library Registration Form -->
  <div class="bg" />
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <h1 class="text-center">Get Senior Pets in Your Home</h1>
        <p class="text-center">
          Heartwarming happy tails are coming right up!
        </p>
        <form @submit.prevent="submitForm">
          <div class="row mb-3">
            <div>
              <label for="firstname" class="form-label">user</label>
              <input
                type="text"
                class="form-control"
                id="user"
                disabled
                @blur="() => validateFName(true)"
                @input="() => validateFName(false)"
                v-model="formData.user"
              />
              <div v-if="errors.user" class="text-danger">{{ errors.user }}</div>
            </div>
            <div>
              <label for="firstname" class="form-label">First Name</label>
              <input
                type="text"
                class="form-control"
                id="firstname"
                @blur="() => validateFName(true)"
                @input="() => validateFName(false)"
                v-model="formData.firstname"
              />
              <div v-if="errors.firstname" class="text-danger">{{ errors.firstname }}</div>
            </div>

            <div>
              <label for="lastname" class="form-label">Last Name</label>
              <input
                type="text"
                class="form-control"
                id="lastname"
                @blur="() => validateLName(true)"
                @input="() => validateLName(false)"
                v-model="formData.lastname"
              />
              <div v-if="errors.lastname" class="text-danger">{{ errors.lastname }}</div>
            </div>

            <div>
              <label for="email" class="form-label">Email</label>
              <input
                type="text"
                class="form-control"
                id="email"
                @blur="() => validateEmail(true)"
                @input="() => validateEmail(false)"
                v-model="formData.email"
              />
              <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>
            </div>

            <div class="col-md-6 col-sm-6">
              <label for="gender" class="form-label">Gender</label>
              <select class="form-select" id="gender" v-model="formData.gender" required>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

          </div>
          <div class="row mb-3">
            <div class="col-md-6 col-sm-6">
              <div class="form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="isAustralian"
                  v-model="formData.isAustralian"
                />
                <label class="form-check-label" for="isAustralian">Australian Resident?</label>
              </div>
            </div>
          </div>
          <div class="mb-3">
            <label for="reason" class="form-label">Reason for applying</label>
            <textarea
              class="form-control"
              id="reason"
              rows="3"
              v-model="formData.reason"
              required
              @blur="() => validateText(true)"
            ></textarea>
            <div v-if="errors.reason" class="text-succeeful">
              {{ errors.reason }}
            </div>
          </div>
          <div class="mb-3">
            <label for="suburb" class="form-label">Suburb</label>
            <input type="text" class="form-control" id="suburb" v-bind:value="formData.suburb" />
            <div v-if="errors.suburb" class="text-succeeful">
              {{ errors.suburb }}
            </div>
          </div>

          <div class="text-center">
            <button type="submit" class="btn btn-primary me-2">Submit</button>
            <button type="button" class="btn btn-secondary me-2" @click="clearForm">Clear</button>           
          </div>

          <FullCalendar :fetchAppointments="fetchAppointments" :bookAppointment="bookAppointment"></FullCalendar>
        </form>
      </div>
    </div>
  </div>


</template>

<style scoped>
.bg {
  background: url('../assets/images/bg-adopt.png') no-repeat;
  background-position: center;
  background-size: cover;
}
</style>

<script setup>
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { saveAs } from 'file-saver'
// Firebase imports
import { getFirestore, collection, addDoc } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'

// Initialize Firebase (make sure Firebase is initialized in your project)
// import { initializeApp } from 'firebase/app'
// const firebaseConfig = { /* Your Firebase config */ }
// const app = initializeApp(firebaseConfig)
const db = getFirestore()
const functions = getFunctions()

const formData = ref({
  firstname: '',
  lastname: '',
  email: '',
  isAustralian: false,
  reason: '',
  gender: '',
  suburb: ''
})

const submittedCards = ref([])

const submitForm = () => {
  validateFName(true)
  validateLName(true)
  validateEmail(true)
  if (!errors.value.firstname && !errors.value.lastname && !errors.value.email) {
    submittedCards.value.push({ ...formData.value })
    clearForm()
    alert('success!')
  }
}

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
  firstname: null,
  lastname: null,
  email: null,
  resident: null,
  gender: null,
  reason: null
})

// Validation functions (same as your code)
const validateEmail = (blur) => {
  // ... your validation logic
}
const validateFName = (blur) => {
  // ... your validation logic
}
const validateLName = (blur) => {
  // ... your validation logic
}

// **Export Functions**

const exportToExcel = () => {
  const data = [formData.value] // Use submittedCards.value if you have multiple entries
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Form Data')
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'form_data.xlsx')
}

const exportToCSV = () => {
  const data = [formData.value]
  const worksheet = XLSX.utils.json_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, 'form_data.csv')
}

const exportToPDF = () => {
  const doc = new jsPDF()
  const data = Object.entries(formData.value).map(([key, value]) => ({ key, value }))
  doc.setFontSize(16)
  doc.text('Form Data', 14, 22)
  autoTable(doc, {
    startY: 30,
    head: [['Field', 'Value']],
    body: data.map(item => [item.key, item.value])
  })
  doc.save('form_data.pdf')
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
            <label for="reason" class="form-label">Reason for joining</label>
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
            <label for="reason" class="form-label">Suburb</label>
            <input type="text" class="form-control" id="suburb" v-bind:value="formData.suburb" />
          </div>

          <div class="text-center">
            <button type="submit" class="btn btn-primary me-2">Submit</button>
            <button type="button" class="btn btn-secondary me-2" @click="clearForm">Clear</button>           
          </div>
        </form>
      </div>
    </div>
  </div>

   <!-- Export Buttons -->

  <div class="text-center">
    <button type="button" class="btn btn-success me-2" @click="exportToExcel">Export to Excel</button>
    <button type="button" class="btn btn-success me-2" @click="exportToCSV">Export to CSV</button>
    <button type="button" class="btn btn-success me-2" @click="exportToPDF">Export to PDF</button>
    <!-- Firebase Buttons -->
    <button type="button" class="btn btn-warning me-2" @click="saveDataToFirebase">Save to Firebase</button>
    <!-- If using Firebase Function -->
    <!-- <button type="button" class="btn btn-warning me-2" @click="processFormData">Process via Firebase Function</button> -->  
  </div>
</template>

<style scoped>
.bg {
  background: url('../assets/images/bg-adopt.png') no-repeat;
  background-position: center;
  background-size: cover;
}
</style>

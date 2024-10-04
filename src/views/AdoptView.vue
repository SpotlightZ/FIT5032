<script setup>
import { ref } from 'vue'

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
    alert('success!');
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

const validateEmail = (blur) => {
  const email = formData.value.email
  const minLength = 5
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const emailVerify = emailPattern.test(email)

  if (email.length < minLength) {
    if (blur) errors.value.email = `Password must be at least ${minLength} characters long.`
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
            <button type="button" class="btn btn-secondary" @click="clearForm">Clear</button>
          </div>
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

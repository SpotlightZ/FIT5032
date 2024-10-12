<script setup>
import { ref } from 'vue'
import axios from 'axios';

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

formData.value.user = JSON.parse(localStorage.getItem('loggedInUser')).email;

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
    if (blur) errors.value.email = `Email must be at least ${minLength} characters long.`
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

const validateReason = (blur) => {
  if (!formData.value.reason || formData.value.reason.length < 10) {
    if (blur) errors.value.reason = 'Reason must be at least 10 characters'
  } else {
    errors.value.reason = null
  }
}

const validateGender = (blur) => {
  if (!formData.value.gender) {
    if (blur) errors.value.gender = 'Please select your gender'
  } else {
    errors.value.gender = null
  }
}

const submitForm = async () => {
  validateFName(true);
  validateLName(true);
  validateEmail(true);
  validateReason(true);
  validateGender(true);
  if (!errors.value.firstname && !errors.value.lastname && !errors.value.email && !errors.value.reason && !errors.value.gender) {
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
</script>

<template>
  <!-- Skip Navigation Link for Keyboard Users -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- Background Image -->
  <div class="bg" role="img" aria-label="Happy elderly person with a pet" />

  <main id="main-content" class="container mt-5">
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <h1 class="text-center">Get Senior Pets in Your Home</h1>
        <p class="text-center">
          Heartwarming happy tails are coming right up!
        </p>
        <p class="text-center">
          Note: Pets cannot be specified, but you can leave your preferences in the reason field, and we will try to accommodate them.
        </p>
        <form @submit.prevent="submitForm">
          <div class="row mb-3">
            <div>
              <label for="user" class="form-label">User</label>
              <input
                type="text"
                class="form-control"
                id="user"
                disabled
                v-model="formData.user"
                aria-readonly="true"
              />
            </div>
            <div>
              <label for="firstname" class="form-label">First Name<span aria-hidden="true">*</span></label>
              <input
                type="text"
                class="form-control"
                id="firstname"
                v-model="formData.firstname"
                @blur="() => validateFName(true)"
                @input="() => validateFName(false)"
                aria-required="true"
                :aria-invalid="!!errors.firstname"
                :aria-describedby="errors.firstname ? 'firstname-error' : null"
              />
              <div v-if="errors.firstname" class="text-danger" id="firstname-error" role="alert">{{ errors.firstname }}</div>
            </div>

            <div>
              <label for="lastname" class="form-label">Last Name<span aria-hidden="true">*</span></label>
              <input
                type="text"
                class="form-control"
                id="lastname"
                v-model="formData.lastname"
                @blur="() => validateLName(true)"
                @input="() => validateLName(false)"
                aria-required="true"
                :aria-invalid="!!errors.lastname"
                :aria-describedby="errors.lastname ? 'lastname-error' : null"
              />
              <div v-if="errors.lastname" class="text-danger" id="lastname-error" role="alert">{{ errors.lastname }}</div>
            </div>

            <div>
              <label for="email" class="form-label">Email<span aria-hidden="true">*</span></label>
              <input
                type="email"
                class="form-control"
                id="email"
                v-model="formData.email"
                @blur="() => validateEmail(true)"
                @input="() => validateEmail(false)"
                aria-required="true"
                :aria-invalid="!!errors.email"
                :aria-describedby="errors.email ? 'email-error' : null"
              />
              <div v-if="errors.email" class="text-danger" id="email-error" role="alert">{{ errors.email }}</div>
            </div>

            <div class="col-md-6 col-sm-6">
              <label for="gender" class="form-label">Gender<span aria-hidden="true">*</span></label>
              <select
                class="form-select"
                id="gender"
                v-model="formData.gender"
                aria-required="true"
                :aria-invalid="!!errors.gender"
                :aria-describedby="errors.gender ? 'gender-error' : null"
                @blur="() => validateGender(true)"
                @change="() => validateGender(false)"
              >
                <option value="" disabled>Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <div v-if="errors.gender" class="text-danger" id="gender-error" role="alert">{{ errors.gender }}</div>
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
            <label for="reason" class="form-label">Reason for Applying<span aria-hidden="true">*</span></label>
            <textarea
              class="form-control"
              id="reason"
              rows="3"
              v-model="formData.reason"
              @blur="() => validateReason(true)"
              @input="() => validateReason(false)"
              aria-required="true"
              :aria-invalid="!!errors.reason"
              :aria-describedby="errors.reason ? 'reason-error' : null"
            ></textarea>
            <div v-if="errors.reason" class="text-danger" id="reason-error" role="alert">
              {{ errors.reason }}
            </div>
          </div>

          <div class="mb-3">
            <label for="suburb" class="form-label">Suburb</label>
            <input type="text" class="form-control" id="suburb" v-model="formData.suburb" />
          </div>

          <div class="text-center">
            <button type="submit" class="btn btn-primary me-2">Submit</button>
            <button type="button" class="btn btn-secondary me-2" @click="clearForm">Clear</button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<style scoped>
.bg {
  background: url('../assets/images/bg-adopt.png') no-repeat;
  background-position: center;
  background-size: cover;
}

/* Skip Link Styles */
.skip-link {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.skip-link:focus {
  position: static;
  left: 0;
  top: 0;
  width: auto;
  height: auto;
  background: #fff;
  color: #000;
  padding: 10px;
  z-index: 1000;
}

/* Focus Indicators */
button:focus,
select:focus,
input:focus,
textarea:focus {
  outline: 2px solid #005fcc;
}
</style>


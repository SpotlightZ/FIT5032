<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useRouter } from "vue-router";

const router = useRouter()
const auth = getAuth()

const db = getFirestore()

const formData = ref({
  email: '',
  password: '',
  confirmPassword: '',
  isAustralian: false,
  reason: '',
  role: '',
})

const submittedCards = ref([])

const submitForm = () => {
  validateEmail(true)
  validatePassword(true)
  if (!errors.value.email && !errors.value.password) {
    register()
  }
}


const register = () => {
  createUserWithEmailAndPassword(auth, formData.value.email, formData.value.password)
  .then((userCredential) => {
    
    const user = userCredential.user;
    // console.log("Firebase Register Successful")

    // 将用户的其他信息存储到 Firestore 的 'users' 集合中
    setDoc(doc(db, "users", user.uid), {
      
        email: formData.value.email,
        role: formData.value.role,  // 添加 role
        isAustralian: formData.value.isAustralian,  // 其他字段
        reason: formData.value.reason,
        createdAt: new Date()  // 添加时间戳
      }).then(() => {
        console.log("User data successfully written to Firestore");
        router.push("/login"); // 跳转到登录页面
        clearForm()
      }).catch((error) => {
        console.error("Error writing document: ", error);
      });
  }).catch((error) => {
    console.log("Error writing document: ", error);
  })
}

const clearForm = () => {
  formData.value = {
    email: '',
    password: '',
    isAustralian: false,
    reason: '',
    role: '',
  }
}

const errors = ref({
  email: null,
  password: null,
  confirmPassword: null,
  resident: null,
  role: null,
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

const validatePassword = (blur) => {
  const password = formData.value.password
  const minLength = 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (password.length < minLength) {
    if (blur) errors.value.password = `Password must be at least ${minLength} characters long.`
  } else if (!hasUppercase) {
    if (blur) errors.value.password = 'Password must contain at least one uppercase letter.'
  } else if (!hasLowercase) {
    if (blur) errors.value.password = 'Password must contain at least one lowercase letter.'
  } else if (!hasNumber) {
    if (blur) errors.value.password = 'Password must contain at least one number.'
  } else if (!hasSpecialChar) {
    if (blur) errors.value.password = 'Password must contain at least one special character.'
  } else {
    errors.value.password = null
  }
}

/**
 * Confirm password validation function that checks if the password and confirm password fields match.
 * @param blur: boolean - If true, the function will display an error message if the passwords do not match.
 */
 const validateConfirmPassword = (blur) => {
  if (formData.value.password !== formData.value.confirmPassword) {
    if (blur) errors.value.confirmPassword = 'Passwords do not match.'
  } else {
    errors.value.confirmPassword = null
  }
}

const validateText = (blur) => {
  if (formData.value.reason.includes('friend')) {
    if (blur) errors.value.reason = 'Great to have a friend';
  }
}
</script>

<template>
  <div class="container pb-5">
    <div class="row">
      <div class="col-md-8 offset-md-2 main">
        <h1 class="text-center">Sign up for a FIT5032 Assessment 2</h1>
        <form @submit.prevent="submitForm">
          <div class="row mb-3 mt-5">
            <div class="col-md-6 col-sm-6">
              <label for="email" class="form-label">email</label>
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
              <label for="role" class="form-label">Role</label>
              <select class="form-select" id="role" v-model="formData.role" required>
                <!-- <option value="admin">Admin</option> -->
                <option value="user">User</option>
                <option value="guest">Guest</option>
              </select>
            </div>

            <div>
              <label for="password" class="form-label">Password</label>
              <input
                type="password"
                class="form-control"
                id="password"
                @blur="() => validatePassword(true)"
                @input="() => validatePassword(false)"
                v-model="formData.password"
              />
              <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>
            </div>
            <div>
              <label for="confirm-password" class="form-label">Confirm password</label>
              <input
                type="password"
                class="form-control"
                id="confirm-password"
                v-model="formData.confirmPassword"
                @blur="() => validateConfirmPassword(true)"
              />
              <div v-if="errors.confirmPassword" class="text-danger">
                {{ errors.confirmPassword }}
              </div>
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
              @blur="() => validateText(true)"
            ></textarea>
            <div v-if="errors.reason" class="text-succeeful">
              {{ errors.reason }}
            </div>
          </div>
          <div class="text-center">
            <button type="submit" class="btn btn-primary me-2">Submit</button>
            <button type="button" class="btn btn-secondary" @click="clearForm">Clear</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- <div class="row mt-5">
    <h4>This is a Primevue Datatable.</h4>
    <DataTable :value="submittedCards" tableStyle="min-width: 50rem">
      <Column field="email" header="email"></Column>
      <Column field="password" header="Password"></Column>
      <Column field="isAustralian" header="Australian Resident"></Column>
      <Column field="role" header="role"></Column>
      <Column field="reason" header="Reason"></Column>
    </DataTable>
  </div>

  <div class="row mt-5" v-if="submittedCards.length">
    <div class="d-flex flex-wrap justify-content-start">
      <div
        v-for="(card, index) in submittedCards"
        :key="index"
        class="card m-2"
        style="width: 18rem"
      >
        <div class="card-header">User Information</div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">email: {{ card.email }}</li>
          <li class="list-group-item">Password: {{ card.password }}</li>
          <li class="list-group-item">
            Australian Resident: {{ card.isAustralian ? 'Yes' : 'No' }}
          </li>
          <li class="list-group-item">role: {{ card.role }}</li>
          <li class="list-group-item">Reason: {{ card.reason }}</li>
        </ul>
      </div>
    </div>
  </div> -->
</template>

<style scoped>
.container {
  background: url('../assets/images/bg-register.png') no-repeat;
  background-size: 100%;
  padding-top: 320px;

  .main {
    padding: 40px;
    background: #fff;
    border-radius: 32px;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.5);
  }
}
</style>

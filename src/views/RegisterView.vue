<script setup>
import { ref } from 'vue'
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
    if (blur) errors.value.email = `Email must be at least ${minLength} characters long.`
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

const validateConfirmPassword = (blur) => {
  if (formData.value.password !== formData.value.confirmPassword) {
    if (blur) errors.value.confirmPassword = 'Passwords do not match.'
  } else {
    errors.value.confirmPassword = null
  }
}

const validateReason = (blur) => {
  if (!formData.value.reason || formData.value.reason.length < 10) {
    if (blur) errors.value.reason = 'Reason must be at least 10 characters.'
  } else {
    errors.value.reason = null
  }
}

const validateRole = (blur) => {
  if (!formData.value.role) {
    if (blur) errors.value.role = 'Please select a role.'
  } else {
    errors.value.role = null
  }
}

const submitForm = () => {
  validateEmail(true)
  validatePassword(true)
  validateConfirmPassword(true)
  validateRole(true)
  validateReason(true)
  if (!errors.value.email && !errors.value.password && !errors.value.confirmPassword && !errors.value.role && !errors.value.reason) {
    register()
  }
}

const register = () => {
  createUserWithEmailAndPassword(auth, formData.value.email, formData.value.password)
    .then((userCredential) => {
      const user = userCredential.user;
      // 将用户的其他信息存储到 Firestore 的 'users' 集合中
      setDoc(doc(db, "users", user.uid), {
        email: formData.value.email,
        role: formData.value.role,
        isAustralian: formData.value.isAustralian,
        reason: formData.value.reason,
        createdAt: new Date()
      }).then(() => {
        console.log("User data successfully written to Firestore");
        router.push("/login"); // 跳转到登录页面
        clearForm()
      }).catch((error) => {
        console.error("Error writing document: ", error);
      });
    }).catch((error) => {
      console.log("Error creating user: ", error);
    })
}

const clearForm = () => {
  formData.value = {
    email: '',
    password: '',
    confirmPassword: '',
    isAustralian: false,
    reason: '',
    role: '',
  }
}

</script>

<template>
  <!-- 带有可访问名称的背景容器 -->
  <div class="container pb-5" role="img" aria-label="Register page background image">
    <div class="row">
      <div class="col-md-8 offset-md-2 main">
        <h1 class="text-center">Sign up for a FIT5032 Assessment 2</h1>
        <form @submit.prevent="submitForm" aria-labelledby="signup-form-heading">
          <h2 id="signup-form-heading" class="visually-hidden">Registration Form</h2>
          <div class="row mb-3 mt-5">
            <div class="col-md-6 col-sm-6">
              <label for="email" class="form-label">Email<span aria-hidden="true">*</span></label>
              <input
                type="email"
                class="form-control"
                id="email"
                @blur="() => validateEmail(true)"
                @input="() => validateEmail(false)"
                v-model="formData.email"
                aria-required="true"
                :aria-invalid="!!errors.email"
                :aria-describedby="errors.email ? 'email-error' : null"
              />
              <div v-if="errors.email" class="text-danger" id="email-error" role="alert">{{ errors.email }}</div>
            </div>

            <div class="col-md-6 col-sm-6">
              <label for="role" class="form-label">Role<span aria-hidden="true">*</span></label>
              <select
                class="form-select"
                id="role"
                v-model="formData.role"
                aria-required="true"
                :aria-invalid="!!errors.role"
                :aria-describedby="errors.role ? 'role-error' : null"
                @blur="() => validateRole(true)"
                @change="() => validateRole(false)"
              >
                <option value="" disabled>Select role</option>
                <option value="user">User</option>
                <option value="guest">Guest</option>
              </select>
              <div v-if="errors.role" class="text-danger" id="role-error" role="alert">{{ errors.role }}</div>
            </div>

            <div>
              <label for="password" class="form-label">Password<span aria-hidden="true">*</span></label>
              <input
                type="password"
                class="form-control"
                id="password"
                @blur="() => validatePassword(true)"
                @input="() => validatePassword(false)"
                v-model="formData.password"
                aria-required="true"
                :aria-invalid="!!errors.password"
                :aria-describedby="errors.password ? 'password-error' : null"
              />
              <div v-if="errors.password" class="text-danger" id="password-error" role="alert">{{ errors.password }}</div>
            </div>

            <div>
              <label for="confirm-password" class="form-label">Confirm Password<span aria-hidden="true">*</span></label>
              <input
                type="password"
                class="form-control"
                id="confirm-password"
                v-model="formData.confirmPassword"
                @blur="() => validateConfirmPassword(true)"
                @input="() => validateConfirmPassword(false)"
                aria-required="true"
                :aria-invalid="!!errors.confirmPassword"
                :aria-describedby="errors.confirmPassword ? 'confirm-password-error' : null"
              />
              <div v-if="errors.confirmPassword" class="text-danger" id="confirm-password-error" role="alert">
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
            <label for="reason" class="form-label">Reason for joining<span aria-hidden="true">*</span></label>
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
/* 隐藏但对屏幕阅读器可见的文本 */
.visually-hidden {
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

/* 焦点样式 */
button:focus,
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid #005fcc;
}

/* 其他样式 */
.container {
  background: url('../assets/images/bg-register.png') no-repeat;
  background-size: 100%;
  padding-top: 320px;
}

.main {
  padding: 40px;
  background: #fff;
  border-radius: 32px;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.5);
}
</style>


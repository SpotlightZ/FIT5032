<script setup>
import { ref } from 'vue'
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useRouter } from "vue-router"

const db = getFirestore()

const router = useRouter()

const email = ref('');
const password = ref('');

const errors = ref({
  email: null,
  password: null
})

const validateName = (blur) => {
  if (email.value == "") {
    if (blur) errors.value.email = 'Please enter your email'
  } else {
    errors.value.email = null
  }
}

const validatePassword = (blur) => {
  if (password.value == "") {
    if (blur) errors.value.password = 'Please enter your password'
  } else {
    errors.value.password = null
  }
}

const toRegister = () => {
  router.replace("/register");
}

const signin = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(getAuth(), email.value, password.value);
    const user = userCredential.user;

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const role = userData.role;

      localStorage.setItem('loggedInUser', JSON.stringify(userData));

      if (role === 'admin') {
        router.replace("/about");
      } else if (role === 'user') {
        router.replace("/about");
      } else {
        router.replace("/about");
      }
    } else {
      console.log("Error");
    }
  } catch (error) {
    console.log(error);
  }
}

const doLogin = () => {
  if (email.value == "") {
    errors.value.email = "Please enter your email";
    return;
  }
  if (password.value == "") {
    errors.value.password = "Please enter your password";
    return;
  }

  signin();
}
</script>


<template>
  <!-- Skip Navigation Link -->
  <div class="login">
    <h1 class="fs-1">FIT5032 Assessment Web App</h1>

    <!-- Main Content Area -->
    <main id="main-content">
      <div class="col-lg-3 col-md-4 col-sm-8 login-box">
        <h2 class="text-center fs-3">Welcome to Login</h2>
        <form @submit.prevent="doLogin" aria-labelledby="login-heading">
          <h3 id="login-heading" class="visually-hidden">Login Form</h3>
          <div class="row mb-3">
            <div>
              <label for="email" class="form-label fs-6">Email<span aria-hidden="true">*</span></label>
              <input
                type="email"
                class="form-control fs-8"
                placeholder="Email"
                id="email"
                @blur="() => validateName(true)"
                @input="() => validateName(false)"
                v-model="email"
                aria-required="true"
                :aria-invalid="!!errors.email"
                :aria-describedby="errors.email ? 'email-error' : null"
              />
              <div v-if="errors.email" class="text-danger" id="email-error" role="alert">{{ errors.email }}</div>
            </div>

            <div>
              <label for="password" class="form-label fs-8">Password<span aria-hidden="true">*</span></label>
              <input
                type="password"
                class="form-control fs-8"
                placeholder="Password"
                id="password"
                @blur="() => validatePassword(true)"
                @input="() => validatePassword(false)"
                v-model="password"
                aria-required="true"
                :aria-invalid="!!errors.password"
                :aria-describedby="errors.password ? 'password-error' : null"
              />  
              <div v-if="errors.password" class="text-danger fs-8" id="password-error" role="alert">{{ errors.password }}</div>
            </div>
          </div>
          <button class="fs-8" type="submit">Login</button>
        </form>

        <div class="mt-4 fs-8">
          <p>Don't have an account?</p>
          <button class="join mt-2 fs-8" type="button" @click="toRegister">Join today</button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Visually Hidden Class */
.visually-hidden {
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

/* Focus Styles */
button:focus,
input:focus {
  outline: 2px solid #005fcc;
}

/* Additional Styles */
.login {
  position: relative;
  height: 100vh;
  padding: 40px;
  background: url('../assets/images/login.png') no-repeat;
  background-size: 100% 100%;
}

.login-box {
  position: absolute;
  top: 50%;
  left: 100px;
  transform: translateY(-50%);
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.5);
  background: #f1f1f1;
}

button {
  width: 100%;
  height: 40px;
  background: #674D3F;
  color: #fff;
  border: none;
  border-radius: 16px;
}

.join {
  background: transparent;
  border: 1px solid #674D3F;
  color: #674D3F;
  height: 30px;
}
</style>

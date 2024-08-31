<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store';
import router from '../router/index'


const userName = ref('');
const password = ref('');
const userStore = useUserStore();


const errors = ref({
  username: null,
  password: null
})

const validateName = (blur) => {
  if (userName.value == "") {
    if (blur) errors.value.username = 'Please enter your username'
  } else {
    errors.value.username = null
  }
}
const validatePassword = (blur) => {
  if (password.value == "") {
    if (blur) errors.value.password = 'Please enter your password'
  } else {
    errors.value.password = null
  }
}

const doLogin = () => {
    try {
        if (userName.value == "") {
            errors.value.username = "Please enter your username";
            return;
        }
        if (password.value == "") {
            errors.value.password = "Please enter your password";
            return;
        }

        userStore.login(userName.value, password.value);
        const role = JSON.parse(localStorage.getItem('loggedInUser')).role

        if (role === 'admin') {
          router.replace("/home");
        } else if (role === 'user') {
          router.replace("/about");
        } else {
          // router.push('/guest-dashboard');
        }
    }
    finally {
        // loginLoading.value = false;
    }

const toRegister = () => {
  router.replace("/register");
}
}

</script>

<template>
<div class="login">
  <h1>FIT5032 Assessment Web App</h1>
  <div class="col-3 login-box">
    <h4 class="text-center">Welcome to Login</h4>
      <div class="row mb-3">
        <div>
          <label for="username" class="form-label">Username</label>
          <input
            type="text"
            class="form-control"
            placeholder="Username"
            id="username"
            @blur="() => validateName(true)"
            @input="() => validateName(false)"
            v-model="userName"
            />
          <div v-if="errors.username" class="text-danger">{{ errors.username }}</div>
        </div>

        <div>
          <label for="password" class="form-label">Password</label>
          <input
            type="password"
            class="form-control"
            placeholder="password"
              @blur="() => validatePassword(true)"
              @input="() => validatePassword(false)"
            v-model="password"
            />  
          <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>
        </div>
      </div>
      <button @click="doLogin" type="submit" >Sign in</button>

      <div class="mt-4">Don't have an account?
        <button class="join mt-2" @click="toRegister">Join today</button>
      </div>
  </div>
</div>
</template>
  
<style scoped>
.login {
  position: relative;
  height: 100vh;
  padding: 40px;
  background: url('../assets/images/login.png') no-repeat;
  background-size: 100%;
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
  /* background: #75A5FF; */
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
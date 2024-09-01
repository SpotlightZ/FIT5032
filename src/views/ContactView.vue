<script setup>
import { ref } from 'vue'

const contactList = ref([
  {
    label: 'Email',
    icon: '/src/assets/images/email.png',
    text: 'yzhe0132@student.monash.edu'
  },
  {
    label: 'Phone',
    icon: '/src/assets/images/phone.png',
    text: '+61 4 32 962 722'
  },
  {
    label: 'Address',
    icon: '/src/assets/images/local.png',
    text: 'Wellington Road Clayton Victoria 3800 Australia'
  }
])
</script>

<template>
  <div class="bg row align-items-center">
    <div>
      <h1 class="text-center fs-1">Fulfilling Friendships</h1>
      <p class="text-center fs-3">Real-life stories of unconditional love, companionship, and limitless snuggles</p>
    </div>
  </div>
  <div class="container">
    <div class="row mt-5">
      <div class="col-12">
        <h2 class="text-center">Contact Us</h2>
      </div>
      <p class="mt-5">In order to help us to process your request more efficiently and enable us to respond to you promptly, please select the appropriate option(s) listed below to contact us.</p>
      <ul class="mt-4">
        <li class="mt-2 d-flex align-items-center" v-for="item,idx in contactList" :key="idx">
          <img :src="item.icon" alt="">
          <label>{{ item.label }}: &nbsp;</label>
          <span>{{ item.text }}</span>
        </li>
      </ul>
    </div>
    <h3 class="fs-4 mt-4">We’d love to hear from you!</h3>
  </div>
</template>

<style scoped>
.bg {
  background: url('../assets/images/bg-contact.png') no-repeat;
  background-position: center;
  background-size: cover;
}
img {
  width: 25px;
  height: 25px;
  margin-right: 10px;
}
</style>

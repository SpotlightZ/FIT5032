<template>
    <div class="about container mt-5">
        <div class="row">
          <div class="col-md-8 offset-md-2">
            <h1 class="text-center">About Our Library</h1>
            <p class="text-center">Welcome to our digital library! We're dedicated to providing a vast collection of books and resources to our community.</p>
          </div>
        </div>
    </div>
  </template>
  
  <script setup>
  // No script needed for now
import { onMounted } from 'vue';

onMounted(() => {
  // 确保没有在 mounted 或其他生命周期钩子中抛出异常
  console.log('Component mounted');
});
  </script>
  
  <style>
  </style>
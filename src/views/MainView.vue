<script setup>
import BHeader from '@/components/BHeader.vue'
import FooterNav from '@/components/FooterNav.vue'

</script>

<template>
  <div>
    <BHeader class="b-header"></BHeader>
    <div class="main">
      <router-view />
      <Toast />
    </div>
    <FooterNav />
  </div>
</template>

<style scoped>
.b-header {
  position: fixed;
  top: 0;
  z-index: 1000;
  width: 100%;
}
</style>

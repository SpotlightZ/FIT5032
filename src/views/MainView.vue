<script setup>
import BHeader from '@/components/BHeader.vue'
import FooterNav from '@/components/FooterNav.vue'

</script>

<template>
  <div>
    <BHeader></BHeader>
    <router-view/>
    <FooterNav />
  </div>
</template>

<style scoped>
</style>

<script setup>
import BHeader from '@/components/BHeader.vue'
import { useUserStore } from '@/store';
import router from '@/router/index'

const userStore = useUserStore();

const toLogout = () => {
  userStore.logout();
  router.replace("/login");
}

</script>

<template>
    <div class="logout row justify-content-end text-center">
      <button @click="toLogout">logout</button>
    </div>
    <div>
        <BHeader></BHeader>
        <router-view/>
    </div>
</template>

<style scoped>
.logout {
  justify-content: end;
  padding: 10px 60px;
}

.logout > button {
    display: inline-block;
    width: 80px;
    height: 35px;
    line-height: 20px;
    border-radius: 8px;
    color: #fff;
    background: #000;
}
</style>

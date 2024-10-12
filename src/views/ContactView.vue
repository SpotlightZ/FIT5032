<script setup>
import { ref } from 'vue'
import Mapbox from '@/components/Mapbox.vue'

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
  <!-- 跳过导航链接 -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- 带有可访问名称的背景图像 -->
  <div class="bg row align-items-center" role="img" aria-label="Happy elderly person with a pet">
    <div>
      <h1 class="text-center fs-1">Fulfilling Friendships</h1>
      <p class="text-center fs-3">Real-life stories of unconditional love, companionship, and limitless snuggles</p>
    </div>
  </div>

  <!-- 主要内容区域 -->
  <main id="main-content" class="container">
    <div class="row mt-5">
      <div class="col-12">
        <h2 class="text-center">联系我们</h2>
      </div>
      <p class="mt-5">为了帮助我们更高效地处理您的请求，并及时回复您，请选择以下适当的选项与我们联系。</p>
      <ul class="mt-4">
        <li class="mt-2 d-flex align-items-center" v-for="(item, idx) in contactList" :key="idx">
          <img :src="item.icon" :alt="item.label">
          <span class="visually-hidden">{{ item.label }}:</span>
          <span>{{ item.text }}</span>
        </li>
      </ul>
    </div>
    <h3 class="fs-4 mt-4">我们期待您的来信！</h3>

    <div class="col-12">
      <Mapbox />
    </div>
  </main>
</template>

<style scoped>
/* 跳过链接的样式 */
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

/* 背景图像样式 */
.bg {
  background: url('../assets/images/bg-contact.png') no-repeat;
  background-position: center;
  background-size: cover;
}

/* 焦点样式 */
a:focus,
button:focus,
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid #005fcc;
}

/* 确保足够的色彩对比度 */
.text-center {
  color: #000;
}

/* 图片样式 */
img {
  width: 25px;
  height: 25px;
  margin-right: 10px;
}

/* 隐藏但对屏幕阅读器可见的文本 */
.visually-hidden {
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
</style>


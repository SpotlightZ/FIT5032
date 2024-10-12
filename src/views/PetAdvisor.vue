<script>
  import GenAI from '@/components/GenAI.vue'
  export default {
    components: {
      GenAI,
    },
  }

</script>

<template>
  <!-- 跳过导航链接 -->
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <!-- 主要内容区域 -->
  <main id="main-content">
    <div class="back">
        <GenAI></GenAI>
    </div>
  </main>
</template>
  
  
<style scoped>
.back {
  background: url('../assets/images/bg-AI2.png') no-repeat;
  background-position: center;
  background-size: cover;
}

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
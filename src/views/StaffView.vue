<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const functionURL = import.meta.env.VITE_FUNCTION_URL

const memberList = ref([])

// Fetch staff data function
const fetchStaff = async () => {
  try {
    const response = await axios.get(`${functionURL}/getStaff`)
    memberList.value = response.data
  } catch (error) {
    console.error('Error fetching staff data:', error)
  }
}

onMounted(() => {
  fetchStaff()
})
</script>

<template>
  <!-- Skip Navigation Link -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- Main Content Area -->
  <main id="main-content">
    <div class="bg row align-items-center">
      <div>
        <h1 class="text-center fs-1">Friends for Life</h1>
        <p class="text-center fs-3">
          Meet some of the senior pets helped by The Monash Organization.
        </p>
      </div>
    </div>
    <div class="col-12 mt-5">
      <h2 class="text-center">Staff</h2>
    </div>
    <div class="container member">
      <div
        class="board-member row mb-4"
        v-for="(item, idx) in memberList"
        :key="idx"
      >
        <div class="col-md-3">
          <img
            :src="item.avatar"
            :alt="`Photo of ${item.name}`"
            class="img-fluid rounded"
          />
        </div>
        <div class="col-md-9">
          <h3 class="member-name text-primary">{{ item.name }}</h3>
          <p class="member-title text-muted fst-italic">
            {{ item.position }}
          </p>
          <p class="member-description">{{ item.describe }}</p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Skip Link Styles */
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

/* Focus Styles */
button:focus,
input:focus,
select:focus,
textarea:focus,
a:focus {
  outline: 2px solid #005fcc;
}

.bg {
  background: url('../assets/images/bg-staff.png') no-repeat;
  background-position: center;
  background-size: cover;
}

.member {
  h1 {
    font-size: 2rem;
    margin-bottom: 30px;
  }
}

.member-name {
  font-size: 1.5rem;
}

.member-description {
  color: #333;
  line-height: 1.6;
}

/* Ensure text over background is readable */
.bg,
.member-description {
  color: #fff;
}

</style>


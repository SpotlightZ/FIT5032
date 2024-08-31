<script setup>
import { ref, onMounted } from 'vue'
// No script needed for now
import Rating from 'primevue/rating';
import Button from 'primevue/button';

const ratingValue = ref(3);
const averageRating = ref(0);
const totalRatings = ref(0);

const activeText = ref('')

// Load existing ratings from localStorage
onMounted(() => {
  loadRatings();
});

const loadRatings = () => {
  const ratings = JSON.parse(localStorage.getItem('ratings')) || [];
  if (ratings.length > 0) {
    const sum = ratings.reduce((total, rating) => total + rating, 0);
    averageRating.value = (sum / ratings.length).toFixed(1);
    totalRatings.value = ratings.length;
  }
};

const toSubmit = () => {
  activeText.value = 'Thanks for your feedback!';
  const ratings = JSON.parse(localStorage.getItem('ratings')) || [];
  // Add the new rating
  ratings.push(ratingValue.value);

  // Save back to localStorage
  localStorage.setItem('ratings', JSON.stringify(ratings));

  // Recalculate the average
  loadRatings();
  console.log('ssssubmit');
}

</script>

<template>
  <div class="about p-0">
    <div class="row bg d-flex align-items-center">
      <div class="col-md-8 offset-md-2">
        <h1 class="text-center fs-1">Friends for Life</h1>
        <p class="text-center fs-3">Companionship to senior individuals through pet ownership, while saving the lives of companion animals in shelters</p>
      </div>
    </div>
  </div>

  <div class="mt-3 ps-4 fs-3">
    <p>Please give us a score for our application</p>
    <Rating v-model="ratingValue" />
    <Button class="mt-2" label="Submit" @click="toSubmit"/>
    <div v-if="activeText" class="text-success fs-5">{{ activeText }}</div>
    <div class="row fs-5 mt-4 ps-3">Average Rating: 
      <Rating class="col-3" v-model="averageRating" disabled/>
    </div>
  </div>
</template>
  
  
<style scoped>
.bg {
  background: url('../assets/images/bg-about.png') no-repeat;
  background-size: 100%;
}

.p-rating-option-active .p-rating-icon {
  color: #f39c12; /* 橙色，已评分的图标 */
}

button {
  background: #000;
  border: none;
}

</style>
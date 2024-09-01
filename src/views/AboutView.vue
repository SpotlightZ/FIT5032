<script setup>
import { ref, onMounted } from 'vue'
// No script needed for now
import Fieldset from 'primevue/fieldset';
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

  <div class="mt-30 ps-4 fs-3">
    <p>Please give us a score for our application</p>
    <Rating v-model="ratingValue" />
    <Button class="mt-2" label="Submit" @click="toSubmit"/>
    <div v-if="activeText" class="text-success fs-5">{{ activeText }}</div>
    <div class="row fs-5 mt-4 ps-3">Average Rating: 
      <Rating class="col-3" v-model="averageRating" disabled/>
    </div>
  </div>

  <div class="container mt-5">
    <Fieldset legend="Who we are?">
      <p class="m-0">The Pets for the Elderly Foundation (PFE) is a 501 (c)(3) public charity whose mission is to provide companionship to senior individuals through pet ownership, while saving the lives of companion animals in shelters; animals which might otherwise be destroyed due to lack of appropriate homes, and space limitations.</p>
      <br>
      <p class="m-0">The program began in 1992 with two shelters near Cleveland, Ohio. Since then, PFE has seen great success and has grown to a nationwide program. PFE branched out nationally in 2002, and has helped successfully place over 100,000 companion animals with senior adopters.</p>
    </Fieldset>

    <Fieldset class="mt-5" legend="What We Do?">
      <p class="m-0">The Pets for the Elderly Foundation helps pay the fees to participating animal shelters throughout the United States for senior citizens (age 60 and over) who adopt a companion dog or cat from a participating shelter – including pre-adoption veterinary exams and spay/neuter, if part of the adoption fee.</p>
      <br>
      <p class="m-0">In 2020, PFE announced that its program would also include funding for shelter programs that cover veterinary services, retention services, food shortage support, and other services for animal adopters aged 60 and over. That PFE funding is implemented through a certified PFE partner shelter and includes routine veterinary care, surgery, food, home visits and grooming.</p>
      <br>
      <p class="m-0">Research shows the most serious disease for older persons is not cancer or heart disease – it’s loneliness. Pets offer affection, unconditional love, fight loneliness, and can help ease the loss of a loved one. Please help. Your monetary donation can make a difference. Few causes can have the potential benefits that will result from your contribution – you not only save the life of an animal, you can make a dramatic difference in the life of a senior. Currently, 53 shelters in 31 states are participating in the program. With additional funding, PFE would be able to expand the program to eventually include several shelters in each of the 50 states.</p>
      <br>
      <p class="m-0">We urgently need your help! Your monetary donation can make a difference. Few causes can have the potential benefits that will result from your contribution. You not only save the life of an animal, you can make a dramatic difference in the life of an elderly person.</p>
    </Fieldset>
  </div>

</template>
  
  
<style scoped>
.bg {
  background: url('../assets/images/bg-about.png') no-repeat;
  background-position: center;
  background-size: cover;
}

.p-rating-option-active .p-rating-icon {
  color: #f39c12; /* 橙色，已评分的图标 */
}

button {
  background: #000;
  border: none;
}

</style>
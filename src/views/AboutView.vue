<script setup>
import { ref, onMounted } from 'vue'
import Fieldset from 'primevue/fieldset'
import Rating from 'primevue/rating'
import Button from 'primevue/button'

const ratingValue = ref(3)
const averageRating = ref(0)
const totalRatings = ref(0)
const activeText = ref('')

// Load existing ratings from localStorage
onMounted(() => {
  loadRatings()
})

const loadRatings = () => {
  const ratings = JSON.parse(localStorage.getItem('ratings')) || []
  if (ratings.length > 0) {
    const sum = ratings.reduce((total, rating) => total + rating, 0)
    averageRating.value = (sum / ratings.length).toFixed(1)
    totalRatings.value = ratings.length
  }
}

const toSubmit = () => {
  activeText.value = 'Thanks for your feedback!'
  const ratings = JSON.parse(localStorage.getItem('ratings')) || []
  // Add the new rating
  ratings.push(ratingValue.value)

  // Save back to localStorage
  localStorage.setItem('ratings', JSON.stringify(ratings))

  // Recalculate the average
  loadRatings()
}
</script>

<template>
  <!-- Skip Navigation Link -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- Main Content Area -->
  <main id="main-content">
    <div class="about p-0" aria-label="Friends for Life">
      <div class="row bg d-flex align-items-center">
        <div class="col-md-8 offset-md-2">
          <h1 class="text-center fs-1">Friends for Life</h1>
          <p class="text-center fs-3">
            Companionship to senior individuals through pet ownership, while saving the lives of
            companion animals in shelters
          </p>
        </div>
      </div>
    </div>

    <div class="mt-30 ps-4 fs-3">
      <label for="rating" class="sr-only">Rate our application</label>
      <p>Please give us a score for our application</p>
      <Rating id="rating" v-model="ratingValue" aria-label="Rating out of 5" aria-required="true" />
      <Button class="mt-2" label="Submit" @click="toSubmit" aria-label="Submit Rating" />
      <div v-if="activeText" class="text-success fs-5" aria-live="polite">{{ activeText }}</div>
      <div class="row fs-5 mt-4 ps-3">Average Rating: 
        <Rating class="col-3" v-model="averageRating" aria-label="Average Rating" disabled/>
      </div>
    </div>

    <div class="container mt-5">
      <Fieldset legend="Who we are?">
        <p class="m-0">
          The Pets for the Elderly Foundation (PFE) is a Monash public charity whose mission is to
          provide companionship to senior individuals through pet ownership, while saving the lives
          of companion animals in shelters; animals which might otherwise be destroyed due to lack
          of appropriate homes, and space limitations.
        </p>
        <br />
        <p class="m-0">
          The program began in 2000 with two shelters near Melbourne, Victoria. Since then, PFE has
          seen great success and has grown to a nationwide program. PFE branched out nationally in
          2002, and has helped successfully place over 100,000 companion animals with senior
          adopters.
        </p>
      </Fieldset>

      <Fieldset class="mt-5" legend="What We Do?">
        <p class="m-0">
          The Pets for the Elderly Foundation helps pay the fees to participating animal shelters
          throughout the United States for senior citizens (age 60 and over) who adopt a companion
          dog or cat from a participating shelter – including pre-adoption veterinary exams and
          spay/neuter, if part of the adoption fee.
        </p>
        <br />
        <p class="m-0">
          In 2020, PFE announced that its program would also include funding for shelter programs
          that cover veterinary services, retention services, food shortage support, and other
          services for animal adopters aged 60 and over. That PFE funding is implemented through a
          certified PFE partner shelter and includes routine veterinary care, surgery, food, home
          visits and grooming.
        </p>
        <br />
        <p class="m-0">
          Research shows the most serious disease for older persons is not cancer or heart disease –
          it’s loneliness. Pets offer affection, unconditional love, fight loneliness, and can help
          ease the loss of a loved one. Please help. Your monetary donation can make a difference.
          Few causes can have the potential benefits that will result from your contribution – you
          not only save the life of an animal, you can make a dramatic difference in the life of a
          senior. Currently, 53 shelters in 31 states are participating in the program. With
          additional funding, PFE would be able to expand the program to eventually include several
          shelters in each of the 50 states.
        </p>
        <br />
        <p class="m-0">
          We urgently need your help! Your monetary donation can make a difference. Few causes can
          have the potential benefits that will result from your contribution. You not only save the
          life of an animal, you can make a dramatic difference in the life of an elderly person.
        </p>
      </Fieldset>
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
  background: url('../assets/images/bg-about.png') no-repeat;
  background-position: center;
  background-size: cover;
}

/* Ensure sufficient color contrast */
.p-rating-option-active .p-rating-icon {
  color: #f39c12;
}

button {
  background: #000;
  border: none;
  color: #fff;
}

button:hover,
button:focus {
  background: #333;
}

.text-success {
  color: #28a745;
}
</style>

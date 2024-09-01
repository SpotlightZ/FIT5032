<script setup>
import { ref, computed } from 'vue'
import Card from 'primevue/card';

const petList = ref([
  {
    image: '/src/assets/images/pet2.jpg',
    name: 'Hollis',
    age: 7,
    shelter: 'Animal Rescue, Inc.',
    description: "Hollis, a 7-year-old Beagle, was surrendered to Animal Rescue, Inc. when his owner's health began to fail.Hollis had clearly been well cared for in his previous home."
  },
  {
    image: '/src/assets/images/pet3.jpg',
    name: 'Emely',
    age: 11,
    shelter: 'Mercy Crusade',
    description: "Emely, an 11-year-old Chipoo, was brought to Mercy Crusade in Oxnard, CA when she developed a concerning mammary mass that needed to be examined by a veterinarian. "
  },
  {
    image: '/src/assets/images/pet4.jpg',
    name: 'Summer,',
    age: 8,
    shelter: 'KARES',
    description: "Summer, an 8-year old hound mix, was seen wandering in Kaloko on the west side of the Big Island of Hawaii. Worried forher well-being, several neighbors tried to come together and capture her."
  },
  {
    image: '/src/assets/images/pet1.jpg',
    name: 'Sophie',
    age: 9,
    shelter: 'Friends of Monash Animals',
    description: 'When Sophie, a 9-year-old lab mix, arrived at Friends of Monash Animals (FOMA) it was discovered that she had degenerative joint disease in her hips and a benign tumor at her elbow.',
  },
  {
    image: '/src/assets/images/pet5.jpg',
    name: 'Sherman',
    age: 8,
    shelter: 'Brother Wolf Animal Rescue',
    description: 'Sweet senior hound Sherman arrived at Brother Wolf Animal Rescue in Asheville, NC with an unknown history and various health issues. It was obvious to staff that Sherman had suffered severe neglect.',
  },
  {
    image: '/src/assets/images/pet6.jpg',
    name: 'Hazel',
    age: 13,
    shelter: 'CASPCA',
    description: 'When 13-year-old Hazel was surrendered to the shelter in June, she was severely overweight and struggling with multiple health issues.',
  },
  {
    image: '/src/assets/images/pet7.jpg',
    name: 'Roxie',
    age: 7,
    shelter: 'Petey and Furends',
    description: 'Senior girl Roxie was a stray who found herself in an overcrowded shelter in North Carolina. Petey and Furends stepped in to transport her to Washington D.C. in hopes.',
  },
  {
    image: '/src/assets/images/pet8.jpg',
    name: 'Carly',
    age: 14,
    shelter: 'Animal Fix Clinic',
    description: "Carly's owners recently noticed that she wasn't her usual happy self. She was lethargic and not interested in eating. Concerned, they took 14-year-old Carly to their local ER.",
  },
  {
    image: '/src/assets/images/pet9.jpg',
    name: 'Buddy',
    age: 11,
    shelter: 'Humane Society of North Texas',
    description: 'Buddy came to the Humane Society of North Texas as an abandoned stray who was severely malnourished. A medical exam revealed that this special senior was also suffering from advanced cancer.',
  }
])
</script>

<template>
  <div class="bg row align-items-center">
    <div>
      <h1 class="text-center fs-1">Meet the Pets</h1>
      <p class="text-center fs-3">Meet some of the senior pets helped by The Monash Organization.</p>
    </div>
  </div>
  <div class="col-12 mt-5">
    <h2 class="text-center">Find a Pet</h2>
  </div>
  <div class="pet-grid container">
    <Card v-for="item,idx in petList" :key="idx">
      <template #header>
        <img :src="item.image" alt="Pet Image" class="pet-image" />
      </template>
      <template #content>
        <div>
          <div class="pet-header">
            <h2>{{ item.name }}</h2>
            <span class="age-badge">{{item.age }} YRS</span>
          </div>
          <p class="shelter-name">{{ item.shelter }}</p>
          <p class="description">{{ item.description }}</p>
          <!-- <a href="#" class="more-info">A Closer Look <i class="pi pi-chevron-right"></i></a> -->
        </div>
      </template>
    </Card>
  </div>
  
</template>

<style scoped>
.bg {
  background: url('../assets/images/bg-find.png') no-repeat;
  background-position: center;
  background-size: cover;
}
.pet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}
.pet-image {
  width: 100%;
  border-radius: 10px;
  object-fit: cover;
}

.pet-header {
  display: flex;
  align-items: center;
}

.pet-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.age-badge {
  background-color: #ff6b6b;
  color: white;
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
  border-radius: 5px;
  margin-left: 10px;
}

.shelter-name {
  color: #ff6b6b;
  font-weight: bold;
  margin-top: 5px;
}

.description {
  color: #333;
  margin: 10px 0;
}

.more-info {
  color: #1e90ff;
  text-decoration: none;
  font-weight: bold;
}

.more-info i {
  vertical-align: middle;
}

.p-card {
  box-shadow: none;
}
</style>

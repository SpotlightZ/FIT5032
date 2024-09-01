<script setup>
import { ref } from 'vue'
import Card from 'primevue/card';

const items = ref([
  { id: 1, title: "Mister Jones, a large chow/lab mix, arrived at the Australia Monash in April 2017.", description: "At 12 years old he wasn’t the young pup that most people are in search of, but after a summer at the APL bewitching the staff and volunteers, he caught the eye and heart of Carrie. A year after Carrie’s dog had passed away, she finally felt ready to find a new canine companion. Last fall, she went to the APL and immediately fell in love with Mister Jones and his playful yet laid back charm. Once all alone and without a loving owner, Mister Jones will never be at a loss for love again. In a wonderful turn of luck, Mister Jones has gotten three humans for the price of one and spends his days happily doted upon by Carrie and her parents, now a happy little family of four.", image: "/src/assets/images/article3.jpg" },
  { id: 3, title: "Bill and Betty needed a companion for their special outings, like traveling and long walks.", description: "At Yavapai Humane in Prescott, Ariz., they met Fallow, an Australian Shepherd/American Blue Heeler, who has an awesome personality, loves to be petted, and is very friendly. Bill and Betty felt an immediate connection. They love traveling in their RV and are very excited to take Fallow along on their adventures.", image: "/src/assets/images/article1.jpg" },
  { id: 4, title: "Beverly, was interested in adopting an adult cat that she hoped would provide her with love and companionship.", description: "Because of her limited mobility, she specifically wanted a cat that wouldn t bolt out the front door whenever it was opened. Beverly and her family visited the Monash shelter and came upon Idgie, a beautiful gray and white cat. It was love at first sight.The two bonded instantly. Beverly knew that Idgie would need some TLC as she had a respiratory issue and a skin condition that needed tending to. Today, Beverly s family says that that Idgie (now named SiSi) is doing well with loving care from Beverly and that the two are inseparable. Beverly s family said that SiSi has definitely exceeded their expectation of providing companionship for their mother.", image: "/src/assets/images/article4.jpg" },
  { id: 5, title: "Four-year-old Panda, a Great Pyrenees mix, was transferred from the Fayette County Animal Control to the Monash shelter.", description: "Very soon after his arrival the beautiful and lovable Panda was adopted, but Panda’s happy ending was not meant to be. His separation anxiety complicated the adoption and as a result he was taken back to Animal Friends. Lisa and Robert, having taken four years to grieve over the loss of their beloved family dog, came into the shelter on a Sunday morning. Having recently retired and spending most of her time at home, Lisa thought it was an ideal situation for her to love and care for a new pet, namely Panda. However, Lisa was unexpectedly overcome with emotion and left the shelter crying. Lisa and Robert took some time to think things over and returned with their daughter to get to know Panda better, leading them to fall in love. They adopted sweet little Panda and credit him with the completion of their happy family. He’s doing well in his new home, and Robert and Lisa feel that Panda saved them more than they saved him.", image: "/src/assets/images/article5.jpg" },
  { id: 2, title: "Poor little puppy, Callie, was having difficulty finding her forever home after being returned to the Monash four times in one week.", description: "When a distressed college student overwhelmed with this sweet puppy dropped her off at Monash, she was immediately placed in a foster home that evening. \nOf course, the kids in Callie’s foster family loved her right away. And shockingly, so did their grumpy resident dog, who though tolerant, never takes a shine to any foster puppy. She even shared her toys with Callie! \nTwo weeks later after Callie was medically prepared for adoption, a local morning news show featured her story. By midday, three adoption applications were submitted, but it was John and Patricia who went one step further and showed up at Monash later that day, eager to meet little Callie. \nThe foster mom, intent on making sure that Callie had the best possible home, followed up with all three applicants. It was John and Patricia’s daughter, Julie - a fellow Monash foster mom - who swayed things in her parents favor. She explained that her parents hadn’t even wanted another dog after their senior lab had passed away but seeing Callie had been “love at first sight.” Though their time with Callie was brief, they developed an immense bond and wouldn’t even consider any of the other puppies available. In the end, love won out and John and Patricia were able to give Callie, now “Daisy,” her happy forever home.", image: "/src/assets/images/article2.jpg" },
  { id: 6, title: "Three weeks after learning about Caesar on the radio, I finally decided to take a trip to Monash to see him for myself.", 
  description: "Am I ever glad I did! Taking one look at this great big ball of feline fluff, I knew he was meant for me. Little did Caesar know as I snuggled him into my car on that cold January day, he was about to meet Belle and Alberta (my 11 year-old and 19-year old cats). \nBelle, who does not like new folks, instantly decided that she needed to inform this male intruder who was boss! After playing it safe for a day, hiding under the bed and behind the corner table, Caesar elected to 'make nice.' And now, Belle and Caesar, my new wide-faced kitty with the great big paws, are more than just friends, they're sweethearts! (At least Belle thinks so.)\n At 12 years of age, Caesar still loves to play. Catnip toys are his favorite. His daily routine remains the same: Eat a big breakfast, sit on my lap, take a long snooze. What a life he has! And he deserves a good life. After his owner died, he was shuttled from shelter to shelter. 'Stressed' is a good adjective to describe Caesar upon his arrival at Animal Friends. \nBut Caesar is stressed no longer. As he sleeps curled up on my bed with Alberta and Belle by his side, I wonder what his life would have been like had I not been listening to the radio one January morning.", image: "/src/assets/images/article7.jpg" }
])
</script>

<template>
  <!-- <div>This is a find pets page</div> -->
  <div>
    <div class="bg row align-items-center">
      <div>
        <h1 class="text-center fs-1">Fulfilling Friendships</h1>
        <p class="text-center fs-3">Real-life stories of unconditional love, companionship, and limitless snuggles</p>
      </div>
    </div>
    <div class="container">
      <div class="row mt-5">
      <div class="col-12">
        <h2 class="text-center">Articles & Resources</h2>
      </div>
      </div>
      <div class="d-flex flex-wrap mt-3">
        <div class="p-2 masonry-item" v-for="item in items" :key="item.id" style="flex: 1 0 21%;">
          <Card>
            <template #header>
              <img :src="item.image" alt="Item Image" class="img-fluid">
            </template>
            <template #content>
              <h5>{{ item.title }}</h5>
              <p>{{ item.description }}</p>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg {
  background: url('../assets/images/bg-articles.png') no-repeat;
  background-position: center;
  background-size: cover;
}

.masonry-item {
  margin-bottom: 16px;
}

.masonry-item img {
  border-radius: 8px;
}

h5 {
  color: #674D3F;
}
</style>

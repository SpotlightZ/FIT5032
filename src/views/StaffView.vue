<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios';

const functionURL = import.meta.env.VITE_FUNCTION_URL;

const memberList = ref([]);
// const memberList = ref([
//   {
//     avagar: '/src/assets/images/staff1.png',
//     name: 'Missia H. Vaselaney',
//     position: 'President',
//     describe: "Vaselaney is a partner at Taft, Stettinius and Hollister LLP and focuses her practice on estate planning for business owners and individuals. She is a featured speaker both nationally and state-wide on estate planning and other related matters on behalf of professional associations.\nVaselaney is a member of the board of advisors for the American Lung Association of the Midland States. She is also a board member and the chairperson of the Planned Giving Committee of Lakeland Community College. She is also a Planned Giving Committee member of the United Cerebral Palsy of Greater Cleveland and is a former Trustee for the Catholic Charities Corporation (1994-2002)."
//   },
//   {
//     avagar: '/src/assets/images/staff3.png',
//     name: 'Michael R. Donaldson',
//     position: '',
//     describe: "Donaldson is an attorney-at-law with over 32 years of experience representing small and medium-size businesses and their owners, focusing on general corporate representation, commercial and residential real estate acquisition and development, and estate planning.\nDonaldson is presently a Trustee of the Brooklyn Heights Cemetery Association in Cleveland, Ohio as well as a member of the Board of Managers of CMSC, Ltd., a marine storage and services company in Sandusky, Ohio."
//   },
//   {
//     avagar: '/src/assets/images/staff4.png',
//     name: 'Kerry Chelm',
//     position: '',
//     describe: "Kerry Chelm is President of Chelm Properties, Inc, a commercial real estate development and management firm located in Cleveland, Ohio. The company currently owns/manages 38 buildings in Northeast Ohio and Texas, totaling just over 4 million square feet. Chelm Properties was founded in 1956. Kerry assumed the role of president in 1993.\nAlways one to give back to the community, Kerry Chelm, has served on several boards and committees. In 2002 Kerry was Chair of the Jewish Federation of Cleveland’s Centennial Implementation Committee, which was an integral part of the $100,000,000 Centennial Campaign. In 2011-2012 Kerry served on the Jewish Federation of Cleveland’s Poverty Task Force Committee. He was a past president of Jewish Community Housing and currently serves as president of the Cleveland Hebrew School Educational Foundation. Kerry also serves on the boards of Menorah Park and Hillel at Kent State University (where he was the immediate past president.) He has also been a past board member of the Jewish Federation of Cleveland and has served as trustee of the Katz Foundation since its inception."
//   },
//   {
//     avagar: '/src/assets/images/staff2.png',
//     name: 'Susan Kurowski',
//     position: '',
//     describe: "Susan joined this organization while operating under the umbrella of Avrum Katz entities (including Pets for the Elderly Foundation and Avrum Katz Foundation) in January, 2006. She was hired as a grant writer and accountant, but quickly took on more responsibility. She has been Executive Director of the Pets for the Elderly Foundation since January of 2009; she is also the Manager of the Avrum Katz Foundation.\nPrior to joining Pets for the Elderly/Avrum Katz Foundation, Susan spent 20 years working in the financial industry, primarily in institutional equities and managed money at regional brokerage firms. She has also been the investor relations representative for a water filtration company, and has owned her own retail business.\nSusan is married, has three adult children, five granddaughters, and is currently the proud parent of three rescue dogs and one dumpster cat."
//   },
// ])
// 获取 staff 数据的函数
const fetchStaff = async () => {
  try {
    const response = await axios.get(`${functionURL}/getStaff`);
    memberList.value = response.data;
    console.log(memberList.value,'=memberList.value');
    
  } catch (error) {
    console.error('Error fetching staff data:', error);
  }
};

onMounted(() => {
  fetchStaff();
});
</script>

<template>
  <div class="bg row align-items-center">
    <div>
      <h1 class="text-center fs-1">Friends for Life</h1>
      <p class="text-center fs-3">Meet some of the senior pets helped by The Monash Organization.</p>
    </div>
  </div>
  <div class="col-12 mt-5">
    <h2 class="text-center">Staff</h2>
  </div>
  <div class="container member">
    <div class="board-member row mb-4" v-for="item,idx in memberList">
      <div class="col-md-3">
        <img :src="item.avatar" alt="Board Member Photo" class="img-fluid rounded" />
      </div>
      <div class="col-md-9">
        <h2 class="member-name text-primary">{{ item.name }}</h2>
        <p class="member-title text-muted fst-italic">{{ item.position }}</p>
        <p class="member-description">{{ item.describe }}</p>
      </div>
    </div>
  </div>
  
</template>

<style scoped>
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
</style>

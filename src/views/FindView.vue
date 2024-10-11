<script setup>
import { ref, onMounted } from 'vue'
import Card from 'primevue/card';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';


const petList = ref([])
const toast = useToast();
const functionURL = import.meta.env.VITE_FUNCTION_URL;

// 调用 Firebase Function 获取宠物数据
const fetchPets = async () => {
  try {
    const response = await axios.get(`${functionURL}/getPets`);
    petList.value = response.data.pets.map(pet => ({
      ...pet,
      createdAt: pet.createdAt, // 已经转换为 Date 对象
    }));
    console.log('Fetched Pets:', petList);
  } catch (error) {
    console.error('Error fetching pets:', error.response ? error.response.data : error.message);
    // 可选：显示错误消息
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch pets.', life: 3000 });
  }
};

onMounted(async () => {
  fetchPets();
});
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
        <img :src="item.avatar" alt="Pet Image" class="pet-image" />
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

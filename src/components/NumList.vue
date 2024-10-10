<template>
    <div class="admin-dashboard container">
      <div class="row justify-content-center">
        <div class="col-md-3 col-sm-6 mb-4">
          <div class="card stat-card">
            <div class="card-body stat-content">
              <i class="pi pi-users stat-icon" style="background-color: #3b82f6;"></i>
              <div class="stat-text">
                <h4>Users</h4>
                <h2>{{ usersCount }}</h2>
              </div>
            </div>
          </div>
        </div>
  
        <div class="col-md-3 col-sm-6 mb-4">
          <div class="card stat-card">
            <div class="card-body stat-content">
              <i class="pi pi-briefcase stat-icon" style="background-color: #f59e0b;"></i>
              <div class="stat-text">
                <h4>Staff</h4>
                <h2>{{ staffsCount }}</h2>
              </div>
            </div>
          </div>
        </div>
  
        <div class="col-md-3 col-sm-6 mb-4">
          <div class="card stat-card">
            <div class="card-body stat-content">
              <i class="pi pi-user stat-icon" style="background-color: #10b981;"></i>
              <div class="stat-text">
                <h4>Adopters</h4>
                <h2>{{ adoptersCount }}</h2>
              </div>
            </div>
          </div>
        </div>
  
        <div class="col-md-3 col-sm-6 mb-4">
          <div class="card stat-card">
            <div class="card-body stat-content">
              <i class="pi pi-heart stat-icon" style="background-color: #ef4444;"></i>
              <div class="stat-text">
                <h4>Pets</h4>
                <h2>{{ petsCount }}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { collection, getDocs, query } from 'firebase/firestore';
  import { db } from '@/firebase/init.js';
  
  export default {
    name: 'AdminDashboard',
    setup() {
      const usersCount = ref(0);
      const adoptersCount = ref(0);
      const staffsCount = ref(0);
      const petsCount = ref(0);
  
      // 获取用户数量
      const fetchCounts = async () => {
        try {
          // Users
          const usersSnapshot = await getDocs(query(collection(db, 'users')));
          usersCount.value = usersSnapshot.size;
  
          // Adopters
          const adoptersSnapshot = await getDocs(query(collection(db, 'adopters')));
          adoptersCount.value = adoptersSnapshot.size;
  
          // Staff
          const staffsSnapshot = await getDocs(query(collection(db, 'staff')));
          staffsCount.value = staffsSnapshot.size;
  
          // Pets
          const petsSnapshot = await getDocs(query(collection(db, 'pets')));
          petsCount.value = petsSnapshot.size;
  
        } catch (error) {
          console.error('Error fetching counts:', error);
        }
      };
  
      onMounted(() => {
        fetchCounts();
      });
  
      return {
        usersCount,
        adoptersCount,
        staffsCount,
        petsCount,
      };
    },
  };
  </script>
  
  <style scoped>
  .admin-dashboard {
    padding: 20px;
  }
  
  .statistics-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
  }
  
  .stat-card {
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    text-align: center;
  }
  
  .stat-content {
    display: flex;
    align-items: center;
    justify-content: start;
    gap: 15px;
  }
  
  .stat-icon {
    font-size: 2em;
    padding: 10px;
    border-radius: 50%;
    color: white;
  }
  
  .stat-text {
    text-align: left;
  }
  
  .stat-text h4 {
    margin: 0;
    font-size: 1em;
    color: #777;
  }
  
  .stat-text h2 {
    margin: 0;
    font-size: 1.5em;
    color: #333;
  }
  </style>
  
<script setup>
import { ref, computed } from 'vue'
import Menubar from 'primevue/menubar';
import router from '@/router/index'



const menuItems = computed(() => {
  const items = []
  items.push({
    label: 'About Us',
    items: [
      { label: 'Who We Are', path: '/about' },
      { label: 'Staff', path: '/staff' }
    ]
  },{
    label: 'Contact Us',
    items: [
      { label: 'Contact Us', path: '/contact' }
    ]
  })
  
  if (userRole === 'admin') {
    items.push(
      {
        label: 'Manage pet list',
        items: [
          { label: 'Manage pet list', path: '/managePet' }
        ]
      }
    )
  }
  
  if (userRole === 'admin' || userRole === 'user') {
    items.push(
      {
        label: 'Pet List',
        items: [
          { label: 'Find a Pet', path: '/find' },
          { label: 'Adopt a Pet', path: '/adopt' }
        ]
      },
      {
        label: 'Our Work',
        items: [
          { label: 'Articles & Resources', path: '/articles' }
        ]
      },
    )
  };
  return items;
})


function getUserRole() {
  // Determine user whether to log in
  return JSON.parse(localStorage.getItem('loggedInUser')).role;
}

let userRole = getUserRole()
</script>

<template>
  <footer class="footer mt-5">
    <div class="footer-container">
      <div class="footer-column" v-for="item,idx in menuItems" :key="idx">
        <h3>{{ item.label }}</h3>
        <ul>
          <li v-for="res,index in item.items" :key="index">
            <router-link :to="res.path" href="#">{{ res.label }}</router-link>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: #f8f9fa;
  padding: 20px;
}

.footer-container {
  display: flex;
  justify-content: space-around;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-column {
  flex: 1;
  padding: 10px;
}

.footer-column h3 {
  color: #0d6efd;
  font-size: 18px;
  margin-bottom: 10px;
}

.footer-column ul {
  list-style-type: none;
  padding: 0;
}

.footer-column ul li {
  margin-bottom: 5px;
}

.footer-column ul li a {
  text-decoration: none;
  color: #333;
}

.footer-column ul li a:hover {
  text-decoration: underline;
}
</style>

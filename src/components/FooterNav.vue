<script setup>
import { computed } from 'vue'

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
        label: 'Manage list',
        items: [
          { label: 'Admin Dashboard', path: '/dashboard' },
          { label: 'Adopter & Pets', path: '/adopter' },
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
          { label: 'Adopt a Pet', path: '/adopt' },
          { label: 'Pet Advisor', path: '/petadvisor' }
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
  <footer class="footer mt-5" aria-label="Footer Navigation">
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
/* Focus Styles */
a:focus {
  outline: 2px solid #005fcc;
}

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
  text-decoration: underline;
  color: #333;
}

.footer-column ul li a:hover {
  text-decoration: none;
}
</style>

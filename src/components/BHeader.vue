<script setup>
import { ref, computed } from 'vue'
import Menubar from 'primevue/menubar';
import { useUserStore } from '@/store';
import router from '@/router/index'

const userStore = useUserStore();

const toLogout = () => {
  userStore.logout();
  router.replace("/login");
}

const menuItems = computed(() => {
  const items = []
  items.push({
    label: 'About Us',
    items: [
      { label: 'Who We Are', command: () => router.push('/about') },
      { label: 'Staff', command: () => router.push('/staff') }
    ]
  },
  {
    label: 'Contact Us', command: () => router.push('/contact') 
  })
  
  if (userRole === 'admin') {
    items.push(
      {
        label: 'Manage list',
        items: [
          { label: 'Adopter', command: () => router.push('/adopter')},
          { label: 'Pets', command: () => router.push('/managePet') },
        ]
      }
    )
  }
  
  if (userRole === 'admin' || userRole === 'user') {
    items.push(
      {
        label: 'Pet List',
        items: [
          { label: 'Find a Pet', command: () => router.push('/find') },
          { label: 'Adopt a Pet', command: () => router.push('/adopt') }
        ]
      },
      {
        label: 'Our Work',
        items: [
          { label: 'Articles & Resources', command: () => router.push('/articles') }
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
  <Menubar :model="menuItems">
    <template #end>
      <div class="flex items-center gap-2">
        <div class="logout row justify-content-end text-center">
          <button @click="toLogout">logout</button>
        </div>
      </div>
    </template>
  </Menubar>
</template>

<style scoped>
.b-example-divider {
  height: 3rem;
  background-color: rgba(0, 0, 0, 0.1);
  border: solid rgba(0, 0, 0, 0.15);
  border-width: 1px 0;
  box-shadow:
    inset 0 0.5em 1.5em rgba(0, 0, 0, 0.1),
    inset 0 0.125em 0.5em rgba(0, 0, 0, 0.15);
}

.form-control-dark {
  color: #fff;
  background-color: var(--bs-dark);
  border-color: var(--bs-gray);
}
.form-control-dark:focus {
  color: #fff;
  background-color: var(--bs-dark);
  border-color: #fff;
  box-shadow: 0 0 0 0.25rem rgba(255, 255, 255, 0.25);
}

.bi {
  vertical-align: -0.125em;
  fill: currentColor;
}

.text-small {
  font-size: 85%;
}

.dropdown-toggle {
  outline: 0;
}

.logout {
  justify-content: end;
  padding: 0px 10px;
}

.logout > button {
    display: inline-block;
    width: 80px;
    height: 35px;
    line-height: 20px;
    border-radius: 8px;
    color: #fff;
    background: #000;
}
</style>

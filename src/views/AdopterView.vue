<template>
    <div class="container">
      <h1>Admin Dashboard</h1>
  
      <!-- Global Search -->
      <div class="global-search">
        <InputText v-model="globalFilter" placeholder="Search all fields" />
      </div>
  
      <!-- Adopters Management Table -->
      <h2>Adopters Management</h2>
      <div class="datatable-filter">
        <DataTable 
          :value="adopters" 
          paginator 
          :rows="10" 
          :filters="adopterFilters" 
          :globalFilterFields="['name', 'email']" 
          :filterDisplay="'menu'"
          :sortField="sortField" 
          :sortOrder="sortOrder"
          :globalFilter="globalFilter"
        >
          <Column field="name" header="Adopter Name" sortable filter filterPlaceholder="Search by name"></Column>
          <Column field="email" header="Adopter Email" sortable filter filterPlaceholder="Search by email"></Column>
          <Column header="Actions">
            <template #body="slotProps">
              <Button label="Send Email" icon="pi pi-envelope" @click="openEmailSender(slotProps.data)" />
            </template>
          </Column>
        </DataTable>
      </div>
  
      <!-- Donors Management Table -->
      <h2>Donors Management</h2>
      <div class="datatable-filter">
        <DataTable 
          :value="donors" 
          paginator 
          :rows="10" 
          :filters="donorFilters" 
          :globalFilterFields="['name', 'email', 'amount']" 
          :filterDisplay="'menu'"
          :sortField="sortField" 
          :sortOrder="sortOrder"
          :globalFilter="globalFilter"
        >
          <Column field="name" header="Donor Name" sortable filter filterPlaceholder="Search by name"></Column>
          <Column field="email" header="Donor Email" sortable filter filterPlaceholder="Search by email"></Column>
          <Column field="amount" header="Donation Amount" sortable filter filterPlaceholder="Search by amount"></Column>
        </DataTable>
      </div>
  
      <!-- Email Sender Component -->
      <Dialog header="Send Email" v-model:visible="selectedAdopter" :modal="true" :closable="false" style="width: 80vw">
        <EmailSender :adopter="selectedAdopter" @close="closeEmailSender" />
      </Dialog>
    </div>
  </template>
  
  <script>
  import EmailSender from '@/components/EmailSender.vue'

  import { ref } from 'vue';
  
  export default {
    components: {
      EmailSender,
    },
    data() {
      return {
        // Adopters data
        adopters: [
          { id: 1, name: 'John Doe', email: 'dd.zheng@outlook.com' },
          { id: 2, name: 'Jane Smith', email: 'janesmith@example.com' },
          { id: 2, name: 'Jane Smith', email: 'janesmith@example.com' },
          { id: 2, name: 'Jane Smith', email: 'janesmith@example.com' },
          { id: 2, name: 'Jane Smith', email: 'janesmith@example.com' },
          { id: 2, name: 'Jane Smith', email: 'janesmith@example.com' },
          { id: 2, name: 'Jane Smith', email: 'janesmith@example.com' },
          { id: 2, name: 'Jane Smith', email: 'janesmith@example.com' },
          { id: 2, name: 'Jane Smith', email: 'janesmith@example.com' },
          { id: 2, name: 'Jane Smith', email: 'janesmith@example.com' },
          { id: 2, name: 'Jane Smith', email: 'janesmith@example.com' },
          { id: 2, name: 'Jane Smith', email: 'janesmith@example.com' },
          { id: 2, name: 'Jane Smith', email: 'janesmith@example.com' },
          { id: 2, name: 'Jane Smith', email: 'janesmith@example.com' },
        ],
        // Donors data
        donors: [
          { id: 1, name: 'Michael Johnson', email: 'michaeljohnson@example.com', amount: 1000 },
          { id: 2, name: 'Emily Davis', email: 'emilydavis@example.com', amount: 500 },
        ],
        selectedAdopter: null, // Selected adopter for email
        globalFilter: '', // Global search filter value
        // Filters
        adopterFilters: {
          global: { value: null, matchMode: 'contains' },
          name: { value: null, matchMode: 'contains' },
          email: { value: null, matchMode: 'contains' },
        },
        donorFilters: {
          global: { value: null, matchMode: 'contains' },
          name: { value: null, matchMode: 'contains' },
          email: { value: null, matchMode: 'contains' },
          amount: { value: null, matchMode: 'equals' },
        },
        sortField: 'name', // Default sorting field
        sortOrder: 1, // 1 for ascending order, -1 for descending
      };
    },
    methods: {
      openEmailSender(adopter) {
        this.selectedAdopter = adopter;
      },
      closeEmailSender() {
        this.selectedAdopter = null;
      },
    },
  };
  </script>
  
  <style scoped>
  .container {
    margin: 20px;
  }
  .global-search {
    margin-bottom: 20px;
  }
  .datatable-filter {
    margin-bottom: 30px;
  }
  </style>
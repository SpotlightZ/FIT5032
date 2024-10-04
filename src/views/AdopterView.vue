<template>
    <div class="container">
      <h1>Admin Dashboard</h1>
  
      <!-- Adopters Management Table -->
      <h2>Adopters Management</h2>
      <div class="datatable-filter">
        <DataTable 
          :value="adopters" 
          paginator 
          :rows="10" 
          :filters="adopterFilters" 
          dataKey="id"
          :globalFilterFields="['name', 'email']" 
          :filterDisplay="'row'"
          :sortField="sortField" 
          :sortOrder="sortOrder"
          selection-mode="multiple"
          v-model:selection="selectedAdopters"
        >
          <template #header>
            <div class="flex justify-end">
              <IconField>
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="adopterFilters['global'].value" placeholder="Keyword Search" />
              </IconField>
            </div>
          </template>
          <template #empty> No adopter found. </template>
          <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
          <Column field="name" header="Adopter Name" sortable filter filterPlaceholder="Search by name">
            <template #filter>
              <InputText v-model="adopterFilters['name'].value" placeholder="Search by name" />
            </template>
          </Column>
          <Column field="email" header="Adopter Email" sortable filter filterPlaceholder="Search by email">
            <template #filter>
              <InputText v-model="adopterFilters['email'].value" placeholder="Search by email" />
            </template>
          </Column>
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
          selection-mode="multiple"
          v-model:selection="selectedAdopters"
        >
          <template #header>
            <div class="flex justify-end">
              <IconField>
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="donorFilters['global'].value" placeholder="Keyword Search" />
              </IconField>
            </div>
          </template>
          <template #empty> No donor found. </template>
          <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
          <Column field="name" header="Donor Name" sortable filter filterPlaceholder="Search by name">
            <template #filter>
              <InputText v-model="donorFilters['name'].value" placeholder="Search by name" />
            </template>
          </Column>
          <Column field="email" header="Donor Email" sortable filter filterPlaceholder="Search by email">
            <template #filter>
              <InputText v-model="donorFilters['email'].value" placeholder="Search by email" />
            </template>
          </Column>
          <Column field="amount" header="Donation Amount" sortable filter filterPlaceholder="Search by amount">
            <template #filter>
              <InputText v-model="donorFilters['amount'].value" placeholder="Search by amount" />
            </template>
          </Column>
          <Column header="Actions">
            <template #body="slotProps">
              <Button label="Send Email" icon="pi pi-envelope" @click="openEmailSender(slotProps.data)" />
            </template>
          </Column>
        </DataTable>
      </div>

      <Button label="Send Bulk Email" icon="pi pi-send" @click="openBulkEmailSender" :disabled="!selectedAdopters.length" />
  
      <!-- Email Sender Component -->
      <Dialog header="Send Email" v-model:visible="isDialog" :modal="true" :closable="false" style="width: 80vw">
        <EmailSender :adopters="selectedAdopter" @close="closeEmailSender" />
      </Dialog>

      <!-- Bulk Email Dialog -->
      <Dialog header="Send Bulk Email" v-model:visible="bulkEmailDialogVisible" :modal="true" :closable="false" style="width: 80vw">
        <EmailSender :adopters="selectedAdopters" @close="closeBulkEmailSender" isBulk />
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
          { id: 3, name: 'Emily Johnson', email: 'emily.johnson@example.com' },
          { id: 4, name: 'Michael Brown', email: 'michael.brown@example.com' },
          { id: 5, name: 'Chris Lee', email: 'chris.lee@example.com' },
          { id: 6, name: 'Laura Martinez', email: 'laura.martinez@example.com' },
          { id: 7, name: 'Robert Wilson', email: 'robert.wilson@example.com' },
          { id: 8, name: 'Daniel Davis', email: 'daniel.davis@example.com' },
          { id: 9, name: 'Sarah Miller', email: 'sarah.miller@example.com' },
          { id: 10, name: 'David Moore', email: 'david.moore@example.com' },
          { id: 11, name: 'Jessica Taylor', email: 'jessica.taylor@example.com' },
          { id: 12, name: 'Anthony Anderson', email: 'anthony.anderson@example.com' },
          { id: 13, name: 'Lisa White', email: 'lisa.white@example.com' },
          { id: 14, name: 'Mark Thompson', email: 'mark.thompson@example.com' },
          { id: 15, name: 'Kevin Harris', email: 'kevin.harris@example.com' }
        ],
        // Donors data
        donors: [
          { id: 1, name: 'Michael Johnson', email: 'michaeljohnson@example.com', amount: 1000 },
          { id: 2, name: 'Emily Davis', email: 'emilydavis@example.com', amount: 500 },
        ],
        selectedAdopters: [],
        selectedAdopter: [], // Selected adopter for email
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
        isDialog: false,
        bulkEmailDialogVisible: false,
      };
    },
    methods: {
      openEmailSender(adopter) {
        this.selectedAdopter.push(adopter)
        console.log(this.selectedAdopter,'=d');
        this.isDialog = true;
        // this.selectedAdopter = adopter;
      },
      closeEmailSender() {
        this.selectedAdopter = [];
        this.isDialog = false;
      },
      openBulkEmailSender() {
        this.bulkEmailDialogVisible = true;
      },
      closeBulkEmailSender() {
        this.bulkEmailDialogVisible = false;
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
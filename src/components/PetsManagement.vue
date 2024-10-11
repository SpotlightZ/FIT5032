<template>
    <div class="container">
      <h2>Pets Management</h2>
      <div class="datatable-filter">
        <Button label="Add Pet" icon="pi pi-plus" class="btn-success me-2" @click="openAddPetDialog" />
        <Button label="Refresh" icon="pi pi-refresh" class="p-button-secondary ml-2" @click="fetchPets" />
      </div>
      <DataTable
        :value="pets"
        paginator
        :rows="10"
        :filters="petFilters"
        dataKey="id"
        :globalFilterFields="['name', 'age', 'address', 'description']"
        :filterDisplay="'menu'"
        :sortField="sortField"
        :sortOrder="sortOrder"
        class="custom-datatable"
      >
        <template #header>
          <div class="flex justify-between">
            <div class="flex">
              <span class="p-input-icon-left">
                <InputText
                  v-model="petFilters['global'].value"
                  placeholder="Keyword Search"
                  class="w-full"
                />
              </span>
            </div>
          </div>
        </template>
        <template #empty> No pets found. </template>
        <Column field="id" header="ID" sortable style="width: 100px;"></Column>
        <Column field="avatar" header="avatar">
            <template #body="slotProps">
              <img :src="slotProps.data.avatar" alt="Avatar" class="avatar-image" style="width: 100px;" />
            </template>
          </Column>
        <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" style="width: 150px;">
          <template #filter>
            <InputText v-model="petFilters['name'].value" placeholder="Search by name" />
          </template>
        </Column>
        <Column field="age" header="Age" sortable filter filterPlaceholder="Search by age" style="width: 100px;">
          <template #filter>
            <InputText v-model="petFilters['age'].value" placeholder="Search by age" />
          </template>
        </Column>
        <Column field="address" header="Address" sortable filter filterPlaceholder="Search by address" style="width: 200px;">
          <template #filter>
            <InputText v-model="petFilters['address'].value" placeholder="Search by address" />
          </template>
        </Column>
        <Column field="description" header="Description" sortable filter filterPlaceholder="Search by description" style="width: 300px;"></Column>
        <Column field="createdAt" header="Created At" sortable style="width: 200px;">
          <template #body="slotProps">
            {{ slotProps.data.createdAt ? new Date(slotProps.data.createdAt).toLocaleString() : '' }}
          </template>
        </Column>
        <Column header="Actions" style="width: 150px;">
          <template #body="slotProps">
            <Button label="" icon="pi pi-trash" class="p-button-danger" @click="deletePet(slotProps.data.id)" />
          </template>
        </Column>
      </DataTable>
  
      <!-- Add Pet Dialog -->
      <Dialog header="Add Pet" v-model:visible="addPetDialogVisible" :modal="true" :closable="false" style="width: 50vw">
        <AddPetForm @add="addPet" @close="closeAddPetDialog" />
      </Dialog>
    </div>
  </template>
  
  <script>
  import AddPetForm from '@/components/AddPetForm.vue';
  import axios from 'axios';
  
  export default {
    components: {
      AddPetForm,
    },
    data() {
      return {
        pets: [],
        addPetDialogVisible: false,
        petFilters: {
          global: { value: null, matchMode: 'contains' },
          name: { value: null, matchMode: 'contains' },
          age: { value: null, matchMode: 'contains' },
          address: { value: null, matchMode: 'contains' },
          description: { value: null, matchMode: 'contains' },
        },
        sortField: 'createdAt',
        sortOrder: -1, // -1 for descending
        functionURL: import.meta.env.VITE_FUNCTION_URL,
      };
    },
    methods: {
      // 打开添加宠物对话框
      openAddPetDialog() {
        this.addPetDialogVisible = true;
      },
      // 关闭添加宠物对话框
      closeAddPetDialog() {
        this.addPetDialogVisible = false;
      },
      // 调用 Firebase Function 添加宠物
      async addPet(newPet) {
        try {
          const response = await axios.post(`${this.functionURL}/addPet`, newPet, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          console.log('Pet added:', response.data);
          this.addPetDialogVisible = false;
          this.fetchPets();
          // 可选：显示成功消息
          this.$toast.add({ severity: 'success', summary: 'Success', detail: 'Pet added successfully.', life: 3000 });
        } catch (error) {
          console.error('Error adding pet:', error.response ? error.response.data : error.message);
          // 可选：显示错误消息
          this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add pet.', life: 3000 });
        }
      },
      // 调用 Firebase Function 获取宠物数据
      async fetchPets() {
        try {
          const response = await axios.get(`${this.functionURL}/getPets`);
          this.pets = response.data.pets.map(pet => ({
            ...pet,
            createdAt: pet.createdAt, // 已经转换为 Date 对象
          }));
          console.log('Fetched Pets:', this.pets);
          // 可选：显示成功消息
        //   this.$toast.add({ severity: 'success', summary: 'Success', detail: 'Pets data fetched successfully.', life: 3000 });
        } catch (error) {
          console.error('Error fetching pets:', error.response ? error.response.data : error.message);
          // 可选：显示错误消息
          this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch pets.', life: 3000 });
        }
      },
      // 调用 Firebase Function 删除宠物
      async deletePet(petId) {
        if (!confirm('Are you sure you want to delete this pet?')) {
          return;
        }
      
        try {
          const response = await axios.delete(`${this.functionURL}/deletePet`, {
            params: { petId },
            headers: {
              'Content-Type': 'application/json',
            },
          });
          console.log('Pet deleted:', response.data);
          this.fetchPets();
          // 可选：显示成功消息
          this.$toast.add({ severity: 'success', summary: 'Success', detail: 'Pet deleted successfully.', life: 3000 });
        } catch (error) {
          console.error('Error deleting pet:', error.response ? error.response.data : error.message);
          // 可选：显示错误消息
          this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete pet.', life: 3000 });
        }
      },

    },
    mounted() {
      this.fetchPets();
    },
  };
  </script>
  
  <style scoped>
  .container {
    margin: 20px;
  }
  
  .datatable-filter {
    margin-bottom: 30px;
  }
  
  .custom-datatable .p-datatable {
    font-size: 12px; /* 调整为您需要的字号 */
  }
  
  .custom-datatable .p-datatable thead th {
    font-size: 12px; /* 表头字号 */
  }
  
  .custom-datatable .p-datatable tbody td {
    font-size: 12px; /* 表格内容字号 */
  }
  
  .custom-datatable .p-button {
    font-size: 10px;
  }
  
  .p-input-icon-left {
    width: 100%;
  }
  
  .ml-2 {
    margin-left: 0.5rem;
  }
  </style>
  
<template>
    <!-- Skip Navigation Link -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <div class="container">
    <h1 class="mb-5">Pets Management</h1>

    <!-- Main Content Area -->
    <main id="main-content">
      <div class="datatable-filter">
        <Button
          label="Add Pet"
          icon="pi pi-plus"
          class="btn-success me-2"
          @click="openAddPetDialog"
          aria-label="Add Pet"
        />
        <Button
          label="Refresh"
          icon="pi pi-refresh"
          class="p-button-secondary ml-2"
          @click="fetchPets"
          aria-label="Refresh Pet List"
        />
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
        aria-label="Pets Data Table"
      >
        <template #header>
          <div class="flex justify-between">
            <div class="flex">
              <span class="p-input-icon-left">
                <InputText
                  v-model="petFilters['global'].value"
                  placeholder="Keyword Search"
                  class="w-full"
                  aria-label="Global Keyword Search"
                />
              </span>
            </div>
          </div>
        </template>
        <template #empty>
          <p>No pets found.</p>
        </template>
        <Column
          field="id"
          header="ID"
          sortable
          style="width: 100px;"
          :ariaLabel="'ID'"
        ></Column>
        <Column field="avatar" header="Avatar" :ariaLabel="'Avatar'">
          <template #body="slotProps">
            <img
              :src="slotProps.data.avatar"
              :alt="`Avatar of ${slotProps.data.name}`"
              class="avatar-image"
              style="width: 100px;"
            />
          </template>
        </Column>
        <Column
          field="name"
          header="Name"
          sortable
          filter
          filterPlaceholder="Search by name"
          style="width: 150px;"
          :ariaLabel="'Name'"
        >
          <template #filter>
            <InputText
              v-model="petFilters['name'].value"
              placeholder="Search by name"
              aria-label="Filter by name"
            />
          </template>
        </Column>
        <Column
          field="age"
          header="Age"
          sortable
          filter
          filterPlaceholder="Search by age"
          style="width: 100px;"
          :ariaLabel="'Age'"
        >
          <template #filter>
            <InputText
              v-model="petFilters['age'].value"
              placeholder="Search by age"
              aria-label="Filter by age"
            />
          </template>
        </Column>
        <Column
          field="address"
          header="Address"
          sortable
          filter
          filterPlaceholder="Search by address"
          style="width: 200px;"
          :ariaLabel="'Address'"
        >
          <template #filter>
            <InputText
              v-model="petFilters['address'].value"
              placeholder="Search by address"
              aria-label="Filter by address"
            />
          </template>
        </Column>
        <Column
          field="description"
          header="Description"
          sortable
          filter
          filterPlaceholder="Search by description"
          style="width: 300px;"
          :ariaLabel="'Description'"
        >
          <template #filter>
            <InputText
              v-model="petFilters['description'].value"
              placeholder="Search by description"
              aria-label="Filter by description"
            />
          </template>
        </Column>
        <Column
          field="createdAt"
          header="Created At"
          sortable
          style="width: 200px;"
          :ariaLabel="'Created At'"
        >
          <template #body="slotProps">
            {{ slotProps.data.createdAt ? new Date(slotProps.data.createdAt).toLocaleString() : '' }}
          </template>
        </Column>
        <Column header="Actions" style="width: 150px;" :ariaLabel="'Actions'">
          <template #body="slotProps">
            <Button
              label=""
              icon="pi pi-trash"
              class="p-button-danger"
              @click="deletePet(slotProps.data.id)"
              aria-label="Delete pet {{ slotProps.data.name }}"
            />
          </template>
        </Column>
      </DataTable>

      <!-- Add Pet Dialog -->
      <Dialog
        header="Add Pet"
        v-model:visible="addPetDialogVisible"
        :modal="true"
        :closable="false"
        style="width: 50vw"
        aria-modal="true"
        role="dialog"
      >
        <AddPetForm @add="addPet" @close="closeAddPetDialog" />
      </Dialog>
    </main>
  </div>
</template>
  
<script>
import AddPetForm from '@/components/AddPetForm.vue'
import axios from 'axios'

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
    }
  },
  methods: {
    // Open Add Pet Dialog
    openAddPetDialog() {
      this.addPetDialogVisible = true
    },
    // Close Add Pet Dialog
    closeAddPetDialog() {
      this.addPetDialogVisible = false
    },
    // Add Pet
    async addPet(newPet) {
      try {
        const response = await axios.post(`${this.functionURL}/addPet`, newPet, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        console.log('Pet added:', response.data)
        this.addPetDialogVisible = false
        this.fetchPets()
        // Optional: Show success message
        this.$toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Pet added successfully.',
          life: 3000,
        })
      } catch (error) {
        console.error('Error adding pet:', error.response ? error.response.data : error.message)
        // Optional: Show error message
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add pet.',
          life: 3000,
        })
      }
    },
    // Fetch Pets
    async fetchPets() {
      try {
        const response = await axios.get(`${this.functionURL}/getPets`)
        this.pets = response.data.pets.map((pet) => ({
          ...pet,
          createdAt: pet.createdAt, // Already converted to Date object
        }))
        console.log('Fetched Pets:', this.pets)
      } catch (error) {
        console.error('Error fetching pets:', error.response ? error.response.data : error.message)
        // Optional: Show error message
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch pets.',
          life: 3000,
        })
      }
    },
    // Delete Pet
    async deletePet(petId) {
      if (!confirm('Are you sure you want to delete this pet?')) {
        return
      }

      try {
        const response = await axios.delete(`${this.functionURL}/deletePet`, {
          params: { petId },
          headers: {
            'Content-Type': 'application/json',
          },
        })
        console.log('Pet deleted:', response.data)
        this.fetchPets()
        // Optional: Show success message
        this.$toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Pet deleted successfully.',
          life: 3000,
        })
      } catch (error) {
        console.error('Error deleting pet:', error.response ? error.response.data : error.message)
        // Optional: Show error message
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete pet.',
          life: 3000,
        })
      }
    },
  },
  mounted() {
    this.fetchPets()
  },
}
</script>

<style scoped>
/* Skip Link Styles */
.skip-link {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.skip-link:focus {
  position: static;
  left: 0;
  top: 0;
  width: auto;
  height: auto;
  background: #fff;
  color: #000;
  padding: 10px;
  z-index: 1000;
}

/* Focus Styles */
button:focus,
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid #005fcc;
}

/* Adjusting font sizes for readability */
.container {
  margin: 20px;
  max-width: 100vw;
}

.datatable-filter {
  margin-bottom: 30px;
}

.custom-datatable .p-datatable {
  font-size: 14px; /* Adjusted font size for better readability */
}

.custom-datatable .p-datatable thead th {
  font-size: 14px;
}

.custom-datatable .p-datatable tbody td {
  font-size: 14px;
}

.custom-datatable .p-button {
  font-size: 14px;
}

.p-input-icon-left {
  width: 100%;
}

.ml-2 {
  margin-left: 0.5rem;
}

/* Adjusting color contrast */
.btn-success {
  background-color: #28a745;
  border-color: #28a745;
  color: #fff;
}

.btn-success:hover,
.btn-success:focus {
  background-color: #218838;
  border-color: #1e7e34;
  color: #fff;
}

/* Image Styles */
.avatar-image {
  width: 100px;
  height: auto;
}
</style>

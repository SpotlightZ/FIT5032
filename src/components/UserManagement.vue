<template>
  <!-- Skip Navigation Link -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <div class="user-management">
    <!-- Header Section -->
    <div class="header flex justify-between items-center mb-4">
      <h2>User Management</h2>
      <div class="flex space-x-2">
        <Button
          label="Delete Selected"
          icon="pi pi-trash"
          class="p-button-danger"
          @click="confirmBulkDelete"
          :disabled="!selectedUsers.length"
          aria-label="Delete Selected Users"
        />
      </div>
    </div>

    <!-- Main Content Area -->
    <main id="main-content">
      <!-- DataTable with Filters and Selection -->
      <DataTable
        :value="users"
        paginator
        :rows="10"
        :filters="userFilters"
        dataKey="id"
        :globalFilterFields="['email', 'role', 'reason']"
        :filterDisplay="'menu'"
        :sortField="sortField"
        :sortOrder="sortOrder"
        selection-mode="multiple"
        v-model:selection="selectedUsers"
        responsiveLayout="scroll"
        :emptyMessage="'No users found.'"
        aria-label="User Management Table"
      >
        <!-- Header Template with Global Search -->
        <template #header>
          <div class="flex justify-between">
            <div class="flex">
              <span class="p-input-icon-left">
                <InputText
                  v-model="userFilters['global'].value"
                  placeholder="Keyword Search"
                  class="w-full"
                  aria-label="Global Keyword Search"
                />
              </span>
            </div>
          </div>
        </template>

        <!-- Empty Template -->
        <template #empty>
          <div class="text-center">No users found.</div>
        </template>

        <!-- Selection Column -->
        <Column
          selectionMode="multiple"
          headerStyle="width: 3em"
          :ariaLabel="'Select all users'"
        ></Column>

        <!-- Email Column with Filter -->
        <Column
          field="email"
          header="Email"
          sortable
          filter
          filterPlaceholder="Search by email"
          :ariaLabel="'Email'"
        >
          <template #filter>
            <InputText
              v-model="userFilters['email'].value"
              placeholder="Search by email"
              aria-label="Filter by email"
            />
          </template>
        </Column>

        <!-- Role Column with Filter -->
        <Column
          field="role"
          header="Role"
          sortable
          filter
          filterPlaceholder="Search by role"
          :ariaLabel="'Role'"
        >
          <template #filter>
            <InputText
              v-model="userFilters['role'].value"
              placeholder="Search by role"
              aria-label="Filter by role"
            />
          </template>
        </Column>

        <!-- Reason Column with Filter -->
        <Column
          field="reason"
          header="Reason"
          sortable
          filter
          filterPlaceholder="Search by reason"
          :ariaLabel="'Reason'"
        >
          <template #filter>
            <InputText
              v-model="userFilters['reason'].value"
              placeholder="Search by reason"
              aria-label="Filter by reason"
            />
          </template>
        </Column>

        <!-- Is Australian Column -->
        <Column
          field="isAustralian"
          header="Is Australian"
          sortable
          filter
          filterPlaceholder="Search by Australian status"
          :ariaLabel="'Is Australian'"
        >
          <template #body="slotProps">
            <i
              v-if="slotProps.data.isAustralian"
              class="pi pi-check"
              style="color: green; font-size: 1.5em;"
              aria-label="Yes"
              role="img"
            ></i>
            <i
              v-else
              class="pi pi-times"
              style="color: red; font-size: 1.5em;"
              aria-label="No"
              role="img"
            ></i>
          </template>
          <template #filter>
            <Dropdown
              :options="isAustralianOptions"
              v-model="userFilters['isAustralian'].value"
              placeholder="Select"
              optionLabel="label"
              optionValue="value"
              showClear
              aria-label="Filter by Australian status"
            />
          </template>
        </Column>

        <!-- Created At Column -->
        <Column
          field="createdAt"
          header="Created At"
          sortable
          :ariaLabel="'Created At'"
        >
          <template #body="slotProps">
            {{ formatDate(slotProps.data) }}
          </template>
        </Column>

        <!-- Operations Column -->
        <Column header="Operations" class="buttons" :ariaLabel="'Operations'">
          <template #body="slotProps">
            <Button
              label=""
              icon="pi pi-trash"
              class="p-button-rounded p-button-danger"
              @click="confirmDeleteUser(slotProps.data)"
              :aria-label="`Delete user ${slotProps.data.email}`"
            />
          </template>
        </Column>
      </DataTable>

      <!-- Delete Confirmation Dialog -->
      <Dialog
        header="Confirm Delete"
        v-model:visible="isDeleteDialogVisible"
        :modal="true"
        :closable="false"
        style="width: 30vw"
        aria-modal="true"
        role="alertdialog"
      >
        <div>
          <p>
            Are you sure you want to delete <strong>{{ userToDelete.email }}</strong>?
          </p>
          <div class="flex justify-end mt-4">
            <Button
              label="Cancel"
              icon="pi pi-times"
              class="p-button-text"
              @click="closeDeleteDialog"
              aria-label="Cancel"
            />
            <Button
              label="Delete"
              icon="pi pi-check"
              class="p-button-danger ml-2"
              @click="deleteUser"
              aria-label="Confirm Delete"
            />
          </div>
        </div>
      </Dialog>

      <!-- Bulk Delete Confirmation Dialog -->
      <Dialog
        header="Confirm Bulk Delete"
        v-model:visible="isBulkDeleteDialogVisible"
        :modal="true"
        :closable="false"
        style="width: 30vw"
        aria-modal="true"
        role="alertdialog"
      >
        <div>
          <p>
            Are you sure you want to delete <strong>{{ selectedUsers.length }}</strong> selected
            users?
          </p>
          <div class="flex justify-end mt-4">
            <Button
              label="Cancel"
              icon="pi pi-times"
              class="p-button-text"
              @click="closeBulkDeleteDialog"
              aria-label="Cancel"
            />
            <Button
              label="Delete"
              icon="pi pi-check"
              class="p-button-danger ml-2"
              @click="bulkDeleteUsers"
              aria-label="Confirm Bulk Delete"
            />
          </div>
        </div>
      </Dialog>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { format } from 'date-fns' // For date formatting
import { db } from '@/firebase/init.js' // Named import
import { collection, getDocs, doc, deleteDoc, writeBatch } from 'firebase/firestore'
import Dropdown from 'primevue/dropdown' // Import Dropdown component
import { useToast } from 'primevue/usetoast'

// User data
const users = ref([])

// Filter object
const userFilters = ref({
  global: { value: null, matchMode: 'contains' },
  email: { value: null, matchMode: 'contains' },
  role: { value: null, matchMode: 'contains' },
  reason: { value: null, matchMode: 'contains' },
  isAustralian: { value: null, matchMode: 'equals' },
})

// Sort field and order
const sortField = ref(null)
const sortOrder = ref(null)

const toast = useToast()

// Selected users
const selectedUsers = ref([])
const selectedAdopters = ref([])

// Dialog states
const isDeleteDialogVisible = ref(false)
const isBulkDeleteDialogVisible = ref(false)

// User to delete
const userToDelete = ref({})

// Filter options
const isAustralianOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
]

// Fetch users from Firestore
const fetchUsers = async () => {
  try {
    const usersCollection = collection(db, 'users')
    const usersSnapshot = await getDocs(usersCollection)
    users.value = usersSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate() : null, // Convert Timestamp to Date
      }
    })
    console.log('Fetched Users:', users.value) // Debug log
  } catch (error) {
    console.error('Error fetching users:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to get user data.',
      life: 3000,
    })
  }
}

const formatDate = (rowData) => {
  if (!rowData.createdAt) return ''
  return format(rowData.createdAt, 'yyyy-MM-dd')
}

// Close delete dialog
const closeDeleteDialog = () => {
  isDeleteDialogVisible.value = false
  userToDelete.value = {}
}

// Confirm delete user
const confirmDeleteUser = (user) => {
  userToDelete.value = user
  isDeleteDialogVisible.value = true
}

// Delete user
const deleteUser = async () => {
  try {
    const userDocRef = doc(db, 'users', userToDelete.value.id)
    await deleteDoc(userDocRef)
    // Remove user from local data
    users.value = users.value.filter((u) => u.id !== userToDelete.value.id)
    closeDeleteDialog()
    // Optional: Show success message
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'The user has been deleted.',
      life: 3000,
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    // Optional: Show error message
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete the user.',
      life: 3000,
    })
  }
}

// Confirm bulk delete
const confirmBulkDelete = () => {
  isBulkDeleteDialogVisible.value = true
}

// Close bulk delete dialog
const closeBulkDeleteDialog = () => {
  isBulkDeleteDialogVisible.value = false
}

// Bulk delete users
const bulkDeleteUsers = async () => {
  if (selectedUsers.value.length === 0) return

  const batch = writeBatch(db)
  selectedUsers.value.forEach((user) => {
    const userDocRef = doc(db, 'users', user.id)
    batch.delete(userDocRef)
  })

  try {
    await batch.commit()
    // Remove deleted users from local data
    const deletedIds = selectedUsers.value.map((u) => u.id)
    users.value = users.value.filter((u) => !deletedIds.includes(u.id))
    selectedUsers.value = []
    closeBulkDeleteDialog()
    // Optional: Show success message
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'The selected users have been deleted.',
      life: 3000,
    })
  } catch (error) {
    console.error('Error deleting users:', error)
    // Optional: Show error message
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete users in bulk.',
      life: 3000,
    })
  }
}

onMounted(() => {
  fetchUsers()
})
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

.user-management {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.buttons .p-button {
  margin-right: 0.5rem;
}

.buttons .p-button:last-child {
  margin-right: 0;
}

/* Adjusting color contrast */
.p-button-danger {
  background-color: #dc3545;
  border-color: #dc3545;
  color: #fff;
}

.p-button-danger:hover,
.p-button-danger:focus {
  background-color: #c82333;
  border-color: #bd2130;
  color: #fff;
}
</style>

  
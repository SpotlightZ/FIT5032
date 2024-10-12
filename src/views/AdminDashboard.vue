<script>
import GenAI from '@/components/GenAI.vue'
import NumList from '@/components/NumList.vue'
import HighlightChart from '@/components/HighlightChart.vue'
import UserManagement from '@/components/UserManagement.vue'
import { ref, onMounted } from 'vue'
import { db, storage } from '../firebase/init.js'
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useToast } from 'primevue/usetoast'

export default {
  name: 'AdminDashboard',
  components: {
    GenAI,
    NumList,
    HighlightChart,
    UserManagement,
  },
  setup() {
    const usersCount = ref(0)
    const adoptersCount = ref(0)
    const applications = ref([])
    const usersOverview = ref([])
    const toast = useToast()

    // Format date function
    const formatDate = (rowData) => {
      if (rowData.createdAt && rowData.createdAt.toDate) {
        return rowData.createdAt.toDate().toLocaleString()
      }
      return ''
    }

    // Fetch applications function
    const fetchApplications = async () => {
      try {
        const applicationsSnapshot = await getDocs(collection(db, 'adoptionApplications'))
        applications.value = applicationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      } catch (error) {
        console.error('Error fetching applications:', error)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch adoption applications.',
          life: 3000,
        })
      }
    }

    // Approve application
    const approveApplication = async (id) => {
      try {
        const applicationRef = doc(db, 'adoptionApplications', id)
        await updateDoc(applicationRef, { status: 'Approved' })
        const appIndex = applications.value.findIndex((app) => app.id === id)
        if (appIndex !== -1) {
          applications.value[appIndex].status = 'Approved'
        }
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Application approved.',
          life: 3000,
        })
      } catch (error) {
        console.error('Error approving application:', error)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to approve application.',
          life: 3000,
        })
      }
    }

    // Reject application
    const rejectApplication = async (id) => {
      try {
        const applicationRef = doc(db, 'adoptionApplications', id)
        await updateDoc(applicationRef, { status: 'Rejected' })
        const appIndex = applications.value.findIndex((app) => app.id === id)
        if (appIndex !== -1) {
          applications.value[appIndex].status = 'Rejected'
        }
        toast.add({
          severity: 'warn',
          summary: 'Rejected',
          detail: 'Application rejected.',
          life: 3000,
        })
      } catch (error) {
        console.error('Error rejecting application:', error)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to reject application.',
          life: 3000,
        })
      }
    }

    // Chart data
    const usersChartData = ref({})
    const adoptersChartData = ref({})
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
      },
    }

    const renderCharts = () => {
      usersChartData.value = {
        labels: usersOverview.value.map((item) => item.category),
        datasets: [
          {
            data: usersOverview.value.map((item) => item.count),
            backgroundColor: ['#42A5F5', '#66BB6A'],
            hoverBackgroundColor: ['#64B5F6', '#81C784'],
          },
        ],
      }

      adoptersChartData.value = {
        labels: ['Adopters'],
        datasets: [
          {
            label: 'Number of Adopters',
            data: [adoptersCount.value],
            backgroundColor: ['#66BB6A'],
            hoverBackgroundColor: ['#81C784'],
          },
        ],
      }
    }

    // Staff management
    const staffs = ref([])
    const selectedStaffs = ref([])
    const addStaffDialogVisible = ref(false)
    const newStaff = ref({
      id: '',
      avatar: '',
      name: '',
      position: '',
      describe: '',
    })

    const editStaffDialogVisible = ref(false)
    const editStaff = ref({
      id: '',
      name: '',
      position: '',
      describe: '',
      avatar: '',
    })

    const deleteStaffDialogVisible = ref(false)
    const staffToDelete = ref({})
    // Filters for Staff DataTable
    const staffFilters = ref({
      id: { value: null, matchMode: 'contains' },
      name: { value: null, matchMode: 'contains' },
      position: { value: null, matchMode: 'contains' },
      describe: { value: null, matchMode: 'contains' },
    })

    // Fetch staffs from Firestore
    const fetchStaffs = async () => {
      try {
        const staffsCollection = collection(db, 'staff')
        const staffsSnapshot = await getDocs(staffsCollection)
        staffs.value = staffsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      } catch (error) {
        console.error('Error fetching staffs:', error)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to get Staff data.',
          life: 3000,
        })
      }
    }

    // Add new Staff
    const addStaff = async () => {
      // Form validation
      if (
        !newStaff.value.id ||
        !newStaff.value.avatar ||
        !newStaff.value.name ||
        !newStaff.value.position ||
        !newStaff.value.describe
      ) {
        toast.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please fill in all fields.',
          life: 3000,
        })
        return
      }

      try {
        const staffsCollection = collection(db, 'staff')
        await addDoc(staffsCollection, {
          id: newStaff.value.id,
          avatar: newStaff.value.avatar,
          name: newStaff.value.name,
          position: newStaff.value.position,
          describe: newStaff.value.describe,
          createdAt: serverTimestamp(),
        })
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Staff added successfully.',
          life: 3000,
        })
        addStaffDialogVisible.value = false
        newStaff.value = { id: '', avatar: '', name: '', position: '', describe: '' }
        fetchStaffs()
      } catch (error) {
        console.error('Error adding staff:', error)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add Staff.',
          life: 3000,
        })
      }
    }

    // Show Edit Staff Dialog
    const showEditStaffDialog = (staff) => {
      editStaff.value = { ...staff }
      editStaffDialogVisible.value = true
    }

    // Update Staff
    const updateStaff = async () => {
      if (
        !editStaff.value.id ||
        !editStaff.value.name ||
        !editStaff.value.position ||
        !editStaff.value.describe
      ) {
        toast.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please fill in all fields.',
          life: 3000,
        })
        return
      }

      try {
        const staffRef = doc(db, 'staff', editStaff.value.id)
        const staffDoc = await getDoc(staffRef)

        if (!staffDoc.exists()) {
          console.error('Error: Staff document does not exist.')
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'The Staff document does not exist.',
            life: 3000,
          })
          return
        }

        await updateDoc(staffRef, {
          avatar: editStaff.value.avatar,
          name: editStaff.value.name,
          position: editStaff.value.position,
          describe: editStaff.value.describe,
        })

        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Staff updated successfully.',
          life: 3000,
        })
        editStaffDialogVisible.value = false
        fetchStaffs()
      } catch (error) {
        console.error('Error updating staff:', error)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update Staff.',
          life: 3000,
        })
      }
    }

    // Confirm Delete Staff
    const confirmDeleteStaff = (staff) => {
      staffToDelete.value = staff
      deleteStaffDialogVisible.value = true
    }

    // Delete Staff
    const deleteStaff = async () => {
      try {
        const staffRef = doc(db, 'staff', staffToDelete.value.id)
        await deleteDoc(staffRef)
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Staff deleted successfully.',
          life: 3000,
        })
        deleteStaffDialogVisible.value = false
        fetchStaffs()
      } catch (error) {
        console.error('Error deleting staff:', error)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete Staff.',
          life: 3000,
        })
      }
    }

    // Staff filter
    const onStaffFilter = (event) => {
      staffFilters.value = event.filters
    }

    const onUpload = () => {
      toast.add({
        severity: 'info',
        summary: 'Success',
        detail: 'File Uploaded',
        life: 3000,
      })
    }

    const selectedFile = ref(null) // To store the selected file

    // When user selects a file
    const onFileSelect = (event) => {
      if (event.files && event.files.length > 0) {
        selectedFile.value = event.files[0]
      }
    }

    // Handle Staff Avatar Upload
    const handleStaffAvatarUpload = async () => {
      const file = selectedFile.value
      if (!file) {
        toast.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please select a file.',
          life: 3000,
        })
        return
      }

      const storageReference = storageRef(
        storage,
        `staffAvatars/${newStaff.value.id}_${Date.now()}_${file.name}`
      )

      try {
        await uploadBytes(storageReference, file)
        const downloadURL = await getDownloadURL(storageReference)

        newStaff.value.avatar = downloadURL
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'The avatar has been uploaded successfully.',
          life: 3000,
        })
      } catch (error) {
        console.error('Error uploading avatar:', error)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to upload the avatar.',
          life: 3000,
        })
      }
    }

    // Handle Edit Staff Avatar Upload
    const handleEditStaffAvatarUpload = async () => {
      const file = selectedFile.value
      if (!file) {
        toast.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please select a file.',
          life: 3000,
        })
        return
      }

      const storageReference = storageRef(
        storage,
        `staffAvatars/${editStaff.value.id}_${Date.now()}_${file.name}`
      )

      try {
        await uploadBytes(storageReference, file)
        const downloadURL = await getDownloadURL(storageReference)
        editStaff.value.avatar = downloadURL
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'The avatar has been uploaded successfully.',
          life: 3000,
        })
      } catch (error) {
        console.error('Error uploading avatar:', error)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to upload the avatar.',
          life: 3000,
        })
      }
    }

    // Show Add Staff Dialog
    const showAddStaffDialog = () => {
      addStaffDialogVisible.value = true
    }

    // Format date (optional)
    const formatStaffDate = (rowData) => {
      if (rowData.createdAt && rowData.createdAt.toDate) {
        return rowData.createdAt.toDate().toLocaleString()
      }
      return ''
    }

    onMounted(async () => {
      await fetchApplications()
      fetchStaffs()
      renderCharts()
    })

    return {
      usersCount,
      adoptersCount,
      applications,
      usersOverview,
      approveApplication,
      rejectApplication,
      usersChartData,
      adoptersChartData,
      chartOptions,
      formatDate,

      // Staff management
      staffs,
      selectedStaffs,
      addStaffDialogVisible,
      newStaff,
      showAddStaffDialog,
      addStaff,
      editStaffDialogVisible,
      editStaff,
      showEditStaffDialog,
      updateStaff,
      deleteStaffDialogVisible,
      staffToDelete,
      confirmDeleteStaff,
      deleteStaff,
      formatDate,
      onStaffFilter,
      staffFilters,

      // FileUpload
      handleStaffAvatarUpload,
      handleEditStaffAvatarUpload,
      onUpload,
      onFileSelect,
    }
  },
}
</script>

<template>
  <!-- Skip Navigation Link -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <div class="admin-dashboard">
    <h1>Admin Dashboard</h1>
    <!-- Main Content Area -->
    <main id="main-content">
      <div class="charts">
        <NumList />
        <HighlightChart />
      </div>
      <div class="data-tables">
        <Card title="Users Overview">
          <DataTable :value="usersOverview" aria-label="Users Overview Table">
            <Column field="category" header="Category"></Column>
            <Column field="count" header="Count"></Column>
          </DataTable>
        </Card>

        <UserManagement></UserManagement>
      </div>

      <!-- Staff Management Section -->
      <div class="staff-management">
        <div class="header">
          <h2>Staff Management</h2>
          <Button
            label="Add Staff"
            icon="pi pi-plus"
            class="p-button-success"
            @click="showAddStaffDialog"
            aria-label="Add Staff"
          />
        </div>

        <DataTable
          :value="staffs"
          paginator
          :rows="10"
          responsiveLayout="scroll"
          selectionMode="multiple"
          v-model:selection="selectedStaffs"
          sortMode="multiple"
          filterDisplay="menu"
          :filters="staffFilters"
          @filter="onStaffFilter"
          aria-label="Staff Data Table"
        >
          <Column selectionMode="multiple" headerStyle="width: 3em" :ariaLabel="'Select all'"></Column>
          <Column
            field="id"
            header="ID"
            sortable
            filter
            filterPlaceholder="Search ID"
            :ariaLabel="'ID'"
          ></Column>
          <Column field="avatar" header="Avatar" :ariaLabel="'Avatar'">
            <template #body="slotProps">
              <img
                :src="slotProps.data.avatar"
                :alt="`Avatar of ${slotProps.data.name}`"
                class="avatar-image"
              />
            </template>
          </Column>
          <Column
            field="name"
            header="Name"
            sortable
            filter
            filterPlaceholder="Search name"
            :ariaLabel="'Name'"
          ></Column>
          <Column
            field="position"
            header="Position"
            sortable
            filter
            filterPlaceholder="Search position"
            :ariaLabel="'Position'"
          ></Column>
          <Column
            field="describe"
            header="Description"
            sortable
            filter
            filterPlaceholder="Search description"
            :ariaLabel="'Description'"
          ></Column>
          <Column header="Operation" :style="{ width: '200px' }" :ariaLabel="'Operation'">
            <template #body="slotProps" class="buttons">
              <Button
                label=""
                icon="pi pi-pencil"
                class="p-button-rounded p-button-info p-mr-2 mr-1"
                @click="showEditStaffDialog(slotProps.data)"
                aria-label="Edit Staff {{ slotProps.data.name }}"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-danger"
                @click="confirmDeleteStaff(slotProps.data)"
                aria-label="Delete Staff {{ slotProps.data.name }}"
              />
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Add Staff Dialog -->
      <Dialog
        header="Add Staff"
        :visible.sync="addStaffDialogVisible"
        modal
        class="col-8"
        aria-modal="true"
        role="dialog"
      >
        <div class="p-fluid">
          <div class="p-field">
            <label for="staff-id" class="col-1">
              ID<span aria-hidden="true">*</span>
            </label>
            <InputText id="staff-id" v-model="newStaff.id" required aria-required="true" />
          </div>
          <div class="p-field">
            <label for="staff-avatar" class="col-1">
              Avatar<span aria-hidden="true">*</span>
            </label>
            <FileUpload
              ref="fileUploadRef"
              mode="basic"
              name="avatar"
              url="#"
              :customUpload="true"
              :auto="false"
              :maxFileSize="1000000"
              accept="image/*"
              @select="onFileSelect"
              aria-required="true"
            />
            <Button
              label="Upload Avatar"
              @click="handleStaffAvatarUpload"
              aria-label="Upload Avatar"
            />
          </div>
          <div class="p-field">
            <label for="staff-name" class="col-1">
              Name<span aria-hidden="true">*</span>
            </label>
            <InputText id="staff-name" v-model="newStaff.name" required aria-required="true" />
          </div>
          <div class="p-field">
            <label for="staff-position" class="col-1">
              Position<span aria-hidden="true">*</span>
            </label>
            <InputText
              id="staff-position"
              v-model="newStaff.position"
              required
              aria-required="true"
            />
          </div>
          <div class="p-field">
            <label for="staff-describe" class="col-1">
              Description<span aria-hidden="true">*</span>
            </label>
            <InputText
              id="staff-describe"
              class="col-10"
              v-model="newStaff.describe"
              required
              aria-required="true"
            />
          </div>
        </div>
        <template #footer>
          <Button
            label="Cancel"
            icon="pi pi-times"
            class="p-button-text"
            @click="addStaffDialogVisible = false"
            aria-label="Cancel"
          />
          <Button
            label="Save"
            icon="pi pi-check"
            class="p-button-text"
            @click="addStaff"
            aria-label="Save Staff"
          />
        </template>
      </Dialog>

      <!-- Edit Staff Dialog -->
      <Dialog
        header="Edit Staff"
        :visible.sync="editStaffDialogVisible"
        modal
        class="col-8"
        aria-modal="true"
        role="dialog"
      >
        <div class="p-fluid">
          <div class="p-field">
            <label for="edit-staff-id" class="col-1">ID</label>
            <InputText id="edit-staff-id" v-model="editStaff.id" disabled />
          </div>
          <div class="p-field">
            <label for="edit-staff-avatar" class="col-1">
              Avatar<span aria-hidden="true">*</span>
            </label>
            <FileUpload
              ref="fileUploadRef"
              mode="basic"
              name="avatar"
              url="#"
              :customUpload="true"
              :auto="false"
              :maxFileSize="1000000"
              accept="image/*"
              @select="onFileSelect"
              aria-required="true"
            />
            <Button
              label="Upload Avatar"
              @click="handleEditStaffAvatarUpload"
              aria-label="Upload Avatar"
            />
          </div>
          <div class="p-field">
            <label for="edit-staff-name" class="col-1">
              Name<span aria-hidden="true">*</span>
            </label>
            <InputText id="edit-staff-name" v-model="editStaff.name" required aria-required="true" />
          </div>
          <div class="p-field">
            <label for="edit-staff-position" class="col-1">
              Position<span aria-hidden="true">*</span>
            </label>
            <InputText
              id="edit-staff-position"
              v-model="editStaff.position"
              required
              aria-required="true"
            />
          </div>
          <div class="p-field">
            <label for="edit-staff-describe" class="col-1">
              Description<span aria-hidden="true">*</span>
            </label>
            <InputText
              id="edit-staff-describe"
              class="col-10"
              v-model="editStaff.describe"
              required
              aria-required="true"
            />
          </div>
        </div>
        <template #footer>
          <Button
            label="Cancel"
            icon="pi pi-times"
            class="p-button-text"
            @click="editStaffDialogVisible = false"
            aria-label="Cancel"
          />
          <Button
            label="Save"
            icon="pi pi-check"
            class="p-button-text"
            @click="updateStaff"
            aria-label="Save Changes"
          />
        </template>
      </Dialog>

      <!-- Confirm Delete Staff Dialog -->
      <Dialog
        header="Confirm Delete"
        :visible.sync="deleteStaffDialogVisible"
        modal
        aria-modal="true"
        role="alertdialog"
      >
        <p>
          Are you sure you want to delete <strong>{{ staffToDelete.name }}</strong>?
        </p>
        <template #footer>
          <Button
            label="Cancel"
            icon="pi pi-times"
            class="p-button-text"
            @click="deleteStaffDialogVisible = false"
            aria-label="Cancel"
          />
          <Button
            label="Delete"
            icon="pi pi-trash"
            class="p-button-text p-button-danger"
            @click="deleteStaff"
            aria-label="Confirm Delete"
          />
        </template>
      </Dialog>

      <Toast />
    </main>
  </div>
</template>

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

/* Main Styles */
.admin-dashboard {
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.charts {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-bottom: 30px;
}

.charts .p-card {
  flex: 1 1 300px;
}

.data-tables {
  margin-top: 20px;
}

.data-tables .p-card {
  margin-bottom: 30px;
}

.user-management,
.staff-management {
  margin-top: 40px;
}

.user-management .header,
.staff-management .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.user-management h2,
.staff-management h2 {
  margin: 0;
}

.avatar-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

table {
  width: 100%;
}

.p-field {
  margin-bottom: 1rem;
}

.buttons {
  display: flex;
  gap: 0.5rem;
}

.error {
  color: red;
  text-align: center;
  margin-top: 10px;
}

/* Adjusting color contrast */
.p-button-success {
  background-color: #28a745;
  border-color: #28a745;
  color: #fff;
}

.p-button-success:hover,
.p-button-success:focus {
  background-color: #218838;
  border-color: #1e7e34;
  color: #fff;
}

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

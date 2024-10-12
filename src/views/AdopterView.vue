<template>
  <!-- Skip Navigation Link -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <div class="container">
    <h1 class="mb-5">Adopters & Pets</h1>

    <!-- Main Content Area -->
    <main id="main-content">
      <!-- Adopters Management Table -->
      <h2>Adopters Management</h2>
      <div class="datatable-filter">
        <DataTable
          :value="adopters"
          paginator
          :rows="10"
          :filters="adopterFilters"
          dataKey="id"
          :globalFilterFields="['firstname', 'lastname', 'email']"
          :filterDisplay="'menu'"
          :sortField="sortField"
          :sortOrder="sortOrder"
          selection-mode="multiple"
          v-model:selection="selectedAdopters"
          aria-label="Adopters Data Table"
        >
          <template #header>
            <div class="flex justify-between">
              <div class="flex">
                <span class="p-input-icon-left">
                  <InputText
                    v-model="adopterFilters['global'].value"
                    placeholder="Keyword Search"
                    class="w-full"
                    aria-label="Global Keyword Search"
                  />
                </span>
              </div>
            </div>
          </template>
          <template #empty>
            <p>No adopter found.</p>
          </template>
          <Column
            selectionMode="multiple"
            headerStyle="width: 3em"
            headerCheckbox
            :ariaLabel="'Select all'"
          ></Column>
          <Column
            field="firstname"
            header="First Name"
            sortable
            filter
            filterPlaceholder="Search by first name"
            :ariaLabel="'First Name'"
          >
            <template #filter>
              <InputText
                v-model="adopterFilters['firstname'].value"
                placeholder="Search by first name"
                aria-label="Filter by first name"
              />
            </template>
          </Column>
          <Column
            field="lastname"
            header="Last Name"
            sortable
            filter
            filterPlaceholder="Search by last name"
            :ariaLabel="'Last Name'"
          >
            <template #filter>
              <InputText
                v-model="adopterFilters['lastname'].value"
                placeholder="Search by last name"
                aria-label="Filter by last name"
              />
            </template>
          </Column>
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
                v-model="adopterFilters['email'].value"
                placeholder="Search by email"
                aria-label="Filter by email"
              />
            </template>
          </Column>
          <Column
            field="gender"
            header="Gender"
            sortable
            filter
            filterPlaceholder="Search by gender"
            :ariaLabel="'Gender'"
          >
            <template #filter>
              <InputText
                v-model="adopterFilters['gender'].value"
                placeholder="Search by gender"
                aria-label="Filter by gender"
              />
            </template>
          </Column>
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
              ></i>
              <i
                v-else
                class="pi pi-times"
                style="color: red; font-size: 1.5em;"
                aria-label="No"
              ></i>
            </template>
            <template #filter>
              <Dropdown
                :options="isAustralianOptions"
                v-model="adopterFilters['isAustralian'].value"
                placeholder="Select"
                optionLabel="label"
                optionValue="value"
                showClear
                aria-label="Filter by Australian Resident Status"
              />
            </template>
          </Column>
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
                v-model="adopterFilters['reason'].value"
                placeholder="Search by reason"
                aria-label="Filter by reason"
              />
            </template>
          </Column>
          <Column
            field="suburb"
            header="Suburb"
            sortable
            filter
            filterPlaceholder="Search by suburb"
            :ariaLabel="'Suburb'"
          >
            <template #filter>
              <InputText
                v-model="adopterFilters['suburb'].value"
                placeholder="Search by suburb"
                aria-label="Filter by suburb"
              />
            </template>
          </Column>
          <Column header="Actions" :ariaLabel="'Actions'">
            <template #body="slotProps">
              <Button
                label=""
                icon="pi pi-envelope"
                @click="openEmailSender(slotProps.data)"
                aria-label="Send Email to {{ slotProps.data.firstname }} {{ slotProps.data.lastname }}"
              />
            </template>
          </Column>
        </DataTable>
      </div>
      <Button
        label="Send Bulk Email"
        icon="pi pi-send"
        @click="openBulkEmailSender"
        :disabled="!selectedAdopters.length"
        aria-label="Send Bulk Email"
      />

      <!-- Email Sender Component -->
      <Dialog
        header="Send Email"
        v-model:visible="isDialog"
        :modal="true"
        :closable="false"
        style="width: 80vw"
        aria-modal="true"
        role="dialog"
      >
        <EmailSender :adopters="selectedAdopter" @close="closeEmailSender" />
      </Dialog>
      <!-- Bulk Email Dialog -->
      <Dialog
        header="Send Bulk Email"
        v-model:visible="bulkEmailDialogVisible"
        :modal="true"
        :closable="false"
        style="width: 80vw"
        aria-modal="true"
        role="dialog"
      >
        <EmailSender
          :adopters="selectedAdopters"
          @close="closeBulkEmailSender"
          isBulk
        />
      </Dialog>

      <!-- Export Buttons -->
      <div class="text-center">
        <button
          type="button"
          class="btn btn-success me-2"
          @click="exportUserData('excel')"
          aria-label="Export All to Excel"
        >
          Export All to Excel
        </button>
        <button
          type="button"
          class="btn btn-success me-2"
          @click="exportUserData('csv')"
          aria-label="Export All to CSV"
        >
          Export All to CSV
        </button>
        <button
          type="button"
          class="btn btn-success me-2"
          @click="exportUserData('pdf')"
          aria-label="Export All to PDF"
        >
          Export All to PDF
        </button>
      </div>

      <PetsManagement></PetsManagement>
    </main>
  </div>
</template>

<script>
import EmailSender from '@/components/EmailSender.vue'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { saveAs } from 'file-saver'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/init.js'
import { getFunctions, httpsCallable } from 'firebase/functions'
import axios from 'axios'
import PetsManagement from '@/components/PetsManagement.vue'

export default {
  components: {
    EmailSender,
    PetsManagement,
  },
  data() {
    return {
      adopters: [],
      selectedAdopters: [],
      selectedAdopter: [], // Selected adopter for email
      // Filters
      adopterFilters: {
        global: { value: null, matchMode: 'contains' },
        id: { value: null, matchMode: 'contains' },
        firstname: { value: null, matchMode: 'contains' },
        lastname: { value: null, matchMode: 'contains' },
        email: { value: null, matchMode: 'contains' },
        gender: { value: null, matchMode: 'contains' },
        isAustralian: { value: null, matchMode: 'equals' },
        reason: { value: null, matchMode: 'contains' },
        suburb: { value: null, matchMode: 'contains' },
        user: { value: null, matchMode: 'contains' },
      },
      sortField: 'firstname', // Default sorting field
      sortOrder: 1, // 1 for ascending order, -1 for descending
      isDialog: false,
      bulkEmailDialogVisible: false,
      isAustralianOptions: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
      functions: null, // Firebase Functions instance
      functionURL: import.meta.env.VITE_FUNCTION_URL,
    }
  },
  methods: {
    openEmailSender(adopter) {
      this.selectedAdopter = [adopter]
      this.isDialog = true
    },
    closeEmailSender() {
      this.selectedAdopter = []
      this.isDialog = false
    },
    openBulkEmailSender() {
      this.bulkEmailDialogVisible = true
    },
    closeBulkEmailSender() {
      this.bulkEmailDialogVisible = false
    },
    // Export functions
    async exportUserData(format) {
      switch (format) {
        case 'excel':
          this.exportAsExcel(this.adopters)
          break
        case 'csv':
          this.exportAsCSV(this.adopters)
          break
        case 'pdf':
          this.exportAsPDF(this.adopters)
          break
        default:
          alert('Unsupported export format.')
      }
    },
    async fetchFormData() {
      try {
        const response = await axios.get(`${this.functionURL}/getFormData`)
        this.adopters = response.data
      } catch (error) {
        console.error('Error fetching data: ', error)
      }
    },
    // Export as Excel
    exportAsExcel(userData) {
      const worksheet = XLSX.utils.json_to_sheet(userData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Form Data')
      const wbout = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })
      saveAs(
        new Blob([wbout], { type: 'application/octet-stream' }),
        'form_data.xlsx'
      )
    },
    // Export as CSV
    exportAsCSV(userData) {
      const worksheet = XLSX.utils.json_to_sheet(userData)
      const csv = XLSX.utils.sheet_to_csv(worksheet)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      saveAs(blob, 'form_data.csv')
    },
    // Export as PDF
    exportAsPDF(userData) {
      if (userData && userData.length > 0) {
        const doc = new jsPDF()
        const data = userData.map((item) => [
          item.firstname,
          item.lastname,
          item.id,
          item.email,
          item.gender,
          item.isAustralian ? 'Yes' : 'No',
          item.reason,
          item.suburb,
        ])

        doc.setFontSize(16)
        doc.text('Form Data', 14, 22)
        autoTable(doc, {
          startY: 30,
          body: data,
          head: [
            [
              'First Name',
              'Last Name',
              'ID',
              'Email',
              'Gender',
              'Australian Resident',
              'Reason',
              'Suburb',
            ],
          ],
        })
        doc.save('form_data.pdf')
      } else {
        alert('No data available for PDF export.')
      }
    },
    // Fetch adopters from Firestore
    async fetchAdopters() {
      try {
        const adoptersCollection = collection(db, 'formSubmissions')
        const adoptersSnapshot = await getDocs(adoptersCollection)
        this.adopters = adoptersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      } catch (error) {
        console.error('Error fetching adopters:', error)
      }
    },
  },
  mounted() {
    // Initialize Firebase Functions
    this.functions = getFunctions()
    this.fetchFormData()
    // Fetch adopters
    this.fetchAdopters()
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

.global-search {
  margin-bottom: 20px;
}

.datatable-filter {
  margin-bottom: 30px;
}

.p-datatable {
  font-size: 14px; /* Adjusted font size for better readability */
}

.p-datatable thead th {
  font-size: 14px;
}

.p-datatable tbody td {
  font-size: 14px;
}

/* Button font sizes */
.p-button {
  font-size: 14px;
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
</style>

<template>
    <div class="container">
      <h1>Adopters & Pets</h1>
  
      <!-- Adopters Management Table -->
      <h2>Adopters Management</h2>
      <div class="datatable-filter">
        <DataTable 
          :value="formSubmissions" 
          paginator 
          :rows="10" 
          :filters="formSubmissionFilters" 
          dataKey="id"
          :globalFilterFields="['firstname', 'lastname', 'email']" 
          :filterDisplay="'row'"
          :sortField="sortField" 
          :sortOrder="sortOrder"
          selection-mode="multiple"
          v-model:selection="selectedFormSubmissions"
        >
          <template #header>
            <div class="flex justify-end">
              <IconField>
                <InputText v-model="formSubmissionFilters['global'].value" placeholder="Keyword Search" />
              </IconField>
            </div>
          </template>
          <template #empty> No adopter found. </template>
          <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
          <Column field="firstname" header="First Name" sortable filter filterPlaceholder="Search by first name">
            <template #filter>
              <InputText v-model="formSubmissionFilters['firstname'].value" placeholder="Search by first name" />
            </template>
          </Column>
          <Column field="lastname" header="Last Name" sortable filter filterPlaceholder="Search by last name">
            <template #filter>
              <InputText v-model="formSubmissionFilters['lastname'].value" placeholder="Search by last name" />
            </template>
          </Column>
          <Column field="email" header="Email" sortable filter filterPlaceholder="Search by email">
            <template #filter>
              <InputText v-model="formSubmissionFilters['email'].value" placeholder="Search by email" />
            </template>
          </Column>
          <Column field="gender" header="Gender" sortable filter filterPlaceholder="Search by gender">
            <template #filter>
              <InputText v-model="formSubmissionFilters['gender'].value" placeholder="Search by gender" />
            </template>
          </Column>
          <Column field="isAustralian" header="Is Australian" sortable filter filterPlaceholder="Search by Australian status">
            <template #body="slotProps">
              <i
                v-if="slotProps.data.isAustralian"
                class="pi pi-check icon-yes"
                aria-label="Yes"
              ></i>
              <i
                v-else
                class="pi pi-times icon-no"
                aria-label="No"
              ></i>
            </template>
            <template #filter>
              <Dropdown
                :options="isAustralianOptions"
                v-model="formSubmissionFilters['isAustralian'].value"
                placeholder="Select"
                optionLabel="label"
                optionValue="value"
                showClear
              />
            </template>
          </Column>
          <Column field="reason" header="Reason" sortable filter filterPlaceholder="Search by reason">
            <template #filter>
              <InputText v-model="formSubmissionFilters['reason'].value" placeholder="Search by reason" />
            </template>
          </Column>
          <Column field="suburb" header="Suburb" sortable filter filterPlaceholder="Search by suburb">
            <template #filter>
              <InputText v-model="formSubmissionFilters['suburb'].value" placeholder="Search by suburb" />
            </template>
          </Column>
          <Column header="Actions">
            <template #body="slotProps">
              <Button label="Send Email" icon="pi pi-envelope" @click="openEmailSender(slotProps.data)" />
            </template>
          </Column>
        </DataTable>
      </div>
  
      <Button label="Send Bulk Email" icon="pi pi-send" @click="openBulkEmailSender" :disabled="!selectedFormSubmissions.length" />
  
      <!-- Email Sender Component -->
      <Dialog header="Send Email" v-model:visible="isDialog" :modal="true" :closable="false" style="width: 80vw">
        <EmailSender :adopters="selectedAdopter" @close="closeEmailSender" />
      </Dialog>
      <!-- Bulk Email Dialog -->
      <Dialog header="Send Bulk Email" v-model:visible="bulkEmailDialogVisible" :modal="true" :closable="false" style="width: 80vw">
        <EmailSender :adopters="selectedFormSubmissions" @close="closeBulkEmailSender" isBulk />
      </Dialog>
  
       <!-- Export Buttons -->
      <div class="text-center">
        <!-- 其他按钮 -->
        <button type="button" class="btn btn-success me-2" @click="exportUserData('excel')">Export All to Excel</button>
        <button type="button" class="btn btn-success me-2" @click="exportUserData('csv')">Export All to CSV</button>
        <button type="button" class="btn btn-success me-2" @click="exportUserData('pdf')">Export All to PDF</button>
      </div>
    </div>
  </template>
  
  <script>
  import EmailSender from '@/components/EmailSender.vue'
  
  import * as XLSX from 'xlsx'
  import jsPDF from 'jspdf'
  import autoTable from 'jspdf-autotable'
  import { saveAs } from 'file-saver'
  
  import { db } from '@/firebase/init.js' // 确保已正确导入 Firestore 实例
  import { collection, getDocs } from 'firebase/firestore'
  import Dropdown from 'primevue/dropdown'
  import Button from 'primevue/button'
  import DataTable from 'primevue/datatable'
  import Column from 'primevue/column'
  import Dialog from 'primevue/dialog'
  import InputText from 'primevue/inputtext'
  
  import { ref, onMounted } from 'vue'
  
  export default {
    components: {
      EmailSender,
      Dropdown,
      Button,
      DataTable,
      Column,
      Dialog,
      InputText,
    },
    data() {
      return {
        // Form Submissions data
        formSubmissions: [],
        // Selected form submissions
        selectedFormSubmissions: [],
        selectedAdopter: [], // Selected adopter for email
        // Filters
        formSubmissionFilters: {
          global: { value: null, matchMode: 'contains' },
          firstname: { value: null, matchMode: 'contains' },
          lastname: { value: null, matchMode: 'contains' },
          email: { value: null, matchMode: 'contains' },
          gender: { value: null, matchMode: 'contains' },
          isAustralian: { value: null, matchMode: 'equals' },
          reason: { value: null, matchMode: 'contains' },
          suburb: { value: null, matchMode: 'contains' },
        },
        sortField: 'firstname', // Default sorting field
        sortOrder: 1, // 1 for ascending order, -1 for descending
        isDialog: false,
        bulkEmailDialogVisible: false,
        isAustralianOptions: [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ],
      };
    },
    methods: {
      // 打开单个发送邮件对话框
      openEmailSender(formSubmission) {
        this.selectedAdopter = [formSubmission]
        this.isDialog = true;
      },
      // 关闭单个发送邮件对话框
      closeEmailSender() {
        this.selectedAdopter = [];
        this.isDialog = false;
      },
      // 打开批量发送邮件对话框
      openBulkEmailSender() {
        this.bulkEmailDialogVisible = true;
      },
      // 关闭批量发送邮件对话框
      closeBulkEmailSender() {
        this.bulkEmailDialogVisible = false;
      },
  
      // 通用导出函数
      async exportUserData(format) {
        switch (format) {
              case 'excel':
                this.exportAsExcel(this.formSubmissions);
                break;
              case 'csv':
                this.exportAsCSV(this.formSubmissions);
                break;
              case 'pdf':
                this.exportAsPDF(this.formSubmissions);
                break;
              default:
                alert('Unsupported export format.');
            }
      
      },
  
      // 导出为 Excel
      exportAsExcel(userData) {
        const worksheet = XLSX.utils.json_to_sheet(userData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Form Submissions');
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'form_submissions.xlsx');
      },
  
      // 导出为 CSV
      exportAsCSV(userData) {
        const worksheet = XLSX.utils.json_to_sheet(userData);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'form_submissions.csv');
      },
  
      // 导出为 PDF
      exportAsPDF(userData) {
        if (userData && userData.length > 0) {
          const doc = new jsPDF();
          const data = userData.map(item => [
            item.id,
            item.firstname,
            item.lastname,
            item.email,
            item.gender,
            item.isAustralian ? 'Yes' : 'No',
            item.reason,
            item.suburb,
          ]);
        
          doc.setFontSize(16);
          doc.text('Form Submissions', 14, 22);
          autoTable(doc, {
            startY: 30,
            head: [['ID', 'First Name', 'Last Name', 'Email', 'Gender', 'Is Australian', 'Reason', 'Suburb']],
            body: data,
          });
          doc.save('form_submissions.pdf');
        } else {
          alert('No data available for PDF export.');
        }
      },
  
      // 从 Firestore 获取 formSubmissions 数据
      async fetchFormSubmissions() {
        try {
          const formSubmissionsCollection = collection(db, 'formSubmissions');
          const formSubmissionsSnapshot = await getDocs(formSubmissionsCollection);
          this.formSubmissions = formSubmissionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log('Fetched Form Submissions:', this.formSubmissions); // 调试日志
        } catch (error) {
          console.error('Error fetching form submissions:', error);
          alert('Failed to fetch form submissions.');
        }
      },
    },
    mounted() {
      this.fetchFormSubmissions();
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
  .icon-yes {
    color: green;
    font-size: 1.5em;
  }
  .icon-no {
    color: red;
    font-size: 1.5em;
  }
  </style>
  
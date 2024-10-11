<template>
  <div class="container">
    <h1 class="mb-5">Adopters & Pets</h1>

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
      >
        <template #header>
          <div class="flex justify-between">
            <div class="flex">
              <span class="p-input-icon-left">
                <InputText
                  v-model="adopterFilters['global'].value"
                  placeholder="Keyword Search"
                  class="w-full"
                />
              </span>
            </div>
          </div>
        </template>
        <template #empty> No adopter found. </template>
        <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
        <Column field="firstname" header="First Name" sortable filter filterPlaceholder="Search by first name">
          <template #filter>
            <InputText v-model="adopterFilters['firstname'].value" placeholder="Search by first name" />
          </template>
        </Column>
        <Column field="lastname" header="Last Name" sortable filter filterPlaceholder="Search by last name">
          <template #filter>
            <InputText v-model="adopterFilters['lastname'].value" placeholder="Search by last name" />
          </template>
        </Column>
        <Column field="email" header="Email" sortable filter filterPlaceholder="Search by email">
          <template #filter>
            <InputText v-model="adopterFilters['email'].value" placeholder="Search by email" />
          </template>
        </Column>
        <Column field="gender" header="Gender" sortable filter filterPlaceholder="Search by gender">
          <template #filter>
            <InputText v-model="adopterFilters['gender'].value" placeholder="Search by gender" />
          </template>
        </Column>
        <Column field="isAustralian" header="Is Australian" sortable filter filterPlaceholder="Search by Australian status">
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
            />
          </template>
        </Column>
        <Column field="reason" header="Reason" sortable filter filterPlaceholder="Search by reason">
          <template #filter>
            <InputText v-model="adopterFilters['reason'].value" placeholder="Search by reason" />
          </template>
        </Column>
        <Column field="suburb" header="Suburb" sortable filter filterPlaceholder="Search by suburb">
          <template #filter>
            <InputText v-model="adopterFilters['suburb'].value" placeholder="Search by suburb" />
          </template>
        </Column>
        <!-- <Column field="status" header="Status" sortable filter filterPlaceholder="Search by status">
          <template #filter>
            <InputText v-model="adopterFilters['status'].value" placeholder="Search by status" />
          </template>
        </Column> -->
        <Column header="Actions">
          <template #body="slotProps">
            <Button label="" icon="pi pi-envelope" @click="openEmailSender(slotProps.data)" />
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

     <!-- Export Buttons -->
    <div class="text-center">
      <!-- 其他按钮 -->
      <button type="button" class="btn btn-success me-2" @click="exportUserData('excel')">Export All to Excel</button>
      <button type="button" class="btn btn-success me-2" @click="exportUserData('csv')">Export All to CSV</button>
      <button type="button" class="btn btn-success me-2" @click="exportUserData('pdf')">Export All to PDF</button>
    </div>

    <PetsManagement></PetsManagement>
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
  import axios from 'axios';
  import PetsManagement from '@/components/PetsManagement.vue';
  
  export default {
    components: {
      EmailSender,
      PetsManagement,
    },
    data() {
      return {
        // Adopters data
        // adopters: [
        //   { id: 1, name: 'Patrick Lulham', email: 'plulham0@sphinn.com' },
        //   { id: 2, name: 'Niven Weymont', email: 'nweymont1@columbia.edu' },
        //   { id: 3, name: 'Aluino Warratt', email: 'awarratt2@lulu.com' },
        //   { id: 4, name: 'Kathy Spandley', email: 'kspandley3@ameblo.jp' },
        //   { id: 5, name: 'Maurie Christal', email: 'mchristal4@miitbeian.gov.cn' },
        //   { id: 6, name: 'Luce Eastgate', email: 'leastgate5@dropbox.com' },
        //   { id: 7, name: 'Brandtr Twydell', email: 'btwydell6@blinklist.com' },
        //   { id: 8, name: 'Ddene Allibon', email: 'dallibon7@google.ru' },
        //   { id: 9, name: 'Harlan Heffernon', email: 'hheffernon8@opera.com' },
        //   { id: 10, name: 'Zelig Cotterrill', email: 'zcotterrill9@sphinn.com' },
        //   { id: 11, name: 'Alanna Whacket', email: 'awhacketa@cnet.com' },
        //   { id: 12, name: 'Brooke Crinidge', email: 'bcrinidgeb@amazonaws.com' },
        //   { id: 13, name: 'Benetta Casol', email: 'bcasolc@icq.com' },
        //   { id: 14, name: 'Mellie Male', email: 'mmaled@rakuten.co.jp' },
        //   { id: 15, name: 'Sterne Yokelman', email: 'syokelmane@eepurl.com' },
        //   { id: 16, name: 'Alleyn Coutts', email: 'acouttsf@cyberchimps.com' },
        //   { id: 17, name: 'Dante Quixley', email: 'dquixleyg@prlog.org' },
        //   { id: 18, name: 'Tish Burrus', email: 'tburrush@nationalgeographic.com' },
        //   { id: 19, name: 'Esma Rosedale', email: 'erosedalei@huffingtonpost.com' },
        //   { id: 20, name: 'Celestine Natalie', email: 'cnataliej@aol.com' },
        //   { id: 21, name: 'Verile Yedall', email: 'vyedallk@yelp.com' },
        //   { id: 22, name: 'Ashlan Dei', email: 'adeil@army.mil' },
        //   { id: 23, name: 'Channa Crunkhurn', email: 'ccrunkhurnm@dropbox.com' },
        //   { id: 24, name: 'Carrie Duffree', email: 'cduffreen@tumblr.com' },
        //   { id: 25, name: 'Tabbie Purdie', email: 'tpurdieo@constantcontact.com' },
        //   { id: 26, name: 'Obed Stothart', email: 'ostothartp@dropbox.com' },
        //   { id: 27, name: 'Sherry Hollow', email: 'shollowq@pen.io' },
        //   { id: 28, name: 'Carolee Tabert', email: 'ctabertr@businessinsider.com' },
        //   { id: 29, name: 'Cly Blazhevich', email: 'cblazhevichs@unicef.org' },
        //   { id: 30, name: 'Marcille Alvarado', email: 'malvaradot@sakura.ne.jp' },
        //   { id: 31, name: 'Roddy Broune', email: 'rbrouneu@blogs.com' }
        // ],
        // Donors data
        donors: [
          { id: 1, name: 'Forest Cleatherow', email: 'fcleatherow0@comcast.net', amount: 7596 },
          { id: 2, name: 'Cybil Polino', email: 'cpolino1@comcast.net', amount: 7981 },
          { id: 3, name: 'Stirling Cowser', email: 'scowser2@about.me', amount: 9230 },
          { id: 4, name: 'Mandie Capener', email: 'mcapener3@ucla.edu', amount: 7761 },
          { id: 5, name: 'Tiffie Phlipon', email: 'tphlipon4@wordpress.org', amount: 1809 },
          { id: 6, name: 'Mechelle Burchell', email: 'mburchell5@house.gov', amount: 7291 },
          { id: 7, name: 'Isobel Jedraszek', email: 'ijedraszek6@webmd.com', amount: 5793 },
          { id: 8, name: 'Jacenta Kop', email: 'jkop7@foxnews.com', amount: 283 },
          { id: 9, name: 'Katuscha Allatt', email: 'kallatt8@artisteer.com', amount: 7353 },
          { id: 10, name: 'Tresa Stowell', email: 'tstowell9@studiopress.com', amount: 1470 },
          { id: 11, name: 'Wendy Paulazzi', email: 'wpaulazzia@mediafire.com', amount: 6115 },
          { id: 12, name: 'Francine Qualtro', email: 'fqualtrob@de.vu', amount: 6576 },
          { id: 13, name: 'Emanuel Helling', email: 'ehellingc@yolasite.com', amount: 1212 },
          { id: 14, name: 'Bail Hum', email: 'bhumd@mediafire.com', amount: 6380 },
          { id: 15, name: 'Harv Rew', email: 'hrewe@ucoz.com', amount: 8867 },
          { id: 16, name: 'Zachary Biasioli', email: 'zbiasiolif@nhs.uk', amount: 2375 },
          { id: 17, name: 'Quint Ferrierio', email: 'qferrieriog@blogspot.com', amount: 3691 },
          { id: 18, name: 'Doroteya Yurtsev', email: 'dyurtsevh@alibaba.com', amount: 2796 },
          { id: 19, name: 'Klement Darrigrand', email: 'kdarrigrandi@alexa.com', amount: 7464 },
          { id: 20, name: 'Whitby Grayling', email: 'wgraylingj@macromedia.com', amount: 2692 },
          { id: 21, name: 'Dore Dowthwaite', email: 'ddowthwaitek@mtv.com', amount: 8287 },
          { id: 22, name: 'Tremain Faulkner', email: 'tfaulknerl@canalblog.com', amount: 2207 },
          { id: 23, name: 'Gardener Titheridge', email: 'gtitheridgem@time.com', amount: 8040 },
          { id: 24, name: 'Rutter Linebarger', email: 'rlinebargern@skype.com', amount: 1460 },
          { id: 25, name: 'Viole Thomsen', email: 'vthomseno@vimeo.com', amount: 2065 },
          { id: 26, name: 'Timmy Hanfrey', email: 'thanfreyp@narod.ru', amount: 1455 },
          { id: 27, name: 'Storm Marsham', email: 'smarshamq@microsoft.com', amount: 4705 },
          { id: 28, name: 'Aldous Rigolle', email: 'arigoller@wix.com', amount: 9413 },
          { id: 29, name: 'Alan McReynold', email: 'amcreynolds@livejournal.com', amount: 2045 },
          { id: 30, name: 'Katey Findley', email: 'kfindleyt@indiatimes.com', amount: 3686 },
          { id: 31, name: 'Brinn Thornton', email: 'bthorntonu@imageshack.us', amount: 1649 },
          { id: 32, name: 'Ariella Malkinson', email: 'amalkinsonv@netvibes.com', amount: 3150 },
          { id: 33, name: 'Monro McMenemy', email: 'mmcmenemyw@livejournal.com', amount: 8027 },
          { id: 34, name: 'Wake Mc Coughan', email: 'wmcx@gravatar.com', amount: 8350 },
          { id: 35, name: 'Isabella Fazakerley', email: 'ifazakerleyy@infoseek.co.jp', amount: 7110 },
          { id: 36, name: 'Lorene Cossor', email: 'lcossorz@hud.gov', amount: 8825 },
          { id: 37, name: 'Eula Tumilson', email: 'etumilson10@yellowbook.com', amount: 4744 },
          { id: 38, name: 'Malvin Anthes', email: 'manthes11@phpbb.com', amount: 5497 },
          { id: 39, name: 'Charo Pues', email: 'cpues12@github.com', amount: 461 },
          { id: 40, name: 'Homere Kwietak', email: 'hkwietak13@nymag.com', amount: 5237 },
          { id: 41, name: 'Matty Kinnon', email: 'mkinnon14@archive.org', amount: 8789 }
        ],
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
          user: { value: null, matchMode: 'contains' }
        },
        donorFilters: {
          global: { value: null, matchMode: 'contains' },
          name: { value: null, matchMode: 'contains' },
          email: { value: null, matchMode: 'contains' },
          amount: { value: null, matchMode: 'equals' },
        },
        sortField: 'firstname', // Default sorting field
        sortOrder: 1, // 1 for ascending order, -1 for descending
        isDialog: false,
        bulkEmailDialogVisible: false,
        addAdopterDialogVisible: false, // 新增对话框状态
        isAustralianOptions: [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ],
        functions: null, // Firebase Functions 实例
        functionURL: import.meta.env.VITE_FUNCTION_URL,
      };
    },
    methods: {
      openEmailSender(adopter) {
        this.selectedAdopter.push(adopter)
        console.log( this.selectedAdopter,'= this.selectedAdopter');
        
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


      // 通用导出函数
      async exportUserData(format) {
        switch (format) {
              case 'excel':
                this.exportAsExcel(this.adopters);
                break;
              case 'csv':
                this.exportAsCSV(this.adopters);
                break;
              case 'pdf':
                this.exportAsPDF(this.adopters);
                break;
              default:
                alert('Unsupported export format.');
            }
        // const email = formData.value.user;
        // if (!email) {
        //   alert('Please log in first.');
        //   return;
        // }
      
        // const userExists = await checkUserExists(email);
      
        // if (userExists) {
        //   const userData = await fetchUserData(email);
        
        //   if (userData) {
        //     switch (format) {
        //       case 'excel':
        //         this.exportAsExcel(userData);
        //         break;
        //       case 'csv':
        //         this.exportAsCSV(userData);
        //         break;
        //       case 'pdf':
        //         this.exportAsPDF(userData);
        //         break;
        //       default:
        //         alert('Unsupported export format.');
        //     }
        //   } else {
        //     alert('Error fetching user data.');
        //   }
        // } else {
        //   alert('Please complete the adoption application form first.');
        // }
      },


      async fetchFormData() {
        try {
          // const functionURL = import.meta.env.VITE_FUNCTION_URL;
          const response = await axios.get(`${this.functionURL}/getFormData`);
          this.adopters.createdAt = this.adopters.createdAt? response.data.createdAt.toDate() : null;
          this.adopters = response.data;
        } catch (error) {
          console.error('Error fetching data: ', error);
        }
      },

      // 导出为 Excel
      exportAsExcel(userData) {
        const worksheet = XLSX.utils.json_to_sheet(userData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Form Data');
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'form_data.xlsx');
      },

      // 导出为 CSV
      exportAsCSV(userData) {
        const worksheet = XLSX.utils.json_to_sheet(userData);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'form_data.csv');
      },

      // 导出为 PDF
      exportAsPDF(userData) {
        if (userData && userData.length > 0) {
          const doc = new jsPDF();
          const data = userData.map(item => [
            item.firstname,
            item.lastname,
            item.id,
            item.email,
            item.gender,
            item.isAustralian ? 'Yes' : 'No',
            item.reason,
            item.suburb
          ]);
        
          doc.setFontSize(16);
          doc.text('Form Data', 14, 22);
          autoTable(doc, {
            startY: 30,
            body: data,
            head: [['ID', 'First Name', 'Last Name', 'Email', 'Gender', 'Australian Resident', 'Reason', 'Suburb']],
          });
          doc.save('form_data.pdf');
        } else {
          alert('No data available for PDF export.');
        }
      },




      // 新增部分
      // 打开添加收养者对话框
      openAddAdopterDialog() {
        this.addAdopterDialogVisible = true;
      },
      // 关闭添加收养者对话框
      closeAddAdopterDialog() {
        this.addAdopterDialogVisible = false;
      },
      // 调用 Firebase Function 添加收养者
      async addAdopter(newAdopter) {
        try {
          const addAdopterFunction = httpsCallable(this.functions, 'addAdopter')
          const result = await addAdopterFunction(newAdopter)
          console.log('Adopter added:', result.data)
          this.addAdopterDialogVisible = false
          // 刷新数据
          this.fetchAdopters()
          // 可选：显示成功消息
          // this.$toast.add({ severity: 'success', summary: 'Success', detail: 'Adopter added successfully.', life: 3000 })
        } catch (error) {
          console.error('Error adding adopter:', error)
          // 可选：显示错误消息
          // this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add adopter.', life: 3000 })
        }
      },      


      // 从 Firestore 获取收养者数据
      async fetchAdopters() {
        try {
          const adoptersCollection = collection(db, 'formSubmissions')
          const adoptersSnapshot = await getDocs(adoptersCollection)
          this.adopters = adoptersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          console.log('Fetched Adopters:', this.adopters)
        } catch (error) {
          console.error('Error fetching adopters:', error)
          // 可选：显示错误消息
          // this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch adopters.', life: 3000 })
        }
      }
    },
    mounted() {
      // 初始化 Firebase Functions
      this.functions = getFunctions()
      this.fetchFormData()
      // 获取收养者数据
      this.fetchAdopters()
    }
  };
  </script>
  
  <style scoped>
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
    font-size: 12px; /* 调整为您需要的字号 */
  }

  .p-datatable thead th {
    font-size: 12px; /* 表头字号 */
  }

  .p-datatable tbody td {
    font-size: 12px; /* 表格内容字号 */
  }

  /* 可选：调整按钮的字体大小 */
  .p-button {
    font-size: 10px;
  }
  </style>
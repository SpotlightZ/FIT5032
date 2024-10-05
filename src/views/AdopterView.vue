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
          { id: 1, name: 'Patrick Lulham', email: 'plulham0@sphinn.com' },
          { id: 2, name: 'Niven Weymont', email: 'nweymont1@columbia.edu' },
          { id: 3, name: 'Aluino Warratt', email: 'awarratt2@lulu.com' },
          { id: 4, name: 'Kathy Spandley', email: 'kspandley3@ameblo.jp' },
          { id: 5, name: 'Maurie Christal', email: 'mchristal4@miitbeian.gov.cn' },
          { id: 6, name: 'Luce Eastgate', email: 'leastgate5@dropbox.com' },
          { id: 7, name: 'Brandtr Twydell', email: 'btwydell6@blinklist.com' },
          { id: 8, name: 'Ddene Allibon', email: 'dallibon7@google.ru' },
          { id: 9, name: 'Harlan Heffernon', email: 'hheffernon8@opera.com' },
          { id: 10, name: 'Zelig Cotterrill', email: 'zcotterrill9@sphinn.com' },
          { id: 11, name: 'Alanna Whacket', email: 'awhacketa@cnet.com' },
          { id: 12, name: 'Brooke Crinidge', email: 'bcrinidgeb@amazonaws.com' },
          { id: 13, name: 'Benetta Casol', email: 'bcasolc@icq.com' },
          { id: 14, name: 'Mellie Male', email: 'mmaled@rakuten.co.jp' },
          { id: 15, name: 'Sterne Yokelman', email: 'syokelmane@eepurl.com' },
          { id: 16, name: 'Alleyn Coutts', email: 'acouttsf@cyberchimps.com' },
          { id: 17, name: 'Dante Quixley', email: 'dquixleyg@prlog.org' },
          { id: 18, name: 'Tish Burrus', email: 'tburrush@nationalgeographic.com' },
          { id: 19, name: 'Esma Rosedale', email: 'erosedalei@huffingtonpost.com' },
          { id: 20, name: 'Celestine Natalie', email: 'cnataliej@aol.com' },
          { id: 21, name: 'Verile Yedall', email: 'vyedallk@yelp.com' },
          { id: 22, name: 'Ashlan Dei', email: 'adeil@army.mil' },
          { id: 23, name: 'Channa Crunkhurn', email: 'ccrunkhurnm@dropbox.com' },
          { id: 24, name: 'Carrie Duffree', email: 'cduffreen@tumblr.com' },
          { id: 25, name: 'Tabbie Purdie', email: 'tpurdieo@constantcontact.com' },
          { id: 26, name: 'Obed Stothart', email: 'ostothartp@dropbox.com' },
          { id: 27, name: 'Sherry Hollow', email: 'shollowq@pen.io' },
          { id: 28, name: 'Carolee Tabert', email: 'ctabertr@businessinsider.com' },
          { id: 29, name: 'Cly Blazhevich', email: 'cblazhevichs@unicef.org' },
          { id: 30, name: 'Marcille Alvarado', email: 'malvaradot@sakura.ne.jp' },
          { id: 31, name: 'Roddy Broune', email: 'rbrouneu@blogs.com' }
        ],
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
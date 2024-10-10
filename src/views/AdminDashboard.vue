<script>
  import GenAI from '@/components/GenAI.vue'
  import NumList from '@/components/NumList.vue'
  import HighlightChart from '@/components/HighlightChart.vue'
  import UserManagement from '@/components/UserManagement.vue'
  import { ref, onMounted } from 'vue';
  import { db, storage } from '../firebase/init.js'; // 使用命名导入
  import { collection, getDocs, getDoc, query, where, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
  import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { useToast } from 'primevue/usetoast';

  export default {
    name: 'AdminDashboard',
    components: {
      GenAI,
      NumList,
      HighlightChart,
      UserManagement,
    },
    setup() {
      const usersCount = ref(0);
      const adoptersCount = ref(0);
      const applications = ref([]);
      const usersOverview = ref([]);
      const toast = useToast();

      // Fetch users from Firestore
      // const fetchUsers = async () => {
      //   try {
      //     const usersCollection = collection(db, 'users');
      //     const usersSnapshot = await getDocs(usersCollection);
      //     users.value = usersSnapshot.docs.map(doc => ({
      //       id: doc.id,
      //       ...doc.data(),
      //     }));
      //     console.log(users.value,'=users');
          
      //   } catch (error) {
      //     console.error('Error fetching users:', error);
      //     toast.add({ severity: 'error', summary: '错误', detail: '获取用户数据失败。', life: 3000 });
      //   }
      // };

      // // 添加新用户
      // const addUser = async () => {
      //   // 表单验证
      //   if (!newUser.value.name || !newUser.value.email || !newUser.value.role) {
      //     toast.add({ severity: 'warn', summary: '警告', detail: '请填写所有字段。', life: 3000 });
      //     return;
      //   }

      //   try {
      //     const usersCollection = collection(db, 'users');
      //     await addDoc(usersCollection, {
      //       name: newUser.value.name,
      //       email: newUser.value.email,
      //       role: newUser.value.role,
      //       createdAt: serverTimestamp(),
      //     });
      //     toast.add({ severity: 'success', summary: '成功', detail: '用户添加成功。', life: 3000 });
      //     addUserDialogVisible.value = false;
      //     newUser.value = { name: '', email: '', role: null };
      //     fetchUsers();
      //   } catch (error) {
      //     console.error('Error adding user:', error);
      //     toast.add({ severity: 'error', summary: '错误', detail: '添加用户失败。', life: 3000 });
      //   }
      // };


      // 格式化日期
      const formatDate = (rowData) => {
        if (rowData.createdAt && rowData.createdAt.toDate) {
          return rowData.createdAt.toDate().toLocaleString();
        }
        return '';
      };

      // 现有的获取计数和申请的方法
      const fetchCounts = async () => {
        try {
          const usersSnapshot = await getDocs(collection(db, 'users'));
          usersCount.value = usersSnapshot.size;

          const adoptersQuery = query(collection(db, 'users'), where('role', '==', 'adopter'));
          const adoptersSnapshot = await getDocs(adoptersQuery);
          adoptersCount.value = adoptersSnapshot.size;

          // Users Overview Data
          usersOverview.value = [
            { category: 'Total Users', count: usersCount.value },
            { category: 'Adopters', count: adoptersCount.value },
          ];
        } catch (error) {
          console.error('Error fetching counts:', error);
          toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch user counts.', life: 3000 });
        }
      };

      const fetchApplications = async () => {
        try {
          const applicationsSnapshot = await getDocs(collection(db, 'adoptionApplications'));
          applications.value = applicationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (error) {
          console.error('Error fetching applications:', error);
          toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch adoption applications.', life: 3000 });
        }
      };

      const approveApplication = async (id) => {
        try {
          const applicationRef = doc(db, 'adoptionApplications', id);
          await updateDoc(applicationRef, { status: 'Approved' });
          // 更新本地数据
          const appIndex = applications.value.findIndex(app => app.id === id);
          if (appIndex !== -1) {
            applications.value[appIndex].status = 'Approved';
          }
          toast.add({ severity: 'success', summary: 'Success', detail: 'Application approved.', life: 3000 });
        } catch (error) {
          console.error('Error approving application:', error);
          toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to approve application.', life: 3000 });
        }
      };

      const rejectApplication = async (id) => {
        try {
          const applicationRef = doc(db, 'adoptionApplications', id);
          await updateDoc(applicationRef, { status: 'Rejected' });
          // 更新本地数据
          const appIndex = applications.value.findIndex(app => app.id === id);
          if (appIndex !== -1) {
            applications.value[appIndex].status = 'Rejected';
          }
          toast.add({ severity: 'warn', summary: 'Rejected', detail: 'Application rejected.', life: 3000 });
        } catch (error) {
          console.error('Error rejecting application:', error);
          toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to reject application.', life: 3000 });
        }
      };

      // 图表数据
      const usersChartData = ref({});
      const adoptersChartData = ref({});
      const chartOptions = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      };

      const renderCharts = () => {
        usersChartData.value = {
          labels: usersOverview.value.map(item => item.category),
          datasets: [
            {
              data: usersOverview.value.map(item => item.count),
              backgroundColor: ['#42A5F5', '#66BB6A'],
              hoverBackgroundColor: ['#64B5F6', '#81C784'],
            },
          ],
        };

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
        };
      };


      // Staff 管理部分
      const staffs = ref([]);
      const selectedStaffs = ref([]);
      const fileUploadRef = ref(null);
      const addStaffDialogVisible = ref(false);
      const newStaff = ref({
        id: '',
        avatar: '',
        name: '',
        position: '',
        describe: '',
      });

      const editStaffDialogVisible = ref(false);
      const editStaff = ref({
        id: '',
        name: '',
        position: '',
        describe: '',
        avatar: '',
      });

      const deleteStaffDialogVisible = ref(false);
      const staffToDelete = ref({});
      // Filters for Staff DataTable
      const staffFilters = ref({
        'id': { value: null, matchMode: 'contains' },
        'name': { value: null, matchMode: 'contains' },
        'position': { value: null, matchMode: 'contains' },
        'describe': { value: null, matchMode: 'contains' },
      });
      
      // Fetch staffs from Firestore
      const fetchStaffs = async () => {
        try {
          const staffsCollection = collection(db, 'staff');
          const staffsSnapshot = await getDocs(staffsCollection);
          staffs.value = staffsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (error) {
          console.error('Error fetching staffs:', error);
          toast.add({ severity: 'error', summary: 'error', detail: 'Failed to get Staff data.', life: 3000 });
        }
      };

      // 添加新 Staff
      const addStaff = async () => {
        // 表单验证
        if (!newStaff.value.id || !newStaff.value.avatar || !newStaff.value.name || !newStaff.value.position || !newStaff.value.describe) {
          toast.add({ severity: 'warn', summary: 'warn', detail: 'Please fill in all fields.', life: 3000 });
          return;
        }

        try {
          const staffsCollection = collection(db, 'staff');
          await addDoc(staffsCollection, {
            id: newStaff.value.id,
            avatar: newStaff.value.avatar,
            name: newStaff.value.name,
            position: newStaff.value.position,
            describe: newStaff.value.describe,
            createdAt: serverTimestamp(),
          });
          toast.add({ severity: 'success', summary: 'success', detail: 'Staff added successfully.', life: 3000 });
          addStaffDialogVisible.value = false;
          newStaff.value = { id: '', avatar: '', name: '', position: '', describe: '' };
          fetchStaffs();
        } catch (error) {
          console.error('Error adding staff:', error);
          toast.add({ severity: 'error', summary: 'error', detail: 'Failed to add Staff.', life: 3000 });
        }
      };
  
      // 显示编辑 Staff Dialog 并填充数据
      const showEditStaffDialog = (staff) => {
        editStaff.value = { ...staff };
        editStaffDialogVisible.value = true;
      };
  
      // 更新 Staff
      const updateStaff = async () => {
        if (!editStaff.value.id || !editStaff.value.name || !editStaff.value.position || !editStaff.value.describe) {
          toast.add({ severity: 'warn', summary: 'warn', detail: 'Please fill in all fields.', life: 3000 });
          return;
        }
      
        try {
          const staffRef = doc(db, 'staff', editStaff.value.id);
          const staffDoc = await getDoc(staffRef);
        
          if (!staffDoc.exists()) {
            console.error('Error: Staff document does not exist.');
            toast.add({ severity: 'error', summary: 'error', detail: 'The Staff document does not exist.', life: 3000 });
            return;
          }
        
          await updateDoc(staffRef, {
            avatar: editStaff.value.avatar,
            name: editStaff.value.name,
            position: editStaff.value.position,
            describe: editStaff.value.describe,
          });
        
          toast.add({ severity: 'success', summary: 'success', detail: 'Staff updated successfully.', life: 3000 });
          editStaffDialogVisible.value = false;
          fetchStaffs();
        } catch (error) {
          console.error('Error updating staff:', error);
          toast.add({ severity: 'error', summary: 'error', detail: 'Failed to update Staff.', life: 3000 });
        }
      };


      // 确认删除 Staff
      const confirmDeleteStaff = (staff) => {
        staffToDelete.value = staff;
        deleteStaffDialogVisible.value = true;
      };
  
      // 删除 Staff
      const deleteStaff = async () => {
        try {
          const staffRef = doc(db, 'staff', staffToDelete.value.id);
          await deleteDoc(staffRef);
          toast.add({ severity: 'success', summary: 'success', detail: 'Staff deleted successfully.', life: 3000 });
          deleteStaffDialogVisible.value = false;
          fetchStaffs();
        } catch (error) {
          console.error('Error deleting staff:', error);
          toast.add({ severity: 'error', summary: 'error', detail: 'Failed to delete Staff.', life: 3000 });
        }
      };

      // Staff 过滤
      const onStaffFilter = (event) => {
        staffFilters.value = event.filters;
      };

      const onUpload = () => {
          toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
      };

      
      const selectedFile = ref(null); // 用于存储选择的文件

      // 当用户选择文件时触发
      const onFileSelect = (event) => {
        if (event.files && event.files.length > 0) {
          selectedFile.value = event.files[0];
        }
      };

      // 处理 Staff Avatar 上传
      const handleStaffAvatarUpload = async () => {
        const file = selectedFile.value;
        if (!file) {
          toast.add({ severity: 'warn', summary: 'warn', detail: 'Please select a file.', life: 3000 });
          return;
        }

        const storageReference = storageRef(storage, `staffAvatars/${newStaff.value.id}_${Date.now()}_${file.name}`);

        try {
          await uploadBytes(storageReference, file);
          const downloadURL = await getDownloadURL(storageReference);
          console.log(downloadURL,'=downloadURL');
          
          newStaff.value.avatar = downloadURL;
          toast.add({ severity: 'success', summary: 'success', detail: 'The avatar is uploaded successfully.', life: 3000 });
        } catch (error) {
          console.error('Error uploading avatar:', error);
          toast.add({ severity: 'error', summary: 'error', detail: 'Failed to upload the avatar.', life: 3000 });
        }
      };


      // 处理编辑 Staff Avatar 上传
      const handleEditStaffAvatarUpload = async (event) => {
        const file = selectedFile.value;
        if (!file) {
          toast.add({ severity: 'warn', summary: 'warn', detail: '请选择一个文件。', life: 3000 });
          return;
        }

        const storageReference = storageRef(storage, `staffAvatars/${editStaff.value.id}_${Date.now()}_${file.name}`);

        try {
          await uploadBytes(storageReference, file);
          const downloadURL = await getDownloadURL(storageReference);
          editStaff.value.avatar = downloadURL;
          toast.add({ severity: 'success', summary: 'success', detail: 'The avatar is uploaded successfully.', life: 3000 });
        } catch (error) {
          console.error('Error uploading avatar:', error);
          toast.add({ severity: 'error', summary: 'error', detail: 'Failed to upload the avatar.', life: 3000 });
        }
      };

      // 显示添加 Staff Dialog
      const showAddStaffDialog = () => {
        addStaffDialogVisible.value = true;
      };

      // 格式化日期（可选）
      const formatStaffDate = (rowData) => {
        if (rowData.createdAt && rowData.createdAt.toDate) {
          return rowData.createdAt.toDate().toLocaleString();
        }
        return '';
      };

  
      onMounted(async () => {
        // await fetchCounts();
        await fetchApplications();
        fetchStaffs();
        renderCharts();
      });
  
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
        
        // Staff 管理相关
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
  
        // FileUpload 相关
        handleStaffAvatarUpload,
        handleEditStaffAvatarUpload,
        onUpload,
        onFileSelect,
      };
    },
  }
</script>

<template>
  <div class="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div class="charts">
        <NumList />
        <HighlightChart />
       
      </div>
      <div class="data-tables">
        <Card title="Users Overview">
          <DataTable :value="usersOverview">
            <Column field="category" header="Category"></Column>
            <Column field="count" header="Count"></Column>
          </DataTable>
        </Card>

        <UserManagement></UserManagement>
      </div>

        <!-- Staff 管理部分 -->
        <div class="staff-management">
          <div class="header">
          <h2>Staff Management</h2>
          <Button label="Add Staff" icon="pi pi-plus" class="p-button-success" @click="showAddStaffDialog" />
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
          >
          <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
          <Column field="id" header="ID" sortable filter filterPlaceholder="SearchID"></Column>
          <Column field="avatar" header="avatar">
            <template #body="slotProps">
              <img :src="slotProps.data.avatar" alt="Avatar" class="avatar-image" />
            </template>
          </Column>
          <Column field="name" header="name" sortable filter filterPlaceholder="search name"></Column>
          <Column field="position" header="position" sortable filter filterPlaceholder="search position"></Column>
          <Column field="describe" header="describe" sortable filter filterPlaceholder="search describe"></Column>
          <Column header="operation" :style="{ width: '200px' }">
            <template #body="slotProps" class="buttons">
              <Button label="" icon="pi pi-pencil" class="p-button-rounded p-button-info p-mr-2 mr-1" @click="showEditStaffDialog(slotProps.data)" />
              <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="confirmDeleteStaff(slotProps.data)" />
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- 添加 Staff Dialog -->
        <Dialog header="添加 Staff" :visible.sync="addStaffDialogVisible" modal class="col-8">
          <div class="p-fluid">
            <div class="p-field">
              <label for="staff-id" class="col-1">ID</label>
              <InputText id="staff-id" v-model="newStaff.id" />
            </div>
            <div class="p-field">
              <label for="staff-avatar" class="col-1">avatar</label>
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
              />
              <Button label="upload avatar" @click="handleStaffAvatarUpload" />
            </div>
            <div class="p-field">
              <label for="staff-name" class="col-1">name</label>
              <InputText id="staff-name" v-model="newStaff.name" />
            </div>
            <div class="p-field">
              <label for="staff-position" class="col-1">position</label>
              <InputText id="staff-position" v-model="newStaff.position" />
            </div>
            <div class="p-field">
              <label for="staff-describe" class="col-1">describe</label>
              <InputText id="staff-describe" class="col-10" v-model="newStaff.describe" />
            </div>
          </div>
          <template #footer>
            <Button label="cancel" icon="pi pi-times" class="p-button-text" @click="addStaffDialogVisible = false" />
            <Button label="save" icon="pi pi-check" class="p-button-text" @click="addStaff" />
          </template>
        </Dialog>
  
        <!-- 编辑 Staff Dialog -->
        <Dialog header="Edit Staff" :visible.sync="editStaffDialogVisible" modal class="col-8">
          <div class="p-fluid">
          <div class="p-field">
            <label for="edit-staff-id" class="col-1">ID</label>
            <InputText id="edit-staff-id" v-model="editStaff.id" disabled />
          </div>
          <div class="p-field">
            <label for="edit-staff-avatar" class="col-1">avatar</label>
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
            />
            <Button label="Upload Avatar" @click="handleEditStaffAvatarUpload" />
          </div>
          <div class="p-field">
            <label for="edit-staff-name" class="col-1">name</label>
            <InputText id="edit-staff-name" v-model="editStaff.name" />
          </div>
          <div class="p-field">
            <label for="edit-staff-position" class="col-1">position</label>
            <InputText id="edit-staff-position" v-model="editStaff.position" />
          </div>
          <div class="p-field">
            <label for="edit-staff-describe" class="col-1">describe</label>
            <InputText id="edit-staff-describe" class="col-10" v-model="editStaff.describe" />
          </div>
          </div>
          <template #footer>
            <Button label="cancel" icon="pi pi-times" class="p-button-text" @click="editStaffDialogVisible = false" />
            <Button label="save" icon="pi pi-check" class="p-button-text" @click="updateStaff" />
          </template>
        </Dialog>
  
        <!-- 确认删除 Staff Dialog -->
        <Dialog header="Confirm Delete" :visible.sync="deleteStaffDialogVisible" modal>
          <p>Are you sure you want to delete <strong>{{ staffToDelete.name }}</strong> user?</p>
          <template #footer>
            <Button label="cancel" icon="pi pi-times" class="p-button-text" @click="deleteStaffDialogVisible = false" />
            <Button label="delete" icon="pi pi-trash" class="p-button-text p-button-danger" @click="deleteStaff" />
          </template>
        </Dialog>

      <Toast />
    </div>
  <!-- <GenAI></GenAI> -->
</template>


<style scoped>
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
  button {
    text-align: center;
  }
}

.error {
  color: red;
  text-align: center;
  margin-top: 10px;
}
</style>
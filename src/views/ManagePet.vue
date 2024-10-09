<script>
  import GenAI from '@/components/GenAI.vue'
  import { ref, onMounted } from 'vue';
  import db from '../firebase/init.js';
  import { collection, getDocs, query, where, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
  // import Chart from 'primevue/chart';
  // import DataTable from 'primevue/datatable';
  // import Column from 'primevue/column';
  // import Button from 'primevue/button';
  // import Card from 'primevue/card';
  import Toast from 'primevue/toast';
  import { useToast } from 'primevue/usetoast';

  export default {
    name: 'AdminDashboard',
    components: {
      GenAI,
      // Chart,
      // DataTable,
      // Column,
      // Button,
      // Card,
      Toast,
    },
    setup() {
      const usersCount = ref(0);
      const adoptersCount = ref(0);
      const applications = ref([]);
      const usersOverview = ref([]);
      const toast = useToast();

      // 用户数据
      const users = ref([]);
      // 添加用户 Dialog 状态
      const addUserDialogVisible = ref(false);
      const newUser = ref({
        name: '',
        email: '',
        role: null,
      });
      const roles = ['admin', 'user', 'guest'];

      // 编辑用户 Dialog 状态
      const editUserDialogVisible = ref(false);
      const editUser = ref({
        id: '',
        name: '',
        email: '',
        role: null,
      });

      // 删除用户 Dialog 状态
      const deleteUserDialogVisible = ref(false);
      const userToDelete = ref({});

      // Fetch users from Firestore
      const fetchUsers = async () => {
        try {
          const usersCollection = collection(db, 'users');
          const usersSnapshot = await getDocs(usersCollection);
          users.value = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (error) {
          console.error('Error fetching users:', error);
          toast.add({ severity: 'error', summary: '错误', detail: '获取用户数据失败。', life: 3000 });
        }
      };

      // 添加新用户
      const addUser = async () => {
        // 表单验证
        if (!newUser.value.name || !newUser.value.email || !newUser.value.role) {
          toast.add({ severity: 'warn', summary: '警告', detail: '请填写所有字段。', life: 3000 });
          return;
        }

        try {
          const usersCollection = collection(db, 'users');
          await addDoc(usersCollection, {
            name: newUser.value.name,
            email: newUser.value.email,
            role: newUser.value.role,
            createdAt: serverTimestamp(),
          });
          toast.add({ severity: 'success', summary: '成功', detail: '用户添加成功。', life: 3000 });
          addUserDialogVisible.value = false;
          newUser.value = { name: '', email: '', role: null };
          fetchUsers();
        } catch (error) {
          console.error('Error adding user:', error);
          toast.add({ severity: 'error', summary: '错误', detail: '添加用户失败。', life: 3000 });
        }
      };

      // 显示编辑用户 Dialog 并填充数据
      const showEditUserDialog = (user) => {
        editUser.value = { ...user };
        editUserDialogVisible.value = true;
      };

      // 更新用户
      const updateUser = async () => {
        // 表单验证
        if (!editUser.value.name || !editUser.value.email || !editUser.value.role) {
          toast.add({ severity: 'warn', summary: '警告', detail: '请填写所有字段。', life: 3000 });
          return;
        }

        try {
          const userRef = doc(db, 'users', editUser.value.id);
          await updateDoc(userRef, {
            name: editUser.value.name,
            email: editUser.value.email,
            role: editUser.value.role,
          });
          toast.add({ severity: 'success', summary: '成功', detail: '用户更新成功。', life: 3000 });
          editUserDialogVisible.value = false;
          fetchUsers();
        } catch (error) {
          console.error('Error updating user:', error);
          toast.add({ severity: 'error', summary: '错误', detail: '更新用户失败。', life: 3000 });
        }
      };

      // 确认删除用户
      const confirmDeleteUser = (user) => {
        userToDelete.value = user;
        deleteUserDialogVisible.value = true;
      };

      // 删除用户
      const deleteUser = async () => {
        try {
          const userRef = doc(db, 'users', userToDelete.value.id);
          await deleteDoc(userRef);
          toast.add({ severity: 'success', summary: '成功', detail: '用户删除成功。', life: 3000 });
          deleteUserDialogVisible.value = false;
          fetchUsers();
        } catch (error) {
          console.error('Error deleting user:', error);
          toast.add({ severity: 'error', summary: '错误', detail: '删除用户失败。', life: 3000 });
        }
      };

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
  
      onMounted(async () => {
        await fetchUsers();
        await fetchCounts();
        await fetchApplications();
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
        users,
        addUserDialogVisible,
        newUser,
        roles,
        showAddUserDialog: () => addUserDialogVisible.value = true,
        addUser,
        editUserDialogVisible,
        editUser,
        showEditUserDialog,
        updateUser,
        deleteUserDialogVisible,
        userToDelete,
        confirmDeleteUser,
        deleteUser,
        formatDate,
      };
    },
  }
</script>

<template>
  <div class="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div class="charts">
        <Card title="Users Overview">
          <Chart type="pie" :data="usersChartData" :options="chartOptions" />
        </Card>
        <Card title="Adopters Count">
          <Chart type="bar" :data="adoptersChartData" :options="chartOptions" />
        </Card>
      </div>
      <div class="data-tables">
        <Card title="Users Overview">
          <DataTable :value="usersOverview">
            <Column field="category" header="Category"></Column>
            <Column field="count" header="Count"></Column>
          </DataTable>
        </Card>
  
        <Card title="Adoption Applications">
          <DataTable :value="applications" responsiveLayout="scroll">
            <Column field="userId" header="User ID"></Column>
            <Column field="petId" header="Pet ID"></Column>
            <Column field="status" header="Status"></Column>
            <Column header="Actions">
              <template #body="slotProps">
                <Button
                  label="Approve"
                  icon="pi pi-check"
                  class="p-button-success p-mr-2"
                  @click="approveApplication(slotProps.data.id)"
                  :disabled="slotProps.data.status !== 'Pending'"
                />
                <Button
                  label="Reject"
                  icon="pi pi-times"
                  class="p-button-danger"
                  @click="rejectApplication(slotProps.data.id)"
                  :disabled="slotProps.data.status !== 'Pending'"
                />
              </template>
            </Column>
          </DataTable>
        </Card>

        <div class="user-management">
          <div class="header">
            <h2>用户管理</h2>
            <Button label="添加用户" icon="pi pi-plus" class="p-button-success" @click="showAddUserDialog" />
          </div>

          <DataTable :value="users" paginator :rows="10" responsiveLayout="scroll">
            <Column field="name" header="姓名"></Column>
            <Column field="email" header="邮箱"></Column>
            <Column field="role" header="角色"></Column>
            <Column field="createdAt" header="创建时间" :body="formatDate"></Column>
            <Column header="操作">
              <template #body="slotProps">
                <Button label="编辑" icon="pi pi-pencil" class="p-button-rounded p-button-info p-mr-2" @click="showEditUserDialog(slotProps.data)" />
                <Button label="删除" icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="confirmDeleteUser(slotProps.data)" />
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- 添加用户 Dialog -->
        <Dialog header="添加用户" :visible.sync="addUserDialogVisible" modal>
          <div class="p-fluid">
            <div class="p-field">
              <label for="name">姓名</label>
              <InputText id="name" v-model="newUser.name" />
            </div>
            <div class="p-field">
              <label for="email">邮箱</label>
              <InputText id="email" v-model="newUser.email" />
            </div>
            <div class="p-field">
              <label for="role">角色</label>
              <Dropdown id="role" v-model="newUser.role" :options="roles" placeholder="选择角色" />
            </div>
          </div>
          <template #footer>
            <Button label="取消" icon="pi pi-times" class="p-button-text" @click="addUserDialogVisible = false" />
            <Button label="保存" icon="pi pi-check" class="p-button-text" @click="addUser" />
          </template>
        </Dialog>

        <!-- 编辑用户 Dialog -->
        <Dialog header="编辑用户" :visible.sync="editUserDialogVisible" modal>
          <div class="p-fluid">
            <div class="p-field">
              <label for="edit-name">姓名</label>
              <InputText id="edit-name" v-model="editUser.name" />
            </div>
            <div class="p-field">
              <label for="edit-email">邮箱</label>
              <InputText id="edit-email" v-model="editUser.email" />
            </div>
            <div class="p-field">
              <label for="edit-role">角色</label>
              <Dropdown id="edit-role" v-model="editUser.role" :options="roles.value" placeholder="选择角色" />
            </div>
          </div>
          <template #footer>
            <Button label="取消" icon="pi pi-times" class="p-button-text" @click="editUserDialogVisible = false" />
            <Button label="保存" icon="pi pi-check" class="p-button-text" @click="updateUser" />
          </template>
        </Dialog>

        <!-- 确认删除 Dialog -->
        <Dialog header="确认删除" :visible.sync="deleteUserDialogVisible" modal>
          <p>您确定要删除用户 <strong>{{ userToDelete.name }}</strong> 吗？</p>
          <template #footer>
            <Button label="取消" icon="pi pi-times" class="p-button-text" @click="deleteUserDialogVisible = false" />
            <Button label="删除" icon="pi pi-trash" class="p-button-text p-button-danger" @click="deleteUser" />
          </template>
        </Dialog>

      </div>
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

table {
  width: 100%;
}

.error {
  color: red;
  text-align: center;
  margin-top: 10px;
}
</style>
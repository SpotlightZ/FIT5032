<template>
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
          />
        </div>
      </div>
  
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
        <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
  
        <!-- Email Column with Filter -->
        <Column
          field="email"
          header="Email"
          sortable
          filter
          filterPlaceholder="Search by email"
        >
          <template #filter>
            <InputText v-model="userFilters['email'].value" placeholder="Search by email" />
          </template>
        </Column>
  
        <!-- Role Column with Filter -->
        <Column
          field="role"
          header="Role"
          sortable
          filter
          filterPlaceholder="Search by role"
        >
          <template #filter>
            <InputText v-model="userFilters['role'].value" placeholder="Search by role" />
          </template>
        </Column>
  
        <!-- Reason Column with Filter -->
        <Column
          field="reason"
          header="Reason"
          sortable
          filter
          filterPlaceholder="Search by reason"
        >
          <template #filter>
            <InputText v-model="userFilters['reason'].value" placeholder="Search by reason" />
          </template>
        </Column>
  
        <!-- Is Australian Column -->
        <Column
          field="isAustralian"
          header="Is Australian"
          sortable
          filter
          filterPlaceholder="Search by Australian status"
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
              v-model="userFilters['isAustralian'].value"
              placeholder="Select"
              optionLabel="label"
              optionValue="value"
              showClear
            />
          </template>
        </Column>
  
        <!-- Created At Column -->
        <Column
          field="createdAt"
          header="Created At"
          sortable
        >
        <template #body="slotProps">
          {{ formatDate(slotProps.data) }}
        </template>
        </Column>
  
        <!-- Operations Column -->
        <Column header="Operations" class="buttons">
          <template #body="slotProps">
            <Button
              label=""
              icon="pi pi-trash"
              class="p-button-rounded p-button-danger"
              @click="confirmDeleteUser(slotProps.data)"
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
      >
        <div>
          <p>Are you sure you want to delete <strong>{{ userToDelete.name }}</strong>?</p>
          <div class="flex justify-end mt-4">
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeDeleteDialog" />
            <Button label="Delete" icon="pi pi-check" class="p-button-danger ml-2" @click="deleteUser" />
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
      >
        <div>
          <p>Are you sure you want to delete <strong>{{ selectedUsers.length }}</strong> selected users?</p>
          <div class="flex justify-end mt-4">
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeBulkDeleteDialog" />
            <Button label="Delete" icon="pi pi-check" class="p-button-danger ml-2" @click="bulkDeleteUsers" />
          </div>
        </div>
      </Dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { format } from 'date-fns'; // 用于日期格式化
  import { db } from '@/firebase/init.js'; // 使用命名导入
  import { collection, getDocs, doc, deleteDoc, writeBatch } from 'firebase/firestore';
  import Dropdown from 'primevue/dropdown'; // 引入 Dropdown 组件
  import { useToast } from 'primevue/usetoast';
  
  // 用户数据
  const users = ref([]);

  // 筛选对象
  const userFilters = ref({
    global: { value: null, matchMode: 'contains' },
    email: { value: null, matchMode: 'contains' },
    role: { value: null, matchMode: 'contains' },
    reason: { value: null, matchMode: 'contains' },
    isAustralian: { value: null, matchMode: 'equals' }, // 添加 isAustralian 的筛选
  });
  
  // 排序字段和顺序
  const sortField = ref(null);
  const sortOrder = ref(null);

  const toast = useToast();
  
  // 选择的用户
  const selectedUsers = ref([]);
  const selectedAdopters = ref([]);
  
  // Dialog 状态
  const isDeleteDialogVisible = ref(false);
  const isBulkDeleteDialogVisible = ref(false);
  
  // 要删除的用户
  const userToDelete = ref(null);
  
  // 筛选选项
  const isAustralianOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];
  
  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      users.value = usersSnapshot.docs.map(doc => {
      const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate() : null, // 转换 Timestamp 到 Date
        };
      });
      console.log('Fetched Users:', users.value); // 调试日志
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.add({ severity: 'error', summary: 'error', detail: 'Failed to get user data.', life: 3000 });
    }
  };

  const formatDate = (rowData) => {
    if (!rowData.createdAt) return '';
    return format(rowData.createdAt, 'yyyy-MM-dd');
  };
  
  // 方法：关闭删除对话框
  const closeDeleteDialog = () => {
    isDeleteDialogVisible.value = false;
    userToDelete.value = null;
  };
  
  // 方法：确认删除用户
  const confirmDeleteUser = (user) => {
    userToDelete.value = user;
    isDeleteDialogVisible.value = true;
  };
  
  // 方法：删除用户
  const deleteUser = async () => {
    try {
      const userDocRef = doc(db, 'users', userToDelete.value.id);
      await deleteDoc(userDocRef);
      // 从本地数据中移除用户
      users.value = users.value.filter(u => u.id !== userToDelete.value.id);
      closeDeleteDialog();
      // 可选：显示成功消息
      toast.add({ severity: 'success', summary: 'success', detail: 'The user has been deleted.', life: 3000 });
    } catch (error) {
      console.error('Error deleting user:', error);
      // 可选：显示错误消息
      toast.add({ severity: 'error', summary: 'error', detail: 'Description Failed to delete the user.', life: 3000 });
    }
  };
  
  // 方法：确认批量删除
  const confirmBulkDelete = () => {
    isBulkDeleteDialogVisible.value = true;
  };
  
  // 方法：关闭批量删除对话框
  const closeBulkDeleteDialog = () => {
    isBulkDeleteDialogVisible.value = false;
  };
  
  // 方法：批量删除用户
  const bulkDeleteUsers = async () => {
    if (selectedUsers.value.length === 0) return;
  
    const batch = writeBatch(db);
    selectedUsers.value.forEach(user => {
      const userDocRef = doc(db, 'users', user.id);
      batch.delete(userDocRef);
    });
  
    try {
      await batch.commit();
      // 从本地数据中移除已删除的用户
      const deletedIds = selectedUsers.value.map(u => u.id);
      users.value = users.value.filter(u => !deletedIds.includes(u.id));
      selectedUsers.value = [];
      closeBulkDeleteDialog();
      // 可选：显示成功消息
      toast.add({ severity: 'success', summary: 'success', detail: 'The selected user has been deleted.', life: 3000 });
    } catch (error) {
      console.error('Error deleting users:', error);
      // 可选：显示错误消息
      toast.add({ severity: 'error', summary: 'error', detail: 'Failed to delete users in bulk.', life: 3000 });
    }
  };
  
  onMounted(() => {
    fetchUsers();  
  });
  </script>
  
  <style scoped>
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
  </style>
  
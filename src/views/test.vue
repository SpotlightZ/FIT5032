<template>
    <div class="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <!-- 用户管理部分 -->
      <div class="user-management">
        <div class="header">
          <h2>用户管理</h2>
          <Button label="添加用户" icon="pi pi-plus" class="p-button-success" @click="showAddUserDialog" />
        </div>
        
        <DataTable :value="users" paginator :rows="10" responsiveLayout="scroll" selectionMode="multiple" v-model:selection="selectedUsers">
          <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
          <Column field="name" header="姓名" sortable filter filterPlaceholder="搜索姓名"></Column>
          <Column field="email" header="邮箱" sortable filter filterPlaceholder="搜索邮箱"></Column>
          <Column field="role" header="角色" sortable filter filterPlaceholder="搜索角色"></Column>
          <Column field="createdAt" header="创建时间" :body="formatDate" sortable></Column>
          <Column header="操作">
            <template #body="slotProps">
              <Button label="编辑" icon="pi pi-pencil" class="p-button-rounded p-button-info p-mr-2" @click="showEditUserDialog(slotProps.data)" />
              <Button label="删除" icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="confirmDeleteUser(slotProps.data)" />
            </template>
          </Column>
        </DataTable>
      </div>
  
      <!-- Staff 管理部分 -->
      <div class="staff-management">
        <div class="header">
          <h2>Staff 管理</h2>
          <Button label="添加 Staff" icon="pi pi-plus" class="p-button-success" @click="showAddStaffDialog" />
        </div>
        
        <DataTable 
          :value="staffs" 
          paginator 
          :rows="10" 
          responsiveLayout="scroll" 
          selectionMode="multiple" 
          v-model:selection="selectedStaffs"
          sortMode="multiple"
          filterDisplay="row"
          :filters="staffFilters"
          @filter="onStaffFilter"
        >
          <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
          <Column field="id" header="ID" sortable filter filterPlaceholder="搜索ID"></Column>
          <Column field="avatar" header="头像" :body="avatarBody" sortable></Column>
          <Column field="name" header="姓名" sortable filter filterPlaceholder="搜索姓名"></Column>
          <Column field="position" header="职位" sortable filter filterPlaceholder="搜索职位"></Column>
          <Column field="describe" header="描述" sortable filter filterPlaceholder="搜索描述"></Column>
          <Column header="操作">
            <template #body="slotProps">
              <Button label="编辑" icon="pi pi-pencil" class="p-button-rounded p-button-info p-mr-2" @click="showEditStaffDialog(slotProps.data)" />
              <Button label="删除" icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="confirmDeleteStaff(slotProps.data)" />
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
            <Dropdown id="edit-role" v-model="editUser.role" :options="roles" placeholder="选择角色" />
          </div>
        </div>
        <template #footer>
          <Button label="取消" icon="pi pi-times" class="p-button-text" @click="editUserDialogVisible = false" />
          <Button label="保存" icon="pi pi-check" class="p-button-text" @click="updateUser" />
        </template>
      </Dialog>
  
      <!-- 确认删除用户 Dialog -->
      <Dialog header="确认删除" :visible.sync="deleteUserDialogVisible" modal>
        <p>您确定要删除用户 <strong>{{ userToDelete.name }}</strong> 吗？</p>
        <template #footer>
          <Button label="取消" icon="pi pi-times" class="p-button-text" @click="deleteUserDialogVisible = false" />
          <Button label="删除" icon="pi pi-trash" class="p-button-text p-button-danger" @click="deleteUser" />
        </template>
      </Dialog>
  
      <!-- 添加 Staff Dialog -->
      <Dialog header="添加 Staff" :visible.sync="addStaffDialogVisible" modal>
        <div class="p-fluid">
          <div class="p-field">
            <label for="staff-id">ID</label>
            <InputText id="staff-id" v-model="newStaff.id" />
          </div>
          <div class="p-field">
            <label for="staff-avatar">头像</label>
            <FileUpload 
              name="avatar" 
              url="#" 
              :customUpload="true" 
              :uploadHandler="handleStaffAvatarUpload" 
              :auto="false"
              :maxFileSize="1000000"
              accept="image/*"
            />
          </div>
          <div class="p-field">
            <label for="staff-name">姓名</label>
            <InputText id="staff-name" v-model="newStaff.name" />
          </div>
          <div class="p-field">
            <label for="staff-position">职位</label>
            <InputText id="staff-position" v-model="newStaff.position" />
          </div>
          <div class="p-field">
            <label for="staff-describe">描述</label>
            <InputText id="staff-describe" v-model="newStaff.describe" />
          </div>
        </div>
        <template #footer>
          <Button label="取消" icon="pi pi-times" class="p-button-text" @click="addStaffDialogVisible = false" />
          <Button label="保存" icon="pi pi-check" class="p-button-text" @click="addStaff" />
        </template>
      </Dialog>
  
      <!-- 编辑 Staff Dialog -->
      <Dialog header="编辑 Staff" :visible.sync="editStaffDialogVisible" modal>
        <div class="p-fluid">
          <div class="p-field">
            <label for="edit-staff-id">ID</label>
            <InputText id="edit-staff-id" v-model="editStaff.id" disabled />
          </div>
          <div class="p-field">
            <label for="edit-staff-avatar">头像</label>
            <FileUpload 
              name="avatar" 
              url="#" 
              :customUpload="true" 
              :uploadHandler="handleEditStaffAvatarUpload" 
              :auto="false"
              :maxFileSize="1000000"
              accept="image/*"
            />
          </div>
          <div class="p-field">
            <label for="edit-staff-name">姓名</label>
            <InputText id="edit-staff-name" v-model="editStaff.name" />
          </div>
          <div class="p-field">
            <label for="edit-staff-position">职位</label>
            <InputText id="edit-staff-position" v-model="editStaff.position" />
          </div>
          <div class="p-field">
            <label for="edit-staff-describe">描述</label>
            <InputText id="edit-staff-describe" v-model="editStaff.describe" />
          </div>
        </div>
        <template #footer>
          <Button label="取消" icon="pi pi-times" class="p-button-text" @click="editStaffDialogVisible = false" />
          <Button label="保存" icon="pi pi-check" class="p-button-text" @click="updateStaff" />
        </template>
      </Dialog>
  
      <!-- 确认删除 Staff Dialog -->
      <Dialog header="确认删除" :visible.sync="deleteStaffDialogVisible" modal>
        <p>您确定要删除 Staff <strong>{{ staffToDelete.name }}</strong> 吗？</p>
        <template #footer>
          <Button label="取消" icon="pi pi-times" class="p-button-text" @click="deleteStaffDialogVisible = false" />
          <Button label="删除" icon="pi pi-trash" class="p-button-text p-button-danger" @click="deleteStaff" />
        </template>
      </Dialog>
    </div>
  </template>
  
  
  <script>
import { ref, onMounted } from 'vue';
import { db } from '../firebase/init.js'; // 使用命名导入
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import FileUpload from 'primevue/fileupload';
import { useToast } from 'primevue/usetoast';

export default {
  name: 'AdminDashboard',
  components: {
    DataTable,
    Column,
    Button,
    Dialog,
    InputText,
    Dropdown,
    FileUpload,
  },
  setup() {
    // 用户数据
    const users = ref([]);
    const selectedUsers = ref([]);

    // Staff 数据
    const staffs = ref([]);
    const selectedStaffs = ref([]);

    // Toast
    const toast = useToast();

    // Firebase Storage
    const storage = getStorage();

    // 添加用户 Dialog 状态
    const addUserDialogVisible = ref(false);
    const newUser = ref({
      name: '',
      email: '',
      role: null,
    });
    const roles = [
      { label: '管理员', value: 'admin' },
      { label: '普通用户', value: 'user' },
    ];

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

    // 添加 Staff Dialog 状态
    const addStaffDialogVisible = ref(false);
    const newStaff = ref({
      id: '',
      avatar: '',
      name: '',
      position: '',
      describe: '',
    });

    // 编辑 Staff Dialog 状态
    const editStaffDialogVisible = ref(false);
    const editStaff = ref({
      id: '',
      avatar: '',
      name: '',
      position: '',
      describe: '',
    });

    // 删除 Staff Dialog 状态
    const deleteStaffDialogVisible = ref(false);
    const staffToDelete = ref({});

    // Filters for Staff DataTable
    const staffFilters = ref({
      'id': { value: null, matchMode: 'contains' },
      'name': { value: null, matchMode: 'contains' },
      'position': { value: null, matchMode: 'contains' },
      'describe': { value: null, matchMode: 'contains' },
    });

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
        toast.add({ severity: 'error', summary: '错误', detail: '获取 Staff 数据失败。', life: 3000 });
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

    // 添加新 Staff
    const addStaff = async () => {
      // 表单验证
      if (!newStaff.value.id || !newStaff.value.avatar || !newStaff.value.name || !newStaff.value.position || !newStaff.value.describe) {
        toast.add({ severity: 'warn', summary: '警告', detail: '请填写所有字段。', life: 3000 });
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
        toast.add({ severity: 'success', summary: '成功', detail: 'Staff 添加成功。', life: 3000 });
        addStaffDialogVisible.value = false;
        newStaff.value = { id: '', avatar: '', name: '', position: '', describe: '' };
        fetchStaffs();
      } catch (error) {
        console.error('Error adding staff:', error);
        toast.add({ severity: 'error', summary: '错误', detail: '添加 Staff 失败。', life: 3000 });
      }
    };

    // 显示编辑 Staff Dialog 并填充数据
    const showEditStaffDialog = (staff) => {
      editStaff.value = { ...staff };
      editStaffDialogVisible.value = true;
    };

    // 更新 Staff
    const updateStaff = async () => {
      // 表单验证
      if (!editStaff.value.id || !editStaff.value.avatar || !editStaff.value.name || !editStaff.value.position || !editStaff.value.describe) {
        toast.add({ severity: 'warn', summary: '警告', detail: '请填写所有字段。', life: 3000 });
        return;
      }

      try {
        const staffRef = doc(db, 'staff', editStaff.value.id);
        await updateDoc(staffRef, {
          avatar: editStaff.value.avatar,
          name: editStaff.value.name,
          position: editStaff.value.position,
          describe: editStaff.value.describe,
        });
        toast.add({ severity: 'success', summary: '成功', detail: 'Staff 更新成功。', life: 3000 });
        editStaffDialogVisible.value = false;
        fetchStaffs();
      } catch (error) {
        console.error('Error updating staff:', error);
        toast.add({ severity: 'error', summary: '错误', detail: '更新 Staff 失败。', life: 3000 });
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
        toast.add({ severity: 'success', summary: '成功', detail: 'Staff 删除成功。', life: 3000 });
        deleteStaffDialogVisible.value = false;
        fetchStaffs();
      } catch (error) {
        console.error('Error deleting staff:', error);
        toast.add({ severity: 'error', summary: '错误', detail: '删除 Staff 失败。', life: 3000 });
      }
    };

    // 格式化日期
    const formatDate = (rowData) => {
      if (rowData.createdAt && rowData.createdAt.toDate) {
        return rowData.createdAt.toDate().toLocaleString();
      }
      return '';
    };

    // 自定义 Avatar 列
    const avatarBody = (rowData) => {
      return `<img src="${rowData.avatar}" alt="${rowData.name}" class="avatar-image" />`;
    };

    // 处理 Staff 的过滤事件
    const onStaffFilter = (event) => {
      staffFilters.value = event.filters;
    };

    // 处理 Staff Avatar 上传
    const handleStaffAvatarUpload = async (event) => {
      const file = event.files[0];
      if (!file) {
        toast.add({ severity: 'warn', summary: '警告', detail: '请选择一个文件。', life: 3000 });
        return;
      }

      const storageReference = storageRef(storage, `staffAvatars/${newStaff.value.id}_${Date.now()}_${file.name}`);

      try {
        await uploadBytes(storageReference, file);
        const downloadURL = await getDownloadURL(storageReference);
        newStaff.value.avatar = downloadURL;
        toast.add({ severity: 'success', summary: '成功', detail: '头像上传成功。', life: 3000 });
      } catch (error) {
        console.error('Error uploading avatar:', error);
        toast.add({ severity: 'error', summary: '错误', detail: '头像上传失败。', life: 3000 });
      }
    };

    // 处理编辑 Staff Avatar 上传
    const handleEditStaffAvatarUpload = async (event) => {
      const file = event.files[0];
      if (!file) {
        toast.add({ severity: 'warn', summary: '警告', detail: '请选择一个文件。', life: 3000 });
        return;
      }

      const storageReference = storageRef(storage, `staffAvatars/${editStaff.value.id}_${Date.now()}_${file.name}`);

      try {
        await uploadBytes(storageReference, file);
        const downloadURL = await getDownloadURL(storageReference);
        editStaff.value.avatar = downloadURL;
        toast.add({ severity: 'success', summary: '成功', detail: '头像上传成功。', life: 3000 });
      } catch (error) {
        console.error('Error uploading avatar:', error);
        toast.add({ severity: 'error', summary: '错误', detail: '头像上传失败。', life: 3000 });
      }
    };

    onMounted(() => {
      fetchUsers();
      fetchStaffs();
      // 其他初始化逻辑，如 fetchCounts 和 fetchApplications
    });

    return {
      // 用户管理相关
      users,
      selectedUsers,
      addUserDialogVisible,
      newUser,
      roles,
      showAddUserDialog,
      addUser,
      editUserDialogVisible,
      editUser,
      showEditUserDialog,
      updateUser,
      deleteUserDialogVisible,
      userToDelete,
      confirmDeleteUser,
      deleteUser,

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
      avatarBody,
      formatDate,
      staffFilters,
      onStaffFilter,
      handleStaffAvatarUpload,
      handleEditStaffAvatarUpload,
    };
  },
}
</script>

  </script>
  
  <style scoped>
  .admin-dashboard {
    padding: 20px;
  }
  
  h1 {
    text-align: center;
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
  
  .p-field {
    margin-bottom: 1rem;
  }
  
  .error {
    color: red;
    text-align: center;
    margin-top: 10px;
  }
  </style>
  
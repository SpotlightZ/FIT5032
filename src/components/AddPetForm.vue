<!-- src/components/AddPetForm.vue -->
<template>
    <form @submit.prevent="handleSubmit">
      <div class="mb-3">
        <label for="name" class="form-label">Pet Name</label>
        <InputText v-model="form.name" class="p-inputtext p-component" id="name" required />
      </div>
      <div class="mb-3">
        <label for="age" class="form-label">Age</label>
        <InputText v-model="form.age" class="p-inputtext p-component" id="age" required />
      </div>
      <div class="mb-3">
        <label for="avatar" class="form-label">Avatar</label>
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
      <div class="mb-3">
        <label for="address" class="form-label">Address</label>
        <InputText v-model="form.address" class="p-inputtext p-component" id="address" required />
      </div>
      <div class="mb-3">
        <label for="description" class="form-label">Description</label>
        <Textarea v-model="form.description" class="p-textarea p-component" id="description" rows="3" cols="30" required />
      </div>
      <div class="mb-3" v-if="isNested">
        <label for="adopterId" class="form-label">Adopter ID</label>
        <InputText v-model="form.adopterId" class="p-inputtext p-component" id="adopterId" required />
      </div>
      <div class="d-flex justify-end">
        <Button label="Cancel" class="p-button-text me-2" @click="$emit('close')" />
        <Button label="Add Pet" type="submit" class="p-button-success" />
      </div>
    </form>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { storage } from '@/firebase/init.js'; // 使用命名导入
  import { useToast } from 'primevue/usetoast';
  
  export default {
    props: {
      isNested: {
        type: Boolean,
        default: false, // 是否嵌套在 Adopter 文档中
      },
    },
    setup(props, { emit }) {
      const form = ref({
        name: '',
        age: '',
        avatar: '',
        address: '',
        description: '',
        // adopterId: '', // 仅在嵌套模式下需要
      });
      
      const selectedFile = ref(null); // 用于存储选择的文件
      const toast = useToast();
  
      const handleSubmit = () => {
        // 简单表单验证
        if (!form.value.name || !form.value.age || !form.value.avatar || !form.value.address || !form.value.description || (props.isNested && !form.value.adopterId)) {
          alert('Please fill in all required fields.');
          return;
        }
  
        // 构建新的宠物数据
        const newPet = {
          name: form.value.name,
          age: form.value.age,
          avatar: form.value.avatar,
          address: form.value.address,
          description: form.value.description,
        //   user: form.value.user || 'admin@example.com', // 假设有一个 user 字段
        };
  
        if (props.isNested) {
          newPet.adopterId = form.value.adopterId;
        }
  
        emit('add', newPet);
      };

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

        const storageReference = storageRef(storage, `petAvatars/${form.value.name}_${Date.now()}_${file.name}`);

        try {
          await uploadBytes(storageReference, file);
          const downloadURL = await getDownloadURL(storageReference);
          console.log(downloadURL,'=downloadURL');
          
          form.value.avatar = downloadURL;
          toast.add({ severity: 'success', summary: 'success', detail: 'The avatar is uploaded successfully.', life: 3000 });
        } catch (error) {
          console.error('Error uploading avatar:', error);
          toast.add({ severity: 'error', summary: 'error', detail: 'Failed to upload the avatar.', life: 3000 });
        }
      };
  
      return {
        form,
        handleSubmit,
        onFileSelect,
        handleStaffAvatarUpload,
      };
    },
  };
  </script>
  
  <style scoped>
  /* 根据需要添加样式 */
  </style>
  
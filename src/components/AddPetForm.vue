<!-- src/components/AddPetForm.vue -->
<template>
  <form @submit.prevent="handleSubmit" aria-labelledby="add-pet-form-heading">
      <h2 id="add-pet-form-heading" class="visually-hidden">Add Pet Form</h2>
  
      <div class="mb-3">
        <label for="name" class="form-label">
          Pet Name<span aria-hidden="true">*</span>
        </label>
        <InputText
          v-model="form.name"
          class="p-inputtext p-component"
          id="name"
          required
          aria-required="true"
          :aria-invalid="!!errors.name"
          :aria-describedby="errors.name ? 'name-error' : null"
        />
        <div v-if="errors.name" class="text-danger" id="name-error" role="alert">
          {{ errors.name }}
        </div>
      </div>
      <div class="mb-3">
        <label for="age" class="form-label">
          Age<span aria-hidden="true">*</span>
        </label>
        <InputText
          v-model="form.age"
          class="p-inputtext p-component"
          id="age"
          required
          aria-required="true"
          :aria-invalid="!!errors.age"
          :aria-describedby="errors.age ? 'age-error' : null"
        />
        <div v-if="errors.age" class="text-danger" id="age-error" role="alert">
          {{ errors.age }}
        </div>
      </div>
      <div class="mb-3">
        <label for="avatar" class="form-label">
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
          :aria-invalid="!!errors.avatar"
        />
        <Button label="Upload Avatar" @click="handleAvatarUpload" aria-label="Upload Avatar" />
        <div v-if="errors.avatar" class="text-danger" id="avatar-error" role="alert">
          {{ errors.avatar }}
        </div>
      </div>
      <div class="mb-3">
        <label for="address" class="form-label">
          Address<span aria-hidden="true">*</span>
        </label>
        <InputText
          v-model="form.address"
          class="p-inputtext p-component"
          id="address"
          required
          aria-required="true"
          :aria-invalid="!!errors.address"
          :aria-describedby="errors.address ? 'address-error' : null"
        />
        <div v-if="errors.address" class="text-danger" id="address-error" role="alert">
          {{ errors.address }}
        </div>
      </div>
      <div class="mb-3">
        <label for="description" class="form-label">
          Description<span aria-hidden="true">*</span>
        </label>
        <Textarea
          v-model="form.description"
          class="p-textarea p-component"
          id="description"
          rows="3"
          cols="30"
          required
          aria-required="true"
          :aria-invalid="!!errors.description"
          :aria-describedby="errors.description ? 'description-error' : null"
        />
        <div v-if="errors.description" class="text-danger" id="description-error" role="alert">
          {{ errors.description }}
        </div>
      </div>
      <div class="d-flex justify-end">
        <Button label="Cancel" class="p-button-text me-2" @click="$emit('close')" aria-label="Cancel" />
        <Button label="Add Pet" type="submit" class="p-button-success" aria-label="Add Pet" />
      </div>
  </form>
</template>
  
<script>
import { ref } from 'vue'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/firebase/init.js' // Use named import
import { useToast } from 'primevue/usetoast'

export default {
  props: {
    isNested: {
      type: Boolean,
      default: false, // Whether nested in Adopter document
    },
  },
  setup(props, { emit }) {
    const form = ref({
      name: '',
      age: '',
      avatar: '',
      address: '',
      description: '',
    })

    const selectedFile = ref(null) // To store the selected file
    const toast = useToast()

    const errors = ref({
      name: null,
      age: null,
      avatar: null,
      address: null,
      description: null,
    })

    const validateForm = () => {
      let valid = true
      if (!form.value.name) {
        errors.value.name = 'Please enter the pet name.'
        valid = false
      } else {
        errors.value.name = null
      }
      if (!form.value.age) {
        errors.value.age = 'Please enter the age.'
        valid = false
      } else {
        errors.value.age = null
      }
      if (!form.value.avatar) {
        errors.value.avatar = 'Please upload an avatar.'
        valid = false
      } else {
        errors.value.avatar = null
      }
      if (!form.value.address) {
        errors.value.address = 'Please enter the address.'
        valid = false
      } else {
        errors.value.address = null
      }
      if (!form.value.description) {
        errors.value.description = 'Please enter the description.'
        valid = false
      } else {
        errors.value.description = null
      }
      return valid
    }

    const handleSubmit = () => {
      if (!validateForm()) {
        return
      }

      // Build new pet data
      const newPet = {
        name: form.value.name,
        age: form.value.age,
        avatar: form.value.avatar,
        address: form.value.address,
        description: form.value.description,
      }

      emit('add', newPet)
    }

    // When user selects a file
    const onFileSelect = (event) => {
      if (event.files && event.files.length > 0) {
        selectedFile.value = event.files[0]
      }
    }
    // Handle Avatar Upload
    const handleAvatarUpload = async () => {
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
        `petAvatars/${form.value.name}_${Date.now()}_${file.name}`
      )

      try {
        await uploadBytes(storageReference, file)
        const downloadURL = await getDownloadURL(storageReference)
        form.value.avatar = downloadURL
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

    return {
      form,
      errors,
      handleSubmit,
      onFileSelect,
      handleAvatarUpload,
    }
  },
}
</script>

<style scoped>
/* Visually Hidden Class */
.visually-hidden {
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

/* Focus Styles */
button:focus,
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid #005fcc;
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

.text-danger {
  color: #dc3545;
}
</style>

<!-- EmailSender.vue -->
<template>
  <div class="email-sender">
    <h2 v-if="isBulk">Send Bulk Email</h2>
    <h2 v-else>Send Email to {{ adopters[0].name }}</h2>
    
    <!-- Display selected recipients -->
    <div v-if="isBulk" class="selected-users">
      <h3>Selected Recipients:</h3>
      <ul>
        <li v-for="adopter in adopters" :key="adopter.id">{{ adopter.email }}</li>
      </ul>
    </div>
    <form @submit.prevent="sendEmail">
      <div class="form-group">
        <label for="subject">Email Subject:</label>
        <input type="text" v-model="emailData.subject" id="subject" required />
      </div>
      <div class="form-group">
        <label for="message">Email Content:</label>
        <textarea v-model="emailData.message" id="message" required></textarea>
      </div>
      <div class="form-group">
        <label for="attachment">Add Attachment:</label>
        <input type="file" @change="handleFileChange" id="attachment" />
      </div>
      <button type="submit" class="btn btn-primary">Send Email</button>
      <button @click="closeSender" class="btn btn-secondary">Cancel</button>
    </form>
  </div>
</template>
  
  <script>
  import axios from 'axios';
  
  export default {
    props: {
      adopter: {},
      adopters: Array, // 现在接收多个 adopter
      isBulk: Boolean // 判断是否是批量邮件
    },
    data() {
      return {
        emailData: {
          subject: '',
          message: '',
          attachment: null,
        },
      };
    },
    methods: {
      handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
          this.emailData.attachment = file;
        }
      },
      async sendEmail() {
        try {
          const formData = new FormData();
          if (this.isBulk) {
            // 对于批量发送，将所有的邮箱加入
            this.adopters.forEach(adopter => {
              formData.append('to', adopter.email);
            });
          } else {
            formData.append('to', this.adopters[0].email); // 单个邮件
          }
        //   formData.append('to', this.adopter.email);
          formData.append('subject', this.emailData.subject);
          formData.append('message', this.emailData.message);
          if (this.emailData.attachment) {
            formData.append('attachment', this.emailData.attachment);
          }
  
          // 发送邮件请求到后端 API
          const response = await axios.post('http://localhost:3000/api/send-email', formData);
        //   console.log('Email sent successfully:', response.data);
          alert('Email sent successfully!')
          this.closeSender();
        } catch (error) {
          console.error('Error sending email:', error);
        }
      },
      closeSender() {
        this.$emit('close');
      },
    },
  };
  </script>
  
  <style scoped>
  .email-sender {
    border: 1px solid #ddd;
    padding: 20px;
    background-color: #f9f9f9;
  }
  .form-group {
    margin-bottom: 15px;
  }
  .btn {
    margin-right: 10px;
  }
  </style>
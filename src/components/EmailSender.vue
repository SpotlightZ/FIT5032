<!-- EmailSender.vue -->
<template>
    <div class="email-sender">
      <h2>给 {{ adopter.name }} 发送邮件</h2>
      <form @submit.prevent="sendEmail">
        <div class="form-group">
          <label for="subject">邮件主题:</label>
          <input type="text" v-model="emailData.subject" id="subject" required />
        </div>
        <div class="form-group">
          <label for="message">邮件内容:</label>
          <textarea v-model="emailData.message" id="message" required></textarea>
        </div>
        <div class="form-group">
          <label for="attachment">添加附件:</label>
          <input type="file" @change="handleFileChange" id="attachment" />
        </div>
        <button type="submit" class="btn btn-primary">发送邮件</button>
        <button @click="closeSender" class="btn btn-secondary">取消</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    props: ['adopter'],
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
          formData.append('to', this.adopter.email);
          formData.append('subject', this.emailData.subject);
          formData.append('message', this.emailData.message);
          if (this.emailData.attachment) {
            formData.append('attachment', this.emailData.attachment);
          }
  
          // 发送邮件请求到后端 API
          const response = await axios.post('http://localhost:3000/api/send-email', formData);
          console.log('Email sent successfully:', response.data);
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
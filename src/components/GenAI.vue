<template>
    <div class="chat-container">
      <h1>Pet Advisor AI Chatbot</h1>
      <div class="chat-window" ref="chatWindow">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message', message.role]"
        >
          <div class="message-content" v-html="message.html"></div>
        </div>
        <div v-if="loading" class="message model">
          <div class="message-content">
            <p>AI is typing...</p>
          </div>
        </div>
      </div>
      <form @submit.prevent="sendMessage" class="input-form">
        <input
          type="text"
          v-model="inputMessage"
          placeholder="Type your message..."
          @keyup.enter="sendMessage"
          required
        />
        <button type="submit" :disabled="loading">Send</button>
      </form>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, watch } from 'vue';
  import axios from 'axios';
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';
  
  export default {
    name: 'GenAI',
    setup() {
      const messages = ref([]);
      const inputMessage = ref('');
      const loading = ref(false);
      const error = ref('');
      const chatWindow = ref(null);
  
      // Function to convert Markdown to sanitized HTML
      const generateHTML = (markdown) => {
        const rawHTML = marked(markdown);
        const cleanHTML = DOMPurify.sanitize(rawHTML);
        return cleanHTML;
      };
  
      // Function to send message
      const sendMessage = async () => {
        const message = inputMessage.value.trim();
        if (!message) return;
  
        // Add user message to the chat
        messages.value.push({
          role: 'user',
          text: message,
          html: generateHTML(message),
        });
  
        // Clear input field
        inputMessage.value = '';
        error.value = '';
        loading.value = true;
  
        try {
          // Send message to backend API
          const response = await axios.post('http://localhost:3000/api/generate', { prompt: message });
          const aiResponse = response.data.generatedText;
  
          // Convert AI response to HTML
          const aiHTML = generateHTML(aiResponse);
  
          // Add AI response to the chat
          messages.value.push({
            role: 'model',
            text: aiResponse,
            html: aiHTML,
          });
        } catch (err) {
          console.error('Error:', err);
          error.value = err.response?.data?.error || 'An unexpected error occurred.';
        } finally {
          loading.value = false;
        }
      };
  
      // Function to scroll chat window to the bottom
      const scrollToBottom = () => {
        if (chatWindow.value) {
          chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
        }
      };
  
      // Watch for changes in messages and scroll to bottom
      watch(messages, () => {
        scrollToBottom();
      });
  
      // Add initial message on component mount
      onMounted(() => {
        const initialText = `Hello! Nice to meet you. What would you like to know?<p>eg: How to take care of a newly adopted pet？</p><p>How should I prepare my home for a new pet?</p><p>What are some important tips for training a new pet?</p>`;
        messages.value.push({
          role: 'model',
          text: initialText,
          html: generateHTML(initialText),
        });
        scrollToBottom();
      });
  
      return {
        messages,
        inputMessage,
        sendMessage,
        loading,
        error,
        chatWindow,
      };
    },
  };
  </script>
  
  <style scoped>
  .chat-container {
    max-width: 600px;
    /* margin: 0 auto; */
    padding: 20px;
    font-family: Arial, sans-serif;
  }
  
  h1 {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .chat-window {
    border: 1px solid #ccc;
    border-radius: 5px;
    height: 400px;
    padding: 10px;
    overflow-y: auto;
    background-color: #f9f9f9;
  }
  
  .message {
    display: flex;
    margin-bottom: 10px;
  }
  
  .message.user {
    justify-content: flex-end;
  }
  
  .message.model {
    justify-content: flex-start;
  }
  
  .message-content {
    max-width: 80%;
    padding: 10px;
    border-radius: 10px;
    background-color: #F9E8E7FF;
  }
  
  .message.user .message-content {
    background-color: #c8e6c9;
  }
  
  .message.model .message-content {
    background-color: #F9E8E7FF;
  }
  
  .input-form {
    display: flex;
    margin-top: 10px;
  }
  
  .input-form input {
    flex: 1;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  .input-form button {
    padding: 10px 20px;
    margin-left: 10px;
    font-size: 16px;
    background-color: #02B2D1FF;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .input-form button:disabled {
    background-color: #b0bec5;
    cursor: not-allowed;
  }
  
  .error {
    color: red;
    margin-top: 10px;
    text-align: center;
  }
  </style>
  
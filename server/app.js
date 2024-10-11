// app.js (Node.js 后端)
require('dotenv').config();

const express = require('express');
const multer = require('multer'); // 用于处理文件上传
const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // 允许跨域请求

const app = express();
const upload = multer({ dest: 'uploads/' }); // 文件上传目录
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 使用 JSON 中间件
app.use(express.json());
app.use(cors()); // 允许跨域访问

// 配置 SendGrid API Key
sgMail.setApiKey('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');

// 处理发送邮件的 POST 请求
app.post('/api/send-email', upload.single('attachment'), async (req, res) => {
  const { to, subject, message } = req.body;
  let attachment = null;

  if (req.file) {
    // 读取上传的文件并将其转换为 base64
    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    const fileData = fs.readFileSync(filePath);
    attachment = {
      content: fileData.toString('base64'),
      filename: req.file.originalname,
      type: req.file.mimetype,
      disposition: 'attachment',
    };
  }

  const msg = {
    to,
    from: 'dd.zheng.other@outlook.com', // 发件人邮箱，必须是已验证的 SendGrid 邮箱
    subject,
    text: message,
    html: `<p>${message}</p>`,
    attachments: attachment ? [attachment] : [],
  };

  try {
    await sgMail.send(msg);
    res.status(200).send({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ error: 'Failed to send email' });
  }
});

// 生成文本的 API 端点
app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt parameter' });
  }

  try {
    // 使用您提供的代码初始化 Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Hello" }],
        },
        {
          role: "model",
          parts: [{ text: "Great to meet you. What would you like to know?" }],
        },
      ],
    });
    let result = await chat.sendMessage(prompt);
    const generatedText = result.response.text();

    res.json({ generatedText });
  } catch (error) {
    console.error('Error communicating with Gemini API:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});


// 监听端口
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
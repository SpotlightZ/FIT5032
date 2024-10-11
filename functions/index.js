/* eslint-disable no-undef */
/* eslint-disable max-len */
/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

admin.initializeApp();

const db = admin.firestore();

const GEMINI_API_KEY = functions.config().gemini.key;


exports.saveFormData = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // 处理 OPTIONS 请求
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET, POST");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      res.set("Access-Control-Max-Age", "3600");
      return res.status(204).send("");
    }

    // 检查请求方法是否为 POST
    if (req.method !== "POST") {
      res.set("Access-Control-Allow-Origin", "*");
      return res.status(405).send("Method Not Allowed");
    }

    try {
      const data = req.body;

      // 验证必填字段（可根据需求调整）
      const requiredFields = ["email", "firstname", "gender", "lastname", "reason", "user", "suburb"];
      for (const field of requiredFields) {
        if (!data[field]) {
          return res.status(400).send({message: `Missing field: ${field}`});
        }
      }

      // 生成新的文档引用，自动生成 id
      const newDocRef = admin.firestore().collection("formSubmissions").doc();
      const generatedId = newDocRef.id;

      // 准备新数据，添加 id 和 status 字段
      const newData = {
        ...data,
        id: generatedId,
        isAustralian: data.isAustralian ? data.isAustralian: false,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // 保存新文档到 Firestore
      await newDocRef.set(newData);

      res.set("Access-Control-Allow-Origin", "*");
      res.status(200).send({message: "Data saved successfully!", id: generatedId});
    } catch (error) {
      console.error("Error saving form data: ", error);
      res.status(500).send({message: "Error saving form data", error: error.message});
    }
  });
});


exports.getFormData = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // 检查请求方法是否为 GET
    if (req.method !== "GET") {
      return res.status(405).send("Method Not Allowed");
    }

    try {
      // eslint-disable-next-line max-len
      const snapshot = await admin.firestore().collection("formSubmissions").get();
      const data = [];
      snapshot.forEach((doc) => {
        data.push({id: doc.id, ...doc.data()});
      });
      res.status(200).send(data);
    } catch (error) {
      console.error("Error fetching form data: ", error);
      res.status(500).send("Error fetching form data");
    }
  });
});

exports.checkUserExists = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const {email} = req.body;

  try {
    const snapshot = await admin.firestore().collection("formSubmissions")
        .where("user", "==", email)
        .limit(1)
        .get();

    const exists = !snapshot.empty;
    res.status(200).send({exists});
  } catch (error) {
    console.error("Error checking user: ", error);
    res.status(500).send("Error checking user");
  }
});

exports.getUserData = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  const {email} = req.body;

  try {
    const snapshot = await admin.firestore().collection("formSubmissions")
        .where("user", "==", email)
        .get();

    if (snapshot.empty) {
      return res.status(404).send("User not found");
    }

    const userData = [];
    snapshot.forEach((doc) => {
      userData.push({id: doc.id, ...doc.data()});
    });

    res.status(200).send(userData);
  } catch (error) {
    console.error("Error fetching user data: ", error);
    res.status(500).send("Error fetching user data");
  }
});


exports.generateText = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method !== "POST") {
      return res.status(405).json({error: "Method not allowed"});
    }

    const {prompt} = req.body;

    if (!prompt) {
      return res.status(400).json({error: "Prompt is required"});
    }

    try {
      // eslint-disable-next-line no-undef
      const response = await axios.post(
          "https://api.gemini.google.com/v1/generate", // Replace with actual Gemini API endpoint
          {
            prompt: prompt,
            max_tokens: 150, // Example parameter
            temperature: 0.7, // Example parameter
          // Add other necessary parameters as per Gemini API documentation
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${GEMINI_API_KEY}`,
            },
          },
      );

      // eslint-disable-next-line max-len
      const generatedText = response.data.text; // Adjust based on actual response structure
      return res.status(200).json({generatedText});
    } catch (error) {
      // eslint-disable-next-line max-len
      console.error("Error communicating with Gemini API:", error.response ? error.response.data : error.message);
      return res.status(500).json({error: "Failed to generate text"});
    }
  });
});


exports.getStaff = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const snapshot = await db.collection("staff").get();
      const staffList = [];
      snapshot.forEach((doc) => {
        staffList.push({id: doc.id, ...doc.data()});
      });
      res.status(200).json(staffList);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).send("Internal Server Error");
    }
  });
});

// Pets
exports.addPet = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // 处理 OPTIONS 请求
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET, POST");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      res.set("Access-Control-Max-Age", "3600");
      return res.status(204).send("");
    }

    // 检查请求方法是否为 POST
    if (req.method !== "POST") {
      res.set("Access-Control-Allow-Origin", "*");
      return res.status(405).send("Method Not Allowed");
    }

    try {
      const data = req.body;

      // 验证必填字段（根据实际需求调整）
      const requiredFields = ["name", "age", "address", "description"];
      for (const field of requiredFields) {
        if (!data[field]) {
          return res.status(400).send({message: `Missing field: ${field}`});
        }
      }

      // 生成新的文档引用，自动生成 id
      const newDocRef = admin.firestore().collection("pets").doc();
      const generatedId = newDocRef.id;

      // 准备新数据，添加 id、status 和 createdAt 字段
      const newData = {
        ...data,
        id: generatedId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // 保存新文档到 Firestore
      await newDocRef.set(newData);

      res.set("Access-Control-Allow-Origin", "*");
      res.status(200).send({message: "Pet added successfully!", id: generatedId});
    } catch (error) {
      console.error("Error adding pet: ", error);
      res.status(500).send({message: "Error adding pet", error: error.message});
    }
  });
});

exports.getPets = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // 处理 OPTIONS 请求
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      res.set("Access-Control-Max-Age", "3600");
      return res.status(204).send("");
    }

    // 检查请求方法是否为 GET
    if (req.method !== "GET") {
      res.set("Access-Control-Allow-Origin", "*");
      return res.status(405).send("Method Not Allowed");
    }

    try {
      const petsSnapshot = await admin.firestore().collection("pets").get();
      const pets = petsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : null,
      }));

      res.set("Access-Control-Allow-Origin", "*");
      res.status(200).send({pets});
    } catch (error) {
      console.error("Error fetching pets: ", error);
      res.status(500).send({message: "Error fetching pets", error: error.message});
    }
  });
});

// 创建 deletePet Function
exports.deletePet = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // 处理 OPTIONS 请求
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "DELETE, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      res.set("Access-Control-Max-Age", "3600");
      return res.status(204).send("");
    }

    // 确保请求方法为 DELETE
    if (req.method !== "DELETE") {
      res.set("Access-Control-Allow-Origin", "*");
      return res.status(405).send("Method Not Allowed");
    }

    try {
      const {petId} = req.query;

      if (!petId) {
        return res.status(400).send({message: "Missing parameter: petId"});
      }

      const petRef = admin.firestore().collection("pets").doc(petId);
      const petDoc = await petRef.get();

      if (!petDoc.exists) {
        return res.status(404).send({message: "Pet not found"});
      }

      await petRef.delete();

      res.set("Access-Control-Allow-Origin", "*");
      res.status(200).send({message: "Pet deleted successfully!"});
    } catch (error) {
      console.error("Error deleting pet: ", error);
      res.status(500).send({message: "Error deleting pet", error: error.message});
    }
  });
});


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

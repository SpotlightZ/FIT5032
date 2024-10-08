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
      return res.status(405).send("Method Not Allowed");
    }

    try {
      const data = req.body;
      await admin.firestore().collection("formSubmissions").add(data);
      res.set("Access-Control-Allow-Origin", "*");
      res.status(200).send({message: "Data saved successfully!"});
    } catch (error) {
      console.error("Error saving form data: ", error);
      res.status(500).send("Error saving form data");
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

// 云函数：获取所有预约数据
exports.getAppointments = functions.https.onRequest(async (_req, res) => {
  try {
    const snapshot = await db.collection("appointments").get();
    const appointments = snapshot.docs.map((doc) => doc.data());
    res.status(200).send(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).send("Error fetching appointments");
  }
});

// 云函数：预约处理逻辑
exports.bookAppointment = functions.https.onRequest(async (req, res) => {
  const {firstname, lastname, email, date} = req.body;

  try {
    // 检查是否有冲突的预约
    const existingAppointments = await db.collection("appointments")
        .where("date", "==", date)
        .get();

    if (!existingAppointments.empty) {
      // eslint-disable-next-line max-len
      return res.status(400).send({message: "This time slot is already booked!"});
    }

    // 保存新的预约
    await db.collection("appointments").add({
      firstname,
      lastname,
      email,
      date,
    });

    res.status(200).send({message: "Appointment booked successfully!"});
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).send("Error booking appointment");
  }
});
// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

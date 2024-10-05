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

exports.saveFormData = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const data = req.body;
      // 将数据保存到 Firestore 的 "formSubmissions" 集合中
      await admin.firestore().collection("formSubmissions").add(data);
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
// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Inisialisasi Firebase Admin SDK hanya jika belum ada instance
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountJson) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON belum diset di environment variable');
}

const serviceAccount = JSON.parse(serviceAccountJson);

// Inisialisasi Firebase Admin SDK jika belum ada
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Endpoint untuk menerima data history dari ESP32
app.post("/api/history", async (req, res) => {
  try {
    const { uid, debit, volume, waktu } = req.body;

    if (!uid || debit == null || volume == null) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    let dateObj;
    if (waktu) {
      dateObj = new Date(waktu.replace(" ", "T"));
    } else {
      dateObj = new Date();
    }

    const timestamp = admin.firestore.Timestamp.fromDate(dateObj);

    const historyRef = db.collection("history").doc(uid).collection("data");

    await historyRef.add({
      debit,
      volume,
      timestamp,
    });

    console.log(`✓ History disimpan untuk UID: ${uid}, Waktu: ${dateObj.toISOString()}`);
    res.status(200).json({ message: "Data history berhasil disimpan" });
  } catch (error) {
    console.error("✗ Gagal simpan history:", error);
    res.status(500).json({ error: "Gagal menyimpan data history" });
  }
});

// Export sebagai handler serverless
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;

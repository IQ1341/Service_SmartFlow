const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Inisialisasi Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Endpoint menerima data history dari ESP32
app.post("/api/history", async (req, res) => {
  try {
    const { uid, debit, volume, waktu } = req.body;

    if (!uid || debit == null || volume == null) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    // Gunakan waktu dari ESP jika tersedia, jika tidak gunakan waktu server
    let dateObj;
    if (waktu) {
      // Contoh waktu: "2025-06-14 23:55:02"
      dateObj = new Date(waktu.replace(" ", "T")); // ubah ke format ISO
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

// Jalankan server
app.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`);
});

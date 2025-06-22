const { db, admin } = require("../firebase");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { uid, pesan, level, waktu, judul } = req.body;

  if (!uid || !pesan || !level || !waktu) {
    return res.status(400).json({
      error: "Field uid, pesan, level, waktu wajib diisi",
    });
  }

  try {
    // Konversi string waktu ke Firestore Timestamp
    let dateObj;
    try {
      dateObj = new Date(waktu.replace(" ", "T"));
    } catch (e) {
      console.warn("Gagal parse waktu, gunakan serverTimestamp");
    }

    const timestamp = dateObj instanceof Date && !isNaN(dateObj)
      ? admin.firestore.Timestamp.fromDate(dateObj)
      : admin.firestore.FieldValue.serverTimestamp();

    // Struktur: /notifikasi/{uid}/data/{autoId}
    const notifRef = db.collection("notifikasi").doc(uid).collection("data");

    await notifRef.add({
      pesan,
      level,
      waktu,
      judul: judul || "Notifikasi", // optional field
      timestamp,
    });

    return res.status(200).json({
      success: true,
      message: "Notifikasi berhasil disimpan",
    });
  } catch (err) {
    console.error("✗ Gagal menyimpan notifikasi:", err);
    return res.status(500).json({
      error: "Gagal menyimpan notifikasi",
      detail: err.message,
    });
  }
};

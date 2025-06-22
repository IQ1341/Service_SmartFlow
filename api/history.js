const { db, admin } = require("./firebase");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { uid, debit, volume, waktu } = req.body;

  if (!uid || debit === undefined || volume === undefined || !waktu) {
    return res.status(400).json({
      error: "Field uid, debit, volume, dan waktu wajib diisi",
    });
  }

  try {
    // Konversi waktu ke Firestore Timestamp
    let dateObj;
    try {
      dateObj = new Date(waktu.replace(" ", "T"));
    } catch (e) {
      console.warn("Gagal parse waktu, gunakan serverTimestamp");
    }

    const timestamp = dateObj instanceof Date && !isNaN(dateObj)
      ? admin.firestore.Timestamp.fromDate(dateObj)
      : admin.firestore.FieldValue.serverTimestamp();

    // Struktur: /history/{uid}/data/{autoID}
    const historyRef = db.collection("history").doc(uid).collection("data");

    await historyRef.add({
      debit,
      volume,
      waktu,
      timestamp,
    });

    return res.status(200).json({
      success: true,
      message: "History berhasil disimpan",
    });
  } catch (err) {
    console.error("Gagal menyimpan history:", err);
    return res.status(500).json({
      error: "Gagal menyimpan history",
      detail: err.message,
    });
  }
};

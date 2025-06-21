const { db, admin } = require("../firebase");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { uid, pesan, level, waktu } = req.body;

  if (!uid || !pesan || !level || !waktu) {
    return res.status(400).json({ error: "Field uid, pesan, level, waktu wajib diisi" });
  }

  try {
    await db.collection("notifikasi").add({
      uid,
      pesan,
      level,
      waktu,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ success: true, message: "Notifikasi berhasil disimpan" });
  } catch (err) {
    return res.status(500).json({ error: "Gagal menyimpan notifikasi", detail: err.message });
  }
};

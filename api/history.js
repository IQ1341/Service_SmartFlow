const { db, admin } = require("../firebase");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { uid, debit, volume, waktu } = req.body;

  if (!uid || debit === undefined || volume === undefined || !waktu) {
    return res.status(400).json({ error: "Field uid, debit, volume, waktu wajib diisi" });
  }

  try {
    await db.collection("history").add({
      uid,
      debit,
      volume,
      waktu,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ success: true, message: "History berhasil disimpan" });
  } catch (err) {
    return res.status(500).json({ error: "Gagal menyimpan history", detail: err.message });
  }
};

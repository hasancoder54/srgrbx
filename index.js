
const fetch = require("node-fetch");

module.exports = async (req, res) => {
  try {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Sadece GET isteği kabul edilir." });
      return;
    }

    const username = req.query.username;

    // Ana sayfadaysa kullanıcıya bilgi ver
    if (!username) {
      res.status(200).json({
        message: "RBX HSnap API",
        usage: "/api?username=RobloxKullaniciAdi",
        example: "https://abc-one-mocha.vercel.app/api?username=builderman"
      });
      return;
    }

    // Kullanıcı ID’sini al
    const searchResponse = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: true }),
    });

    if (!searchResponse.ok) {
      res.status(500).json({ error: "Roblox API bağlantı hatası." });
      return;
    }

    const searchData = await searchResponse.json();
    if (!searchData.data || searchData.data.length === 0) {
      res.status(404).json({ error: "Kullanıcı bulunamadı." });
      return;
    }

    const userId = searchData.data[0].id;

    // Kullanıcı detayları
    const detailsResponse = await fetch(\`https://users.roblox.com/v1/users/\${userId}\`);
    if (!detailsResponse.ok) {
      res.status(500).json({ error: "Kullanıcı bilgileri alınamadı." });
      return;
    }

    const details = await detailsResponse.json();
    const avatarUrl = \`https://tr.rbxcdn.com/30DAY-AvatarHeadshot-\${userId}-Png/150/150/AvatarHeadshot/Webp/noFilter\`;

    res.status(200).json({
      id: userId,
      username: details.name || username,
      display_name: details.displayName || details.name || username,
      created: details.created,
      description: details.description || null,
      avatar: avatarUrl,
    });

  } catch (error) {
    res.status(500).json({ error: `Hata oluştu: ${error.message}` });
  }
};

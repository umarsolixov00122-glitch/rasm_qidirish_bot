const express = require("express");
const axios = require("axios");

const app = express();

app.get("/imge", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.json({
      status: false,
      message: "Qidiruv yozing! ?q=cat"
    });
  }

  try {
    // 1. Token olish
    const html = await axios.get("https://duckduckgo.com/", {
      params: { q: query },
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const match = html.data.match(/vqd=([\d-]+)/);

    if (!match) {
      return res.json({ status: false, message: "Token olinmadi" });
    }

    const vqd = match[1];

    // 2. Rasm olish
    const response = await axios.get("https://duckduckgo.com/i.js", {
      params: {
        l: "us-en",
        o: "json",
        q: query,
        vqd: vqd
      },
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://duckduckgo.com/"
      }
    });

    const images = [];

    if (response.data.results) {
      for (let img of response.data.results) {
        images.push(img.image);
      }
    }

    res.json({
      status: true,
      query: query,
      count: images.length,
      images: images.slice(0, 10)
    });

  } catch (err) {
    res.json({ status: false, message: "Xatolik yuz berdi" });
  }
});

app.listen(3000, () => {
  console.log("API ishlayapti: http://localhost:3000/imge");
});
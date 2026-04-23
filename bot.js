const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = "8238916616:AAG6R__2i9JuK7RY2tYdy1b-hPIV5klMRbk"; 
const admin = 7721754142;
const api = "http://localhost:3000/imge"; 

const bot = new TelegramBot(token, { polling: true });


let steps = {};
let users = new Set();


async function translate(text) {
  try {
    const res = await axios.get("https://translate.googleapis.com/translate_a/single", {
      params: {
        client: "gtx",
        sl: "auto",
        tl: "en",
        dt: "t",
        q: text
      }
    });
    return res.data[0][0][0];
  } catch {
    return text;
  }
}


bot.onText(/\/start/, (msg) => {
  const cid = msg.chat.id;
  steps[cid] = "none";
  users.add(cid);

  if (cid == admin) {
    bot.sendMessage(cid, "👑 Admin panel", {
      reply_markup: {
        keyboard: [
          ["🔎 Rasm qidirish"],
          ["📊 Statistika", "📨 Xabar yuborish"]
        ],
        resize_keyboard: true
      }
    });
  } else {
    bot.sendMessage(cid, "👋 Salom!", {
      reply_markup: {
        keyboard: [["🔎 Rasm qidirish"]],
        resize_keyboard: true
      }
    });
  }
});


bot.on("message", async (msg) => {
  const cid = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  users.add(cid);
  if (!steps[cid]) steps[cid] = "none";

  if (text === "🔎 Rasm qidirish") {
    steps[cid] = "search";
    return bot.sendMessage(cid, "✍️ Qidiruv yoz:");
  }

  if (text === "📊 Statistika" && cid == admin) {
    return bot.sendMessage(cid, `👥 Userlar soni: ${users.size}`);
  }
  if (text === "📨 Xabar yuborish" && cid == admin) {
    steps[cid] = "send";
    return bot.sendMessage(cid, "✍️ Xabar yoz:");
  }

  if (steps[cid] === "send" && cid == admin) {
    for (let user of users) {
      bot.sendMessage(user, text);
    }
    steps[cid] = "none";
    return bot.sendMessage(cid, "✅ Yuborildi");
  }

  if (steps[cid] === "search") {
    const en = await translate(text);

    bot.sendMessage(cid, `🔎 Qidirilmoqda: ${en}`);

    try {
      const { data } = await axios.get(api, {
        params: { q: en }
      });

      if (data.images && data.images.length > 0) {
        for (let img of data.images.slice(0, 5)) {
          await bot.sendPhoto(cid, img);
        }
      } else {
        bot.sendMessage(cid, "❌ Topilmadi");
      }
    } catch (e) {
      bot.sendMessage(cid, "❌ API ishlamayapti");
    }

    steps[cid] = "none";
  }
});
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.get("/", (_, res) => {
  res.send(`<a href="https://us.merchantos.com/oauth/authorize.php?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&scope=inventory:all">Login with Lightspeed</a>`);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing ?code");

  try {
    const result = await axios.post("https://cloud.lightspeedapp.com/oauth/access_token.php", new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: process.env.REDIRECT_URI
    }));

    console.log("Tokens:", result.data);
    res.send("✅ Tokens received! Check logs.");
  } catch (err) {
    console.error("Error exchanging code:", err.response?.data || err.message);
    res.status(500).send("Failed to exchange token");
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

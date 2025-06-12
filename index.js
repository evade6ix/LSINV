// index.js
import express from "express"
import axios from "axios"
import dotenv from "dotenv"
dotenv.config()

const app = express()

app.get("/", (_, res) => {
  res.send("✅ Lightspeed Sync Server Running")
})

app.get("/callback", async (req, res) => {
  const code = req.query.code
  if (!code) return res.status(400).send("❌ Missing ?code")

  try {
    const result = await axios.post("https://cloud.lightspeedapp.com/oauth/access_token.php",
      new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: "https://lsinv-production.up.railway.app/callback"
      })
    )

    console.log("✅ NEW TOKENS:", result.data)
    res.send("✅ Tokens received! Check Railway logs.")

  } catch (err) {
    console.error("❌ Token exchange failed:", err.response?.data || err.message)
    res.status(500).send("❌ Token exchange failed. Check logs.")
  }
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log("🚀 Server listening on port " + PORT)
})

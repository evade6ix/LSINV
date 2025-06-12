// index.js (or wherever your callback route lives)
import express from "express"
import axios from "axios"
import dotenv from "dotenv"
dotenv.config()

const app = express()

app.get("/callback", async (req, res) => {
  const code = req.query.code
  if (!code) return res.status(400).send("Missing ?code")

  try {
    const params = new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: process.env.REDIRECT_URI,
    })

    const response = await axios.post(
      "https://cloud.lightspeedapp.com/oauth/access_token.php",
      params.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    )

    console.log("✅ Token exchange success:", response.data)
    // You can save tokens here to DB or environment
    res.send("✅ Tokens received! Check logs.")
  } catch (err) {
    console.error("❌ Token exchange failed:", err.response?.data || err.message)
    res.status(500).send("❌ Failed to exchange token. Check logs.")
  }
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})

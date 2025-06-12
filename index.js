import express from "express"
import axios from "axios"
import dotenv from "dotenv"
dotenv.config()

const app = express()

// Root route: shows login link with properly encoded redirect_uri
app.get("/", (req, res) => {
  const redirectUri = encodeURIComponent(process.env.REDIRECT_URI)
  const oauthUrl = `https://us.merchantos.com/oauth/authorize.php?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&scope=employee:register%20employee:inventory_read`
  res.send(`
    <h1>Lightspeed OAuth Demo</h1>
    <p><a href="${oauthUrl}">Login with Lightspeed</a></p>
  `)
})

// OAuth callback: exchange code for tokens
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
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    )

    console.log("✅ Token exchange success:", response.data)
    res.send(`
      <h1>Tokens received!</h1>
      <pre>${JSON.stringify(response.data, null, 2)}</pre>
      <p>Check your server logs for details.</p>
    `)
  } catch (err) {
    console.error("❌ Token exchange failed:", err.response?.data || err.message)
    res.status(500).send("❌ Failed to exchange token. Check logs.")
  }
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})

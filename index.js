import express from "express"
import axios from "axios"
import dotenv from "dotenv"
import { MongoClient } from "mongodb"
dotenv.config()

const app = express()

// Helper to connect to MongoDB
let mongoClient
async function getDb() {
  if (!mongoClient) {
    mongoClient = new MongoClient(process.env.MONGO_URI)
    await mongoClient.connect()
  }
  return mongoClient.db("lightspeed")
}

// Root route: shows login link with properly encoded redirect_uri
app.get("/", (req, res) => {
  const redirectUri = encodeURIComponent(process.env.REDIRECT_URI)
  const oauthUrl = `https://us.merchantos.com/oauth/authorize.php?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&scope=employee:register%20employee:inventory_read`
  res.send(`
    <h1>Lightspeed OAuth Demo</h1>
    <p><a href="${oauthUrl}">Login with Lightspeed</a></p>
  `)
})

// OAuth callback: exchange code for tokens and save to MongoDB
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

    const tokens = response.data
    console.log("✅ Token exchange success:", tokens)

    // Save tokens to MongoDB
    const db = await getDb()
    const tokensCollection = db.collection("tokens")

    await tokensCollection.updateOne(
      { account_id: tokens.account_id },
      {
        $set: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in,
          scope: tokens.scope,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    )

    res.send(`
      <h1>Tokens received and saved to DB!</h1>
      <pre>${JSON.stringify(tokens, null, 2)}</pre>
      <p>Check your server logs and database.</p>
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

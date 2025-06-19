import axios from "axios"
import dotenv from "dotenv"
dotenv.config()

async function exchangeCodeForTokens() {
  try {
    const response = await axios.post("https://cloud.lightspeedapp.com/auth/oauth/token", {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "authorization_code",
      code: process.env.AUTH_CODE,
      redirect_uri: process.env.REDIRECT_URI
    })

    console.log("✅ Access Token:", response.data.access_token)
    console.log("🔁 Refresh Token:", response.data.refresh_token)
  } catch (err) {
    console.error("❌ Failed to exchange token.")
    console.error("🔍 Error details:", err.response?.data || err.message)
  }
}

exchangeCodeForTokens()

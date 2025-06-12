import axios from "axios"
import dotenv from "dotenv"
dotenv.config()

let accessToken = process.env.ACCESS_TOKEN || null

async function refreshAccessToken() {
  try {
    const res = await axios.post(
      "https://cloud.lightspeedapp.com/oauth/access_token.php",
      new URLSearchParams({
        refresh_token: process.env.REFRESH_TOKEN,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "refresh_token"
      })
    )
    accessToken = res.data.access_token
    console.log("✅ Refreshed Access Token")
    return accessToken
  } catch (err) {
    console.error("❌ Failed to refresh token:", err.response?.data || err.message)
    throw err
  }
}

async function fetchProducts(page = 0, limit = 100) {
  if (!accessToken) await refreshAccessToken()

  const offset = page * limit
  try {
    const res = await axios.get(
      `https://api.lightspeedapp.com/API/Account/${process.env.ACCOUNT_ID}/Item.json?limit=${limit}&offset=${offset}&load_relations=["ItemShops"]`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    )

    return res.data.Item ? (Array.isArray(res.data.Item) ? res.data.Item : [res.data.Item]) : []
  } catch (err) {
    if (err.response?.status === 401) {
      console.warn("🔁 Token expired, refreshing...")
      await refreshAccessToken()
      return fetchProducts(page, limit)
    } else {
      throw err
    }
  }
}

export { fetchProducts, refreshAccessToken }

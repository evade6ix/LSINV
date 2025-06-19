import axios from "axios"
import dotenv from "dotenv"
dotenv.config()

let accessToken = null

async function refreshAccessToken() {
  try {
    const response = await axios.post("https://cloud.lightspeedapp.com/auth/oauth/token", {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      refresh_token: process.env.REFRESH_TOKEN,
      grant_type: "refresh_token"
    })

    accessToken = response.data.access_token
    console.log("✅ Access token refreshed")
    return accessToken
  } catch (err) {
    console.error("❌ Failed to refresh access token:", err.response?.data || err.message)
    throw err
  }
}

async function fetchAllProducts() {
  if (!accessToken) await refreshAccessToken()

  const allProducts = []
  let url = `https://api.lightspeedapp.com/API/V3/Account/${process.env.ACCOUNT_ID}/Item.json?limit=100&sort=itemID&load_relations=["ItemShops"]`

  while (url) {
    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json"
        }
      })

      const items = res.data.Item
      const attributes = res.data["@attributes"]

      if (items) {
        const productArray = Array.isArray(items) ? items : [items]
        allProducts.push(...productArray)
        console.log(`📦 Loaded ${productArray.length} items (${allProducts.length} total so far)`)
      }

      url = attributes?.next || null
    } catch (err) {
      if (err.response?.status === 401) {
        console.warn("🔁 Token expired, refreshing...")
        await refreshAccessToken()
      } else {
        console.error("❌ Error fetching products:", err.response?.data || err.message)
        break
      }
    }
  }

  return allProducts
}

export { fetchAllProducts, refreshAccessToken }

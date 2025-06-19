import { fetchAllProducts } from "./lightspeed.js"

async function test() {
  try {
    const products = await fetchAllProducts()
    console.log(`✅ Success! Fetched ${products.length} products.`)
    console.log("🔎 Sample product:", products[0])
  } catch (err) {
    console.error("❌ Lightspeed API test failed:", err.response?.data || err.message)
  }
}

test()

import { MongoClient } from "mongodb"
import dotenv from "dotenv"
import { fetchProducts } from "./lightspeed.js"

dotenv.config()

const MONGO_URI = process.env.MONGO_URI
const DB_NAME = "lightspeed"
const COLLECTION = "products"
const YEAR_FILTER = ["2025", "2026"]

export async function runSync() {
  const client = new MongoClient(MONGO_URI)
  await client.connect()
  const db = client.db(DB_NAME)
  const col = db.collection(COLLECTION)

  let page = 0
  const limit = 100
  let total = 0
  let inserted = 0
  let updated = 0

  console.log("🚀 Starting product sync...")

  while (true) {
    const products = await fetchProducts(page, limit)
    if (!products.length) break

    for (const item of products) {
      const createdAt = item.timeStamp || ""
      if (!YEAR_FILTER.some((year) => createdAt.includes(year))) continue

      const query = { itemID: item.itemID }
      const update = {
        $set: {
          customSku: item.customSku,
          systemSku: item.systemSku,
          name: item.description,
          createdAt,
          lastSynced: new Date(),
          rawData: { fromLightspeed: item }
        }
      }
      const options = { upsert: true }
      const result = await col.updateOne(query, update, options)
      if (result.upsertedCount) inserted++
      else if (result.modifiedCount) updated++
      total++
    }

    console.log(`📦 Page ${page + 1}: Processed ${products.length}, Total synced: ${total}`)
    page++
  }

  console.log(`✅ Sync complete — ${inserted} inserted, ${updated} updated`)
  await client.close()
}

import { MongoClient } from "mongodb"
import dotenv from "dotenv"
dotenv.config()

let client
let db

export async function getDb() {
  if (db) return db
  client = new MongoClient(process.env.MONGO_URI)
  await client.connect()
  db = client.db("lightspeed")
  return db
}

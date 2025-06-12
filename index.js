import cron from 'node-cron'
import { runSync } from './syncLightspeed.js'

console.log("🔁 Sync job initialized.")

cron.schedule('0 */6 * * *', async () => {
  console.log("⏱️ Running Lightspeed sync at", new Date().toISOString())
  await runSync()
})

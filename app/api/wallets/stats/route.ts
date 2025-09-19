import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0]

    const [totalWallets, todayWallets, lastGenerated, walletIds] = await Promise.all([
      redis.get("stats:total_wallets") || 0,
      redis.get(`stats:daily:${today}`) || 0,
      redis.get("stats:last_generated"),
      redis.smembers("wallet:ids"),
    ])

    // 估算数据库大小（简单估算）
    const walletCount = Array.isArray(walletIds) ? walletIds.length : 0
    const estimatedSize = walletCount * 0.5 // 每个钱包约0.5KB
    const databaseSize =
      estimatedSize > 1024 ? `${(estimatedSize / 1024).toFixed(1)} MB` : `${estimatedSize.toFixed(0)} KB`

    return NextResponse.json({
      totalWallets: Number(totalWallets) || 0,
      todayWallets: Number(todayWallets) || 0,
      databaseSize,
      lastGenerated: lastGenerated as string | null,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "获取统计信息失败" }, { status: 500 })
  }
}

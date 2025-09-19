import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET() {
  try {
    // 获取所有钱包ID
    const walletIds = (await redis.smembers("wallet:ids")) as string[]

    if (!walletIds || walletIds.length === 0) {
      return NextResponse.json({ wallets: [] })
    }

    // 获取所有钱包数据
    const wallets = []
    for (const id of walletIds) {
      const walletData = await redis.hgetall(`wallet:${id}`)
      if (walletData && Object.keys(walletData).length > 0) {
        wallets.push(walletData)
      }
    }

    // 按创建时间排序（最新的在前）
    wallets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ wallets })
  } catch (error) {
    console.error("Error fetching wallets:", error)
    return NextResponse.json({ error: "获取钱包列表失败" }, { status: 500 })
  }
}

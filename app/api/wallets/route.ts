import { type NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function POST(request: NextRequest) {
  try {
    const { wallets } = await request.json()

    // 生成批次ID
    const batchId = `batch_${Date.now()}`

    // 保存钱包批次信息
    await redis.hset(`wallets:${batchId}`, {
      createdAt: new Date().toISOString(),
      count: wallets.length,
      wallets: JSON.stringify(wallets),
    })

    // 添加到批次列表
    await redis.lpush("wallet_batches", batchId)

    return NextResponse.json({
      success: true,
      batchId,
      message: `成功保存 ${wallets.length} 个钱包到数据库`,
    })
  } catch (error) {
    console.error("保存钱包失败:", error)
    return NextResponse.json({ success: false, message: "保存钱包失败" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // 获取所有批次ID
    const batchIds = await redis.lrange("wallet_batches", 0, -1)

    const batches = []
    for (const batchId of batchIds) {
      const batchData = await redis.hgetall(`wallets:${batchId}`)
      if (batchData) {
        batches.push({
          id: batchId,
          createdAt: batchData.createdAt,
          count: batchData.count,
          wallets: JSON.parse(batchData.wallets as string),
        })
      }
    }

    return NextResponse.json({ success: true, batches })
  } catch (error) {
    console.error("获取钱包失败:", error)
    return NextResponse.json({ success: false, message: "获取钱包失败" }, { status: 500 })
  }
}

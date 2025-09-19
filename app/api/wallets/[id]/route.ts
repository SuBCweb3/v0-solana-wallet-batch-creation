import { type NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const walletId = params.id

    // 检查钱包是否存在
    const walletExists = await redis.hexists(`wallet:${walletId}`, "id")
    if (!walletExists) {
      return NextResponse.json({ error: "钱包不存在" }, { status: 404 })
    }

    // 删除钱包数据
    await redis.del(`wallet:${walletId}`)
    await redis.srem("wallet:ids", walletId)

    // 更新统计信息
    await redis.decr("stats:total_wallets")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting wallet:", error)
    return NextResponse.json({ error: "删除钱包失败" }, { status: 500 })
  }
}

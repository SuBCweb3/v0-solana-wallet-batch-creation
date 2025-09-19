import { type NextRequest, NextResponse } from "next/server"
import { Keypair } from "@solana/web3.js"
import { generateMnemonic, mnemonicToSeedSync } from "bip39"
import { derivePath } from "ed25519-hd-key"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

interface WalletData {
  id: string
  publicKey: string
  privateKey: string
  mnemonic: string
  prefix?: string
  createdAt: string
}

function generateSolanaWallet(mnemonic?: string): {
  publicKey: string
  privateKey: string
  mnemonic: string
} {
  const walletMnemonic = mnemonic || generateMnemonic()
  const seed = mnemonicToSeedSync(walletMnemonic)
  const derivedSeed = derivePath("m/44'/501'/0'/0'", seed.toString("hex")).key
  const keypair = Keypair.fromSeed(derivedSeed)

  return {
    publicKey: keypair.publicKey.toBase58(),
    privateKey: Buffer.from(keypair.secretKey).toString("base64"),
    mnemonic: walletMnemonic,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { count, prefix } = await request.json()

    if (!count || count < 1 || count > 100) {
      return NextResponse.json({ error: "批量大小必须在 1-100 之间" }, { status: 400 })
    }

    const wallets: WalletData[] = []
    const createdAt = new Date().toISOString()

    // 生成钱包
    for (let i = 0; i < count; i++) {
      const wallet = generateSolanaWallet()
      const walletId = `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const walletData: WalletData = {
        id: walletId,
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic,
        prefix: prefix || undefined,
        createdAt,
      }

      wallets.push(walletData)

      // 保存到 Redis
      await redis.hset(`wallet:${walletId}`, walletData)
      await redis.sadd("wallet:ids", walletId)
    }

    // 更新统计信息
    await redis.incrby("stats:total_wallets", count)
    await redis.incrby(`stats:daily:${new Date().toISOString().split("T")[0]}`, count)
    await redis.set("stats:last_generated", createdAt)

    return NextResponse.json({
      success: true,
      wallets: wallets.map((w) => ({
        id: w.id,
        publicKey: w.publicKey,
        prefix: w.prefix,
        createdAt: w.createdAt,
      })),
    })
  } catch (error) {
    console.error("Error generating wallets:", error)
    return NextResponse.json({ error: "生成钱包时发生错误" }, { status: 500 })
  }
}

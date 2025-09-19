import { WalletGenerator } from "@/components/wallet-generator"
import { WalletList } from "@/components/wallet-list"
import { StatsCards } from "@/components/stats-cards"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">Solana 钱包批量生成器</h1>
          <p className="text-muted-foreground text-lg">批量创建 Solana 钱包并安全存储到数据库中</p>
        </div>

        <div className="grid gap-6">
          <StatsCards />
          <div className="grid lg:grid-cols-2 gap-6">
            <WalletGenerator />
            <WalletList />
          </div>
        </div>
      </div>
    </div>
  )
}

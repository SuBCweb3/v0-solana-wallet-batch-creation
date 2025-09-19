"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Wallet, Plus } from "lucide-react"

interface GeneratedWallet {
  publicKey: string
  privateKey: string
  mnemonic: string
  createdAt: string
}

export function WalletGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [batchSize, setBatchSize] = useState(5)
  const [prefix, setPrefix] = useState("")
  const { toast } = useToast()

  const generateWallets = async () => {
    if (batchSize < 1 || batchSize > 100) {
      toast({
        title: "无效的批量大小",
        description: "批量大小必须在 1-100 之间",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/wallets/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          count: batchSize,
          prefix: prefix || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("生成钱包失败")
      }

      const data = await response.json()

      toast({
        title: "钱包生成成功",
        description: `成功生成并保存了 ${data.wallets.length} 个钱包`,
      })

      // 触发钱包列表刷新
      window.dispatchEvent(new CustomEvent("walletsUpdated"))
    } catch (error) {
      console.error("Error generating wallets:", error)
      toast({
        title: "生成失败",
        description: "生成钱包时发生错误，请重试",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          批量生成钱包
        </CardTitle>
        <CardDescription>创建多个 Solana 钱包并自动保存到数据库</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="batchSize">批量大小</Label>
          <Input
            id="batchSize"
            type="number"
            min="1"
            max="100"
            value={batchSize}
            onChange={(e) => setBatchSize(Number.parseInt(e.target.value) || 1)}
            placeholder="输入要生成的钱包数量"
          />
          <p className="text-sm text-muted-foreground">一次最多可生成 100 个钱包</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prefix">钱包前缀 (可选)</Label>
          <Input
            id="prefix"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            placeholder="例如: MyWallet"
            maxLength={20}
          />
          <p className="text-sm text-muted-foreground">为生成的钱包添加自定义前缀标识</p>
        </div>

        <Button onClick={generateWallets} disabled={isGenerating} className="w-full" size="lg">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              正在生成钱包...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              生成 {batchSize} 个钱包
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

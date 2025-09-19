"use client"

import { useState } from "react"
import { Keypair } from "@solana/web3.js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Copy, Download, Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface WalletInfo {
  publicKey: string
  privateKey: string
  mnemonic?: string
}

export function WalletGenerator() {
  const [walletCount, setWalletCount] = useState(5)
  const [wallets, setWallets] = useState<WalletInfo[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generateWallets = async () => {
    setIsGenerating(true)
    const newWallets: WalletInfo[] = []

    try {
      for (let i = 0; i < walletCount; i++) {
        const keypair = Keypair.generate()
        newWallets.push({
          publicKey: keypair.publicKey.toBase58(),
          privateKey: Buffer.from(keypair.secretKey).toString("hex"),
        })
      }

      setWallets(newWallets)
      toast({
        title: "钱包生成成功",
        description: `成功生成 ${walletCount} 个Solana钱包`,
      })
    } catch (error) {
      toast({
        title: "生成失败",
        description: "钱包生成过程中出现错误",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "复制成功",
        description: `${type}已复制到剪贴板`,
      })
    } catch (error) {
      toast({
        title: "复制失败",
        description: "无法复制到剪贴板",
        variant: "destructive",
      })
    }
  }

  const exportWallets = () => {
    const data = wallets.map((wallet, index) => ({
      index: index + 1,
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
    }))

    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `solana-wallets-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "导出成功",
      description: "钱包信息已导出为JSON文件",
    })
  }

  const clearWallets = () => {
    setWallets([])
    toast({
      title: "清空成功",
      description: "所有钱包信息已清空",
    })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Solana钱包批量创建</h1>
        <p className="text-muted-foreground">使用@solana/web3.js批量生成Solana钱包地址和私钥</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            生成设置
          </CardTitle>
          <CardDescription>设置要生成的钱包数量并开始批量创建</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="wallet-count">钱包数量</Label>
              <Input
                id="wallet-count"
                type="number"
                min="1"
                max="100"
                value={walletCount}
                onChange={(e) => setWalletCount(Math.max(1, Number.parseInt(e.target.value) || 1))}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 pt-6">
              <Button onClick={generateWallets} disabled={isGenerating} className="min-w-[120px]">
                {isGenerating ? "生成中..." : "生成钱包"}
              </Button>
              {wallets.length > 0 && (
                <>
                  <Button variant="outline" onClick={exportWallets}>
                    <Download className="h-4 w-4 mr-2" />
                    导出JSON
                  </Button>
                  <Button variant="outline" onClick={clearWallets}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    清空
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {wallets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>生成的钱包</span>
              <Badge variant="secondary">{wallets.length} 个钱包</Badge>
            </CardTitle>
            <CardDescription>点击复制按钮可以复制公钥或私钥到剪贴板</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wallets.map((wallet, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">钱包 #{index + 1}</h3>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium">公钥地址</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Textarea
                          value={wallet.publicKey}
                          readOnly
                          className="font-mono text-sm resize-none"
                          rows={2}
                        />
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(wallet.publicKey, "公钥")}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-destructive">私钥 (请妥善保管)</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Textarea
                          value={wallet.privateKey}
                          readOnly
                          className="font-mono text-sm resize-none"
                          rows={3}
                        />
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(wallet.privateKey, "私钥")}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Toaster />
    </div>
  )
}

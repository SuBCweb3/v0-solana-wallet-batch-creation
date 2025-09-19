"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Copy, Eye, EyeOff, Trash2, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface Wallet {
  id: string
  publicKey: string
  privateKey: string
  mnemonic: string
  prefix?: string
  createdAt: string
}

export function WalletList() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)
  const [showPrivateKeys, setShowPrivateKeys] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const fetchWallets = async () => {
    try {
      const response = await fetch("/api/wallets")
      if (!response.ok) throw new Error("获取钱包列表失败")

      const data = await response.json()
      setWallets(data.wallets || [])
    } catch (error) {
      console.error("Error fetching wallets:", error)
      toast({
        title: "获取失败",
        description: "无法获取钱包列表",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "复制成功",
        description: `${type} 已复制到剪贴板`,
      })
    } catch (error) {
      toast({
        title: "复制失败",
        description: "无法复制到剪贴板",
        variant: "destructive",
      })
    }
  }

  const togglePrivateKey = (walletId: string) => {
    setShowPrivateKeys((prev) => ({
      ...prev,
      [walletId]: !prev[walletId],
    }))
  }

  const deleteWallet = async (walletId: string) => {
    try {
      const response = await fetch(`/api/wallets/${walletId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("删除钱包失败")

      setWallets((prev) => prev.filter((w) => w.id !== walletId))
      toast({
        title: "删除成功",
        description: "钱包已从数据库中删除",
      })
    } catch (error) {
      toast({
        title: "删除失败",
        description: "无法删除钱包",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchWallets()

    const handleWalletsUpdated = () => {
      fetchWallets()
    }

    window.addEventListener("walletsUpdated", handleWalletsUpdated)
    return () => window.removeEventListener("walletsUpdated", handleWalletsUpdated)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>钱包列表</CardTitle>
          <CardDescription>正在加载钱包数据...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>钱包列表</CardTitle>
          <CardDescription>已生成的钱包 ({wallets.length} 个)</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchWallets}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {wallets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">暂无钱包数据，请先生成钱包</div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {wallets.map((wallet) => (
              <div key={wallet.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {wallet.prefix && <Badge variant="secondary">{wallet.prefix}</Badge>}
                    <span className="text-sm text-muted-foreground">
                      {new Date(wallet.createdAt).toLocaleString("zh-CN")}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteWallet(wallet.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium min-w-16">公钥:</span>
                    <code className="flex-1 text-xs bg-muted px-2 py-1 rounded font-mono">{wallet.publicKey}</code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(wallet.publicKey, "公钥")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium min-w-16">私钥:</span>
                    <code
                      className={cn(
                        "flex-1 text-xs bg-muted px-2 py-1 rounded font-mono",
                        !showPrivateKeys[wallet.id] && "blur-sm select-none",
                      )}
                    >
                      {wallet.privateKey}
                    </code>
                    <Button variant="ghost" size="sm" onClick={() => togglePrivateKey(wallet.id)}>
                      {showPrivateKeys[wallet.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(wallet.privateKey, "私钥")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

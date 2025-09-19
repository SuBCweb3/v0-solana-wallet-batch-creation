"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Database, Clock, TrendingUp } from "lucide-react"

interface Stats {
  totalWallets: number
  todayWallets: number
  databaseSize: string
  lastGenerated: string | null
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    totalWallets: 0,
    todayWallets: 0,
    databaseSize: "0 KB",
    lastGenerated: null,
  })

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/wallets/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  useEffect(() => {
    fetchStats()

    const handleWalletsUpdated = () => {
      fetchStats()
    }

    window.addEventListener("walletsUpdated", handleWalletsUpdated)
    return () => window.removeEventListener("walletsUpdated", handleWalletsUpdated)
  }, [])

  const statsData = [
    {
      title: "总钱包数",
      value: stats.totalWallets.toLocaleString(),
      icon: Wallet,
      description: "已生成的钱包总数",
    },
    {
      title: "今日新增",
      value: stats.todayWallets.toLocaleString(),
      icon: TrendingUp,
      description: "今天生成的钱包数量",
    },
    {
      title: "数据库大小",
      value: stats.databaseSize,
      icon: Database,
      description: "存储空间使用情况",
    },
    {
      title: "最后生成",
      value: stats.lastGenerated ? new Date(stats.lastGenerated).toLocaleString("zh-CN") : "暂无记录",
      icon: Clock,
      description: "最近一次生成时间",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { WalletGenerator } from "@/components/wallet-generator"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  const [activeTab, setActiveTab] = useState("wallet-generator")

  const renderContent = () => {
    switch (activeTab) {
      case "wallet-generator":
        return <WalletGenerator />
      default:
        return <WalletGenerator />
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex h-screen bg-background">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-auto">{renderContent()}</main>
      </div>
    </ThemeProvider>
  )
}

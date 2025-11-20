import type React from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <div className="flex">
        <aside className="hidden md:flex w-64 flex-col border-r border-primary/20 bg-gradient-to-b from-sidebar to-sidebar/95 min-h-[calc(100vh-4rem)] shadow-lg shadow-primary/5">
          <div className="p-6">
            <DashboardNav />
          </div>
        </aside>
        <main className="flex-1 p-6 bg-gradient-to-br from-background to-background/95">{children}</main>
      </div>
    </div>
  )
}

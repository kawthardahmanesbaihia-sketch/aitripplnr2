"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Hotel, Utensils, Activity, Calendar,
  Map, ClipboardList, Globe, ChevronLeft, Menu, Bus, BrainCircuit,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export const NAV_ITEMS = [
  { id: "overview",     label: "Overview",    icon: LayoutDashboard },
  { id: "hotels",       label: "Hotels",      icon: Hotel },
  { id: "restaurants",  label: "Food",        icon: Utensils },
  { id: "activities",   label: "Activities",  icon: Activity },
  { id: "events",       label: "Events",      icon: Calendar },
  { id: "map",          label: "Map",         icon: Map },
  { id: "transport",    label: "Transport",   icon: Bus },
  { id: "ai-insights",  label: "AI Insights", icon: BrainCircuit },
  { id: "plan",         label: "Itinerary",   icon: ClipboardList },
]

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  destinationName: string
  backHref?: string
  backLabel?: string
}

export function DestinationSidebar({ activeTab, onTabChange, destinationName, backHref = "/results", backLabel = "Back to Results" }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1, width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2 }}
      /* bg-background = white/dark-teal, border-border auto-switches */
      className="hidden md:flex flex-col bg-background border-r border-border shadow-sm shrink-0 overflow-hidden h-full"
    >
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center justify-between min-h-[64px]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                {/* text-foreground auto-switches */}
                <p className="font-bold text-sm text-foreground whitespace-nowrap">AI Trip Planner</p>
                <p className="text-xs text-muted-foreground truncate max-w-[130px]">{destinationName}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? "bg-primary/10 text-primary dark:bg-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && isActive && (
                <motion.div
                  layoutId="sidebarDot"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                />
              )}
              {collapsed && isActive && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-l-full bg-primary" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Back link */}
      <div className="p-4 border-t border-border">
        <Link
          href={backHref}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                {backLabel}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>
    </motion.aside>
  )
}

export function MobileBottomNav({
  activeTab,
  onTabChange,
}: {
  activeTab: string
  onTabChange: (tab: string) => void
}) {
  return (
    /* bg-background/95 so it adapts in dark mode too */
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50">
      <div className="flex items-center justify-around px-1 py-2">
        {NAV_ITEMS.slice(0, 6).map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

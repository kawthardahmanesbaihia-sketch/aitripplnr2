"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Plane, Menu, X, User, LogOut, Heart, Clock,
  Building2, LayoutDashboard, CalendarCheck, ClipboardList, Bell, BarChart3,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/components/language-provider"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Notif {
  id:                 number
  type:               "booking_request" | "booking_status"
  message:            string
  package_id:         string | null
  booking_request_id: number | null
  is_read:            boolean
  created_at:         string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7)  return `${days}d ago`
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

// ── Component ──────────────────────────────────────────────────────────────────

export function Navbar() {
  const [isScrolled,       setIsScrolled]       = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen,   setIsDropdownOpen]   = useState(false)
  const [isNotifOpen,      setIsNotifOpen]      = useState(false)
  const [unreadCount,      setUnreadCount]      = useState(0)
  const [notifications,    setNotifications]    = useState<Notif[]>([])
  const [notifLoaded,      setNotifLoaded]      = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const notifRef    = useRef<HTMLDivElement>(null)

  const pathname = usePathname()
  const router   = useRouter()
  const { t }    = useLanguage()
  const { user, logout } = useAuth()

  const navItems = [
    { name: t("home"),      href: "/"        },
    { name: "Explore",      href: "/explore" },
    { name: t("about"),     href: "/about"   },
    { name: t("contact"),   href: "/contact" },
  ]

  // ── Scroll ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // ── Click outside (both dropdowns) ──────────────────────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // ── Fetch unread count on login / logout ─────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      setNotifications([])
      setNotifLoaded(false)
      return
    }
    fetch("/api/notifications/unread-count", { credentials: "include" })
      .then(r => r.ok ? r.json() : { count: 0 })
      .then(d => setUnreadCount(d.count ?? 0))
      .catch(() => {})
  }, [user])

  // ── Lazy-load full notification list ─────────────────────────────────────────
  const loadNotifications = useCallback(() => {
    if (notifLoaded) return
    setNotifLoaded(true)
    fetch("/api/notifications", { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then((data: Notif[]) => setNotifications(data))
      .catch(() => {})
  }, [notifLoaded])

  const handleBellClick = () => {
    const opening = !isNotifOpen
    setIsNotifOpen(opening)
    setIsDropdownOpen(false)
    if (opening) loadNotifications()
  }

  const handleNotifClick = useCallback(async (notif: Notif) => {
    setIsNotifOpen(false)
    if (!notif.is_read) {
      // optimistic update
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
      await fetch(`/api/notifications/${notif.id}/read`, {
        method: "PATCH",
        credentials: "include",
      }).catch(() => {})
    }
    router.push(notif.type === "booking_request" ? "/agency/bookings" : "/bookings")
  }, [router])

  const handleLogout = async () => {
    setIsDropdownOpen(false)
    await logout()
    router.push("/")
  }

  // ── Menus ────────────────────────────────────────────────────────────────────
  const travelerMenu = [
    { label: "My Profile",      href: "/profile",               icon: User          },
    { label: "My Bookings",     href: "/bookings",              icon: CalendarCheck },
    { label: "Travel History",  href: "/profile?tab=history",   icon: Clock         },
    { label: "Favorites",       href: "/profile?tab=favorites", icon: Heart         },
  ]

  const agencyMenu = [
    { label: "Agency Profile",  href: "/profile?tab=agency",    icon: Building2       },
    { label: "Dashboard",       href: "/agency/dashboard",       icon: LayoutDashboard },
    { label: "Agency Bookings", href: "/agency/bookings",        icon: ClipboardList   },
    { label: "Analytics",       href: "/agency/analytics",       icon: BarChart3       },
  ]

  const menuItems = user?.role === "agency" ? agencyMenu : travelerMenu

  const avatarContent = user?.avatar_url
    ? <img src={user.avatar_url} alt="avatar" className="h-full w-full object-cover" />
    : <span className="text-sm font-bold text-primary">{(user?.full_name || user?.username || "U")[0].toUpperCase()}</span>

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-500",
        isScrolled
          ? "border-border/30 bg-background/80 shadow-lg shadow-black/10 backdrop-blur-xl"
          : "border-white/10 bg-white/[0.03] backdrop-blur-md dark:bg-black/[0.04]",
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2 transition-all duration-300 hover:scale-105">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <Plane className="h-6 w-6" />
          </motion.div>
          <span className="hidden font-bold text-lg sm:inline-block">{t("Ai Trip Planner")}</span>
        </Link>

        {/* ── Desktop Nav ───────────────────────────────────────────────────── */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} transition={{ duration: 0.3 }}>
                <Button
                  variant={pathname === item.href ? "default" : "ghost"}
                  className={cn(
                    "relative transition-all duration-300 rounded-lg font-medium",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {item.name}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-lg bg-primary/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Button>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* ── Right side ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />

          {/* ── Notification Bell ─────────────────────────────────────────── */}
          {user && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleBellClick}
                className="relative h-9 w-9 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center bg-destructive text-[9px] font-bold text-white rounded-full leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1,    y: 0  }}
                    exit={{   opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-background shadow-lg shadow-primary/10 overflow-hidden z-50"
                  >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <p className="text-sm font-semibold">Notifications</p>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-semibold bg-destructive/15 text-destructive px-2 py-0.5 rounded-full">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                          <Bell className="h-6 w-6 mb-2 text-muted-foreground/30" />
                          <p className="text-sm text-muted-foreground">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <button
                            key={notif.id}
                            onClick={() => handleNotifClick(notif)}
                            className={cn(
                              "w-full text-left px-4 py-3 border-b border-border/50 last:border-0 hover:bg-accent transition-colors",
                              !notif.is_read && "bg-primary/5"
                            )}
                          >
                            <div className="flex items-start gap-2.5">
                              <span
                                className={cn(
                                  "mt-[7px] h-1.5 w-1.5 rounded-full shrink-0",
                                  !notif.is_read ? "bg-primary" : "bg-transparent"
                                )}
                              />
                              <div className="min-w-0">
                                <p className="text-sm leading-snug text-left">{notif.message}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  {timeAgo(notif.created_at)}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ── User avatar / Get Started ────────────────────────────────── */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => { setIsDropdownOpen(v => !v); setIsNotifOpen(false) }}
                className="h-9 w-9 rounded-full overflow-hidden bg-primary/10 border-2 border-primary/20 hover:border-primary/60 transition-colors flex items-center justify-center"
              >
                {avatarContent}
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1,    y: 0  }}
                    exit={{   opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-background shadow-lg shadow-primary/10 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold truncate">{user.full_name || user.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>

                    {menuItems.map(({ label, href, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {label}
                      </Link>
                    ))}

                    <div className="border-t border-border">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.3 }}>
              <Button
                asChild
                variant="default"
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/30 transition-all duration-300"
              >
                <Link href="/auth">Get Started</Link>
              </Button>
            </motion.div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* ── Mobile menu ───────────────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border/40 bg-background/95 backdrop-blur-lg md:hidden"
        >
          <div className="container mx-auto flex flex-col gap-2 px-4 py-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant={pathname === item.href ? "default" : "ghost"} className="w-full justify-start">
                  {item.name}
                </Button>
              </Link>
            ))}
            {user && (
              <>
                {menuItems.map(({ label, href }) => (
                  <Link key={href} href={href} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">{label}</Button>
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}

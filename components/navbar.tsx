"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plane, Menu, X, User, LogOut, Heart, Clock, Building2, LayoutDashboard } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/components/language-provider"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [isScrolled,      setIsScrolled]      = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen,  setIsDropdownOpen]  = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const pathname = usePathname()
  const router   = useRouter()
  const { t }    = useLanguage()
  const { user, logout } = useAuth()

  const navItems = [
    { name: t("home"),  href: "/" },
    { name: "Explore",  href: "/explore" },
    { name: t("about"), href: "/about" },
    { name: t("contact"), href: "/contact" },
  ]

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleLogout = async () => {
    setIsDropdownOpen(false)
    await logout()
    router.push("/")
  }

  const travelerMenu = [
    { label: "My Profile",      href: "/profile",           icon: User          },
    { label: "Travel History",  href: "/profile?tab=history",   icon: Clock         },
    { label: "Favorites",       href: "/profile?tab=favorites", icon: Heart         },
  ]

  const agencyMenu = [
    { label: "Agency Profile",  href: "/profile?tab=agency",    icon: Building2     },
    { label: "Dashboard",       href: "/agency/dashboard",       icon: LayoutDashboard },
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
        "sticky top-0 z-50 w-full border-b backdrop-blur-lg transition-all duration-300",
        isScrolled
          ? "border-border/40 bg-background/90 shadow-lg shadow-primary/10"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
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

        {/* Desktop Nav */}
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

        {/* Right side */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((v) => !v)}
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

      {/* Mobile menu */}
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

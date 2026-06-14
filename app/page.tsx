"use client"

import { motion, useMotionValue, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  EarthIcon, Camera, Compass,
  MapPin, Globe, Sparkles, ArrowRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { AnimatedBackgroundElements } from "@/components/animated-background-elements"
import { useLanguage } from "@/components/language-provider"

export default function HomePage() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const { t } = useLanguage()

  const [windowSize, setWindowSize] = useState({ width: 1024, height: 768 })

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
    }
  }, [mouseX, mouseY, setWindowSize])

  const x1 = useTransform(mouseX, [0, windowSize.width],  [-20, 20])
  const y1 = useTransform(mouseY, [0, windowSize.height], [-20, 20])
  const x2 = useTransform(mouseX, [0, windowSize.width],  [-10, 10])
  const y2 = useTransform(mouseY, [0, windowSize.height], [-10, 10])

  return (
    <div className="relative overflow-hidden">
      <AnimatedBackgroundElements />

      {/* HERO */}
      {/*
        Photography-first layout.
        No central card. Image is the primary visual element.
        CTAs float at the bottom of the hero.
      */}
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">

        {/* Background image — Ken Burns cinematic effect */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute"
            style={{ inset: "-4%" }}
            animate={{
              scale: [1, 1.06, 1.03],
              x:     ["0%", "-0.8%", "0.4%"],
              y:     ["0%", "-0.4%", "0.2%"],
            }}
            transition={{
              duration:   22,
              repeat:     Number.POSITIVE_INFINITY,
              repeatType: "mirror",
              ease:       "easeInOut",
            }}
          >
            <Image
              src="/hero-section/sea.jpg"
              alt="Ocean travel destination"
              fill
              className="object-cover object-center"
              priority
            />
          </motion.div>

          {/* Minimal overlay: 6% light / 12% dark — image stays sharp and vibrant */}
          <div className="absolute inset-0 bg-black/[0.06] dark:bg-black/[0.12]" />

          {/* Bottom vignette — only behind CTA area, not the full image */}
          <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />

          {/* Seamless transition into the page background */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Subtle ambient teal glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-[480px] w-[480px] rounded-full bg-primary/10 blur-[160px]" />
          <div className="absolute right-1/4 top-1/2 h-64 w-64 rounded-full bg-[#18C6C8]/10 blur-[120px]" />
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[140px]" />
        </div>

        {/* Floating parallax icons — atmospheric, never block the image */}
        <motion.div
          className="pointer-events-none absolute left-[6%] top-[18%] hidden opacity-20 dark:opacity-15 sm:block"
          style={{ x: x1, y: y1 }}
        >
          <EarthIcon className="h-20 w-20 text-primary" />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute right-[8%] top-[22%] hidden opacity-20 dark:opacity-15 sm:block"
          style={{ x: x2, y: y2 }}
        >
          <Compass className="h-16 w-16 text-primary" />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute bottom-[38%] left-[10%] hidden opacity-15 lg:block"
          style={{ x: x2, y: y1 }}
        >
          <MapPin className="h-14 w-14 text-primary" />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute bottom-[30%] right-[6%] hidden opacity-15 lg:block"
          style={{ x: x1, y: y2 }}
        >
          <Globe className="h-24 w-24 text-primary" />
        </motion.div>

        {/* Bottom-center floating CTA */}
        {/*
          Minimal floating layout — no card, no heavy glassmorphism.
          Badge + compact headline + two action buttons.
          Positioned above the vignette for maximum contrast.
        */}
        <div className="absolute inset-x-0 bottom-0 z-10 pb-14 sm:pb-16">
          <div className="container mx-auto max-w-5xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
              className="flex flex-col items-center gap-5 text-center"
            >

              {/* Minimal AI badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm"
              >
                <Sparkles className="h-3 w-3" />
                AI-Powered Travel Planning
              </motion.div>

              {/* Premium two-line headline — white → cyan gradient */}
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.7 }}
                className="max-w-4xl font-extrabold leading-none tracking-tight text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
                style={{ textShadow: "0 2px 30px rgba(0,0,0,0.7), 0 1px 6px rgba(0,0,0,0.4)" }}
              >
                <span className="block text-white">
                  AI-Driven Visual
                </span>
                <span className="block text-[#47D3FF]">
                  Travel Discovery
                </span>
              </motion.h1>

              {/* Concise premium description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.6 }}
                className="max-w-2xl text-balance text-base leading-relaxed text-white/70 sm:text-lg"
                style={{ textShadow: "0 1px 16px rgba(0,0,0,0.55)" }}
              >
                Transform visual inspiration into personalized destinations, experiences, and travel plans powered by AI.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-col items-center gap-3 sm:flex-row"
              >
                {/* Button 1 — Start Your Journey → /single */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    asChild
                    size="lg"
                    className="h-12 border-0 bg-gradient-to-r from-primary to-[#11C5B9] px-8 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 dark:from-primary dark:to-[#18C6C8]"
                  >
                    <Link href="/single">
                      Start Your Journey
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>

                {/* Button 2 — Explore Destinations → /explore */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 border border-white/30 bg-white/10 px-8 text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/20"
                  >
                    <Link href="/explore">
                      Explore Destinations
                      <Compass className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Trust indicators — visual only, no backend calls */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.6 }}
                className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
              >
                {[
                  "AI-Powered Recommendations",
                  "Real Hotels & Activities",
                  "Personalized Itineraries",
                ].map((label) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-primary/80">✓</span>
                    <span className="text-xs font-medium tracking-wide text-white/50">{label}</span>
                  </div>
                ))}
              </motion.div>

            </motion.div>
          </div>
        </div>

      </section>

      {/* HOW IT WORKS */}
      <section className="relative bg-background px-4 py-24">
        <div className="container mx-auto max-w-6xl">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Simple Process
            </div>
            <h2 className="mb-5 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {t("howItWorks")}
            </h2>
            <p className="mx-auto max-w-2xl text-pretty text-xl leading-relaxed text-muted-foreground">
              Three simple steps to discover your perfect travel destinations
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Camera,
                title:       t("uploadImages"),
                description: t("uploadImagesDesc"),
                step: "01",
              },
              {
                icon: Compass,
                title:       t("aiAnalysis"),
                description: t("aiAnalysisDesc"),
                step: "02",
              },
              {
                icon: Globe,
                title:       t("getResults"),
                description: t("getResultsDesc"),
                step: "03",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.15 }}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.25 } }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative z-10">
                  <span className="select-none text-5xl font-black leading-none text-primary/10 transition-colors duration-300 group-hover:text-primary/20">
                    {feature.step}
                  </span>
                  <div className="mb-5 mt-3 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md group-hover:shadow-primary/30">
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Explore CTA banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16"
          >
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-secondary via-card to-secondary p-12 shadow-xl">
              {/* Top cyan accent line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
              {/* Decorative rings */}
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-primary/10 opacity-50" />
              <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full border border-primary/10 opacity-50" />
              {/* Right ambient glow */}
              <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent" />

              <div className="relative z-10 text-center">
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Compass className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-3xl font-bold">Ready to Explore?</h3>
                <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                  Browse curated destinations by squad type — solo, couple, friends, or family — and get a personalised AI dashboard instantly.
                </p>
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    asChild
                    size="lg"
                    className="h-12 border-0 bg-gradient-to-r from-primary to-[#11C5B9] px-9 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/35 dark:from-primary dark:to-[#18C6C8]"
                  >
                    <Link href="/explore">
                      Browse Destinations
                      <Compass className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  )
}

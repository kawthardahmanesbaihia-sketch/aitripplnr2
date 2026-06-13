"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Mail, Send, MapPin, Globe } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AnimatedBackgroundElements } from "@/components/animated-background-elements"
import { useLanguage } from "@/components/language-provider"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. We'll get back to you soon.",
      })
      setFormData({ name: "", email: "", message: "" })
      setIsSubmitting(false)
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="relative min-h-screen px-4 py-16">
      <AnimatedBackgroundElements />

      <div className="container relative z-10 mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ duration: 0.6, type: "spring", delay: 0.2 }}
              className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <Mail className="h-10 w-10" />
            </motion.div>

            <h1 className="mb-4 text-balance text-4xl font-bold sm:text-5xl md:text-6xl">{t("getInTouch")}</h1>
            <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
              Have questions about the project? We'd love to hear from you.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <Card className="border-2 bg-card/50 p-6 backdrop-blur-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold">{t("email")}</h3>
                <p className="text-sm text-muted-foreground">222232014017@univ-chlef.dz
                  222232010918@univ-chlef.dz
                  232332029110@univ-chlef.dz
                </p>
              </Card>

              <Card className="border-2 bg-card/50 p-6 backdrop-blur-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold">Location</h3>
                <p className="text-sm text-muted-foreground">Hassiba Benbouali University of Chlef (UHBC), Ouled Fares</p>
              </Card>

              <Card className="border-2 bg-card/50 p-6 backdrop-blur-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold">Project Type</h3>
                <p className="text-sm text-muted-foreground">Graduation Project 2026</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="border-2 bg-card/50 p-8 backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium">
                      {t("name")}
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                      className="border-2"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium">
                      {t("email")}
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      required
                      className="border-2"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-2 block text-sm font-medium">
                      {t("message")}
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us what you think..."
                      rows={6}
                      required
                      className="border-2 resize-none"
                    />
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      size="lg"
                      className="w-full shadow-lg shadow-primary/30 transition-shadow hover:shadow-xl hover:shadow-primary/40"
                    >
                      {isSubmitting ? (
                        t("sending")
                      ) : (
                        <>
                          {t("sendMessage")}
                          <Send className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

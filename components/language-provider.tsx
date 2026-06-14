"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Language = "en" | "fr" | "ar"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  en: {
    home: "Home",
    about: "About",
    contact: "Contact",
    tripPlanner: "Trip Planner",
    aiDrivenVisual: "AI-Driven Visual",
    uploadYourImages: "Show us your vibe and let AI find your perfect destination",
    startNow: "Start Now",
    howItWorks: "How It Works",
    uploadImages: "Share Your Vibe",
    uploadImagesDesc: "Upload travel images on the Explore page and our AI reads your style instantly",
    aiAnalysis: "AI Analysis",
    aiAnalysisDesc: "Helping travelers and agencies make better decisions",
    getResults: "Get Results",
    getResultsDesc: "Receive personalized trip recommendations instantly",
    aboutThisProject: "About This Project",
    projectVision: "Project Vision",
    keyTechnologies: "Key Technologies",
    getInTouch: "Get In Touch",
    name: "Name",
    email: "Email",
    message: "Message",
    sendMessage: "Send Message",
    sending: "Sending...",
  },
  fr: {
    home: "Accueil",
    about: "À propos",
    contact: "Contact",
    tripPlanner: "Planificateur de Voyage",
    aiDrivenVisual: "Visuel Piloté par IA",
    uploadYourImages: "Montrez-nous votre vibe, l'IA trouve votre destination idéale",
    startNow: "Commencer",
    howItWorks: "Comment ça marche",
    uploadImages: "Partagez votre vibe",
    uploadImagesDesc: "Téléchargez des images sur la page Explore et notre IA détecte votre style",
    aiAnalysis: "Analyse IA",
    aiAnalysisDesc: "Notre modèle de vision analyse vos préférences et votre style de voyage",
    getResults: "Obtenir des résultats",
    getResultsDesc: "Recevez des recommandations de voyage personnalisées instantanément",
    aboutThisProject: "À propos de ce projet",
    projectVision: "Vision du projet",
    keyTechnologies: "Technologies clés",
    getInTouch: "Entrer en contact",
    name: "Nom",
    email: "E-mail",
    message: "Message",
    sendMessage: "Envoyer le message",
    sending: "Envoi...",
  },
  ar: {
    home: "الرئيسية",
    about: "حول",
    contact: "اتصل",
    tripPlanner: "مخطط الرحلات",
    aiDrivenVisual: "مرئي مدعوم بالذكاء الاصطناعي",
    uploadYourImages: "أرنا أسلوبك والذكاء الاصطناعي يجد وجهتك المثالية",
    startNow: "ابدأ الآن",
    howItWorks: "كيف يعمل",
    uploadImages: "شارك أسلوبك",
    uploadImagesDesc: "ارفع صور سفرك في صفحة Explore وسيقرأ الذكاء الاصطناعي أسلوبك فوراً",
    aiAnalysis: "تحليل الذكاء الاصطناعي",
    aiAnalysisDesc: "يقوم نموذج الرؤية لدينا بتحليل تفضيلاتك وأسلوب سفرك",
    getResults: "احصل على النتائج",
    getResultsDesc: "احصل على توصيات سفر مخصصة على الفور",
    aboutThisProject: "حول هذا المشروع",
    projectVision: "رؤية المشروع",
    keyTechnologies: "التقنيات الرئيسية",
    getInTouch: "ابقى على تواصل",
    name: "الاسم",
    email: "البريد الإلكتروني",
    message: "الرسالة",
    sendMessage: "إرسال الرسالة",
    sending: "جاري الإرسال...",
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem("language") as Language
    if (savedLang && ["en", "fr", "ar"].includes(savedLang)) {
      setLanguageState(savedLang)
      updateDirection(savedLang)
    }
  }, [])

  const updateDirection = (lang: Language) => {
    if (lang === "ar") {
      document.documentElement.setAttribute("dir", "rtl")
      document.documentElement.setAttribute("lang", "ar")
    } else {
      document.documentElement.setAttribute("dir", "ltr")
      document.documentElement.setAttribute("lang", lang)
    }
  }

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
    updateDirection(lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}

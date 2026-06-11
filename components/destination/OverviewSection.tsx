"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, AlertTriangle, Brain } from "lucide-react"

interface OverviewSectionProps {
  positives: string[]
  negatives: string[]
  weatherContent?: ReactNode
  aiContext?: {
    vibes: string[]
    travelStyle: string
  }
}

export function OverviewSection({ positives, negatives, weatherContent, aiContext }: OverviewSectionProps) {
  return (
    <div className="p-6 space-y-5">
      {/* AI analysis banner — only shown when context is available */}
      {aiContext && aiContext.vibes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={[
            "rounded-2xl px-5 py-4 border flex items-start gap-3",
            "bg-violet-50 border-violet-100",
            "dark:bg-violet-900/15 dark:border-violet-800/40",
          ].join(" ")}
        >
          <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center shrink-0 mt-0.5">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wide mb-2">
              Visual themes detected from your image selections
            </p>
            <div className="flex flex-wrap gap-1.5">
              {aiContext.vibes.map((vibe) => (
                <span
                  key={vibe}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-800/40 dark:text-violet-200 border border-violet-200/60 dark:border-violet-700/40"
                >
                  {vibe}
                </span>
              ))}
              {aiContext.travelStyle && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-800/40 dark:text-indigo-200 border border-indigo-200/60 dark:border-indigo-700/40">
                  {aiContext.travelStyle} travel style
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {/* Why you'll love it — green accent card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={[
            "rounded-2xl p-5 border",
            "bg-green-50 border-green-100",
            "dark:bg-green-900/20 dark:border-green-800/40",
          ].join(" ")}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Why you'll love it</h3>
              <p className="text-xs text-muted-foreground">Based on your image selections</p>
            </div>
          </div>
          <ul className="space-y-2.5">
            {positives.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 * i }}
                className="flex items-start gap-3"
              >
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Things to consider — amber accent card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className={[
            "rounded-2xl p-5 border",
            "bg-amber-50 border-amber-100",
            "dark:bg-amber-900/20 dark:border-amber-800/40",
          ].join(" ")}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Things to consider</h3>
              <p className="text-xs text-muted-foreground">Personalised to your preferences</p>
            </div>
          </div>
          <ul className="space-y-2.5">
            {negatives.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 * i }}
                className="flex items-start gap-3"
              >
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Weather — rendered content from WeatherSection or fallback */}
      {weatherContent ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {weatherContent}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-r from-blue-500 to-sky-400 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs mb-1 uppercase tracking-wide font-medium">Select travel dates</p>
              <p className="text-blue-100 text-sm mt-1">Add travel dates to see weather forecasts and climate estimates for your trip.</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

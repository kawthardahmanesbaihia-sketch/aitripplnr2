"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

interface AIInsightBoxProps {
  destinationName: string
  summary?: string
  positives?: string[]
  vibes?: string[]
  travelStyle?: string
}

export function AIInsightBox({
  destinationName,
  summary,
  positives,
  vibes,
  travelStyle,
}: AIInsightBoxProps) {
  const hasVibes = vibes && vibes.length > 0

  const defaultSummary = `${destinationName} was selected by the AI engine based on the visual themes detected across your uploaded images. The recommendation reflects a high alignment between your image preferences and this destination's characteristics.`

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 border bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-800/40"
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Why This Destination?</h2>
            <p className="text-sm text-muted-foreground">Explainable AI recommendation analysis</p>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-foreground/80 leading-relaxed mb-6">
          {summary || defaultSummary}
        </p>

        {/* Detected vibes from user's image selections */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {hasVibes ? "Visual themes detected from your selections" : "Detected travel preferences"}
          </p>
          <div className="flex flex-wrap gap-2">
            {hasVibes ? (
              <>
                {vibes!.map((vibe) => (
                  <div
                    key={vibe}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-800/40 dark:text-green-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                    {vibe}
                  </div>
                ))}
                {travelStyle && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-800/40 dark:text-emerald-200">
                    <Sparkles className="w-3 h-3" />
                    {travelStyle} style
                  </div>
                )}
              </>
            ) : (
              /* Fallback chips when no CLIP data is available */
              ["Adventure", "Culture", "Nature", "Local cuisine"].map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-800/40 dark:text-green-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  {label}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Positives list */}
        {positives && positives.length > 0 && (
          <div className="bg-background/60 dark:bg-card/40 rounded-xl p-4 border border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Why {destinationName} is right for you
            </p>
            <ul className="space-y-2">
              {positives.slice(0, 4).map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </div>
  )
}

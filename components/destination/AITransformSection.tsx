"use client"

import { motion } from "framer-motion"
import { Sparkles, Brain, AlertTriangle, TrendingUp, Eye } from "lucide-react"

interface AITransformSectionProps {
  vibes:            string[]
  travelStyle:      string
  positives:        string[]
  negatives:        string[]
  destinationName:  string
  confidenceBreakdown?: Record<string, number>
}

const VIBE_COLORS = [
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-purple-500",
  "from-emerald-500 to-green-500",
  "from-orange-500 to-amber-500",
  "from-rose-500 to-pink-500",
  "from-teal-500 to-sky-500",
]

const CATEGORY_NICE: Record<string, string> = {
  "winter arctic":      "Arctic & Winter",
  "coastal marine":     "Coastal & Ocean",
  "tropical beach":     "Tropical Beach",
  "mountain hiking":    "Mountains & Hiking",
  "urban nightlife":    "Urban Nightlife",
  "cultural heritage":  "Culture & Heritage",
  "desert landscape":   "Desert & Arid",
  "wildlife safari":    "Wildlife & Safari",
  "food gastronomy":    "Food & Gastronomy",
  "festival events":    "Festivals & Events",
  "luxury resort":      "Luxury & Resorts",
  "budget backpacker":  "Budget Travel",
  "romantic couples":   "Romance & Couples",
  "family friendly":    "Family Friendly",
  "adventure sports":   "Adventure Sports",
}

function toNiceLabel(raw: string): string {
  return CATEGORY_NICE[raw] ?? raw.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.round(value * 100))}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  )
}

export function AITransformSection({
  vibes,
  travelStyle,
  positives,
  negatives,
  destinationName,
  confidenceBreakdown,
}: AITransformSectionProps) {
  const hasVibes       = vibes && vibes.length > 0
  const hasBreakdown   = confidenceBreakdown && Object.keys(confidenceBreakdown).length > 0
  const hasPositives   = positives && positives.length > 0
  const hasNegatives   = negatives && negatives.length > 0

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">AI Insights</h2>
        <p className="text-sm text-muted-foreground">
          How the AI matched your image selections to {destinationName}
        </p>
      </div>

      {/* Section A — Detected visual preferences */}
      {(hasVibes || hasBreakdown) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Visual Preferences Detected</h3>
              <p className="text-xs text-muted-foreground">From your image selections via CLIP analysis</p>
            </div>
          </div>

          {hasBreakdown ? (
            <div className="space-y-3">
              {Object.entries(confidenceBreakdown!)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([cat, score], i) => (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{toNiceLabel(cat)}</span>
                      <span className="text-muted-foreground">{Math.round(score * 100)}%</span>
                    </div>
                    <ProgressBar value={score} color={VIBE_COLORS[i % VIBE_COLORS.length]} />
                  </div>
                ))}
            </div>
          ) : hasVibes ? (
            <div className="flex flex-wrap gap-2">
              {vibes.map((v, i) => (
                <span
                  key={v}
                  className="px-3 py-1.5 rounded-full text-sm font-medium text-white"
                  style={{
                    background: `linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))`,
                    backgroundImage: `linear-gradient(to right, hsl(${i * 37 % 360}deg 70% 55%), hsl(${(i * 37 + 40) % 360}deg 70% 55%))`,
                  }}
                >
                  {v}
                </span>
              ))}
            </div>
          ) : null}

          {travelStyle && (
            <div className="flex items-center gap-2 pt-1 border-t border-border">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-sm text-foreground">
                Your travel style: <span className="font-semibold text-primary">{travelStyle}</span>
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Section B — Why this destination matched */}
      {hasPositives && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Why {destinationName} Matches You</h3>
              <p className="text-xs text-muted-foreground">AI-generated match reasoning</p>
            </div>
          </div>
          <ul className="space-y-2.5">
            {positives.slice(0, 5).map((p, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Section C — Potential mismatches */}
      {hasNegatives && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800/40 p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Things to Consider</h3>
              <p className="text-xs text-muted-foreground">Personalised tradeoffs detected by the AI</p>
            </div>
          </div>
          <ul className="space-y-2.5">
            {negatives.slice(0, 5).map((n, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                {n}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Fallback when no CLIP data */}
      {!hasVibes && !hasBreakdown && !hasPositives && !hasNegatives && (
        <div className="rounded-2xl border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          <Brain className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
          <p>AI insights will appear here after your preferences are analysed.</p>
        </div>
      )}
    </div>
  )
}

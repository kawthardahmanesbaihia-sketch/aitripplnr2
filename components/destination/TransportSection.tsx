"use client"

import { motion } from "framer-motion"
import { Bus, Car, Train, Plane, Clock, Users, DollarSign, MapPin } from "lucide-react"

interface Transfer {
  name:     string
  vehicle:  string
  capacity: number
  price:    string
  duration: string
}

interface TransportSectionProps {
  transfers: Transfer[]
  cityName:  string
}

const VEHICLE_META: Record<string, { icon: typeof Car; color: string; label: string }> = {
  TAXI:       { icon: Car,   color: "text-yellow-500", label: "Taxi" },
  CAR:        { icon: Car,   color: "text-blue-500",   label: "Private Car" },
  MINIBUS:    { icon: Bus,   color: "text-green-500",  label: "Minibus" },
  BUS:        { icon: Bus,   color: "text-green-500",  label: "Bus" },
  TRAIN:      { icon: Train, color: "text-purple-500", label: "Train" },
  SHUTTLE:    { icon: Bus,   color: "text-orange-500", label: "Shuttle" },
}

function getVehicleMeta(code: string) {
  const key = Object.keys(VEHICLE_META).find(k => code?.toUpperCase().includes(k))
  return key ? VEHICLE_META[key] : { icon: Car, color: "text-muted-foreground", label: code || "Transfer" }
}

const TRANSIT_TIPS = [
  { icon: Bus,   label: "Public Bus",  desc: "Extensive routes covering the whole city. Best for short hops." },
  { icon: Train, label: "Metro / Subway", desc: "Fast and reliable. Great for cross-city travel." },
  { icon: Car,   label: "Rideshare",   desc: "Uber, Bolt or local apps. Easy door-to-door service." },
  { icon: MapPin,label: "Walking",     desc: "City centres are often walkable for attractions under 1 km." },
]

export function TransportSection({ transfers, cityName }: TransportSectionProps) {
  const hasTransfers = transfers && transfers.length > 0

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Transportation & Mobility</h2>
        <p className="text-sm text-muted-foreground">Getting around {cityName} — airport transfers and city transit</p>
      </div>

      {/* Airport Transfers */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Plane className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Airport Transfers</h3>
          {hasTransfers && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {transfers.length} options
            </span>
          )}
        </div>

        {hasTransfers ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {transfers.map((t, i) => {
              const { icon: Icon, color, label } = getVehicleMeta(t.vehicle)
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-card rounded-2xl border border-border p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{t.name || label}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {t.price && (
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="w-3 h-3" />
                          <span>Price</span>
                        </div>
                        <span className="font-semibold text-foreground">{t.price}</span>
                      </div>
                    )}
                    {t.duration && (
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Time</span>
                        </div>
                        <span className="font-semibold text-foreground">{t.duration}</span>
                      </div>
                    )}
                    {t.capacity > 0 && (
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>Max</span>
                        </div>
                        <span className="font-semibold text-foreground">{t.capacity} pax</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
            Airport transfer data is not available for this destination yet. Check local taxi apps or public transport on arrival.
          </div>
        )}
      </div>

      {/* City Transit Tips */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Bus className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Getting Around the City</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {TRANSIT_TIPS.map((tip, i) => {
            const Icon = tip.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="flex items-start gap-3 bg-card rounded-xl border border-border p-4"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground mb-1">{tip.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tip.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

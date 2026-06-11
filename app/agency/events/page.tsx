"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/auth-context";
import { 
  NATIONAL_EVENTS, 
  getEventsByCountry, 
  getUpcomingEvents, 
  getHighImpactEvents,
  getEventPlanningInsights,
  type NationalEvent 
} from "@/lib/nationalEvents";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  AlertTriangle, 
  TrendingUp,
  Filter,
  Clock,
  Info
} from "lucide-react";
import Link from "next/link";

export default function AgencyEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<NationalEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<NationalEvent[]>([]);
  const [filters, setFilters] = useState({
    country: "",
    type: "",
    year: "2024"
  });
  const [selectedEvent, setSelectedEvent] = useState<NationalEvent | null>(null);

  useEffect(() => {
    loadEvents();
  }, [filters]);

  const loadEvents = () => {
    let eventList: NationalEvent[] = [];

    if (filters.country) {
      eventList = getEventsByCountry(filters.country, parseInt(filters.year));
    } else {
      // Show all events for selected year
      eventList = NATIONAL_EVENTS.filter(event => 
        event.date.startsWith(filters.year)
      );
    }

    if (filters.type) {
      eventList = eventList.filter(event => event.type === filters.type);
    }

    setEvents(eventList);
    setFilteredEvents(eventList);
  };

  const handleCountryChange = (country: string) => {
    setFilters(prev => ({ ...prev, country }));
  };

  const handleTypeChange = (type: string) => {
    setFilters(prev => ({ ...prev, type }));
  };

  const handleYearChange = (year: string) => {
    setFilters(prev => ({ ...prev, year }));
  };

  const getEventTypeColor = (type: NationalEvent["type"]) => {
    switch (type) {
      case "holiday": return "bg-red-100 text-red-800";
      case "festival": return "bg-purple-100 text-purple-800";
      case "cultural": return "bg-blue-100 text-blue-800";
      case "religious": return "bg-green-100 text-green-800";
      case "national": return "bg-orange-100 text-orange-800";
      default: return "bg-muted text-foreground";
    }
  };

  const getImpactColor = (impact: NationalEvent["impact"]) => {
    switch (impact) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-muted text-foreground";
    }
  };

  const upcomingEvents = filters.country ? getUpcomingEvents(filters.country, 90) : [];
  const highImpactEvents = filters.country ? getHighImpactEvents(filters.country) : [];
  const planningInsights = filters.country ? getEventPlanningInsights(filters.country) : null;

  return (
    <ProtectedRoute requiredRole="agency">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link href="/agency/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">National Events & Holidays</h1>
          </div>
          <p className="text-muted-foreground">
            Plan your travel packages around important national events and holidays
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Filter className="h-4 w-4" />
              <h3 className="font-semibold">Filters</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Country</label>
                <Select value={filters.country} onValueChange={handleCountryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Countries</SelectItem>
                    <SelectItem value="Morocco">Morocco</SelectItem>
                    <SelectItem value="Spain">Spain</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Italy">Italy</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="Netherlands">Netherlands</SelectItem>
                    <SelectItem value="USA">USA</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Brazil">Brazil</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="Japan">Japan</SelectItem>
                    <SelectItem value="Thailand">Thailand</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="New Zealand">New Zealand</SelectItem>
                    <SelectItem value="Argentina">Argentina</SelectItem>
                    <SelectItem value="South Africa">South Africa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Event Type</label>
                <Select value={filters.type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="festival">Festival</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="religious">Religious</SelectItem>
                    <SelectItem value="national">National</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Year</label>
                <Select value={filters.year} onValueChange={handleYearChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Upcoming Events</h3>
              </div>
              
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {filters.country ? "No upcoming events" : "Select a country to see events"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 5).map((event, index) => (
                    <div key={event.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{event.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getEventTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* High Impact Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold">High Impact Events</h3>
              </div>
              
              {highImpactEvents.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {filters.country ? "No high impact events" : "Select a country to see events"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {highImpactEvents.map((event, index) => (
                    <div key={event.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{event.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getEventTypeColor(event.type)}>
                            {event.type}
                          </Badge>
                          <Badge className={getImpactColor(event.impact)}>
                            {event.impact}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {event.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Planning Insights */}
          {planningInsights && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Planning Insights</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Best Travel Periods</h4>
                    <div className="space-y-2">
                      {planningInsights.bestTravelPeriods.map((period, index) => (
                        <div key={index} className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{period.reason}</p>
                              <p className="text-xs text-muted-foreground">
                                {period.start} - {period.end}
                              </p>
                            </div>
                            <Clock className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Key Considerations</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        <span>Plan packages around major holidays for higher demand</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        <span>Consider shoulder seasons for better pricing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        <span>Avoid peak travel times around major events</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Events List */}
        {filteredEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-3"
          >
            <Card className="p-6">
              <h3 className="font-semibold mb-4">
                All Events ({filteredEvents.length})
              </h3>
              <div className="space-y-3">
                {filteredEvents.map((event, index) => (
                  <div key={event.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{event.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getEventTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                        <Badge className={getImpactColor(event.impact)}>
                          {event.impact}
                        </Badge>
                        {event.recurring && (
                          <Badge variant="outline" className="text-xs">
                            Recurring
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </ProtectedRoute>
  );
}

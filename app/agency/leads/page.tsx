"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/auth-context";
import { useLeads } from "@/hooks/useLeads";
import { useTaste } from "@/hooks/useTaste";
import type { Lead, LeadFilters } from "@/types/lead";
import { 
  ArrowLeft, 
  Users, 
  MapPin, 
  DollarSign, 
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  Clock,
  TrendingUp,
  Filter
} from "lucide-react";
import Link from "next/link";

export default function AgencyLeadsPage() {
  const { user } = useAuth();
  const { 
    leads, 
    isLoading, 
    updateLeadStatus, 
    addNote, 
    getLeadStats,
    filterLeads,
    getLeadsByDestination,
    getRecentLeads
  } = useLeads(user?.uid);
  const { loadTasteProfile } = useTaste();
  
  const [filters, setFilters] = useState<LeadFilters>({});
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const stats = getLeadStats();
  const recentLeads = getRecentLeads();
  const topDestinations = getLeadsByDestination();
  const filteredLeads = filterLeads(filters);

  const handleStatusChange = (leadId: string, status: Lead["status"]) => {
    updateLeadStatus(leadId, status);
  };

  const handleAddNote = async (leadId: string) => {
    if (!newNote.trim()) return;

    setIsAddingNote(true);
    try {
      addNote(leadId, newNote);
      setNewNote("");
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setIsAddingNote(false);
    }
  };

  const getStatusColor = (status: Lead["status"]) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "contacted": return "bg-yellow-100 text-yellow-800";
      case "quoted": return "bg-purple-100 text-purple-800";
      case "booked": return "bg-green-100 text-green-800";
      case "closed": return "bg-muted text-foreground";
      default: return "bg-muted text-foreground";
    }
  };

  const getStatusIcon = (status: Lead["status"]) => {
    switch (status) {
      case "new": return <Users className="h-4 w-4" />;
      case "contacted": return <Phone className="h-4 w-4" />;
      case "quoted": return <Mail className="h-4 w-4" />;
      case "booked": return <CheckCircle className="h-4 w-4" />;
      case "closed": return <MessageSquare className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <ProtectedRoute requiredRole="agency">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/agency/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Lead Management</h1>
            </div>
          </div>
          <p className="text-muted-foreground">
            Track and manage potential customers interested in your travel packages
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8"
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Booked</p>
                <p className="text-2xl font-bold">{stats.booked}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{stats.conversionRate}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recent (7 days)</p>
                <p className="text-2xl font-bold">{recentLeads.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <MapPin className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Destination</p>
                <p className="text-lg font-bold">
                  {topDestinations[0]?.destination || "N/A"}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4" />
              <h3 className="font-semibold">Filters</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-4 mt-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as Lead["status"] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Destination</label>
                <Input
                  placeholder="Search destinations..."
                  value={filters.destination || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, destination: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Budget</label>
                <Select value={filters.budget} onValueChange={(value) => setFilters(prev => ({ ...prev, budget: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All budgets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Leads Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredLeads.map((lead, index) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                {/* Lead Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(lead.status)}>
                        {getStatusIcon(lead.status)}
                        <span className="ml-1 capitalize">{lead.status}</span>
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg">{lead.destination}</h3>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Select value={lead.status} onValueChange={(value) => handleStatusChange(lead.id, value as Lead["status"])}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="quoted">Quoted</SelectItem>
                        <SelectItem value="booked">Booked</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Lead Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{lead.userName || lead.userEmail}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="capitalize">{lead.budget}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* User Preferences */}
                  {lead.preferences && Object.keys(lead.preferences).length > 0 && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2 text-sm">User Preferences</h4>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(lead.preferences)
                          .filter(([_, score]) => score > 50)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 5)
                          .map(([tag, score]) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag} ({score}%)
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Package Info */}
                  {lead.packageName && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-1 text-sm">Interested Package</h4>
                      <p className="text-sm">{lead.packageName}</p>
                    </div>
                  )}
                </div>

                {/* Notes Section */}
                {lead.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2 text-sm">Notes</h4>
                    <div className="bg-muted/50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">{lead.notes}</pre>
                    </div>
                  </div>
                )}

                {/* Add Note */}
                <div className="mt-4 flex gap-2">
                  <Input
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAddNote(lead.id)}
                    disabled={!newNote.trim() || isAddingNote}
                  >
                    Add Note
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredLeads.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No leads found</h3>
            <p className="text-muted-foreground">
              {Object.keys(filters).length > 0 
                ? "Start by attracting customers to your travel packages"
                : "Try adjusting your filters to see more results"
              }
            </p>
          </motion.div>
        )}
      </div>
    </ProtectedRoute>
  );
}

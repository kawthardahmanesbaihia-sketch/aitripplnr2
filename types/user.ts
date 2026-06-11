export type UserRole = "user" | "agency"

export interface User {
  uid:         string
  username:    string
  email:       string
  role:        UserRole
  full_name?:  string
  phone?:      string
  country?:    string
  city?:       string
  bio?:        string
  avatar_url?: string
  last_login?: string
  created_at?: string
}

export interface UserPreferences {
  travel_style?:        string
  budget?:              string
  preferred_climate?:   string
  favorite_activities?: string[]
  travel_type?:         string
}

export interface TravelHistoryEntry {
  id:                number
  country:           string
  city?:             string
  country_code?:     string
  match_percentage?: number
  travel_style?:     string
  budget?:           string
  image_url?:        string
  viewed_at:         string
}

export interface SavedDestination {
  id:                number
  country:           string
  city?:             string
  destination_name?: string
  image_url?:        string
  match_percentage?: number
  saved_at:          string
}

export interface AgencyProfile {
  agency_name?:    string
  phone?:          string
  website?:        string
  description?:    string
  logo_url?:       string
  total_trips:     number
  active_trips:    number
  total_bookings:  number
  total_travelers: number
}

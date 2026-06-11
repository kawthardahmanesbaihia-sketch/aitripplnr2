"use client";

import { useState, useEffect } from "react";
// Legacy types used by agency pages only — kept separate from the new auth system
type UserRole = "traveler" | "agency"
interface User {
  id:        string
  email:     string
  role:      UserRole
  name:      string
  createdAt: string
}

const STORAGE_KEY = "currentUser";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('user');
      if (stored) {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (email: string, role: UserRole, name?: string): User => {
    const newUser: User = {
      id: Date.now().toString(),
      email,
      role,
      name: name || email.split("@")[0],
      createdAt: new Date().toISOString()
    };

    setUser(newUser);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    } catch (error) {
      console.error("Error saving user:", error);
    }

    return newUser;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const isAgency = user?.role === "agency";
  const isUser = user?.role === "traveler";

  return {
    user,
    isLoading,
    login,
    logout,
    updateUser,
    isAgency,
    isUser
  };
};

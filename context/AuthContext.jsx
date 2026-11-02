"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Check customer session from HTTP-only cookie on mount
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: { credentials: "same-origin" },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.authenticated && data.user) {
          setUser({ ...data.user, isLoggedIn: true });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  /**
   * Log in customer with credentials.
   * Authenticates against /api/auth/login, setting HTTP-only cookie.
   */
  const login = async (email, password, rememberMe = false) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setUser({ ...data.user, isLoggedIn: true });
        setIsAuthModalOpen(false);
        return { success: true, user: data.user, message: data.message };
      }

      return {
        success: false,
        message: data.message || "Invalid email or password.",
        status: res.status,
      };
    } catch {
      return {
        success: false,
        message: "Network error occurred during login. Please try again.",
      };
    }
  };

  /**
   * Register a new customer.
   * Registers via /api/auth/register and sets HTTP-only cookie.
   */
  const register = async (name, email, password, confirmPassword) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setUser({ ...data.user, isLoggedIn: true });
        setIsAuthModalOpen(false);
        return { success: true, user: data.user, message: data.message };
      }

      return {
        success: false,
        message: data.message || "Failed to create account.",
        errors: data.errors,
        status: res.status,
      };
    } catch {
      return {
        success: false,
        message: "Network error occurred during registration. Please try again.",
      };
    }
  };

  /**
   * Log out customer.
   * Clears HTTP-only session cookie via /api/auth/logout.
   */
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
    }
  };

  // Safe user object with backward-compatible defaults
  const activeUser = user || {
    name: "Customer",
    email: "",
    isLoggedIn: false,
  };

  return (
    <AuthContext.Provider
      value={{
        user: activeUser,
        currentUser: user,
        isLoggedIn: Boolean(user?.isLoggedIn),
        loading,
        login,
        register,
        logout,
        checkSession,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

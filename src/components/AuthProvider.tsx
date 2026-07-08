import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, googleProvider, signInWithPopup, firebaseSignOut, onAuthStateChanged } from "../lib/firebase";

interface User {
  name?: string;
  email?: string;
  image?: string;
  role?: "administrator" | "healthcare_worker" | "doctor" | "patient";
}

interface Session {
  user?: User;
  expires?: string;
}

interface AuthContextType {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          setSession(data);
          setStatus("authenticated");
        } else {
          setSession(null);
          setStatus("unauthenticated");
        }
      } else {
        setSession(null);
        setStatus("unauthenticated");
      }
    } catch (err) {
      console.error("Failed to fetch session:", err);
      setSession(null);
      setStatus("unauthenticated");
    }
  };

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const savedRole = typeof window !== "undefined" ? localStorage.getItem("selected_role") : null;
          // Sync with backend session by sending user info
          const res = await fetch("/api/auth/firebase-signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              image: firebaseUser.photoURL,
              role: savedRole || undefined
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setSession({ user: data.user });
            setStatus("authenticated");
          } else {
            console.error("Failed to sync firebase user session with backend");
            setSession(null);
            setStatus("unauthenticated");
          }
        } catch (err) {
          console.error("Failed to sync session with backend:", err);
          setSession(null);
          setStatus("unauthenticated");
        }
      } else {
        // If there is no firebase user, check if there's any active backend session
        checkSession();
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (role?: string) => {
    try {
      setStatus("loading");
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      if (role && typeof window !== "undefined") {
        localStorage.setItem("selected_role", role);
      }
      
      const res = await fetch("/api/auth/firebase-signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          image: firebaseUser.photoURL, role
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setSession({ user: data.user });
        setStatus("authenticated");
      } else {
        throw new Error("Failed to sync user with backend session");
      }
    } catch (err) {
      console.error("Sign-in failed:", err);
      setStatus("unauthenticated");
      alert("Sign-in failed. Please ensure popups are allowed.");
    }
  };

  const signOut = async () => {
    try {
      setStatus("loading");
      if (typeof window !== "undefined") {
        localStorage.removeItem("selected_role");
      }
      // Sign out from Firebase
      await firebaseSignOut(auth);
      // Sign out from Backend
      await fetch("/api/auth/signout", { method: "POST" });
      setSession(null);
      setStatus("unauthenticated");
    } catch (err) {
      console.error("Sign out failed:", err);
      setStatus("unauthenticated");
    }
  };

  return (
    <AuthContext.Provider value={{ session, status, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSession() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSession must be used within an AuthProvider");
  }
  return { data: context.session, status: context.status };
}

export async function signIn(role?: string) {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    
    if (role && typeof window !== "undefined") {
      localStorage.setItem("selected_role", role);
    }
    
    await fetch("/api/auth/firebase-signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        image: firebaseUser.photoURL, role
      }),
    });
    window.location.reload();
  } catch (err) {
    console.error("Sign-in failed:", err);
    alert("Sign-in failed. Please ensure popups are allowed.");
  }
}

export async function signOut() {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem("selected_role");
    }
    try {
      await firebaseSignOut(auth);
    } catch (firebaseErr) {
      console.warn("Firebase signout warning:", firebaseErr);
    }
    await fetch("/api/auth/signout", { method: "POST" });
  } catch (err) {
    console.error("Sign out failed:", err);
  } finally {
    window.location.reload();
  }
}

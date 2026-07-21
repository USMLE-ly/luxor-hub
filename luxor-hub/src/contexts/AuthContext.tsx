import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isReady: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, options?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  isReady: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // If Supabase is not configured, skip auth entirely and go to offline mode
    if (!isSupabaseConfigured) {
      setLoading(false);
      setIsReady(true);
      return;
    }

    let resolved = false;

    // Timeout: if auth takes >6s, force-ready to prevent permanent spinner
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        setLoading(false);
        setIsReady(true);
      }
    }, 6000);

    let subscription: { unsubscribe: () => void } | null = null;

    try {
      // Subscribe FIRST — handles ALL auth events
      const result = supabase.auth.onAuthStateChange((_event, session) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          setLoading(false);
          setIsReady(true);
        }
        setSession(session);
        setUser(session?.user ?? null);
      });
      subscription = result.data?.subscription ?? null;
    } catch (err) {
      resolved = true;
      clearTimeout(timeout);
      setLoading(false);
      setIsReady(true);
    }

    // Hydrate from stored session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        setIsReady(true);
      })
      .catch((err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          setLoading(false);
          setIsReady(true);
        }
      });

    return () => {
      clearTimeout(timeout);
      resolved = true;
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) return { error: { message: "Database not connected" } };
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, options?: any) => {
    if (!isSupabaseConfigured) return { error: { message: "Database not connected" } };
    return await supabase.auth.signUp({ email, password, options });
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, isReady, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

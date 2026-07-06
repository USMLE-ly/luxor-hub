import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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
    // Timeout: if auth takes >6s, force-ready to prevent permanent spinner
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        setLoading(false);
        setIsReady(true);
        console.warn("[AUTH] Fallback timeout fired — forcing isReady=true");
      }
    }, 6000);

    let resolved = false;

    // Subscribe FIRST — guarantees no auth event is missed while getSession() resolves
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (resolved) return; // getSession() already set state
      resolved = true;
      clearTimeout(timeout);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setIsReady(true);
    });

    // Then hydrate from the stored session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (resolved) return; // onAuthStateChange already fired
      resolved = true;
      clearTimeout(timeout);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setIsReady(true);
    });

    return () => {
      clearTimeout(timeout);
      resolved = true; // prevent state updates after unmount
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, options?: any) => {
    return await supabase.auth.signUp({ email, password, options });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, isReady, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isReady: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  isReady: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let resolved = false;

    // Subscribe FIRST — guarantees no auth event is missed while getSession() resolves
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (resolved) return; // getSession() already set state
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setIsReady(true);
    });

    // Then hydrate from the stored session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (resolved) return; // onAuthStateChange already fired
      resolved = true;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setIsReady(true);
    });

    return () => {
      resolved = true; // prevent state updates after unmount
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, isReady, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

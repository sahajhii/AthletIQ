import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getProfile } from "@/integrations/supabase/queries";
import { useCartStore } from "@/stores/cart-store";
import type { Profile } from "@/types";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
  applyProfile: (profile: Profile | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const setCartUser = useCartStore((state) => state.setUser);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    try {
      const currentProfile = await getProfile(user.id);
      setProfile(currentProfile);
    } catch {
      setProfile(null);
    }
  }, [user]);

  const applyProfile = useCallback((nextProfile: Profile | null) => {
    setProfile(nextProfile);
  }, []);

  const syncProfileFromUser = useCallback(async (currentUser: User) => {
    const displayName =
      (currentUser.user_metadata?.display_name as string | undefined) ??
      (currentUser.user_metadata?.full_name as string | undefined) ??
      null;
    const avatarUrl = (currentUser.user_metadata?.avatar_url as string | undefined) ?? null;

    const { data } = await supabase
      .from("profiles")
      .upsert(
        {
          id: currentUser.id,
          display_name: displayName,
          avatar_url: avatarUrl,
        },
        { onConflict: "id" },
      )
      .select("*")
      .single();

    return (data as Profile | null) ?? null;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function syncSession(currentSession: Session | null) {
      if (!mounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setCartUser(currentSession?.user?.id ?? null);

      if (currentSession?.user) {
        try {
          const syncedProfile = await syncProfileFromUser(currentSession.user);
          const currentProfile = syncedProfile ?? (await getProfile(currentSession.user.id));
          if (mounted) setProfile(currentProfile);
        } catch {
          if (mounted) setProfile(null);
        }
      } else if (mounted) {
        setProfile(null);
      }

      if (mounted) setLoading(false);
    }

    supabase.auth
      .getSession()
      .then(({ data }) => syncSession(data.session))
      .catch(() => {
        if (!mounted) return;
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_, currentSession) => {
      void syncSession(currentSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [setCartUser, syncProfileFromUser]);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: profile?.role === "admin",
      refreshProfile,
      applyProfile,
    }),
    [applyProfile, loading, profile, refreshProfile, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider.");
  }
  return context;
}

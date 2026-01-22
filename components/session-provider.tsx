"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCompanyMe, getProfileMe } from "@/api/endpoints";
import type { Company, Profile } from "@/api/types";
import { createClient } from "@/lib/supabase/client";

type SessionContextValue = {
  token: string | null;
  user: User | null;
  profile: Profile | null;
  company: Company | null;
  loading: boolean;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
  setCompany: (company: Company | null) => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadProfile = useCallback(async (currentToken: string | null) => {
    if (!currentToken) {
      setProfile(null);
      setCompany(null);
      return;
    }
    setProfileLoading(true);
    try {
      const [profileData, companyData] = await Promise.all([
        getProfileMe(currentToken),
        getCompanyMe(currentToken),
      ]);
      setProfile(profileData);
      setCompany(companyData);
    } catch {
      setProfile(null);
      setCompany(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }
      setUser(data.session?.user ?? null);
      setToken(data.session?.access_token ?? null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setToken(session?.access_token ?? null);
      },
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }
    loadProfile(token);
  }, [loadProfile, loading, token]);

  const value = useMemo(
    () => ({
      token,
      user,
      profile,
      company,
      loading,
      profileLoading,
      refreshProfile: () => loadProfile(token),
      setCompany,
    }),
    [token, user, profile, company, loading, profileLoading, loadProfile],
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider.");
  }
  return context;
}

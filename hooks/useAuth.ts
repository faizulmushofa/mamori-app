import { useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  nim?: string | null;
  role: 'student' | 'staff' | 'public';
  isCampusVerified: boolean;
}

/**
 * Hook autentikasi reaktif MAMORI dengan SecureStore session.
 * Menjamin Zero Memory Leak dengan membersihkan listener onAuthStateChange saat unmount.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Profil pengguna terkonstruksi
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const resolveProfile = useCallback((currentUser: User | null): UserProfile | null => {
    if (!currentUser) return null;

    const email = currentUser.email || '';
    const isCampusDomain =
      email.endsWith('.ac.id') ||
      email.includes('@student.') ||
      email.includes('@mhs.') ||
      email.includes('@staff.');

    const meta = currentUser.user_metadata || {};
    const role: 'student' | 'staff' | 'public' =
      meta.role || (isCampusDomain ? 'student' : 'public');

    return {
      id: currentUser.id,
      name:
        meta.full_name ||
        meta.name ||
        email.split('@')[0] ||
        'Civitas Kampus',
      email,
      avatarUrl: meta.avatar_url || null,
      nim: meta.nim || null,
      role,
      isCampusVerified: isCampusDomain || meta.is_campus_verified === true,
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    // 1. Ambil session awal tersimpan di expo-secure-store
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        if (!isMounted) return;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setProfile(resolveProfile(initialSession?.user ?? null));
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    // 2. Subscribe perubahan auth (login, logout, refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setProfile(resolveProfile(currentSession?.user ?? null));
      setIsLoading(false);
    });

    // 3. Unsubscribe cleanup (Zero Memory Leak)
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [resolveProfile]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsLoading(false);
  }, []);

  return {
    user,
    session,
    profile,
    isAuthenticated: !!user,
    isLoading,
    signOut,
  };
}

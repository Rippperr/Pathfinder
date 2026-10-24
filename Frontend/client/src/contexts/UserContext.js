import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const activeUserId = useRef(null);
  const profileRequestId = useRef(0);

  // Function to fetch the profile with built-in retry logic
  const fetchProfile = useCallback(async (user, retries = 3, showLoading = true) => {
    const requestId = ++profileRequestId.current;
    const requestedUserId = user?.id;
    const isCurrentRequest = () => requestId === profileRequestId.current && activeUserId.current === requestedUserId;
    if (showLoading) setLoading(true);
    if (!user) {
      setProfile(null);
      if (showLoading) setLoading(false);
      return;
    }

    for (let i = 0; i < retries; i++) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!isCurrentRequest()) return;
      
      // If data is found OR the error is NOT "Row not found", we exit the loop
      if (data) {
        setProfile(data);
        if (showLoading) setLoading(false);
        return;
      }

      // Supabase error code PGRST116 means "No row found"
      // If we don't find a row, it means the trigger hasn't finished yet. We wait and retry.
      if (error && error.code === 'PGRST116' && i < retries - 1) {
        console.warn(`Profile not found yet. Retrying in 1 second... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
      } else if (error) {
        console.error("Final Profile Fetch Error:", error.message);
        if (showLoading) setProfile(null);
        if (showLoading) setLoading(false);
        return;
      }
    }
    if (isCurrentRequest() && showLoading) setLoading(false);
  }, []);

  useEffect(() => {
    // INITIAL_SESSION is the single source of truth for startup. Token refreshes
    // update the session but must not reload the profile or remount protected pages.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) {
        profileRequestId.current += 1;
        activeUserId.current = null;
        setProfile(null);
        setLoading(false);
        return;
      }
      if (event === 'INITIAL_SESSION' || activeUserId.current !== session.user.id) {
        setProfile(null);
        activeUserId.current = session.user.id;
        fetchProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const value = {
    session,
    profile,
    loading,
    refetchProfile: () => fetchProfile(session?.user, 3, false),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  return useContext(UserContext);
};

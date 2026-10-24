import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileStatus, setProfileStatus] = useState('loading');
  const [profileError, setProfileError] = useState(null);
  const activeUserId = useRef(null);
  const profileRequestId = useRef(0);

  // Function to fetch the profile with built-in retry logic
  const fetchProfile = useCallback(async (user, retries = 3, showLoading = true) => {
    const requestId = ++profileRequestId.current;
    const requestedUserId = user?.id;
    const isCurrentRequest = () => requestId === profileRequestId.current && activeUserId.current === requestedUserId;
    if (showLoading) setLoading(true);
    setProfileStatus(user ? 'loading' : 'signed_out');
    setProfileError(null);
    if (!user) {
      setProfile(null);
      if (showLoading) setLoading(false);
      return { ok: false, status: 'signed_out' };
    }

    for (let i = 0; i < retries; i++) {
      let result;
      try {
        result = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
      } catch (error) {
        result = { data: null, error: { message: error.message || 'The profile request failed.' } };
      }
      const { data, error } = result;

      if (!isCurrentRequest()) return { ok: false, status: 'stale' };
      
      // If data is found OR the error is NOT "Row not found", we exit the loop
      if (data) {
        setProfile(data);
        setProfileStatus('ready');
        if (showLoading) setLoading(false);
        return { ok: true, status: 'ready', profile: data };
      }

      // A missing profile may briefly follow signup while the auth trigger completes.
      if ((!error || error.code === 'PGRST116') && i < retries - 1) {
        console.warn(`Profile not found yet. Retrying in 1 second... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
      } else {
        if (error) console.error("Final Profile Fetch Error:", error.message);
        setProfile(null);
        const missing = !error || error.code === 'PGRST116';
        setProfileStatus(missing ? 'missing' : 'error');
        setProfileError(error || { message: 'No Pathfinder profile record exists for this account.' });
        if (showLoading) setLoading(false);
        return { ok: false, status: missing ? 'missing' : 'error', error };
      }
    }
    if (isCurrentRequest() && showLoading) setLoading(false);
    if (isCurrentRequest()) {
      setProfile(null);
      setProfileStatus('missing');
      setProfileError({ message: 'No Pathfinder profile record exists for this account.' });
    }
    return { ok: false, status: 'missing' };
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
        setProfileStatus('signed_out');
        setProfileError(null);
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
    profileStatus,
    profileError,
    refetchProfile: () => fetchProfile(session?.user, 3, true),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  return useContext(UserContext);
};

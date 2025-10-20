import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch the profile
  const fetchProfile = useCallback(async (user) => {
    setLoading(true);
    if (user) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!error) {
        setProfile(data);
      } else {
        // Handle case where profile might not exist yet after signup
        setProfile(null);
        console.warn("Could not fetch profile:", error.message);
      }
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, []);

  // Effect to manage session and initial profile fetch
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchProfile(session?.user);
    });

    // Listener for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      fetchProfile(session?.user); // Refetch profile on auth change
    });

    // Cleanup listener on unmount
    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // Define the context value, including refetchProfile
  const value = {
    session,
    profile,
    loading,
    // Ensure this function is provided to the context consumers
    refetchProfile: () => fetchProfile(session?.user),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook to consume the context
export const useUser = () => {
  return useContext(UserContext);
};
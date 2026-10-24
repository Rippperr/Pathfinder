import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../supabaseClient';
import Button from '../common/Button';
import './ProtectedRoute.css';

const ProtectedRoute = () => {
  const { session, profile, loading, profileStatus, profileError, refetchProfile } = useUser();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (profileStatus === 'error') {
    return <main className="profile-recovery" role="alert">
      <h1>We couldn’t load your Pathfinder profile</h1>
      <p>{profileError?.message || 'Check your connection and try again. Your account is still signed in.'}</p>
      <div><Button type="button" onClick={refetchProfile}>Try again</Button><Button type="button" variant="secondary" onClick={() => supabase.auth.signOut()}>Sign out</Button></div>
    </main>;
  }

  if (profileStatus === 'missing') {
    return <main className="profile-recovery" role="alert">
      <h1>Your Pathfinder profile needs recovery</h1>
      <p>This account is signed in, but it has no profile record to load. Retrying may help if signup is still finishing. If the message remains, sign out and contact support to restore the account record.</p>
      <div><Button type="button" onClick={refetchProfile}>Try again</Button><Button type="button" variant="secondary" onClick={() => supabase.auth.signOut()}>Sign out</Button></div>
    </main>;
  }

  if ((!profile || !profile.onboarding_completed) && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

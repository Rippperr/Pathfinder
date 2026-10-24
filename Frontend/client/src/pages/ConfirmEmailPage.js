import React, { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import Button from '../components/common/Button';
import PublicAuthLayout from '../components/layout/PublicAuthLayout';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../supabaseClient';
import './ConfirmEmailPage.css';

const ConfirmEmailPage = () => {
  const { session, loading } = useUser();
  const location = useLocation();
  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const email = location.state?.email || window.sessionStorage.getItem('pathfinder-confirmation-email') || '';

  if (session && !loading) {
    window.sessionStorage.removeItem('pathfinder-confirmation-email');
    return <Navigate to="/onboarding" replace />;
  }

  if (session) {
    return (
      <PublicAuthLayout title="Email confirmed." description="Your Pathfinder account is verified. We’re preparing your profile setup now.">
        <section className="confirmation-content" aria-live="polite" role="status">
          <div className="confirmation-icon" aria-hidden="true">✓</div>
          <h3>You’re verified</h3>
          <p>Just a moment while we securely load your account. Your profile setup will open automatically.</p>
          <div className="confirmation-progress" aria-hidden="true"><span /></div>
        </section>
      </PublicAuthLayout>
    );
  }

  const resendConfirmation = async () => {
    if (!email) {
      setErrorMessage('Return to sign up and enter your email address to request another link.');
      return;
    }

    setResending(true);
    setNotice('');
    setErrorMessage('');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    });
    if (error) setErrorMessage(error.message);
    else setNotice('A fresh confirmation link is on its way.');
    setResending(false);
  };

  return (
    <PublicAuthLayout title="One last step." description="Your Pathfinder account is ready. Confirm your email to create your career profile.">
      <section className="confirmation-content" aria-live="polite">
        <div className="confirmation-icon" aria-hidden="true">✉</div>
        <h3>Check your inbox</h3>
        <p>
          We sent a secure confirmation link{email ? <> to <strong>{email}</strong></> : ''}. Open it to verify your account.
        </p>
        <div className="confirmation-next-step">
          <span className="confirmation-check">1</span>
          <span><b>Confirm your email</b><small>The link will bring you right back here.</small></span>
        </div>
        <div className="confirmation-next-step">
          <span className="confirmation-check">2</span>
          <span><b>Build your profile</b><small>Share your current role, goals, and skills.</small></span>
        </div>
        {notice && <p className="confirmation-notice" role="status">{notice}</p>}
        {errorMessage && <p className="auth-form-error" role="alert">{errorMessage}</p>}
        <Button type="button" onClick={resendConfirmation} disabled={resending}>
          {resending ? 'Sending…' : 'Resend confirmation email'}
        </Button>
        <p className="confirmation-help">No email yet? Check your spam folder, or <Link to="/signup">try signing up again</Link>.</p>
      </section>
    </PublicAuthLayout>
  );
};

export default ConfirmEmailPage;

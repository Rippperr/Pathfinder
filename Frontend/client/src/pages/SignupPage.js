import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Button from '../components/common/Button';
import PublicAuthLayout from '../components/layout/PublicAuthLayout';
import './LoginPage.css'; // Reusing the login page styles

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm-email`,
        },
      });
      if (error) throw error;
      window.sessionStorage.setItem('pathfinder-confirmation-email', email.trim());
      navigate('/confirm-email', { state: { email: email.trim() } });
    } catch (error) {
      setErrorMessage(error.error_description || error.message || 'We could not create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicAuthLayout title="Start with clarity." description="Create your free Pathfinder account and build a career plan around your goals.">
        <div className="login-form">
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {errorMessage && <p className="auth-form-error" role="alert">{errorMessage}</p>}
            <Button type="submit" disabled={submitting}>{submitting ? 'Creating your account…' : 'Create my account'}</Button>
          </form>

          {/* 2. Add the login link at the bottom */}
          <div className="login-links">
            <span>
              Already have an account? <Link to="/login">Log in</Link>
            </span>
          </div>
        </div>
    </PublicAuthLayout>
  );
};

export default SignupPage;

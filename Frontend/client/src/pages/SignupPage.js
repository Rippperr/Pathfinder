import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // 1. Import Link
import { supabase } from '../supabaseClient';
import Button from '../components/common/Button';
import PublicAuthLayout from '../components/layout/PublicAuthLayout';
import './LoginPage.css'; // Reusing the login page styles

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (event) => {
    event.preventDefault();
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });
      if (error) throw error;
      alert('Signup successful! Please check your email to verify.');
    } catch (error) {
      alert(error.error_description || error.message);
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
            <Button type="submit">Sign Up</Button>
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

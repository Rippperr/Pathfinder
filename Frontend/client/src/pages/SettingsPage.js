import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../contexts/UserContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import './SettingsPage.css';

const preferenceKey = (userId) => `pathfinder-settings:${userId}`;
const defaults = { learningStyle: 'balanced', weeklyHours: '4' };

const SettingsPage = () => {
  const { session, profile } = useUser();
  const user = session?.user;
  const [preferences, setPreferences] = useState(defaults);
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    setEmail(user?.email || '');
    if (!user?.id) return;
    try {
      const saved = JSON.parse(localStorage.getItem(preferenceKey(user.id)) || '{}');
      setPreferences({ ...defaults, ...saved });
    } catch {
      setPreferences(defaults);
    }
  }, [user?.id, user?.email]);

  const updatePreference = (key, value) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem(preferenceKey(user.id), JSON.stringify(updated));
    setNotice({ type: 'success', text: 'Your learning preferences have been saved on this device.' });
  };

  const changeEmail = async (event) => {
    event.preventDefault();
    if (!email.trim() || email.trim() === user.email) return;
    setBusy('email'); setNotice(null);
    const { error } = await supabase.auth.updateUser({ email: email.trim() });
    setBusy('');
    setNotice(error
      ? { type: 'error', text: error.message }
      : { type: 'success', text: 'Email change requested. Follow the confirmation link sent to your inbox to complete it.' });
  };

  const changePassword = async (event) => {
    event.preventDefault(); setNotice(null);
    if (newPassword.length < 8) return setNotice({ type: 'error', text: 'Choose a password with at least 8 characters.' });
    if (newPassword !== confirmPassword) return setNotice({ type: 'error', text: 'The passwords do not match.' });
    setBusy('password');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setBusy('');
    if (error) return setNotice({ type: 'error', text: error.message });
    setNewPassword(''); setConfirmPassword('');
    setNotice({ type: 'success', text: 'Your password has been updated.' });
  };

  const exportData = async () => {
    setBusy('export'); setNotice(null);
    const [skillsResult, achievementsResult] = await Promise.all([
      supabase.from('user_skills').select('skill_id, skills(name)').eq('user_id', user.id),
      supabase.from('achievements').select('*').eq('user_id', user.id),
    ]);
    setBusy('');
    if (skillsResult.error || achievementsResult.error) {
      return setNotice({ type: 'error', text: skillsResult.error?.message || achievementsResult.error?.message || 'Your data could not be exported.' });
    }
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      account: { email: user.email, createdAt: user.created_at },
      profile: profile || null,
      skills: skillsResult.data || [],
      achievements: achievementsResult.data || [],
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'pathfinder-account-data.json'; link.click();
    URL.revokeObjectURL(url);
    setNotice({ type: 'success', text: 'Your Pathfinder data download is ready.' });
  };

  return (
    <main className="settings-page">
      <header className="settings-heading">
        <p className="settings-eyebrow">MAKE PATHFINDER YOURS</p>
        <h1>Settings</h1>
        <p>Manage your account, choose how you like to learn, and keep control of your data.</p>
      </header>
      {notice && <p className={`settings-notice ${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>{notice.text}</p>}

      <nav className="settings-jump-nav" aria-label="Settings sections">
        <a href="#account">Account</a><a href="#learning">Learning preferences</a><a href="#security">Security</a><a href="#privacy">Data &amp; privacy</a>
      </nav>

      <section id="account" className="settings-section">
        <div className="settings-section-heading"><span>01</span><div><h2>Account</h2><p>Your sign-in details and Pathfinder profile.</p></div></div>
        <Card className="settings-card">
          <form onSubmit={changeEmail} className="settings-form">
            <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
            <div className="settings-inline-actions"><p>{user?.email_confirmed_at ? 'Email verified' : 'Email confirmation pending'}</p><Button type="submit" disabled={busy === 'email' || email.trim() === user?.email}>{busy === 'email' ? 'Sending…' : 'Update email'}</Button></div>
          </form>
          <div className="settings-divider" />
          <div className="settings-profile-link"><div><h3>Career profile</h3><p>Update your name, experience, skills, and career direction.</p></div><Link to="/edit-profile">Edit profile <span aria-hidden="true">↗</span></Link></div>
        </Card>
      </section>

      <section id="learning" className="settings-section">
        <div className="settings-section-heading"><span>02</span><div><h2>Learning preferences</h2><p>Shape the resources Pathfinder recommends for your goals.</p></div></div>
        <Card className="settings-card">
          <label className="settings-select-label">How do you prefer to learn?
            <select value={preferences.learningStyle} onChange={(event) => updatePreference('learningStyle', event.target.value)}>
              <option value="balanced">A balanced mix</option><option value="video">Video courses and playlists</option><option value="reading">Guides and official documentation</option><option value="hands-on">Hands-on practice</option>
            </select>
          </label>
          <fieldset className="hours-fieldset"><legend>Weekly learning target</legend><div className="hours-options">{['2', '4', '6', '8'].map((hours) => <label key={hours} className={preferences.weeklyHours === hours ? 'selected' : ''}><input type="radio" name="weekly-hours" value={hours} checked={preferences.weeklyHours === hours} onChange={() => updatePreference('weeklyHours', hours)} /><span>{hours} hrs</span></label>)}</div></fieldset>
          <p className="settings-muted">Preferences are saved in this browser and used to personalize your dashboard. Weekly targets are guidance, not a time tracker.</p>
        </Card>
      </section>

      <section id="security" className="settings-section">
        <div className="settings-section-heading"><span>03</span><div><h2>Security</h2><p>Use a strong password to protect your account.</p></div></div>
        <Card className="settings-card">
          <form onSubmit={changePassword} className="settings-form settings-password-form">
            <label>New password<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength="8" placeholder="At least 8 characters" required /></label>
            <label>Confirm new password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength="8" placeholder="Enter it again" required /></label>
            <div className="settings-inline-actions"><p>Changing your password keeps you signed in on this device.</p><Button type="submit" disabled={busy === 'password'}>{busy === 'password' ? 'Updating…' : 'Update password'}</Button></div>
          </form>
        </Card>
      </section>

      <section id="privacy" className="settings-section">
        <div className="settings-section-heading"><span>04</span><div><h2>Data &amp; privacy</h2><p>Take a copy of the career information you have added.</p></div></div>
        <Card className="settings-card settings-data-card"><div><h3>Download your Pathfinder data</h3><p>Export your profile, skills, and achievements as a JSON file. This does not include your password or private sign-in tokens.</p></div><Button type="button" variant="secondary" disabled={busy === 'export'} onClick={exportData}>{busy === 'export' ? 'Preparing…' : 'Download my data'}</Button></Card>
      </section>
      <p className="settings-footer-note">Need help with your account? <Link to="/profile">Visit your profile</Link> or sign out from the navigation menu.</p>
    </main>
  );
};

export default SettingsPage;

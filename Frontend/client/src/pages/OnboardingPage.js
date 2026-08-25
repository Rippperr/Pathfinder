import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { supabase } from '../supabaseClient';
import { useUser } from '../contexts/UserContext';
import './OnboardingPage.css';

const OnboardingPage = () => {
  const { session, profile, refetchProfile } = useUser();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [skills, setSkills] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [form, setForm] = useState({
    name: '',
    title: '',
    department: '',
    experience: '',
    location: '',
    careerGoals: '',
  });

  useEffect(() => {
    if (!profile) return;

    setForm({
      name: profile.name || '',
      title: profile.title || '',
      department: profile.department || '',
      experience: profile.experience || '',
      location: profile.location || '',
      careerGoals: profile.career_goals || '',
    });
  }, [profile]);

  useEffect(() => {
    const loadSkills = async () => {
      const { data, error } = await supabase.from('skills').select('*').order('name');

      if (error) {
        setErrorMessage(`Could not load skills: ${error.message}`);
      } else {
        setSkills(data || []);
      }
      setSkillsLoading(false);
    };

    loadSkills();
  }, []);

  const updateField = (field) => (event) => {
    setForm((currentForm) => ({ ...currentForm, [field]: event.target.value }));
  };

  const toggleSkill = (skillId) => {
    setSelectedSkillIds((currentIds) => (
      currentIds.includes(skillId)
        ? currentIds.filter((id) => id !== skillId)
        : [...currentIds, skillId]
    ));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');

    if (selectedSkillIds.length > 0) {
      const { error: skillsError } = await supabase
        .from('user_skills')
        .upsert(
          selectedSkillIds.map((skillId) => ({ user_id: session.user.id, skill_id: skillId })),
          { onConflict: 'user_id,skill_id' }
        );

      if (skillsError) {
        setErrorMessage(`Could not save your skills: ${skillsError.message}`);
        setSaving(false);
        return;
      }
    }

    const { error } = await supabase
      .from('users')
      .update({
        name: form.name.trim(),
        title: form.title.trim(),
        department: form.department.trim(),
        experience: form.experience.trim(),
        location: form.location.trim(),
        career_goals: form.careerGoals.trim(),
        onboarding_completed: true,
      })
      .eq('id', session.user.id);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    await refetchProfile();
    navigate('/dashboard', { replace: true });
  };

  return (
    <main className="onboarding-page">
      <Card className="onboarding-card">
        <p className="onboarding-step">Step 1 of 1</p>
        <h1>Let’s build your career starting point</h1>
        <p className="onboarding-intro">
          Tell us where you are today. Pathfinder will use this to make your role roadmap more relevant.
        </p>

        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="onboarding-name">Name</label>
              <input id="onboarding-name" value={form.name} onChange={updateField('name')} required />
            </div>
            <div className="form-group">
              <label htmlFor="onboarding-title">Current or desired role</label>
              <input
                id="onboarding-title"
                value={form.title}
                onChange={updateField('title')}
                placeholder="e.g. Student, Frontend Developer"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="onboarding-experience">Experience</label>
              <select id="onboarding-experience" value={form.experience} onChange={updateField('experience')} required>
                <option value="">Select your experience</option>
                <option value="Student / Fresher">Student / Fresher</option>
                <option value="0–1 years">0–1 years</option>
                <option value="1–3 years">1–3 years</option>
                <option value="3–5 years">3–5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="onboarding-location">Location</label>
              <input id="onboarding-location" value={form.location} onChange={updateField('location')} placeholder="e.g. Bengaluru, India" />
            </div>
            <div className="form-group full-width">
              <label htmlFor="onboarding-department">Education, department, or current team</label>
              <input id="onboarding-department" value={form.department} onChange={updateField('department')} />
            </div>
            <div className="form-group full-width">
              <label htmlFor="onboarding-goals">What career goal are you working toward?</label>
              <textarea
                id="onboarding-goals"
                rows="4"
                value={form.careerGoals}
                onChange={updateField('careerGoals')}
                placeholder="e.g. Get an entry-level frontend role in the next six months"
              />
            </div>
            <fieldset className="onboarding-skills full-width">
              <legend>Which skills do you already have?</legend>
              <p>Select all that apply. You can edit your skillset later from your profile.</p>
              {skillsLoading ? (
                <span>Loading skills...</span>
              ) : (
                <div className="onboarding-skill-options">
                  {skills.map((skill) => (
                    <label key={skill.id} className="onboarding-skill-option">
                      <input
                        type="checkbox"
                        checked={selectedSkillIds.includes(skill.id)}
                        onChange={() => toggleSkill(skill.id)}
                      />
                      <span>{skill.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>
          </div>

          {errorMessage && <p className="onboarding-error">Could not save your details: {errorMessage}</p>}
          <Button type="submit" disabled={saving || skillsLoading}>
            {saving ? 'Saving your profile...' : 'Continue to my dashboard'}
          </Button>
        </form>
      </Card>
    </main>
  );
};

export default OnboardingPage;

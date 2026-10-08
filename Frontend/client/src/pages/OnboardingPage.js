import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { supabase } from '../supabaseClient';
import { useUser } from '../contexts/UserContext';
import { careerRoleGuides } from '../data/careerCatalog';
import './OnboardingPage.css';

const categoryForSkill = (skill) => {
  if (skill.category) return skill.category;
  const name = skill.name.toLowerCase();
  if (/communicat|leadership|teamwork|problem solv|time management|writing|presentation|critical thinking/.test(name)) return 'Workplace skills';
  if (/figma|design|wirefram|prototyp|accessibility|visual/.test(name)) return 'Design';
  if (/sql|database|excel|power bi|tableau|analytics|statistics|data/.test(name)) return 'Data';
  if (/cloud|aws|azure|docker|kubernetes|linux|devops|git|cyber|network/.test(name)) return 'Cloud & tools';
  if (/python|java|javascript|typescript|react|node|html|css|api|c\+\+|\.net|testing|programming|machine learning| ai /.test(` ${name} `)) return 'Technology';
  if (/marketing|sales|finance|account|product|project|business|agile|scrum|customer|research/.test(name)) return 'Business';
  return 'Other skills';
};

const OnboardingPage = () => {
  const { session, profile, refetchProfile } = useUser();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [skills, setSkills] = useState([]);
  const [roleTitles, setRoleTitles] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '',
    currentRole: '',
    desiredRole: '',
    department: '',
    experience: '',
    location: '',
    careerGoals: '',
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      name: profile.name || '',
      currentRole: profile.title || '',
      desiredRole: profile.desired_role || '',
      department: profile.department || '',
      experience: profile.experience || '',
      location: profile.location || '',
      careerGoals: profile.career_goals || '',
    });
  }, [profile]);

  useEffect(() => {
    let active = true;
    const loadSkills = async () => {
      const [{ data, error }, { data: userSkills }, { data: rolesData }] = await Promise.all([
        supabase.from('skills').select('*').order('name'),
        supabase.from('user_skills').select('skill_id').eq('user_id', session.user.id),
        supabase.from('roles').select('title').order('title'),
      ]);
      if (!active) return;
      if (error) setErrorMessage(`Could not load skills: ${error.message}`);
      else setSkills(data || []);
      setRoleTitles((rolesData || []).map((role) => role.title));
      setSelectedSkillIds((userSkills || []).map((item) => item.skill_id));
      setSkillsLoading(false);
    };
    if (session?.user?.id) loadSkills();
    return () => { active = false; };
  }, [session]);

  const groupedSkills = useMemo(() => {
    const query = search.trim().toLowerCase();
    return skills.reduce((groups, skill) => {
      if (query && !skill.name.toLowerCase().includes(query)) return groups;
      const category = categoryForSkill(skill);
      if (!groups[category]) groups[category] = [];
      groups[category].push(skill);
      return groups;
    }, {});
  }, [skills, search]);

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
        title: form.currentRole.trim(),
        desired_role: form.desiredRole.trim(),
        department: form.department.trim(),
        experience: form.experience,
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
      <header className="onboarding-nav">
        <Link to="/" className="onboarding-brand"><span className="onboarding-brand-mark">P</span>Pathfinder</Link>
        <span className="onboarding-nav-note">Your next chapter starts here</span>
      </header>
      <section className="onboarding-shell">
        <div className="onboarding-heading">
          <p className="onboarding-step"><span>01</span> Your Pathfinder profile</p>
          <h1>Let’s map your next move.</h1>
          <p className="onboarding-intro">A few details help us make your roadmap personal, practical, and focused on the role you want.</p>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form">
          <section className="onboarding-section" aria-labelledby="about-you-title">
            <div className="onboarding-section-heading"><span>01</span><div><h2 id="about-you-title">Start with you</h2><p>Tell us where you are and where you want to go.</p></div></div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="onboarding-name">Your name <i>*</i></label>
                <input id="onboarding-name" value={form.name} onChange={updateField('name')} placeholder="e.g. Aisha Sharma" autoComplete="name" required />
              </div>
              <div className="form-group">
                <label htmlFor="onboarding-current-role">Current role</label>
                <input id="onboarding-current-role" value={form.currentRole} onChange={updateField('currentRole')} placeholder="e.g. Student, Marketing Associate" />
              </div>
              <div className="form-group">
                <label htmlFor="onboarding-desired-role">Desired role <i>*</i></label>
                <input id="onboarding-desired-role" list="pathfinder-role-options" value={form.desiredRole} onChange={updateField('desiredRole')} placeholder="e.g. AI Engineer, Data Engineer" required />
                <datalist id="pathfinder-role-options">{[...new Set([...careerRoleGuides.map((role) => role.title), ...roleTitles])].map((title) => <option value={title} key={title} />)}</datalist>
              </div>
              <div className="form-group">
                <label htmlFor="onboarding-experience">Experience <i>*</i></label>
                <select id="onboarding-experience" value={form.experience} onChange={updateField('experience')} required>
                  <option value="">Choose your experience</option>
                  <option value="Student / Fresher">Student / Fresher</option>
                  <option value="0–1 years">0–1 years</option>
                  <option value="1–3 years">1–3 years</option>
                  <option value="3–5 years">3–5 years</option>
                  <option value="5+ years">5+ years</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="onboarding-location">Location</label>
                <input id="onboarding-location" value={form.location} onChange={updateField('location')} placeholder="e.g. Bengaluru, India" autoComplete="address-level2" />
              </div>
              <div className="form-group">
                <label htmlFor="onboarding-department">Education or team</label>
                <input id="onboarding-department" value={form.department} onChange={updateField('department')} placeholder="e.g. Computer Science, Growth team" />
              </div>
              <div className="form-group full-width">
                <label htmlFor="onboarding-goals">What would you like to achieve?</label>
                <textarea id="onboarding-goals" rows="3" value={form.careerGoals} onChange={updateField('careerGoals')} placeholder="e.g. Build a portfolio and move into a product design role this year" />
              </div>
            </div>
          </section>

          <section className="onboarding-section skills-section" aria-labelledby="skills-title">
            <div className="onboarding-section-heading"><span>02</span><div><h2 id="skills-title">Skills you already have</h2><p>Choose what you know today. You can update this anytime.</p></div></div>
            <div className="skills-toolbar">
              <label className="skills-search" htmlFor="skills-search"><span aria-hidden="true">⌕</span><input id="skills-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search skills, tools, or strengths" /></label>
              <span className="skills-selected-count">{selectedSkillIds.length} selected</span>
            </div>
            {skillsLoading ? <p className="skills-loading">Loading your skill library…</p> : Object.keys(groupedSkills).length ? (
              <div className="skills-category-list">
                {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                  <div className="skills-category" key={category}>
                    <h3>{category}<span>{categorySkills.length}</span></h3>
                    <div className="onboarding-skill-options">
                      {categorySkills.map((skill) => {
                        const selected = selectedSkillIds.includes(skill.id);
                        return (
                          <label key={skill.id} className={`onboarding-skill-option${selected ? ' is-selected' : ''}`}>
                            <input type="checkbox" checked={selected} onChange={() => toggleSkill(skill.id)} />
                            <span className="skill-option-check" aria-hidden="true">{selected ? '✓' : '+'}</span>
                            <span>{skill.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="skills-empty">No matching skills. Try another search.</p>}
          </section>

          {errorMessage && <p className="onboarding-error" role="alert">Could not save your details: {errorMessage}</p>}
          <div className="onboarding-submit-row"><span>Your details stay private and help personalize your roadmap.</span><Button type="submit" disabled={saving || skillsLoading}>{saving ? 'Saving your profile…' : 'Build my roadmap'} <span aria-hidden="true">→</span></Button></div>
        </form>
      </section>
      <footer className="onboarding-footer">Pathfinder <span>·</span> Clear steps toward work that fits you.</footer>
    </main>
  );
};

export default OnboardingPage;

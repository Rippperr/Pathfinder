import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../contexts/UserContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import CustomDropdown from '../components/common/CustomDropdown';
import './ProfilePage.css';

const ProfilePage = () => {
  const { session, profile, loading } = useUser();
  const location = useLocation();
  const [userSkillIds, setUserSkillIds] = useState(new Set());
  const [allSkills, setAllSkills] = useState([]);
  const [skillToAdd, setSkillToAdd] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [skillError, setSkillError] = useState('');

  useEffect(() => {
    let active = true;
    const getPageData = async () => {
      const [{ data: allSkillsData }, { data: userSkillsData }, { data: achievementsData }] = await Promise.all([
        supabase.from('skills').select('*').order('name'),
        supabase.from('user_skills').select('skill_id').eq('user_id', session.user.id),
        supabase.from('achievements').select('*').eq('user_id', session.user.id),
      ]);
      if (!active) return;
      if (allSkillsData) setAllSkills(allSkillsData);
      if (userSkillsData) setUserSkillIds(new Set(userSkillsData.map((skill) => skill.skill_id)));
      if (achievementsData) setAchievements(achievementsData);
    };
    if (session?.user?.id) getPageData();
    return () => { active = false; };
  }, [session]);

  const handleAddSkill = async (event) => {
    event.preventDefault();
    if (!skillToAdd) return;
    setSkillError('');
    const { error } = await supabase
      .from('user_skills')
      .insert({ user_id: session.user.id, skill_id: skillToAdd.id });
    if (error) setSkillError(error.message);
    else {
      setUserSkillIds((current) => new Set(current).add(skillToAdd.id));
      setSkillToAdd('');
      setIsAddingSkill(false);
    }
  };

  const handleRemoveSkill = async (skillId) => {
    setSkillError('');
    const { error } = await supabase
      .from('user_skills')
      .delete()
      .eq('user_id', session.user.id)
      .eq('skill_id', skillId);
    if (error) setSkillError(error.message);
    else setUserSkillIds((current) => {
      const updated = new Set(current);
      updated.delete(skillId);
      return updated;
    });
  };

  const availableSkillsToAdd = allSkills.filter((skill) => !userSkillIds.has(skill.id));
  const userSkills = allSkills.filter((skill) => userSkillIds.has(skill.id));

  if (loading || !profile) return <div className="profile-loading">Loading your profile…</div>;

  return (
    <main className="profile-page">
      <header className="profile-page-heading">
        <p className="profile-eyebrow">YOUR PATHFINDER SPACE</p>
        <h1>Your profile</h1>
        <p>Keep your experience, skills, and career direction current as you grow.</p>
      </header>
      {location.state?.profileSaved && <p className="profile-saved-banner" role="status">Your profile has been saved.</p>}

      <div className="profile-grid">
        <Card className="profile-card">
          <div className="profile-identity">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={`${profile.name || 'Your'} profile`} className="profile-avatar-large" />
            ) : (
              <div className="profile-avatar-empty" aria-label="No profile photo added yet"><span aria-hidden="true">+</span></div>
            )}
            <h2>{profile.name || 'Your name'}</h2>
            <p className="profile-title">{profile.title || 'Current role not added'}</p>
            <p className="profile-email">{session.user.email}</p>
            <Link to="/edit-profile" className="profile-photo-link">{profile.avatar_url ? 'Change profile photo' : 'Add your profile photo'} <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="profile-divider" />
          <div className="profile-target-role">
            <span className="profile-target-icon" aria-hidden="true">↗</span>
            <div><small>WORKING TOWARD</small><b>{profile.desired_role || 'Add your desired role'}</b></div>
          </div>
          <div className="profile-actions-footer">
            <Link to="/edit-profile" className="profile-edit-button"><span aria-hidden="true">✎</span> Edit profile details</Link>
          </div>
        </Card>

        <div className="profile-right-column">
          <Card className="profile-details-card">
            <div className="profile-card-heading"><div><p className="profile-card-kicker">THE FOUNDATION</p><h2>Career details</h2></div><Link to="/edit-profile" aria-label="Edit career details">Edit <span aria-hidden="true">↗</span></Link></div>
            <div className="profile-details-grid">
              <div><span>Current role</span><b>{profile.title || 'Not added yet'}</b></div>
              <div><span>Desired role</span><b>{profile.desired_role || 'Not added yet'}</b></div>
              <div><span>Experience</span><b>{profile.experience || 'Not added yet'}</b></div>
              <div><span>Education or team</span><b>{profile.department || 'Not added yet'}</b></div>
              <div><span>Location</span><b>{profile.location || 'Not added yet'}</b></div>
            </div>
          </Card>

          <Card className="skills-card">
            <div className="profile-card-heading"><div><p className="profile-card-kicker">WHAT YOU BRING</p><h2>My skillset <span className="profile-count">{userSkills.length}</span></h2></div></div>
            {userSkills.length ? (
              <div className="skills-list">
                {userSkills.map((skill) => (
                  <span key={skill.id} className="skill-badge-removable">{skill.name}<button type="button" onClick={() => handleRemoveSkill(skill.id)} className="remove-icon" aria-label={`Remove ${skill.name}`}>&times;</button></span>
                ))}
              </div>
            ) : <p className="profile-empty-copy">Your skills will show here. Add the strengths and tools you already use.</p>}
            {skillError && <p className="profile-inline-error" role="alert">{skillError}</p>}
            {isAddingSkill ? (
              <form onSubmit={handleAddSkill} className="add-skill-form">
                <CustomDropdown options={availableSkillsToAdd} selectedValue={skillToAdd?.id} onChange={setSkillToAdd} placeholder="Choose a skill" displayKey="name" />
                <Button type="submit" disabled={!skillToAdd}>Add skill</Button>
                <Button type="button" variant="secondary" onClick={() => setIsAddingSkill(false)}>Cancel</Button>
              </form>
            ) : (
              <button className="add-skill-button" type="button" onClick={() => setIsAddingSkill(true)} disabled={!availableSkillsToAdd.length}>
                <span aria-hidden="true">+</span> Add a skill
              </button>
            )}
          </Card>

          <Card className="goals-card">
            <div className="profile-card-heading"><div><p className="profile-card-kicker">YOUR DIRECTION</p><h2>Career goals</h2></div><Link to="/edit-profile" aria-label="Edit career goals">Edit <span aria-hidden="true">↗</span></Link></div>
            <p>{profile.career_goals || 'Your goals will appear here once you add what you are working toward.'}</p>
          </Card>

          <Card className="achievements-card">
            <div className="profile-card-heading"><div><p className="profile-card-kicker">PROGRESS WORTH REMEMBERING</p><h2>Recent achievements</h2></div><Link to="/edit-profile" aria-label="Edit achievements">Edit <span aria-hidden="true">↗</span></Link></div>
            {achievements.length ? (
              <div className="achievements-list">
                {achievements.map((item) => (
                  <div key={item.id} className="achievement-item"><span className="achievement-dot" /><div className="achievement-text"><h3 className="achievement-title">{item.title}</h3><p className="achievement-subtitle">{item.subtitle}</p></div></div>
                ))}
              </div>
            ) : <p className="profile-empty-copy">Projects, milestones, and wins you add will be collected here.</p>}
          </Card>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;

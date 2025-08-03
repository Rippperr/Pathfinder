import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../contexts/UserContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { LuPlus, LuPencil } from 'react-icons/lu';
import './ProfilePage.css';

// Placeholder data for the new section
const recentAchievements = [
  { title: 'Led Frontend Redesign Project', subtitle: 'Improved user engagement by 35%', color: 'green' },
  { title: 'Completed React Advanced Certification', subtitle: 'Earned certification from React Training', color: 'blue' },
  { title: 'Mentored 2 Junior Developers', subtitle: 'Helped onboard new team members', color: 'purple' },
];

const ProfilePage = () => {
  const { session, profile: contextProfile, loading: contextLoading } = useUser();
  
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [userSkillIds, setUserSkillIds] = useState(new Set());
  const [allSkills, setAllSkills] = useState([]);
  const [skillToAdd, setSkillToAdd] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  useEffect(() => {
    if (contextProfile) {
      setProfile(contextProfile);
      setName(contextProfile.name || '');
      setTitle(contextProfile.title || '');
    }

    const getSkillsData = async () => {
      const { data: allSkillsData } = await supabase.from('skills').select('*');
      if (allSkillsData) setAllSkills(allSkillsData);

      if (session?.user) {
        const { data: userSkillsData } = await supabase.from('user_skills').select('skill_id').eq('user_id', session.user.id);
        if (userSkillsData) setUserSkillIds(new Set(userSkillsData.map(s => s.skill_id)));
      }
    };
    
    getSkillsData();
  }, [session, contextProfile]);

  const handleProfileUpdate = async () => {
    const { data, error } = await supabase
      .from('users')
      .update({ name: name, title: title })
      .eq('id', session.user.id)
      .select()
      .single();

    if (error) {
      alert(error.message);
    } else {
      setProfile(data);
      setIsEditing(false);
    }
  };

  const cancelEdit = () => {
    setName(profile.name);
    setTitle(profile.title || '');
    setIsEditing(false);
  };

  const handleAddSkill = async (event) => {
    event.preventDefault();
    if (!skillToAdd) return;
    const { error } = await supabase
      .from('user_skills')
      .insert({ user_id: session.user.id, skill_id: skillToAdd });
    if (error) {
      alert(error.message);
    } else {
      setUserSkillIds(prev => new Set(prev).add(parseInt(skillToAdd)));
      setSkillToAdd('');
      setIsAddingSkill(false);
    }
  };

  const handleRemoveSkill = async (skillId) => {
    const { error } = await supabase
      .from('user_skills')
      .delete()
      .eq('user_id', session.user.id)
      .eq('skill_id', skillId);
    if (error) {
      alert(error.message);
    } else {
      setUserSkillIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(skillId);
        return newSet;
      });
    }
  };

  const availableSkillsToAdd = allSkills.filter(skill => !userSkillIds.has(skill.id));
  const userSkills = allSkills.filter(skill => userSkillIds.has(skill.id));

  if (contextLoading || !profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <h1>My Profile</h1>
      <div className="profile-grid">
        <Card className="profile-card">
          <img 
            src={profile.avatar_url || `https://i.pravatar.cc/150?u=${session.user.id}`} 
            alt={profile.name} 
            className="profile-avatar-large" 
          />
          <div className="profile-header">
            <div className="profile-info">
              {isEditing ? (
                <div className="edit-details">
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="profile-input" />
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="profile-input" placeholder="Your title" />
                </div>
              ) : (
                <>
                  <h2>{profile.name}</h2>
                  <p className="profile-title">{profile.title}</p>
                  <p className="profile-email">{session.user.email}</p>
                </>
              )}
            </div>
          </div>
          <div className="profile-divider"></div>
          <div className="profile-details-grid">
            <span>Department:</span><span>Engineering</span>
            <span>Experience:</span><span>3 years</span>
            <span>Location:</span><span>San Francisco, CA</span>
          </div>
          <div className="profile-actions-footer">
            {isEditing ? (
              <>
                <Button onClick={handleProfileUpdate}>Save Changes</Button>
                <Button onClick={cancelEdit} variant="secondary">Cancel</Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <LuPencil /> Edit Profile
              </Button>
            )}
          </div>
        </Card>
        <div className="profile-right-column">
          <Card className="skills-card">
            <h3>My Skillset</h3>
            <div className="skills-list">
              {userSkills.map(skill => (
                <span key={skill.id} className="skill-badge-removable">
                  {skill.name} 
                  <span onClick={() => handleRemoveSkill(skill.id)} className="remove-icon">&times;</span>
                </span>
              ))}
            </div>
            {isAddingSkill ? (
              <form onSubmit={handleAddSkill} className="add-skill-form">
                <select value={skillToAdd} onChange={(e) => setSkillToAdd(e.target.value)}>
                  <option value="" disabled>Select a skill...</option>
                  {availableSkillsToAdd.map(skill => (
                    <option key={skill.id} value={skill.id}>{skill.name}</option>
                  ))}
                </select>
                <Button type="submit">Add</Button>
                <Button type="button" variant="secondary" onClick={() => setIsAddingSkill(false)}>Cancel</Button>
              </form>
            ) : (
              <button className="add-skill-button" onClick={() => setIsAddingSkill(true)}>
                <LuPlus /> Add Skill
              </button>
            )}
          </Card>
          <Card className="goals-card">
            <h3>Career Goals</h3>
            <p>
              Transition to a Senior Frontend Developer role within the next 12 months, 
              focusing on advanced React patterns, TypeScript mastery, and team leadership skills.
            </p>
          </Card>
          {/* --- NEW SECTION --- */}
          <Card className="achievements-card">
            <h3>Recent Achievements</h3>
            <div className="achievements-list">
              {recentAchievements.map((item, index) => (
                <div key={index} className="achievement-item">
                  <span className={`achievement-dot dot-${item.color}`}></span>
                  <div className="achievement-text">
                    <h4 className="achievement-title">{item.title}</h4>
                    <p className="achievement-subtitle">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
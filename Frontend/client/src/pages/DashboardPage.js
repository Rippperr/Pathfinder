import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../contexts/UserContext';
import Card from '../components/common/Card';
import CustomDropdown from '../components/common/CustomDropdown';
import SkillGapDisplay from '../components/dashboard/SkillGapDisplay';
import CareerRoadmap from '../components/dashboard/CareerRoadmap';
import { getCareerRoleCatalog, getCareerSkillCatalog, normalizeCareerTitle } from '../data/careerCatalog';
import './DashboardPage.css';

const DashboardPage = () => {
  const { session, profile } = useUser();
  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [learningPreferences, setLearningPreferences] = useState({ learningStyle: 'balanced', weeklyHours: '4' });
  const [roleSaveState, setRoleSaveState] = useState('');
  const roleSelectionKey = session?.user?.id ? `pathfinder-dashboard-role:${session.user.id}` : null;
  const savedAccountRole = session?.user?.user_metadata?.last_selected_role || '';

  useEffect(() => {
    if (!session?.user?.id) return;
    try {
      const saved = JSON.parse(localStorage.getItem(`pathfinder-settings:${session.user.id}`) || '{}');
      setLearningPreferences({ learningStyle: 'balanced', weeklyHours: '4', ...saved });
    } catch {
      setLearningPreferences({ learningStyle: 'balanced', weeklyHours: '4' });
    }
  }, [session?.user?.id]);

  useEffect(() => {
    const getPageData = async () => {
      let rolesData = [];
      let skillsData = [];
      let userSkillsData = [];
      try {
        const results = await Promise.all([
          supabase.from('roles').select('*, role_skills(skill_id)'),
          supabase.from('skills').select('*').order('name'),
          supabase.from('user_skills').select('skill_id').eq('user_id', session.user.id),
        ]);
        rolesData = results[0].data || [];
        skillsData = results[1].data || [];
        userSkillsData = results[2].data || [];
      } catch (error) {
        console.warn('Using Pathfinder’s built-in career catalog because Supabase data is unavailable.', error);
      }
      const mergedSkills = getCareerSkillCatalog(skillsData || []);
      const mergedRoles = getCareerRoleCatalog(rolesData || [], mergedSkills);
      setSkills(mergedSkills);
      setRoles(mergedRoles);
      setUserSkills(userSkillsData.map((skill) => skill.skill_id));

    };
    getPageData();
  }, [session]);

  useEffect(() => {
    if (selectedRoleId || !roles.length) return;
    let savedRoleTitle = '';
    try { savedRoleTitle = roleSelectionKey ? localStorage.getItem(roleSelectionKey) || '' : ''; } catch { /* storage may be unavailable */ }
    const targetRole = roles.find((role) => normalizeCareerTitle(role.title) === normalizeCareerTitle(savedAccountRole))
      || roles.find((role) => normalizeCareerTitle(role.title) === normalizeCareerTitle(savedRoleTitle))
      || roles.find((role) => normalizeCareerTitle(role.title) === normalizeCareerTitle(profile?.desired_role || ''));
    if (targetRole) setSelectedRoleId(targetRole.id);
  }, [profile?.desired_role, roles, selectedRoleId, roleSelectionKey, savedAccountRole]);

  const selectedRole = roles.find(role => role.id === selectedRoleId);

  const requiredSkillsForRole = useMemo(() => {
    if (!selectedRole) return [];
    return selectedRole.role_skills.map(rs => rs.skill_id);
  }, [selectedRole]);

  const recommendedLearningResources = useMemo(() => {
    if (!selectedRole) return [];
    const missingSkillNames = requiredSkillsForRole
      .filter((id) => !userSkills.includes(id))
      .map((id) => skills.find((skill) => skill.id === id)?.name)
      .filter(Boolean);
    const resources = selectedRole.learningResources || [];
    const relevant = !missingSkillNames.length ? resources : resources.filter((resource) => resource.skillNames.some((name) => missingSkillNames.includes(name)));
    const base = relevant.length ? relevant : resources;
    const preferredFormat = (resource) => {
      const text = `${resource.provider} ${resource.format} ${resource.title}`.toLowerCase();
      if (learningPreferences.learningStyle === 'video') return /youtube|video|playlist|course/.test(text);
      if (learningPreferences.learningStyle === 'reading') return /docs|documentation|guide|reading|official/.test(text);
      if (learningPreferences.learningStyle === 'hands-on') return /practice|lab|interactive|hands-on|kaggle|portswigger|project/.test(text);
      return false;
    };
    return [...base].sort((a, b) => Number(preferredFormat(b)) - Number(preferredFormat(a)));
  }, [selectedRole, userSkills, requiredSkillsForRole, skills, learningPreferences]);

  const handleRoleChange = async (role) => {
    setSelectedRoleId(role.id);
    try { if (roleSelectionKey) localStorage.setItem(roleSelectionKey, role.title); } catch { /* selection remains available for this visit */ }
    setRoleSaveState('saving');
    const { error } = await supabase.auth.updateUser({ data: { last_selected_role: role.title } });
    setRoleSaveState(error ? 'error' : 'saved');
  };
  
  return (
    <div className="dashboard-page">
      <header className="dashboard-heading">
        <p className="dashboard-eyebrow">YOUR CAREER WORKSPACE</p>
        <h1>Your next move, mapped.</h1>
      <p className="dashboard-intro">{profile?.desired_role ? `Build toward ${profile.desired_role} with a clear view of your skills and practical next steps.` : 'Choose a role to see the skills you already bring and the next steps to strengthen your profile.'}</p>
        <Link className="dashboard-learning-preference" to="/settings">{learningPreferences.weeklyHours} hrs/week learning target <span>·</span> {learningPreferences.learningStyle === 'balanced' ? 'Balanced resources' : `${learningPreferences.learningStyle} first`} <span aria-hidden="true">↗</span></Link>
      </header>

      <CustomDropdown
        options={roles}
        selectedValue={selectedRoleId}
        onChange={handleRoleChange}
        placeholder="Select your target role"
        displayKey="title"
      />
      {roleSaveState && <p className={`dashboard-role-save ${roleSaveState}`} role="status">{roleSaveState === 'saving' ? 'Saving your target role to your account…' : roleSaveState === 'saved' ? 'Your target role is saved to your account.' : 'Could not sync this role to your account. It is saved in this browser.'}</p>}

      <Card>
        <SkillGapDisplay 
          userSkills={userSkills}
          requiredSkills={requiredSkillsForRole}
          allSkills={skills}
          roleTitle={selectedRole?.title}
        />
      </Card>

      <CareerRoadmap role={selectedRole} skills={skills} userSkillIds={userSkills} />
      
      <div className="recommendations-section">
        <h2>Focused learning resources</h2>
        <div className="courses-grid">
          {selectedRole ? (
            recommendedLearningResources.length > 0 ? (
              recommendedLearningResources.map((resource) => (
                <Card key={`${resource.provider}-${resource.title}`} className="learning-resource-card">
                  <div className="learning-resource-topline"><span>{resource.provider}</span><span>{resource.format}</span></div>
                  <h3>{resource.title}</h3>
                  <p>{resource.description}</p>
                  <a href={resource.url} target="_blank" rel="noreferrer">Open learning resource <span aria-hidden="true">↗</span></a>
                </Card>
              ))
            ) : (
              <p className="placeholder-text">Resources for this role are being prepared.</p>
            )
          ) : (
            <p className="placeholder-text">Select a target role to get courses, official learning paths, and YouTube course playlists.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

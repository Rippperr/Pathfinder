import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../contexts/UserContext';
import Card from '../components/common/Card';
import CustomDropdown from '../components/common/CustomDropdown';
import SkillGapDisplay from '../components/dashboard/SkillGapDisplay';
import CareerRoadmap from '../components/dashboard/CareerRoadmap';
import { getCareerRoleCatalog, getCareerSkillCatalog, normalizeCareerTitle } from '../data/careerCatalog';
import './DashboardPage.css';

const progressKey = (roleTitle, skillName) => `${(roleTitle || '').trim().toLowerCase()}::${(skillName || '').trim().toLowerCase()}`;
const mapProgressRows = (rows = []) => rows.reduce((result, row) => {
  result[progressKey(row.role_title, row.skill_name)] = row;
  return result;
}, {});

const DashboardPage = () => {
  const location = useLocation();
  const { session, profile } = useUser();
  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [achievementSkillSelections, setAchievementSkillSelections] = useState({});
  const [achievementMessages, setAchievementMessages] = useState({});
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [learningPreferences, setLearningPreferences] = useState({ learningStyle: 'balanced', weeklyHours: '4' });
  const [roleSaveState, setRoleSaveState] = useState('');
  const [skillProgress, setSkillProgress] = useState({});
  const [progressStorage, setProgressStorage] = useState('loading');
  const [progressSavingKey, setProgressSavingKey] = useState('');
  const roleSelectionKey = session?.user?.id ? `pathfinder-dashboard-role:${session.user.id}` : null;
  const savedAccountRole = session?.user?.user_metadata?.last_selected_role || '';

  useEffect(() => {
    if (!session?.user?.id) return;
    const accountPreferences = session.user.user_metadata?.pathfinder_learning_preferences;
    try {
      const saved = JSON.parse(localStorage.getItem(`pathfinder-settings:${session.user.id}`) || '{}');
      setLearningPreferences({ learningStyle: 'balanced', weeklyHours: '4', ...(accountPreferences || saved) });
    } catch {
      setLearningPreferences({ learningStyle: 'balanced', weeklyHours: '4', ...(accountPreferences || {}) });
    }
  }, [session?.user?.id, session?.user?.user_metadata?.pathfinder_learning_preferences]);

  useEffect(() => {
    if (!session?.user?.id) return;
    let active = true;
    const getPageData = async () => {
      let rolesData = [];
      let skillsData = [];
      let userSkillsData = [];
      let achievementsData = [];
      try {
        const results = await Promise.all([
          supabase.from('roles').select('*, role_skills(skill_id)'),
          supabase.from('skills').select('*').order('name'),
          supabase.from('user_skills').select('skill_id').eq('user_id', session.user.id),
          supabase.from('achievements').select('*').eq('user_id', session.user.id),
        ]);
        rolesData = results[0].data || [];
        skillsData = results[1].data || [];
        userSkillsData = results[2].data || [];
        achievementsData = results[3].data || [];
      } catch (error) {
        console.warn('Using Pathfinder’s built-in career catalog because Supabase data is unavailable.', error);
      }
      const mergedSkills = getCareerSkillCatalog(skillsData || []);
      const mergedRoles = getCareerRoleCatalog(rolesData || [], mergedSkills);
      if (active) {
        setSkills(mergedSkills);
        setRoles(mergedRoles);
        setUserSkills(userSkillsData.map((skill) => skill.skill_id));
        setAchievements(achievementsData);
      }

    };
    getPageData();
    return () => { active = false; };
  }, [session?.user?.id]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return undefined;
    let active = true;
    const storageKey = `pathfinder-skill-progress:${userId}`;
    let localRows = [];
    try {
      const savedRows = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localRows = Array.isArray(savedRows) ? savedRows : [];
    } catch { localRows = []; }
    setSkillProgress(mapProgressRows(localRows));
    setProgressStorage('loading');

    supabase.from('user_skill_progress')
      .select('role_title, skill_name, status, evidence, completed_at, updated_at')
      .eq('user_id', userId)
      .then(async ({ data, error }) => {
        if (!active) return;
        if (error) {
          setProgressStorage('local');
          return;
        }
        const remoteRows = data || [];
        const remoteMap = mapProgressRows(remoteRows);
        const localMap = mapProgressRows(localRows);
        const rowTimestamp = (row) => {
          const timestamp = Date.parse(row?.updated_at || row?.completed_at || '');
          return Number.isNaN(timestamp) ? 0 : timestamp;
        };
        const merged = { ...remoteMap };
        const localRowsToSync = [];
        Object.entries(localMap).forEach(([key, localRow]) => {
          const remoteRow = remoteMap[key];
          if (!remoteRow || rowTimestamp(localRow) > rowTimestamp(remoteRow)) {
            const rowToSync = { ...localRow, updated_at: localRow.updated_at || new Date().toISOString() };
            merged[key] = rowToSync;
            localRowsToSync.push({ user_id: userId, ...rowToSync });
          }
        });
        setSkillProgress(merged);
        setProgressStorage('synced');
        try { localStorage.setItem(storageKey, JSON.stringify(Object.values(merged))); } catch { /* remote copy remains saved */ }
        if (localRowsToSync.length) {
          const { error: migrationError } = await supabase.from('user_skill_progress').upsert(localRowsToSync, { onConflict: 'user_id,role_title,skill_name' });
          if (active && migrationError) setProgressStorage('local');
        }
      })
      .catch(() => { if (active) setProgressStorage('local'); });

    return () => { active = false; };
  }, [session?.user?.id]);

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

  const roadmapSkills = useMemo(() => {
    if (!selectedRole) return [];
    const orderedSkills = selectedRole.roadmapPhases?.flatMap((phase) => phase.skills) || [];
    const fallbackSkills = selectedRole.role_skills.map(({ skill_id }) => skills.find((skill) => skill.id === skill_id)).filter(Boolean);
    const uniqueSkills = new Map();
    [...orderedSkills, ...fallbackSkills].forEach((skill) => { if (skill?.id) uniqueSkills.set(skill.id, skill); });
    return [...uniqueSkills.values()];
  }, [selectedRole, skills]);

  const roadmapSummary = useMemo(() => {
    const completed = roadmapSkills.filter((skill) => skillProgress[progressKey(selectedRole?.title, skill.name)]?.status === 'completed').length;
    const nextSkill = roadmapSkills.find((skill) => skillProgress[progressKey(selectedRole?.title, skill.name)]?.status !== 'completed');
    return { completed, total: roadmapSkills.length, percent: roadmapSkills.length ? Math.round((completed / roadmapSkills.length) * 100) : 0, nextSkill };
  }, [roadmapSkills, skillProgress, selectedRole]);

  const requiredSkillsForRole = useMemo(() => {
    if (!selectedRole) return [];
    return selectedRole.role_skills.map(rs => rs.skill_id);
  }, [selectedRole]);

  const recommendedLearningResources = useMemo(() => {
    if (!selectedRole) return [];
    const missingSkillNames = requiredSkillsForRole
      .filter((id) => {
        const skill = skills.find((item) => item.id === id);
        const completed = skill && skillProgress[progressKey(selectedRole.title, skill.name)]?.status === 'completed';
        return !userSkills.includes(id) && !completed;
      })
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
  }, [selectedRole, userSkills, requiredSkillsForRole, skills, learningPreferences, skillProgress]);

  const completedRoadmapSkillIds = useMemo(() => {
    if (!selectedRole) return [];
    return (selectedRole.roadmapPhases || [])
      .flatMap((phase) => phase.skills)
      .filter((skill) => skillProgress[progressKey(selectedRole.title, skill.name)]?.status === 'completed')
      .map((skill) => skill.id);
  }, [selectedRole, skillProgress]);

  const handleRoleChange = async (role) => {
    setSelectedRoleId(role.id);
    try { if (roleSelectionKey) localStorage.setItem(roleSelectionKey, role.title); } catch { /* selection remains available for this visit */ }
    setRoleSaveState('saving');
    const { error } = await supabase.auth.updateUser({ data: { last_selected_role: role.title } });
    setRoleSaveState(error ? 'error' : 'saved');
  };

  const handleSkillProgressChange = async (skill, changes) => {
    if (!selectedRole || !session?.user?.id) return;
    const userId = session.user.id;
    const storageKey = `pathfinder-skill-progress:${userId}`;
    const key = progressKey(selectedRole.title, skill.name);
    const row = {
      role_title: selectedRole.title,
      skill_name: skill.name,
      status: changes.status,
      evidence: changes.evidence || '',
      completed_at: changes.status === 'completed' ? (changes.completed_at || new Date().toISOString()) : null,
      updated_at: new Date().toISOString(),
    };
    const next = { ...skillProgress, [key]: row };
    setSkillProgress(next);
    setProgressSavingKey(key);
    try { localStorage.setItem(storageKey, JSON.stringify(Object.values(next))); } catch { /* continue with account sync */ }

    const { error } = await supabase.from('user_skill_progress').upsert(
      { user_id: userId, ...row },
      { onConflict: 'user_id,role_title,skill_name' }
    );
    setProgressSavingKey('');
    if (error) {
      setProgressStorage('local');
      return;
    }
    setProgressStorage('synced');
  };

  const attachAchievementToRoadmap = async (achievement) => {
    if (!selectedRole || !achievement?.title) return;
    const skillId = achievementSkillSelections[achievement.id] || roadmapSummary.nextSkill?.id;
    const skill = roadmapSkills.find((item) => item.id === skillId);
    if (!skill) return;
    const key = progressKey(selectedRole.title, skill.name);
    const previous = skillProgress[key] || {};
    const evidenceLine = `${achievement.title}${achievement.subtitle ? ` — ${achievement.subtitle}` : ''}`;
    const evidence = previous.evidence?.includes(achievement.title)
      ? previous.evidence
      : [previous.evidence, evidenceLine].filter(Boolean).join('\n');
    await handleSkillProgressChange(skill, {
      status: previous.status === 'completed' ? 'completed' : 'in_progress',
      evidence,
      completed_at: previous.completed_at || null,
    });
    setAchievementMessages((current) => ({ ...current, [achievement.id]: `Linked to ${skill.name} in your roadmap.` }));
  };
  
  return (
    <div className="dashboard-page">
      <header className="dashboard-heading">
        <p className="dashboard-eyebrow">YOUR CAREER WORKSPACE</p>
        <h1>Your next move, mapped.</h1>
      <p className="dashboard-intro">{profile?.desired_role ? `Build toward ${profile.desired_role} with a clear view of your skills and practical next steps.` : 'Choose a role to see the skills you already bring and the next steps to strengthen your profile.'}</p>
        <Link className="dashboard-learning-preference" to="/settings">{learningPreferences.weeklyHours} hrs/week learning target <span>·</span> {learningPreferences.learningStyle === 'balanced' ? 'Balanced resources' : `${learningPreferences.learningStyle} first`} <span aria-hidden="true">↗</span></Link>
      </header>

      {location.state?.roleSyncFailed && <p className="dashboard-progress-notice" role="status">Your new roadmap is saved in this browser, but account sync was unavailable. It may not follow you to other devices yet.</p>}

      <CustomDropdown
        options={roles}
        selectedValue={selectedRoleId}
        onChange={handleRoleChange}
        placeholder="Select your target role"
        displayKey="title"
      />
      {roleSaveState && <p className={`dashboard-role-save ${roleSaveState}`} role="status">{roleSaveState === 'saving' ? 'Saving your target role to your account…' : roleSaveState === 'saved' ? 'Your target role is saved to your account.' : 'Could not sync this role to your account. It is saved in this browser.'}</p>}

      {selectedRole && progressStorage === 'local' && <p className="dashboard-progress-notice" role="status">Your roadmap progress is saved in this browser. Apply the Supabase skill progress migration to sync it with your account across devices.</p>}

      <section className="career-focus-grid" aria-label="Career goals and achievements">
        <Card className="career-focus-card">
          <div className="career-focus-heading"><div><p className="career-focus-kicker">YOUR DIRECTION</p><h2>Career goal</h2></div><Link to="/edit-profile">Edit goal <span aria-hidden="true">↗</span></Link></div>
          <p className="career-goal-copy">{profile?.career_goals || 'Add a clear milestone to give your learning plan a purpose.'}</p>
          {selectedRole ? <>
            <div className="career-goal-progress-label"><span>{roadmapSummary.completed} of {roadmapSummary.total} roadmap skills completed</span><strong>{roadmapSummary.percent}%</strong></div>
            <div className="career-goal-progress" role="progressbar" aria-label="Career goal roadmap progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={roadmapSummary.percent}><span style={{ width: `${roadmapSummary.percent}%` }} /></div>
            <div className="career-goal-next"><span aria-hidden="true">→</span><p>{roadmapSummary.nextSkill ? <>Your next milestone: <b>{roadmapSummary.nextSkill.name}</b></> : 'You have completed every skill in this roadmap.'}</p></div>
            {roadmapSummary.nextSkill && <a className="career-focus-primary" href="#career-roadmap">Continue with {roadmapSummary.nextSkill.name} <span aria-hidden="true">↓</span></a>}
          </> : <div className="career-goal-empty"><p>Select your target role to turn this goal into a trackable roadmap.</p><Link to="/paths">Explore career paths <span aria-hidden="true">→</span></Link></div>}
        </Card>

        <Card className="career-focus-card achievements-roadmap-card">
          <div className="career-focus-heading"><div><p className="career-focus-kicker">PROOF OF YOUR PROGRESS</p><h2>Recent achievements</h2></div><Link to="/edit-profile">Manage <span aria-hidden="true">↗</span></Link></div>
          {achievements.length ? <div className="roadmap-achievements-list">
            {achievements.slice(0, 3).map((achievement) => {
              const chosenSkillId = achievementSkillSelections[achievement.id] || roadmapSummary.nextSkill?.id || '';
              const chosenSkill = roadmapSkills.find((skill) => skill.id === chosenSkillId);
              const existingEvidence = chosenSkill && skillProgress[progressKey(selectedRole?.title, chosenSkill.name)]?.evidence;
              const alreadyLinked = Boolean(existingEvidence?.includes(achievement.title));
              return <div className="roadmap-achievement-item" key={achievement.id}>
                <span className="roadmap-achievement-mark" aria-hidden="true">✦</span>
                <div className="roadmap-achievement-content"><h3>{achievement.title}</h3><p>{achievement.subtitle || 'A milestone worth carrying into your next role.'}</p>
                  {selectedRole ? <div className="roadmap-achievement-action">
                    <label htmlFor={`achievement-skill-${achievement.id}`}>Connect to a roadmap skill</label>
                    <select id={`achievement-skill-${achievement.id}`} value={chosenSkillId} onChange={(event) => setAchievementSkillSelections((current) => ({ ...current, [achievement.id]: event.target.value }))}>
                      {roadmapSkills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
                    </select>
                    <button type="button" onClick={() => attachAchievementToRoadmap(achievement)} disabled={!chosenSkill || alreadyLinked}>{alreadyLinked ? 'Added to roadmap' : 'Use as evidence'} <span aria-hidden="true">↗</span></button>
                    {achievementMessages[achievement.id] && <small role="status">{achievementMessages[achievement.id]}</small>}
                  </div> : <Link to="/paths" className="roadmap-achievement-browse">Choose a role to connect this achievement →</Link>}
                </div>
              </div>;
            })}
          </div> : <div className="roadmap-achievements-empty"><p>Add a project, certificate, or measurable win, then connect it to a skill as roadmap evidence.</p><Link to="/edit-profile">Add your first achievement <span aria-hidden="true">→</span></Link></div>}
          {achievements.length > 3 && <Link to="/profile" className="roadmap-achievements-more">View all {achievements.length} achievements →</Link>}
        </Card>
      </section>

      <Card>
        <SkillGapDisplay 
          userSkills={userSkills}
          requiredSkills={requiredSkillsForRole}
          allSkills={skills}
          roleTitle={selectedRole?.title}
          completedSkillIds={completedRoadmapSkillIds}
        />
      </Card>

      <CareerRoadmap role={selectedRole} skills={skills} userSkillIds={userSkills} progressRecords={skillProgress} onProgressChange={handleSkillProgressChange} progressSavingKey={progressSavingKey} progressLoading={progressStorage === 'loading'} />
      
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

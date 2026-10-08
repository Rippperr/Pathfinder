import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../contexts/UserContext';
import Card from '../components/common/Card';
import { getCareerRoleCatalog, getCareerSkillCatalog, normalizeCareerTitle } from '../data/careerCatalog';
import './CareerPathsPage.css';

const CareerPathsPage = () => {
  const { session, profile } = useUser();
  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [expandedRoleId, setExpandedRoleId] = useState(null);
  const [query, setQuery] = useState('');
  const [familyFilter, setFamilyFilter] = useState('All fields');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
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
        console.warn('Using Pathfinder’s built-in role and skill catalog because Supabase data is unavailable.', error);
      }
      if (!active) return;
      const allSkills = getCareerSkillCatalog(skillsData || []);
      setSkills(allSkills);
      setRoles(getCareerRoleCatalog(rolesData || [], allSkills));
      if (userSkillsData) setUserSkills(userSkillsData.map(({ skill_id }) => skill_id));
      setLoading(false);
    };
    if (session?.user?.id) getPageData();
    return () => { active = false; };
  }, [session]);

  const families = useMemo(() => ['All fields', ...new Set(roles.map((role) => role.family || 'Technology roles'))], [roles]);
  const visibleRoles = useMemo(() => roles.filter((role) => {
    const matchesFamily = familyFilter === 'All fields' || role.family === familyFilter;
    const haystack = `${role.title} ${role.family} ${role.summary} ${role.skillNames.join(' ')}`.toLowerCase();
    const matchesSearch = !query || haystack.includes(query.toLowerCase());
    return matchesFamily && matchesSearch;
  }), [roles, familyFilter, query]);

  const toggleRoleDetails = (roleId) => setExpandedRoleId((current) => current === roleId ? null : roleId);

  return (
    <main className="career-paths-page">
      <header className="career-page-heading">
        <p className="career-page-eyebrow">ROLE &amp; SKILL LIBRARY</p>
        <h1>Explore your next role.</h1>
        <p>Understand what the work involves, which skills to build, how to get started, and where to learn next.</p>
      </header>
      <aside className="career-market-note">
        <span className="market-note-mark" aria-hidden="true">↗</span>
        <p><b>Market-informed, not a promise of openings.</b> Global workforce research points to growth across AI, data, software, and security. Hiring needs vary by location and employer.</p>
        <div className="market-note-sources"><a href="https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/" target="_blank" rel="noreferrer">WEF outlook ↗</a><a href="https://www.linkedin.com/pulse/jobs-rise-2025-edition-get-hired-by-linkedin-news-lt2sf" target="_blank" rel="noreferrer">LinkedIn roles ↗</a></div>
      </aside>

      <section className="role-explorer" aria-label="Explore career roles">
        <div className="role-explorer-toolbar">
          <label className="role-search" htmlFor="role-search"><span aria-hidden="true">⌕</span><input id="role-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roles, skills, or fields" /></label>
          <span className="role-result-count">{visibleRoles.length} roles</span>
        </div>
        <div className="role-family-filters" aria-label="Filter roles by field">
          {families.map((family) => <button type="button" key={family} className={`role-family-filter${familyFilter === family ? ' is-active' : ''}`} onClick={() => setFamilyFilter(family)}>{family}</button>)}
        </div>

        {loading ? <p className="role-empty-state">Loading role details…</p> : visibleRoles.length ? (
          <div className="role-catalog-grid">
            {visibleRoles.map((role) => {
              const isExpanded = expandedRoleId === role.id;
              const requiredSkills = role.resolvedSkills || (role.role_skills || []).map(({ skill_id }) => skills.find((skill) => skill.id === skill_id)).filter(Boolean);
              const knownSkillCount = requiredSkills.filter((skill) => userSkills.includes(skill.id)).length;
              const isTargetRole = normalizeCareerTitle(profile?.desired_role || '') === normalizeCareerTitle(role.title);
              return (
                <Card key={role.id} className={`role-catalog-card${isExpanded ? ' is-expanded' : ''}`}>
                  <div className="role-catalog-card-top"><span className="role-catalog-mark" aria-hidden="true">{role.mark}</span><span className="role-family-label">{role.family}</span>{isTargetRole && <span className="role-target-label">Your target</span>}</div>
                  <h2>{role.title}</h2>
                  <p className="role-summary">{role.summary}</p>
                  <div className="role-skill-summary"><span>{knownSkillCount} of {requiredSkills.length} listed skills in your profile</span><span className="role-skill-track"><i style={{ width: requiredSkills.length ? `${Math.round((knownSkillCount / requiredSkills.length) * 100)}%` : '0%' }} /></span></div>
                  <div className="role-skill-chips">{requiredSkills.slice(0, 4).map((skill) => <span className={userSkills.includes(skill.id) ? 'skill-chip is-known' : 'skill-chip'} key={skill.id}>{skill.name}</span>)}{requiredSkills.length > 4 && <span className="skill-chip-more">+{requiredSkills.length - 4}</span>}</div>
                  {isExpanded && (
                    <div className="role-expanded-details">
                      <div><h3>Role overview</h3><p>{role.overview}</p></div>
                      <div><h3>What you’ll work on</h3><ul>{role.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul></div>
                      <div><h3>Skills for this role</h3><div className="role-skill-chips role-skill-chips-expanded">{requiredSkills.map((skill) => <span className={userSkills.includes(skill.id) ? 'skill-chip is-known' : 'skill-chip'} key={skill.id}>{skill.name}</span>)}</div></div>
                      <div><h3>How to get started</h3><p>{role.entryPath}</p></div>
                      <div><h3>Project to show your skills</h3><p>{role.portfolioProject}</p></div>
                      {role.nextRoles?.length > 0 && <div><h3>Possible next steps</h3><p>{role.nextRoles.join(' · ')}</p></div>}
                      <div><h3>Recommended learning</h3><div className="role-learning-links">{role.learningResources.map((resource) => <a href={resource.url} key={`${resource.provider}-${resource.title}`} target="_blank" rel="noreferrer"><span><b>{resource.title}</b><small>{resource.provider} · {resource.format}</small></span><span aria-hidden="true">↗</span></a>)}</div></div>
                    </div>
                  )}
                  <button type="button" className="role-details-toggle" onClick={() => toggleRoleDetails(role.id)} aria-expanded={isExpanded}>{isExpanded ? 'Close role guide' : 'View complete role guide'} <span aria-hidden="true">{isExpanded ? '↑' : '→'}</span></button>
                </Card>
              );
            })}
          </div>
        ) : <p className="role-empty-state">No roles match that search. Try a broader title, skill, or field.</p>}
      </section>
    </main>
  );
};

export default CareerPathsPage;

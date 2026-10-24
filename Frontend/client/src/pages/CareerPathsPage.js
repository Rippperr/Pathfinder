import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../contexts/UserContext';
import Card from '../components/common/Card';
import { getCareerRoleCatalog, getCareerSkillCatalog, normalizeCareerTitle } from '../data/careerCatalog';
import './CareerPathsPage.css';

const CareerPathsPage = () => {
  const navigate = useNavigate();
  const { session, profile } = useUser();
  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [expandedRoleId, setExpandedRoleId] = useState(null);
  const [query, setQuery] = useState('');
  const [familyFilter, setFamilyFilter] = useState('All fields');
  const [loading, setLoading] = useState(true);
  const [choosingRoleId, setChoosingRoleId] = useState('');
  const guideTriggerRef = useRef(null);
  const closeGuideRef = useRef(null);

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

  const toggleRoleDetails = (roleId, event) => {
    if (expandedRoleId === roleId) setExpandedRoleId(null);
    else {
      guideTriggerRef.current = event.currentTarget;
      setExpandedRoleId(roleId);
    }
  };

  useEffect(() => {
    if (!expandedRoleId) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeGuideRef.current?.focus();
    const handleGuideKeys = (event) => {
      if (event.key === 'Escape') {
        setExpandedRoleId(null);
        return;
      }
      if (event.key !== 'Tab') return;
      const dialog = closeGuideRef.current?.closest('.role-guide-dialog');
      const focusable = dialog?.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleGuideKeys);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleGuideKeys);
      guideTriggerRef.current?.focus();
    };
  }, [expandedRoleId]);

  const chooseRole = async (role) => {
    if (!session?.user?.id || choosingRoleId) return;
    setChoosingRoleId(role.id);
    try {
      localStorage.setItem(`pathfinder-dashboard-role:${session.user.id}`, role.title);
    } catch { /* the account copy is still updated below */ }
    let syncFailed = false;
    try {
      const { error } = await supabase.auth.updateUser({ data: { last_selected_role: role.title } });
      syncFailed = Boolean(error);
    } catch {
      syncFailed = true;
    }
    setChoosingRoleId('');
    navigate('/dashboard', { state: { roleSyncFailed: syncFailed } });
  };

  const activeGuideRole = roles.find((role) => role.id === expandedRoleId);
  const guideSkills = activeGuideRole?.resolvedSkills || (activeGuideRole?.role_skills || []).map(({ skill_id }) => skills.find((skill) => skill.id === skill_id)).filter(Boolean);
  const guideKnownSkillCount = guideSkills.filter((skill) => userSkills.includes(skill.id)).length;
  const guideIsTargetRole = normalizeCareerTitle(profile?.desired_role || '') === normalizeCareerTitle(activeGuideRole?.title || '');

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
      <aside className="curriculum-method-note">
        <span aria-hidden="true">◎</span>
        <p><b>Roadmaps are sequenced learning plans, not exhaustive hiring checklists.</b> Core skills move from foundations toward applied and production work. Specializations vary by employer—compare them with current job descriptions. Reference frameworks: <a href="https://developers.google.com/machine-learning/crash-course" target="_blank" rel="noreferrer">Google ML Crash Course</a>, <a href="https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center" target="_blank" rel="noreferrer">NIST NICE</a>, <a href="https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html" target="_blank" rel="noreferrer">AWS Well-Architected</a>, <a href="https://owasp.org/www-project-application-security-verification-standard/" target="_blank" rel="noreferrer">OWASP ASVS</a>, and <a href="https://www.w3.org/TR/wcag/" target="_blank" rel="noreferrer">W3C WCAG</a>.</p>
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
              const requiredSkills = role.resolvedSkills || (role.role_skills || []).map(({ skill_id }) => skills.find((skill) => skill.id === skill_id)).filter(Boolean);
              const knownSkillCount = requiredSkills.filter((skill) => userSkills.includes(skill.id)).length;
              const isTargetRole = normalizeCareerTitle(profile?.desired_role || '') === normalizeCareerTitle(role.title);
              return (
                <Card key={role.id} className="role-catalog-card">
                  <div className="role-catalog-card-top"><span className="role-catalog-mark" aria-hidden="true">{role.mark}</span><span className="role-family-label">{role.family}</span>{isTargetRole && <span className="role-target-label">Your target</span>}</div>
                  <h2>{role.title}</h2>
                  <p className="role-summary">{role.summary}</p>
                  <div className="role-skill-summary"><span>{knownSkillCount} of {requiredSkills.length} listed skills in your profile</span><span className="role-skill-track"><i style={{ width: requiredSkills.length ? `${Math.round((knownSkillCount / requiredSkills.length) * 100)}%` : '0%' }} /></span></div>
                  <div className="role-skill-chips">{requiredSkills.slice(0, 4).map((skill) => <span className={userSkills.includes(skill.id) ? 'skill-chip is-known' : 'skill-chip'} key={skill.id}>{skill.name}</span>)}{requiredSkills.length > 4 && <span className="skill-chip-more">+{requiredSkills.length - 4}</span>}</div>
                  <div className="role-card-actions">
                    <button type="button" className="role-details-toggle" onClick={(event) => toggleRoleDetails(role.id, event)} aria-haspopup="dialog" aria-expanded={expandedRoleId === role.id}>View complete role guide <span aria-hidden="true">↗</span></button>
                    <button type="button" className="role-roadmap-button" onClick={() => chooseRole(role)} disabled={Boolean(choosingRoleId)}>{choosingRoleId === role.id ? 'Saving…' : isTargetRole ? 'Continue roadmap' : 'Build this roadmap'} <span aria-hidden="true">→</span></button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : <p className="role-empty-state">No roles match that search. Try a broader title, skill, or field.</p>}
      </section>
      {activeGuideRole && <div className="role-guide-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setExpandedRoleId(null); }}>
        <section className="role-guide-dialog" role="dialog" aria-modal="true" aria-labelledby="role-guide-title" aria-describedby="role-guide-summary">
          <header className="role-guide-header">
            <div className="role-guide-brand"><span className="role-guide-mark" aria-hidden="true">{activeGuideRole.mark}</span><div><p>{activeGuideRole.family}</p><h2 id="role-guide-title">{activeGuideRole.title}</h2></div></div>
            <button ref={closeGuideRef} type="button" className="role-guide-close" onClick={() => setExpandedRoleId(null)} aria-label="Close role guide">×</button>
          </header>
          <div className="role-guide-content">
            <section className="role-guide-intro"><p className="role-guide-eyebrow">COMPLETE ROLE GUIDE</p><p id="role-guide-summary">{activeGuideRole.summary}</p><div className="role-guide-skill-progress"><div><span>Your listed skills</span><b>{guideKnownSkillCount} / {guideSkills.length}</b></div><span className="role-guide-progress-track"><i style={{ width: guideSkills.length ? `${Math.round((guideKnownSkillCount / guideSkills.length) * 100)}%` : '0%' }} /></span></div></section>
            <div className="role-guide-sections">
              <section className="role-guide-section role-guide-overview"><h3>Role overview</h3><p>{activeGuideRole.overview}</p></section>
              <section className="role-guide-section"><h3>What you’ll work on</h3><ul>{activeGuideRole.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul></section>
              <section className="role-guide-section"><h3>Skills for this role</h3><div className="role-skill-chips role-skill-chips-expanded">{guideSkills.map((skill) => <span className={userSkills.includes(skill.id) ? 'skill-chip is-known' : 'skill-chip'} key={skill.id}>{skill.name}</span>)}</div><p className="role-guide-hint">Green skills are already listed on your profile.</p></section>
              {activeGuideRole.optionalSkills?.length > 0 && <section className="role-guide-section"><h3>Common specializations</h3><p>These vary by employer and product. Use current job descriptions to choose what is relevant.</p><div className="role-skill-chips role-skill-chips-expanded">{activeGuideRole.optionalSkills.map((skill) => <span className="skill-chip" key={skill.id || skill.name}>{skill.name}</span>)}</div></section>}
              <section className="role-guide-section"><h3>How to get started</h3><p>{activeGuideRole.entryPath}</p></section>
              <section className="role-guide-section"><h3>Portfolio project</h3><p>{activeGuideRole.portfolioProject}</p></section>
              {activeGuideRole.nextRoles?.length > 0 && <section className="role-guide-section"><h3>Possible next steps</h3><p>{activeGuideRole.nextRoles.join(' · ')}</p></section>}
              <section className="role-guide-section role-guide-learning"><h3>Recommended learning</h3><div className="role-learning-links">{activeGuideRole.learningResources.map((resource) => <a href={resource.url} key={`${resource.provider}-${resource.title}`} target="_blank" rel="noreferrer"><span><b>{resource.title}</b><small>{resource.provider} · {resource.format}</small></span><span aria-hidden="true">↗</span></a>)}</div></section>
            </div>
          </div>
          <footer className="role-guide-footer"><span>{guideIsTargetRole ? 'This is your current target role.' : 'Ready to work toward this role?'}</span><button type="button" className="role-roadmap-button" onClick={() => chooseRole(activeGuideRole)} disabled={Boolean(choosingRoleId)}>{choosingRoleId === activeGuideRole.id ? 'Saving…' : guideIsTargetRole ? 'Continue roadmap' : 'Build this roadmap'} <span aria-hidden="true">→</span></button></footer>
        </section>
      </div>}
    </main>
  );
};

export default CareerPathsPage;

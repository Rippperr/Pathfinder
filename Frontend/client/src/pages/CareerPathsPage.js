import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../contexts/UserContext';
import Card from '../components/common/Card';
import './CareerPathsPage.css';

const roleGuides = [
  { title: 'AI Engineer', family: 'AI & machine learning', mark: 'AI', summary: 'Build AI features and services that solve real product or business problems.', work: 'Turn models and foundation model APIs into reliable product capabilities. Evaluate output quality, connect systems to trusted data, and monitor safety, latency, and cost.', proof: 'Ship a small AI feature with an evaluation set, clear user value, and documented limits.' },
  { title: 'AI Application Developer', family: 'AI & machine learning', mark: 'AP', summary: 'Integrate generative AI into useful, secure applications.', work: 'Build model-backed workflows, retrieval pipelines, tool integrations, and user experiences. Test responses, manage secrets, and design graceful fallbacks when a model is uncertain.', proof: 'Create a retrieval-based assistant over a small, cited document collection and test it with realistic questions.' },
  { title: 'Machine Learning Engineer', family: 'AI & machine learning', mark: 'ML', summary: 'Develop, evaluate, and deploy machine learning systems.', work: 'Prepare data, train or adapt models, build repeatable pipelines, and measure model behavior in production. Work closely with data and platform teams.', proof: 'Train a baseline model, compare it to a stronger approach, and explain the evaluation and trade-offs.' },
  { title: 'MLOps Engineer', family: 'AI & machine learning', mark: 'MO', summary: 'Make model training and deployment reproducible and observable.', work: 'Build data and model pipelines, automate deployment, track experiments, and monitor drift, quality, and infrastructure use.', proof: 'Package a model behind an API and automate a tested deployment with monitoring.' },
  { title: 'Data Engineer', family: 'Data & analytics', mark: 'DE', summary: 'Build dependable pipelines that turn raw information into usable data.', work: 'Design ingestion and transformation workflows, maintain data quality, and make reliable datasets available to analytics and product teams.', proof: 'Publish a tested end-to-end pipeline with documented data quality checks.' },
  { title: 'Data Analyst', family: 'Data & analytics', mark: 'DA', summary: 'Use data to help teams make clearer operational and product decisions.', work: 'Query and validate data, identify trends, build useful reporting, and communicate what the evidence supports and where it is limited.', proof: 'Build a dashboard from a well-documented dataset and present a decision it can inform.' },
  { title: 'Cloud / Platform Engineer', family: 'Cloud & infrastructure', mark: 'CP', summary: 'Create secure, reliable foundations that help software teams ship.', work: 'Provision cloud services, automate infrastructure, improve reliability and cost visibility, and build self-service tools for engineering teams.', proof: 'Deploy a small service with infrastructure as code, monitoring, and a recovery plan.' },
  { title: 'DevOps Engineer', family: 'Cloud & infrastructure', mark: 'DO', summary: 'Improve how software is built, tested, released, and operated.', work: 'Automate delivery pipelines, maintain deployment environments, reduce release risk, and help teams learn from incidents.', proof: 'Set up a CI/CD pipeline with automated checks and a safe rollback path.' },
  { title: 'Cybersecurity Analyst', family: 'Security', mark: 'CS', summary: 'Detect security risks and help protect systems, identities, and data.', work: 'Review alerts and logs, investigate suspicious activity, assess vulnerabilities, and improve security controls and response playbooks.', proof: 'Create a small threat model and incident response walkthrough for a sample application.' },
  { title: 'Application Security Engineer', family: 'Security', mark: 'AS', summary: 'Build security into software design and delivery.', work: 'Review application risks, help teams fix vulnerabilities, automate security checks, and guide secure API, identity, and cloud practices.', proof: 'Threat-model a small application and demonstrate a tested fix for a security issue.' },
  { title: 'Software Engineer', family: 'Software development', mark: 'SE', summary: 'Design, build, test, and maintain software that people rely on.', work: 'Translate product needs into maintainable code, collaborate across disciplines, review changes, and improve reliability and performance.', proof: 'Deliver a documented project with tests, a clear README, and a short design explanation.' },
  { title: 'Full-Stack Developer', family: 'Software development', mark: 'FS', summary: 'Build user-facing features across the application and its services.', work: 'Connect accessible interfaces to APIs and data stores, validate inputs, handle errors, and deliver complete features from browser to backend.', proof: 'Build and deploy a complete feature with authentication, data validation, and tests.' },
  { title: 'Backend Developer', family: 'Software development', mark: 'BE', summary: 'Build the APIs and services behind dependable applications.', work: 'Design APIs and data models, implement business rules, improve performance, and protect services with testing and security controls.', proof: 'Publish a documented API with validation, automated tests, and sensible error handling.' },
  { title: 'Frontend Developer', family: 'Software development', mark: 'FE', summary: 'Turn product designs into fast, accessible, responsive experiences.', work: 'Build reusable interfaces, connect them to APIs, improve accessibility and performance, and collaborate with design and backend teams.', proof: 'Ship a responsive, accessible interface with meaningful tests and a working live demo.' },
  { title: 'FinTech Software Engineer', family: 'Software development', mark: 'FT', summary: 'Build financial software where correctness, security, and trust matter.', work: 'Develop transaction, payments, risk, or financial-data systems with careful validation, auditability, and secure handling of sensitive information.', proof: 'Build a small ledger or payment simulation with idempotency, audit events, and tests.' },
  { title: 'Product Designer', family: 'Product & design', mark: 'PD', summary: 'Shape useful digital products through research, interaction, and iteration.', work: 'Understand user needs, explore flows and prototypes, partner with engineering, and use feedback and accessibility checks to improve the experience.', proof: 'Present a case study showing research, iterations, accessibility choices, and outcomes.' },
  { title: 'AI Product Manager', family: 'Product & design', mark: 'PM', summary: 'Guide AI-enabled products from user need through responsible delivery.', work: 'Define user problems and measurable outcomes, prioritize experiments, align product and technical teams, and account for quality, privacy, safety, and operating costs.', proof: 'Write a concise product brief with a user problem, evaluation plan, risks, and launch measures.' },
];

const normalized = (value = '') => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
const guideFor = (role) => roleGuides.find((guide) => normalized(guide.title) === normalized(role.title)) || {
  title: role.title,
  family: 'Technology roles',
  mark: role.title.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
  summary: `Explore the day-to-day work, skill expectations, and evidence employers look for in a ${role.title}.`,
  work: `Build practical expertise in the skills associated with ${role.title}, work on real problems, and communicate your decisions clearly.`,
  proof: 'Create a focused project that demonstrates the role’s core skills and documents your decisions.',
};

const CareerPathsPage = () => {
  const { session, profile } = useUser();
  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [expandedRoleId, setExpandedRoleId] = useState(null);
  const [query, setQuery] = useState('');
  const [familyFilter, setFamilyFilter] = useState('All roles');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const getPageData = async () => {
      const [{ data: rolesData }, { data: skillsData }, { data: userSkillsData }] = await Promise.all([
        supabase.from('roles').select('*, role_skills(skill_id)'),
        supabase.from('skills').select('*'),
        supabase.from('user_skills').select('skill_id').eq('user_id', session.user.id),
      ]);
      if (!active) return;
      if (rolesData) setRoles(rolesData);
      if (skillsData) setSkills(skillsData);
      if (userSkillsData) setUserSkills(userSkillsData.map(({ skill_id }) => skill_id));
      setLoading(false);
    };
    if (session?.user?.id) getPageData();
    return () => { active = false; };
  }, [session]);

  const families = useMemo(() => ['All roles', ...new Set(roleGuides.map(({ family }) => family))], []);
  const sortedRoles = useMemo(() => [...roles].sort((left, right) => {
    const leftIndex = roleGuides.findIndex((guide) => normalized(guide.title) === normalized(left.title));
    const rightIndex = roleGuides.findIndex((guide) => normalized(guide.title) === normalized(right.title));
    if (leftIndex < 0 && rightIndex < 0) return left.title.localeCompare(right.title);
    if (leftIndex < 0) return 1;
    if (rightIndex < 0) return -1;
    return leftIndex - rightIndex;
  }), [roles]);
  const visibleRoles = useMemo(() => sortedRoles.filter((role) => {
    const guide = guideFor(role);
    const matchesFamily = familyFilter === 'All roles' || guide.family === familyFilter;
    const matchesSearch = !query || `${role.title} ${guide.family} ${guide.summary}`.toLowerCase().includes(query.toLowerCase());
    return matchesFamily && matchesSearch;
  }), [sortedRoles, familyFilter, query]);

  const toggleRoleDetails = (roleId) => setExpandedRoleId((current) => current === roleId ? null : roleId);

  return (
    <main className="career-paths-page">
      <header className="career-page-heading">
        <p className="career-page-eyebrow">EXPLORE WHAT’S NEXT</p>
        <h1>Roles with room to grow.</h1>
        <p>Explore modern technology careers, understand the work, and see the skills you can build evidence for.</p>
      </header>

      <aside className="career-market-note">
        <span className="market-note-mark" aria-hidden="true">↗</span>
        <p><b>Market-informed, not a promise of openings.</b> Global workforce research points to growth in AI, data, software, and security. Demand still varies by location and employer.</p>
        <div className="market-note-sources"><a href="https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/" target="_blank" rel="noreferrer">WEF outlook ↗</a><a href="https://www.linkedin.com/pulse/jobs-rise-2025-edition-get-hired-by-linkedin-news-lt2sf" target="_blank" rel="noreferrer">LinkedIn roles ↗</a></div>
      </aside>

      <section className="role-explorer" aria-label="Explore career roles">
        <div className="role-explorer-toolbar">
          <label className="role-search" htmlFor="role-search"><span aria-hidden="true">⌕</span><input id="role-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roles or fields" /></label>
          <span className="role-result-count">{visibleRoles.length} {visibleRoles.length === 1 ? 'role' : 'roles'}</span>
        </div>
        <div className="role-family-filters" aria-label="Filter roles by field">
          {families.map((family) => <button type="button" key={family} className={`role-family-filter${familyFilter === family ? ' is-active' : ''}`} onClick={() => setFamilyFilter(family)}>{family}</button>)}
        </div>

        {loading ? <p className="role-empty-state">Loading career roles…</p> : visibleRoles.length ? (
          <div className="role-catalog-grid">
            {visibleRoles.map((role) => {
              const guide = guideFor(role);
              const isExpanded = expandedRoleId === role.id;
              const requiredSkills = (role.role_skills || []).map(({ skill_id }) => skills.find((skill) => skill.id === skill_id)).filter(Boolean);
              const knownSkillCount = requiredSkills.filter((skill) => userSkills.includes(skill.id)).length;
              const isTargetRole = normalized(profile?.desired_role) === normalized(role.title);
              return (
                <Card key={role.id} className={`role-catalog-card${isExpanded ? ' is-expanded' : ''}`}>
                  <div className="role-catalog-card-top"><span className="role-catalog-mark" aria-hidden="true">{guide.mark}</span><span className="role-family-label">{guide.family}</span>{isTargetRole && <span className="role-target-label">Your target</span>}</div>
                  <h2>{role.title}</h2>
                  <p className="role-summary">{guide.summary}</p>
                  <div className="role-skill-summary"><span>{requiredSkills.length ? `${knownSkillCount} of ${requiredSkills.length} skills in your profile` : 'Skill map being prepared'}</span><span className="role-skill-track"><i style={{ width: requiredSkills.length ? `${Math.round((knownSkillCount / requiredSkills.length) * 100)}%` : '0%' }} /></span></div>
                  {requiredSkills.length > 0 && <div className="role-skill-chips">{requiredSkills.slice(0, 4).map((skill) => <span className={userSkills.includes(skill.id) ? 'skill-chip is-known' : 'skill-chip'} key={skill.id}>{skill.name}</span>)}{requiredSkills.length > 4 && <span className="skill-chip-more">+{requiredSkills.length - 4}</span>}</div>}
                  {isExpanded && <div className="role-expanded-details"><div><h3>What you’ll work on</h3><p>{guide.work}</p></div><div><h3>Build evidence</h3><p>{guide.proof}</p></div>{requiredSkills.length > 4 && <div><h3>More related skills</h3><p>{requiredSkills.slice(4).map((skill) => skill.name).join(' · ')}</p></div>}</div>}
                  <button type="button" className="role-details-toggle" onClick={() => toggleRoleDetails(role.id)} aria-expanded={isExpanded}>{isExpanded ? 'Show less' : 'Explore this role'} <span aria-hidden="true">{isExpanded ? '↑' : '→'}</span></button>
                </Card>
              );
            })}
          </div>
        ) : <p className="role-empty-state">No roles match that search. Try a broader title or choose another field.</p>}
      </section>
    </main>
  );
};

export default CareerPathsPage;

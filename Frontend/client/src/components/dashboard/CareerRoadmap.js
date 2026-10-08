import React, { useMemo, useState } from 'react';
import { getSkillLearningGuide } from '../../data/skillLearningGuides';
import './CareerRoadmap.css';

const progressFilters = [
  { id: 'all', label: 'All steps' },
  { id: 'not_started', label: 'To do' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
];
const progressKey = (roleTitle, skillName) => `${roleTitle.trim().toLowerCase()}::${skillName.trim().toLowerCase()}`;

const CareerRoadmap = ({ role, skills, userSkillIds, progressRecords = {}, onProgressChange = () => {}, progressSavingKey = '', progressLoading = false }) => {
  const [filter, setFilter] = useState('all');
  const [evidenceDrafts, setEvidenceDrafts] = useState({});

  const roadmap = useMemo(() => {
    if (!role) return null;
    const requiredSkills = (role.role_skills || [])
      .map(({ skill_id }) => skills.find((skill) => skill.id === skill_id))
      .filter(Boolean);
    const steps = requiredSkills.map((skill, index) => {
      const record = progressRecords[progressKey(role.title, skill.name)] || {};
      return {
        skill,
        step: index + 1,
        status: record.status || 'not_started',
        evidence: record.evidence || '',
        completedAt: record.completed_at || null,
        hasProfileSkill: userSkillIds.includes(skill.id),
        guide: getSkillLearningGuide(skill.name),
      };
    });
    const counts = steps.reduce((result, item) => {
      result[item.status] = (result[item.status] || 0) + 1;
      return result;
    }, {});
    return { steps, counts, completed: counts.completed || 0, inProgress: counts.in_progress || 0, notStarted: counts.not_started || 0 };
  }, [role, skills, userSkillIds, progressRecords]);

  if (!roadmap) {
    return <section className="career-roadmap roadmap-empty" aria-labelledby="roadmap-title"><h2 id="roadmap-title">Your career roadmap</h2><p>Select a target role to see your skill-by-skill plan and track your progress.</p></section>;
  }

  const { steps, completed, inProgress, notStarted } = roadmap;
  const completionPercent = steps.length ? Math.round((completed / steps.length) * 100) : 0;
  const visibleSteps = steps.filter((item) => filter === 'all' || item.status === filter);

  const changeStatus = (step, status) => {
    const previous = progressRecords[step.skill.name.trim().toLowerCase()] || {};
    const completedAt = status === 'completed'
      ? (previous.status === 'completed' && previous.completed_at ? previous.completed_at : new Date().toISOString())
      : null;
    onProgressChange(step.skill, { status, evidence: previous.evidence || '', completed_at: completedAt });
  };

  const saveEvidence = (step) => {
    const evidence = (evidenceDrafts[step.skill.id] ?? step.evidence).trim();
    onProgressChange(step.skill, { status: step.status, evidence, completed_at: step.completedAt });
  };

  return (
    <section className="career-roadmap" aria-labelledby="roadmap-title">
      <div className="roadmap-heading">
        <div><p className="roadmap-eyebrow">YOUR PERSONALIZED PLAN</p><h2 id="roadmap-title">Your {role.title} roadmap</h2></div>
        <strong className="roadmap-progress-value">{completionPercent}% complete</strong>
      </div>
      <div className="roadmap-progress-track" role="progressbar" aria-label="Completed roadmap skills" aria-valuemin="0" aria-valuemax="100" aria-valuenow={completionPercent}><span style={{ width: `${completionPercent}%` }} /></div>
      <p className="roadmap-summary">Track your learning separately from the skills listed on your profile. Add a note or project link as evidence whenever you like.</p>

      <div className="roadmap-stats" aria-label="Roadmap skill counts">
        <div className="roadmap-stat completed"><span className="roadmap-stat-number">{completed}</span><span>Completed</span></div>
        <div className="roadmap-stat in-progress"><span className="roadmap-stat-number">{inProgress}</span><span>In progress</span></div>
        <div className="roadmap-stat to-do"><span className="roadmap-stat-number">{notStarted}</span><span>To do</span></div>
      </div>

      {steps.length ? <>
        <div className="roadmap-filter-row" role="group" aria-label="Filter roadmap skills">
          {progressFilters.map((item) => <button key={item.id} type="button" className={filter === item.id ? 'active' : ''} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}<span>{item.id === 'all' ? steps.length : (roadmap.counts[item.id] || 0)}</span></button>)}
        </div>

        {visibleSteps.length ? <ol className="roadmap-actions">
          {visibleSteps.map((item) => {
            const saving = progressSavingKey === progressKey(role.title, item.skill.name);
            const evidenceValue = evidenceDrafts[item.skill.id] ?? item.evidence;
            return <li key={item.skill.id} className={`roadmap-action status-${item.status}`}>
              <span className="roadmap-week">Step {item.step}</span>
              <div className="roadmap-action-content">
                <div className="roadmap-skill-heading"><div><h3>{item.skill.name}</h3><div className="roadmap-tags"><span className={`roadmap-status-tag ${item.status}`}>{item.status === 'not_started' ? 'To do' : item.status === 'in_progress' ? 'In progress' : 'Completed'}</span>{item.hasProfileSkill && <span className="roadmap-profile-tag">On your profile</span>}</div></div>
                  <label className="roadmap-status-control"><span className="visually-hidden">Progress for {item.skill.name}</span><select aria-label={`Progress for ${item.skill.name}`} value={item.status} onChange={(event) => changeStatus(item, event.target.value)} disabled={saving || progressLoading}><option value="not_started">To do</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select></label>
                </div>
                <p className="roadmap-benefit"><strong>Why it matters</strong>{item.guide.benefit}</p>
                <p className="roadmap-practice-tip">Try it: apply {item.skill.name} in a small project related to {role.title}.</p>
                {item.status === 'completed' && item.completedAt && <p className="roadmap-completed-date">Completed {new Date(item.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>}
                <a className="roadmap-resource-link" href={item.guide.url} target="_blank" rel="noreferrer">Learn {item.skill.name} <span aria-hidden="true">↗</span></a>
                <details className="roadmap-evidence">
                  <summary>{item.evidence ? 'View or edit evidence' : 'Add evidence (optional)'}</summary>
                  <label htmlFor={`evidence-${item.skill.id}`}>Add a note, project link, or certificate link</label>
                  <textarea id={`evidence-${item.skill.id}`} rows="3" maxLength="2000" value={evidenceValue} onChange={(event) => setEvidenceDrafts((current) => ({ ...current, [item.skill.id]: event.target.value }))} placeholder="For example: Built a dashboard using SQL joins…" />
                  <div className="roadmap-evidence-footer"><span>{evidenceValue.length}/2000</span><button type="button" onClick={() => saveEvidence(item)} disabled={saving || progressLoading}>{saving ? 'Saving…' : 'Save evidence'}</button></div>
                </details>
              </div>
            </li>;
          })}
        </ol> : <div className="roadmap-filter-empty"><span aria-hidden="true">✦</span><p>No skills in this view yet. Choose another filter or update a roadmap step.</p></div>}
      </> : <div className="roadmap-complete"><h3>Skill map being prepared</h3><p>This role does not have a detailed skill map yet. Explore the role guide and learning resources while we add one.</p></div>}
    </section>
  );
};

export default CareerRoadmap;

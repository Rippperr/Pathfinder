import React, { useMemo } from 'react';
import './CareerRoadmap.css';

const CareerRoadmap = ({ role, skills, userSkillIds }) => {
  const roadmap = useMemo(() => {
    if (!role) return null;
    const requiredSkills = (role.role_skills || [])
      .map(({ skill_id }) => skills.find((skill) => skill.id === skill_id))
      .filter(Boolean);
    const missingSkills = requiredSkills.filter((skill) => !userSkillIds.includes(skill.id));
    const resources = role.learningResources || [];
    const actions = missingSkills.map((skill, index) => ({
      skill,
      step: index + 1,
      resource: resources.find((item) => item.skillNames.some((name) => name.toLowerCase() === skill.name.toLowerCase())) || resources[0],
    }));
    return {
      actions,
      completedSkills: requiredSkills.length - missingSkills.length,
      progress: requiredSkills.length ? Math.round(((requiredSkills.length - missingSkills.length) / requiredSkills.length) * 100) : 0,
      requiredSkills,
    };
  }, [role, skills, userSkillIds]);

  if (!roadmap) {
    return <section className="career-roadmap roadmap-empty" aria-labelledby="roadmap-title"><h2 id="roadmap-title">Your career roadmap</h2><p>Select a target role to see a skill-by-skill plan and learning resources.</p></section>;
  }

  const { actions, completedSkills, progress, requiredSkills } = roadmap;
  return (
    <section className="career-roadmap" aria-labelledby="roadmap-title">
      <div className="roadmap-heading">
        <div><p className="roadmap-eyebrow">PERSONALIZED SKILL PLAN</p><h2 id="roadmap-title">Your {role.title} roadmap</h2></div>
        <strong className="roadmap-progress-value">{progress}% mapped</strong>
      </div>
      <div className="roadmap-progress-track" role="progressbar" aria-label="Skills in your profile for this role" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>
      <p className="roadmap-summary">{completedSkills} of {requiredSkills.length} mapped skills are already in your profile. Work through the gaps in an order that suits your goal.</p>
      {actions.length ? (
        <ol className="roadmap-actions">
          {actions.map(({ skill, resource, step }) => (
            <li key={skill.id} className="roadmap-action">
              <span className="roadmap-week">Step {step}</span>
              <div className="roadmap-action-content">
                <h3>Build skill: {skill.name}</h3>
                <p>Learn the fundamentals, then create a small project that shows how you use {skill.name} for this role.</p>
                {resource && <a className="roadmap-resource-link" href={resource.url} target="_blank" rel="noreferrer">{resource.provider}: {resource.title} <span aria-hidden="true">↗</span></a>}
              </div>
            </li>
          ))}
        </ol>
      ) : requiredSkills.length > 0 ? (
        <div className="roadmap-complete"><h3>Your profile covers every skill in this map.</h3><p>Keep building evidence through projects, interview practice, and role-specific applications. This skill map is a guide, not a hiring guarantee.</p></div>
      ) : <div className="roadmap-complete"><h3>Role map being prepared</h3><p>Explore the role guide and learning resources while we add a detailed skill map for this role.</p></div>}
    </section>
  );
};

export default CareerRoadmap;

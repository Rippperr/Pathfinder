import React, { useMemo } from 'react';
import './CareerRoadmap.css';

const CareerRoadmap = ({ role, skills, userSkillIds, courses }) => {
  const roadmap = useMemo(() => {
    if (!role) return null;

    const requiredSkillIds = (role.role_skills || []).map(({ skill_id }) => skill_id);
    const requiredSkills = requiredSkillIds
      .map((skillId) => skills.find((skill) => skill.id === skillId))
      .filter(Boolean);
    const missingSkills = requiredSkills.filter((skill) => !userSkillIds.includes(skill.id));
    const completedSkills = requiredSkills.length - missingSkills.length;
    const progress = requiredSkills.length
      ? Math.round((completedSkills / requiredSkills.length) * 100)
      : 0;

    const actions = missingSkills.map((skill, index) => {
      const resource = courses.find((course) =>
        (course.course_skills || []).some(({ skill_id }) => skill_id === skill.id)
      );

      return {
        skill,
        resource,
        week: index + 1,
      };
    });

    return { actions, completedSkills, progress, requiredSkills };
  }, [role, skills, userSkillIds, courses]);

  if (!roadmap) {
    return (
      <section className="career-roadmap roadmap-empty" aria-labelledby="roadmap-title">
        <h2 id="roadmap-title">Your Career Roadmap</h2>
        <p>Select a target role to receive a focused, skill-by-skill action plan.</p>
      </section>
    );
  }

  const { actions, completedSkills, progress, requiredSkills } = roadmap;

  return (
    <section className="career-roadmap" aria-labelledby="roadmap-title">
      <div className="roadmap-heading">
        <div>
          <p className="roadmap-eyebrow">Target role</p>
          <h2 id="roadmap-title">{role.title} Roadmap</h2>
        </div>
        <strong className="roadmap-progress-value">{progress}% ready</strong>
      </div>

      <div
        className="roadmap-progress-track"
        role="progressbar"
        aria-label="Required skills completed"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={progress}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      <p className="roadmap-summary">
        You have demonstrated {completedSkills} of {requiredSkills.length} required skills.
      </p>

      {actions.length === 0 ? (
        <div className="roadmap-complete">
          <h3>You are ready for the next step.</h3>
          <p>Keep your profile current and focus on projects, interview practice, and applications.</p>
        </div>
      ) : (
        <ol className="roadmap-actions">
          {actions.map(({ skill, resource, week }) => (
            <li key={skill.id} className="roadmap-action">
              <span className="roadmap-week">Step {week}</span>
              <div>
                <h3>Build evidence for {skill.name}</h3>
                <p>
                  {resource
                    ? `Start with “${resource.title}” (${resource.type}), then add a small project or portfolio example.`
                    : 'Add this skill to your learning plan, then create a small project or portfolio example that demonstrates it.'}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

export default CareerRoadmap;

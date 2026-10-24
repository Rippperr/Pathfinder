import { getCareerRoleCatalog, getCareerSkillCatalog } from './careerCatalog';

test('every built-in role has a sequenced roadmap covering each core skill exactly once', () => {
  const skills = getCareerSkillCatalog();
  const roles = getCareerRoleCatalog([], skills);

  expect(roles.length).toBeGreaterThanOrEqual(17);
  roles.forEach((role) => {
    const roadmapSkillNames = role.roadmapPhases.flatMap((phase) => phase.skills.map((skill) => skill.name));
    const coreSkillNames = role.role_skills.map(({ skill_id }) => skills.find((skill) => skill.id === skill_id)?.name).filter(Boolean);

    expect(role.roadmapPhases.length).toBeGreaterThan(1);
    expect(roadmapSkillNames).toHaveLength(coreSkillNames.length);
    expect(new Set(roadmapSkillNames).size).toBe(roadmapSkillNames.length);
    expect([...roadmapSkillNames].sort()).toEqual([...coreSkillNames].sort());
    expect(role.optionalSkills.every((skill) => skills.some((available) => available.id === skill.id))).toBe(true);
  });
});

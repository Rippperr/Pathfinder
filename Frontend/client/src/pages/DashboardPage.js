import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../contexts/UserContext';
import Card from '../components/common/Card';
import CustomDropdown from '../components/common/CustomDropdown';
import SkillGapDisplay from '../components/dashboard/SkillGapDisplay';
import CareerRoadmap from '../components/dashboard/CareerRoadmap';
import './DashboardPage.css';

const DashboardPage = () => {
  const { session, profile } = useUser();
  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [courses, setCourses] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');

  useEffect(() => {
    const getPageData = async () => {
      const { data: rolesData } = await supabase.from('roles').select('*, role_skills(skill_id)');
      if (rolesData) {
        setRoles(rolesData);
        const targetRole = profile?.desired_role?.trim().toLowerCase();
        if (targetRole) {
          const matchedRole = rolesData.find((role) => role.title.trim().toLowerCase() === targetRole);
          if (matchedRole) setSelectedRoleId(matchedRole.id);
        }
      }
      
      const { data: skillsData } = await supabase.from('skills').select('*');
      if (skillsData) setSkills(skillsData);

      const { data: coursesData } = await supabase.from('courses').select('*, course_skills(skill_id)');
      if (coursesData) setCourses(coursesData);

      if (session?.user) {
        const { data: userSkillsData } = await supabase.from('user_skills').select('skill_id').eq('user_id', session.user.id);
        if (userSkillsData) setUserSkills(userSkillsData.map(s => s.skill_id));
      }
    };
    getPageData();
  }, [session, profile?.desired_role]);

  const selectedRole = roles.find(role => role.id === selectedRoleId);

  const requiredSkillsForRole = useMemo(() => {
    if (!selectedRole) return [];
    return selectedRole.role_skills.map(rs => rs.skill_id);
  }, [selectedRole]);

  const recommendedCourses = useMemo(() => {
    if (!selectedRole) return [];
    const missingSkillIds = requiredSkillsForRole.filter(id => !userSkills.includes(id));
    if (missingSkillIds.length === 0) return [];
    const recommendations = courses.filter(course => 
      course.course_skills.some(cs => missingSkillIds.includes(cs.skill_id))
    );
    return recommendations;
  }, [selectedRole, userSkills, courses, requiredSkillsForRole]);

  const handleRoleChange = (role) => {
    setSelectedRoleId(role.id);
  };
  
  return (
    <div className="dashboard-page">
      <header className="dashboard-heading">
        <p className="dashboard-eyebrow">YOUR CAREER WORKSPACE</p>
        <h1>Your next move, mapped.</h1>
        <p className="dashboard-intro">{profile?.desired_role ? `Build toward ${profile.desired_role} with a clear view of your skills and practical next steps.` : 'Choose a role to see the skills you already bring and the next steps to strengthen your profile.'}</p>
      </header>

      <CustomDropdown
        options={roles}
        selectedValue={selectedRoleId}
        onChange={handleRoleChange}
        placeholder="Select your target role"
        displayKey="title"
      />

      <Card>
        <SkillGapDisplay 
          userSkills={userSkills}
          requiredSkills={requiredSkillsForRole}
          allSkills={skills}
          roleTitle={selectedRole?.title}
        />
      </Card>

      <CareerRoadmap
        role={selectedRole}
        skills={skills}
        userSkillIds={userSkills}
        courses={courses}
      />
      
      <div className="recommendations-section">
        <h2>Focused learning resources</h2>
        <div className="courses-grid">
          {selectedRole ? (
            recommendedCourses.length > 0 ? (
              recommendedCourses.map(course => (
                <Card key={course.id}>
                  <img src={course.image_url} alt={course.title} className="course-image" />
                  <h3>{course.title}</h3>
                  <p>{course.type}</p>
                </Card>
              ))
            ) : (
              <p className="placeholder-text">You have all the required skills for this role!</p>
            )
          ) : (
            <p className="placeholder-text">Select a role to see recommendations.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

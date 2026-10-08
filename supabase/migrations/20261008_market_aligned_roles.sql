-- Expand the Pathfinder role catalog around current technology role families.
-- This migration assumes the existing public.skills, public.roles, and public.role_skills tables.

with skill_catalog(name) as (
  values
    ('PyTorch'), ('TensorFlow'), ('Prompt Engineering'), ('LLM Application Development'),
    ('Retrieval-Augmented Generation'), ('Vector Databases'), ('AI Evaluation'), ('MLOps'),
    ('Data Pipelines'), ('Apache Airflow'), ('dbt'), ('Snowflake'), ('Terraform'),
    ('SIEM'), ('Incident Response'), ('Identity and Access Management'), ('Threat Modeling'),
    ('Secure Coding'), ('Cloud Security'), ('FinTech'), ('System Design'), ('API Design'),
    ('Product Strategy'), ('Experiment Design'), ('Product Analytics')
)
insert into public.skills (name)
select catalog.name
from skill_catalog catalog
where not exists (
  select 1 from public.skills existing where lower(existing.name) = lower(catalog.name)
);

with role_catalog(title) as (
  values
    ('AI Engineer'), ('AI Application Developer'), ('Machine Learning Engineer'), ('MLOps Engineer'),
    ('Data Engineer'), ('Data Analyst'), ('Cloud / Platform Engineer'), ('DevOps Engineer'),
    ('Cybersecurity Analyst'), ('Application Security Engineer'), ('Software Engineer'),
    ('Full-Stack Developer'), ('Backend Developer'), ('Frontend Developer'),
    ('FinTech Software Engineer'), ('Product Designer'), ('AI Product Manager')
)
insert into public.roles (title)
select catalog.title
from role_catalog catalog
where not exists (
  select 1 from public.roles existing where lower(existing.title) = lower(catalog.title)
);

with role_skill_catalog(role_title, skill_name) as (
  values
    ('AI Engineer', 'Artificial Intelligence'), ('AI Engineer', 'Python'),
    ('AI Engineer', 'Machine Learning'), ('AI Engineer', 'PyTorch'),
    ('AI Engineer', 'TensorFlow'), ('AI Engineer', 'AI Evaluation'),
    ('AI Engineer', 'REST APIs'), ('AI Engineer', 'Git'),
    ('AI Application Developer', 'Artificial Intelligence'), ('AI Application Developer', 'Python'),
    ('AI Application Developer', 'Prompt Engineering'), ('AI Application Developer', 'LLM Application Development'),
    ('AI Application Developer', 'Retrieval-Augmented Generation'), ('AI Application Developer', 'Vector Databases'),
    ('AI Application Developer', 'REST APIs'), ('AI Application Developer', 'Unit Testing'),
    ('Machine Learning Engineer', 'Python'), ('Machine Learning Engineer', 'Machine Learning'),
    ('Machine Learning Engineer', 'PyTorch'), ('Machine Learning Engineer', 'TensorFlow'),
    ('Machine Learning Engineer', 'Statistics'), ('Machine Learning Engineer', 'Docker'),
    ('Machine Learning Engineer', 'Data Analysis'),
    ('MLOps Engineer', 'Machine Learning'), ('MLOps Engineer', 'Python'),
    ('MLOps Engineer', 'Docker'), ('MLOps Engineer', 'Kubernetes'),
    ('MLOps Engineer', 'Cloud Computing'), ('MLOps Engineer', 'CI/CD'), ('MLOps Engineer', 'Git'),
    ('Data Engineer', 'Python'), ('Data Engineer', 'SQL'), ('Data Engineer', 'PostgreSQL'),
    ('Data Engineer', 'Data Pipelines'), ('Data Engineer', 'Apache Airflow'),
    ('Data Engineer', 'dbt'), ('Data Engineer', 'Cloud Computing'), ('Data Engineer', 'Docker'),
    ('Data Analyst', 'SQL'), ('Data Analyst', 'Microsoft Excel'), ('Data Analyst', 'Power BI'),
    ('Data Analyst', 'Statistics'), ('Data Analyst', 'Data Visualization'), ('Data Analyst', 'Communication'),
    ('Cloud / Platform Engineer', 'Cloud Computing'), ('Cloud / Platform Engineer', 'Amazon Web Services'),
    ('Cloud / Platform Engineer', 'Terraform'), ('Cloud / Platform Engineer', 'Kubernetes'),
    ('Cloud / Platform Engineer', 'Docker'), ('Cloud / Platform Engineer', 'Linux'),
    ('Cloud / Platform Engineer', 'CI/CD'),
    ('DevOps Engineer', 'Linux'), ('DevOps Engineer', 'Docker'), ('DevOps Engineer', 'Kubernetes'),
    ('DevOps Engineer', 'CI/CD'), ('DevOps Engineer', 'Git'), ('DevOps Engineer', 'Cloud Computing'),
    ('Cybersecurity Analyst', 'Cybersecurity'), ('Cybersecurity Analyst', 'Networking'),
    ('Cybersecurity Analyst', 'Linux'), ('Cybersecurity Analyst', 'SIEM'),
    ('Cybersecurity Analyst', 'Incident Response'), ('Cybersecurity Analyst', 'Communication'),
    ('Application Security Engineer', 'Cybersecurity'), ('Application Security Engineer', 'Secure Coding'),
    ('Application Security Engineer', 'Threat Modeling'), ('Application Security Engineer', 'Cloud Security'),
    ('Application Security Engineer', 'REST APIs'), ('Application Security Engineer', 'Git'),
    ('Software Engineer', 'JavaScript'), ('Software Engineer', 'Python'),
    ('Software Engineer', 'System Design'), ('Software Engineer', 'Git'),
    ('Software Engineer', 'Unit Testing'), ('Software Engineer', 'API Design'),
    ('Full-Stack Developer', 'React'), ('Full-Stack Developer', 'JavaScript'),
    ('Full-Stack Developer', 'Node.js'), ('Full-Stack Developer', 'REST APIs'),
    ('Full-Stack Developer', 'PostgreSQL'), ('Full-Stack Developer', 'Git'), ('Full-Stack Developer', 'Unit Testing'),
    ('Backend Developer', 'Node.js'), ('Backend Developer', 'Python'), ('Backend Developer', 'SQL'),
    ('Backend Developer', 'REST APIs'), ('Backend Developer', 'PostgreSQL'),
    ('Backend Developer', 'Docker'), ('Backend Developer', 'Unit Testing'),
    ('Frontend Developer', 'React'), ('Frontend Developer', 'TypeScript'),
    ('Frontend Developer', 'JavaScript'), ('Frontend Developer', 'HTML'), ('Frontend Developer', 'CSS'),
    ('Frontend Developer', 'Web Accessibility'), ('Frontend Developer', 'Unit Testing'),
    ('FinTech Software Engineer', 'Java'), ('FinTech Software Engineer', 'Python'),
    ('FinTech Software Engineer', 'SQL'), ('FinTech Software Engineer', 'FinTech'),
    ('FinTech Software Engineer', 'Financial Analysis'), ('FinTech Software Engineer', 'Cybersecurity'),
    ('FinTech Software Engineer', 'API Design'),
    ('Product Designer', 'Figma'), ('Product Designer', 'UX Research'), ('Product Designer', 'UI Design'),
    ('Product Designer', 'Prototyping'), ('Product Designer', 'Web Accessibility'),
    ('Product Designer', 'Communication'),
    ('AI Product Manager', 'Product Management'), ('AI Product Manager', 'Artificial Intelligence'),
    ('AI Product Manager', 'Product Strategy'), ('AI Product Manager', 'Experiment Design'),
    ('AI Product Manager', 'Product Analytics'), ('AI Product Manager', 'Communication'),
    ('AI Product Manager', 'Agile')
)
insert into public.role_skills (role_id, skill_id)
select r.id, skill.id
from role_skill_catalog catalog
join public.roles r on lower(r.title) = lower(catalog.role_title)
join public.skills skill on lower(skill.name) = lower(catalog.skill_name)
where not exists (
  select 1 from public.role_skills existing
  where existing.role_id = r.id and existing.skill_id = skill.id
);

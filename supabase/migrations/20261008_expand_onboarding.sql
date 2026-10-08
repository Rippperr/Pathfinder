-- Adds a separate target role and broadens the selectable onboarding skill library.
alter table public.users
  add column if not exists desired_role text;

insert into public.skills (name)
select catalog.name
from (values
  ('HTML'), ('CSS'), ('JavaScript'), ('TypeScript'), ('React'), ('Next.js'), ('Node.js'),
  ('Express.js'), ('Python'), ('Java'), ('C++'), ('C#'), ('.NET'), ('PHP'), ('Go'),
  ('REST APIs'), ('GraphQL'), ('Git'), ('GitHub'), ('Unit Testing'), ('Web Accessibility'),
  ('SQL'), ('PostgreSQL'), ('MySQL'), ('MongoDB'), ('Data Analysis'), ('Microsoft Excel'),
  ('Power BI'), ('Tableau'), ('Statistics'), ('Data Visualization'), ('Machine Learning'),
  ('Artificial Intelligence'), ('Figma'), ('UI Design'), ('UX Research'), ('Wireframing'),
  ('Prototyping'), ('Adobe Photoshop'), ('Adobe Illustrator'), ('Product Management'),
  ('Project Management'), ('Agile'), ('Scrum'), ('Business Analysis'), ('Market Research'),
  ('Digital Marketing'), ('SEO'), ('Content Writing'), ('Social Media Marketing'),
  ('Sales'), ('Customer Support'), ('Financial Analysis'), ('Accounting'), ('Public Speaking'),
  ('Communication'), ('Leadership'), ('Teamwork'), ('Problem Solving'), ('Critical Thinking'),
  ('Time Management'), ('Presentation Skills'), ('Cloud Computing'), ('Amazon Web Services'),
  ('Microsoft Azure'), ('Docker'), ('Kubernetes'), ('Linux'), ('Cybersecurity'),
  ('Networking'), ('CI/CD'), ('Mobile App Development'), ('iOS Development'),
  ('Android Development'), ('Search Ads'), ('Copywriting'), ('Data Storytelling')
) as catalog(name)
where not exists (
  select 1
  from public.skills existing
  where lower(existing.name) = lower(catalog.name)
);

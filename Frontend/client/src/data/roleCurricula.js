// Role learning plans are ordered prerequisites, not hiring checklists.
// Core skills are grouped into a practical learning sequence; optional skills
// are adjacent specializations that vary by product, employer, and tech stack.
export const roleCurricula = {
  'AI Engineer': {
    phases: [
      { title: 'Build the engineering foundation', outcome: 'Write, test, version, and expose reliable software before adding models.', skills: ['Python', 'Git', 'Unit Testing', 'SQL', 'Statistics', 'Data Analysis', 'API Design'] },
      { title: 'Learn machine learning', outcome: 'Understand data preparation, model training, evaluation, and the limits of model metrics.', skills: ['Machine Learning', 'Data Preparation', 'Feature Engineering', 'PyTorch', 'Transformer Models'] },
      { title: 'Build useful AI features', outcome: 'Connect models to a focused user problem and evaluate quality with representative cases.', skills: ['LLM Application Development', 'Prompt Engineering', 'Retrieval-Augmented Generation', 'Vector Databases', 'AI Evaluation'] },
      { title: 'Ship responsibly', outcome: 'Deploy and monitor the feature with privacy, security, reliability, and cost controls.', skills: ['Docker', 'Cloud Computing', 'MLOps', 'Model Monitoring', 'AI Safety and Responsible AI', 'Privacy and Data Protection', 'Communication'] },
    ],
    optionalSkills: ['TensorFlow', 'GPU Optimization', 'Distributed Training', 'Model Fine-Tuning'],
  },
  'AI Application Developer': {
    phases: [
      { title: 'Application development basics', outcome: 'Build a small tested application with a clear API and persistent data.', skills: ['Python', 'JavaScript', 'Git', 'REST APIs', 'SQL', 'Unit Testing'] },
      { title: 'Model-backed features', outcome: 'Integrate model APIs, structured outputs, and tool use into an application flow.', skills: ['LLM Application Development', 'Prompt Engineering', 'AI Tool Calling', 'AI Evaluation'] },
      { title: 'Ground answers in trusted data', outcome: 'Build retrieval with citations, measure retrieval quality, and handle missing answers.', skills: ['Retrieval-Augmented Generation', 'Embeddings', 'Vector Databases', 'Data Preparation'] },
      { title: 'Secure and operate the app', outcome: 'Protect users and secrets, add fallbacks, and deploy observable services.', skills: ['Application Security', 'AI Safety and Responsible AI', 'Privacy and Data Protection', 'Prompt Injection Defense', 'Docker', 'Cloud Computing', 'Observability'] },
    ],
    optionalSkills: ['TypeScript', 'Agent Frameworks', 'Multimodal AI', 'Fine-Tuning'],
  },
  'Machine Learning Engineer': {
    phases: [
      { title: 'Math, code, and data', outcome: 'Prepare reproducible datasets and explain the assumptions behind a baseline.', skills: ['Python', 'Statistics', 'Probability', 'Linear Algebra', 'SQL', 'Data Analysis', 'Data Preparation', 'Git'] },
      { title: 'Train and evaluate models', outcome: 'Compare model families using suitable metrics, validation, and error analysis.', skills: ['Machine Learning', 'Feature Engineering', 'Experiment Design', 'scikit-learn', 'PyTorch'] },
      { title: 'Build reliable training workflows', outcome: 'Turn experiments into repeatable pipelines with tests and tracked artifacts.', skills: ['Data Pipelines', 'Model Training', 'Unit Testing', 'Docker', 'Cloud Computing'] },
      { title: 'Deploy and monitor', outcome: 'Serve a model safely, monitor quality and drift, and document trade-offs.', skills: ['Model Serving', 'MLOps', 'Model Monitoring', 'AI Evaluation', 'AI Safety and Responsible AI', 'Communication'] },
    ],
    optionalSkills: ['TensorFlow', 'Distributed Training', 'GPU Optimization', 'Feature Stores'],
  },
  'MLOps Engineer': {
    phases: [
      { title: 'Software and systems foundation', outcome: 'Automate repeatable tasks and understand the environments models run in.', skills: ['Linux', 'Python', 'Git', 'Docker', 'REST APIs', 'Unit Testing'] },
      { title: 'Make ML workflows reproducible', outcome: 'Version data and models, track experiments, and orchestrate training jobs.', skills: ['Machine Learning', 'Data Pipelines', 'Data Versioning', 'Experiment Tracking', 'Workflow Orchestration'] },
      { title: 'Build the delivery platform', outcome: 'Package and deploy models through tested, repeatable infrastructure.', skills: ['CI/CD', 'Cloud Computing', 'Terraform', 'Kubernetes', 'Model Registry', 'Model Serving'] },
      { title: 'Operate safely at scale', outcome: 'Observe model and service health, control access, and respond to failures.', skills: ['Observability', 'Model Monitoring', 'Cloud Security', 'Secrets Management', 'Reliability Engineering', 'Cost Optimization'] },
    ],
    optionalSkills: ['Feature Stores', 'GPU Optimization', 'Distributed Training', 'Kubeflow'],
  },
  'Data Engineer': {
    phases: [
      { title: 'Query and model data', outcome: 'Use SQL and Python to transform trustworthy relational data.', skills: ['SQL', 'Python', 'Git', 'Linux', 'PostgreSQL', 'Data Modeling', 'Data Quality'] },
      { title: 'Build data pipelines', outcome: 'Design tested batch and event-driven ingestion and transformation flows.', skills: ['ETL and ELT', 'Data Pipelines', 'Data Warehousing', 'dbt', 'Apache Airflow', 'Unit Testing'] },
      { title: 'Scale on cloud platforms', outcome: 'Deploy pipelines with appropriate storage, orchestration, and access controls.', skills: ['Cloud Computing', 'Docker', 'Data Lakehouse', 'Cloud Security'] },
      { title: 'Keep data dependable', outcome: 'Monitor freshness, quality, failures, privacy, performance, and cost.', skills: ['Data Observability', 'Privacy and Data Protection', 'Performance Optimization', 'Documentation', 'Communication'] },
    ],
    optionalSkills: ['Apache Kafka', 'Spark', 'Snowflake', 'BigQuery', 'Amazon Redshift'],
  },
  'Data Analyst': {
    phases: [
      { title: 'Ask answerable questions', outcome: 'Translate a stakeholder need into metrics, assumptions, and a data plan.', skills: ['Business Understanding', 'SQL', 'Microsoft Excel', 'Data Cleaning', 'Data Modeling'] },
      { title: 'Analyze with care', outcome: 'Use statistics and validation to separate signal from noise.', skills: ['Statistics', 'Data Analysis', 'Experiment Design', 'Python'] },
      { title: 'Communicate the evidence', outcome: 'Build clear visuals and explain what the data supports and does not support.', skills: ['Power BI', 'Data Visualization', 'Data Storytelling', 'Communication'] },
      { title: 'Deliver decision-ready work', outcome: 'Publish a reproducible analysis with definitions, caveats, and a recommendation.', skills: ['Dashboard Design', 'Data Quality', 'Documentation', 'Presentation Skills'] },
    ],
    optionalSkills: ['Tableau', 'Looker', 'R', 'A/B Testing', 'Product Analytics'],
  },
  'Cloud / Platform Engineer': {
    phases: [
      { title: 'Systems and networking', outcome: 'Explain how services communicate and troubleshoot a Linux environment.', skills: ['Linux', 'Networking', 'Scripting', 'Git', 'Operating Systems'] },
      { title: 'Cloud and infrastructure', outcome: 'Provision a least-privilege cloud environment from reviewed code.', skills: ['Cloud Computing', 'Amazon Web Services', 'Identity and Access Management', 'Terraform', 'Docker'] },
      { title: 'Platform foundations', outcome: 'Create repeatable deployment paths with container orchestration and CI/CD.', skills: ['Kubernetes', 'CI/CD', 'Platform Engineering', 'System Design'] },
      { title: 'Operate resiliently', outcome: 'Measure service health, manage incidents, and improve security and cost.', skills: ['Observability', 'Reliability Engineering', 'Cloud Security', 'Incident Response', 'Cost Optimization', 'Documentation'] },
    ],
    optionalSkills: ['Microsoft Azure', 'Google Cloud Platform', 'Service Mesh', 'FinOps'],
  },
  'DevOps Engineer': {
    phases: [
      { title: 'Command line and collaboration', outcome: 'Automate common tasks and collaborate through reliable version control.', skills: ['Linux', 'Scripting', 'Git', 'Networking', 'Unit Testing'] },
      { title: 'Automate delivery', outcome: 'Build a tested CI/CD pipeline with safe release and rollback steps.', skills: ['CI/CD', 'Build Automation', 'Release Management', 'Application Security'] },
      { title: 'Package and deploy', outcome: 'Run a containerized service in cloud infrastructure provisioned as code.', skills: ['Docker', 'Cloud Computing', 'Terraform', 'Kubernetes'] },
      { title: 'Run production systems', outcome: 'Observe services, respond to incidents, and improve reliability over time.', skills: ['Observability', 'Incident Response', 'Reliability Engineering', 'Cloud Security', 'Cost Optimization', 'Communication'] },
    ],
    optionalSkills: ['AWS', 'Azure', 'Google Cloud Platform', 'Argo CD', 'Service Mesh'],
  },
  'Cybersecurity Analyst': {
    phases: [
      { title: 'Systems and network fundamentals', outcome: 'Understand hosts, protocols, identities, and normal system behavior.', skills: ['Networking', 'Linux', 'Windows Administration', 'Cybersecurity', 'Identity and Access Management'] },
      { title: 'Collect and interpret signals', outcome: 'Correlate logs and alerts, use a SIEM, and prioritize investigation.', skills: ['Log Analysis', 'SIEM', 'Threat Intelligence', 'Scripting'] },
      { title: 'Investigate and respond', outcome: 'Scope an incident, preserve evidence, contain risk, and document actions.', skills: ['Incident Response', 'Digital Forensics', 'Vulnerability Management', 'Cloud Security'] },
      { title: 'Improve defensive readiness', outcome: 'Turn findings into detections, remediation plans, and clear risk communication.', skills: ['Detection Engineering', 'Risk Assessment', 'Documentation', 'Communication'] },
    ],
    optionalSkills: ['Splunk', 'Microsoft Sentinel', 'AWS Security', 'Penetration Testing'],
  },
  'Application Security Engineer': {
    phases: [
      { title: 'Understand how software works', outcome: 'Read application code and trace data across UI, APIs, and storage.', skills: ['JavaScript', 'Python', 'REST APIs', 'Web Architecture', 'Git'] },
      { title: 'Find design and coding risks', outcome: 'Threat-model an application and apply secure coding patterns.', skills: ['Cybersecurity', 'Secure Coding', 'Threat Modeling', 'OWASP Top 10', 'Authentication and Authorization'] },
      { title: 'Test application defenses', outcome: 'Use safe testing methods to verify controls and prioritize fixes.', skills: ['Application Security Testing', 'API Security', 'Dependency Security', 'Cloud Security'] },
      { title: 'Embed security in delivery', outcome: 'Automate useful checks and help teams fix issues without slowing delivery.', skills: ['CI/CD', 'Security Code Review', 'Secrets Management', 'Vulnerability Management', 'Communication'] },
    ],
    optionalSkills: ['Burp Suite', 'SAST and DAST Tools', 'Container Security', 'Kubernetes Security'],
  },
  'Software Engineer': {
    phases: [
      { title: 'Programming fundamentals', outcome: 'Write readable code and solve problems with a chosen language.', skills: ['JavaScript', 'Python', 'Data Structures and Algorithms', 'Git', 'Debugging'] },
      { title: 'Build dependable components', outcome: 'Design APIs and data structures with tests, error handling, and security.', skills: ['Unit Testing', 'API Design', 'SQL', 'Data Modeling', 'Secure Coding'] },
      { title: 'Design complete systems', outcome: 'Reason about architecture, performance, and maintainability as a system grows.', skills: ['System Design', 'Software Architecture', 'Performance Optimization', 'Integration Testing'] },
      { title: 'Ship and collaborate', outcome: 'Deliver a documented application and improve it through review and feedback.', skills: ['Cloud Computing', 'CI/CD', 'Documentation', 'Communication', 'Code Review'] },
    ],
    optionalSkills: ['Java', 'C#', 'Go', 'Rust', 'Mobile Development'],
  },
  'Full-Stack Developer': {
    phases: [
      { title: 'Web foundations', outcome: 'Build responsive interfaces with accessible browser fundamentals.', skills: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'Web Accessibility', 'Git'] },
      { title: 'Frontend application', outcome: 'Build a component-based interface with predictable state and API integration.', skills: ['React', 'Frontend State Management', 'REST APIs', 'Unit Testing'] },
      { title: 'Backend and persistence', outcome: 'Create a validated backend with authentication and a well-designed database.', skills: ['Node.js', 'Backend Development', 'PostgreSQL', 'Data Modeling', 'Authentication and Authorization'] },
      { title: 'Securely ship a full feature', outcome: 'Test and deploy an end-to-end feature with security and performance basics.', skills: ['Application Security', 'Integration Testing', 'Docker', 'Cloud Computing', 'CI/CD', 'Communication'] },
    ],
    optionalSkills: ['Next.js', 'Python', 'GraphQL', 'Redis', 'Mobile Development'],
  },
  'Backend Developer': {
    phases: [
      { title: 'Language and web foundations', outcome: 'Understand HTTP, processes, and the language used by your target teams.', skills: ['Node.js', 'Python', 'Linux', 'Git', 'Networking'] },
      { title: 'APIs and data', outcome: 'Design versioned APIs and reliable relational data models.', skills: ['REST APIs', 'API Design', 'SQL', 'PostgreSQL', 'Data Modeling'] },
      { title: 'Reliability and scale', outcome: 'Handle failures, concurrency, caching, and asynchronous work deliberately.', skills: ['Unit Testing', 'Integration Testing', 'Caching', 'Message Queues', 'System Design'] },
      { title: 'Secure production services', outcome: 'Deploy, observe, and protect a service with a clear operational runbook.', skills: ['Authentication and Authorization', 'Application Security', 'Docker', 'Cloud Computing', 'Observability', 'CI/CD'] },
    ],
    optionalSkills: ['Java', 'Go', 'GraphQL', 'Redis', 'Microservices'],
  },
  'Frontend Developer': {
    phases: [
      { title: 'Browser foundations', outcome: 'Create semantic, responsive pages and understand how browsers render them.', skills: ['HTML', 'CSS', 'JavaScript', 'Web Accessibility', 'Browser Developer Tools'] },
      { title: 'Build application interfaces', outcome: 'Use components, typed code, state, and APIs to implement product flows.', skills: ['React', 'TypeScript', 'Frontend State Management', 'REST APIs', 'Git'] },
      { title: 'Quality and experience', outcome: 'Test interactions and improve keyboard use, performance, and responsive behavior.', skills: ['Unit Testing', 'End-to-End Testing', 'Web Performance', 'Web Accessibility'] },
      { title: 'Ship maintainable UI', outcome: 'Document and deploy a polished interface with secure, observable integrations.', skills: ['Build Tooling', 'Application Security', 'CI/CD', 'Communication', 'Design Systems'] },
    ],
    optionalSkills: ['Next.js', 'Vue', 'Angular', 'Storybook', 'Web Animation'],
  },
  'FinTech Software Engineer': {
    phases: [
      { title: 'Software and finance foundations', outcome: 'Build tested services and understand the financial domain your product serves.', skills: ['Java', 'Python', 'SQL', 'Data Modeling', 'Financial Systems'] },
      { title: 'Transactions and ledgers', outcome: 'Represent money precisely and make transaction processing auditable.', skills: ['Payment Systems', 'Ledger Design', 'Transaction Integrity', 'Idempotency', 'Reconciliation'] },
      { title: 'Protect financial workflows', outcome: 'Secure sensitive information and handle identity, permissions, and risk.', skills: ['API Design', 'Cybersecurity', 'Privacy and Data Protection', 'Audit Logging', 'Risk Controls'] },
      { title: 'Prove correctness in production', outcome: 'Test failure and retry cases, monitor financial flows, and communicate limitations.', skills: ['Unit Testing', 'Integration Testing', 'Observability', 'Regulatory Awareness', 'Communication'] },
    ],
    optionalSkills: ['PCI DSS', 'Fraud Detection', 'Banking Integrations', 'Kafka'],
  },
  'Product Designer': {
    phases: [
      { title: 'Understand people and problems', outcome: 'Frame a user need with research evidence and a clear problem statement.', skills: ['UX Research', 'User Interviewing', 'Information Architecture', 'Product Thinking'] },
      { title: 'Design and prototype', outcome: 'Translate journeys into clear, consistent interactions and testable prototypes.', skills: ['UI Design', 'Figma', 'Prototyping', 'Interaction Design', 'Content Design'] },
      { title: 'Validate inclusive experiences', outcome: 'Test designs with users and address accessibility and responsive behavior.', skills: ['Usability Testing', 'Web Accessibility', 'Responsive Design', 'Design Systems'] },
      { title: 'Partner through delivery', outcome: 'Hand off usable specifications and evaluate outcomes after launch.', skills: ['Developer Handoff', 'Product Analytics', 'Communication', 'Presentation Skills'] },
    ],
    optionalSkills: ['Motion Design', 'Service Design', 'Research Operations', 'HTML and CSS'],
  },
  'AI Product Manager': {
    phases: [
      { title: 'Find the right problem', outcome: 'Validate a real user need and decide whether AI is appropriate at all.', skills: ['Product Management', 'Product Discovery', 'User Research', 'Product Strategy'] },
      { title: 'Understand AI and data constraints', outcome: 'Collaborate on data, model, UX, latency, and cost feasibility.', skills: ['Artificial Intelligence', 'AI Product Literacy', 'Data Literacy', 'Product Analytics'] },
      { title: 'Define measures and safeguards', outcome: 'Specify evaluation, experiments, privacy, safety, and failure handling.', skills: ['Experiment Design', 'AI Evaluation', 'AI Safety and Responsible AI', 'Privacy and Data Protection', 'Risk Assessment'] },
      { title: 'Deliver and learn', outcome: 'Prioritize delivery, align teams, and improve the product using measured outcomes.', skills: ['Agile', 'Stakeholder Management', 'Communication', 'Cost Optimization', 'Product Operations'] },
    ],
    optionalSkills: ['Prompt Engineering', 'Machine Learning', 'Responsible AI Governance', 'B2B Product Management'],
  },
};

export const getCurriculumSkillNames = (roleTitle) => {
  const curriculum = roleCurricula[roleTitle];
  if (!curriculum) return [];
  return [...new Set(curriculum.phases.flatMap((phase) => phase.skills))];
};

export const getOptionalCurriculumSkillNames = (roleTitle) => roleCurricula[roleTitle]?.optionalSkills || [];

const guides = {
  'html': { benefit: 'HTML gives structure and meaning to web content, which is the foundation of accessible web pages.', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content' },
  'css': { benefit: 'CSS lets you turn a working interface into a clear, responsive experience across screen sizes.', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics' },
  'javascript': { benefit: 'JavaScript adds behavior to web apps and is central to building interactive interfaces and services.', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting' },
  'typescript': { benefit: 'TypeScript catches many data and interface mistakes early, making larger codebases easier to change safely.', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
  'react': { benefit: 'React helps you build reusable interface components and manage changing application views.', url: 'https://react.dev/learn' },
  'python': { benefit: 'Python is widely used for automation, backend services, data work, and applied AI.', url: 'https://docs.python.org/3/tutorial/' },
  'sql': { benefit: 'SQL lets you retrieve, combine, and analyze the structured data behind most modern products.', url: 'https://www.postgresql.org/docs/current/tutorial.html' },
  'git': { benefit: 'Git helps you track changes, collaborate safely, and explain how a project evolved.', url: 'https://git-scm.com/book/en/v2' },
  'github': { benefit: 'GitHub makes your work reviewable through repositories, pull requests, and collaboration workflows.', url: 'https://docs.github.com/en/get-started' },
  'rest apis': { benefit: 'API knowledge lets you connect applications and services through stable, well-defined interfaces.', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview' },
  'node.js': { benefit: 'Node.js lets you build server-side JavaScript services and share language skills across the stack.', url: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs' },
  'machine learning': { benefit: 'Machine learning helps you build systems that find patterns in data and make measurable predictions.', url: 'https://developers.google.com/machine-learning/crash-course' },
  'artificial intelligence': { benefit: 'AI fundamentals help you identify where intelligent systems are useful and how to evaluate their limits.', url: 'https://ai.google/education/' },
  'prompt engineering': { benefit: 'Prompt design helps you make model instructions clearer, more consistent, and easier to evaluate.', url: 'https://platform.openai.com/docs/guides/prompt-engineering' },
  'amazon web services': { benefit: 'AWS skills help you deploy and operate services on infrastructure used across many production teams.', url: 'https://skillbuilder.aws/' },
  'cloud computing': { benefit: 'Cloud knowledge helps you reason about deploying, scaling, securing, and operating modern services.', url: 'https://cloud.google.com/learn/training' },
  'docker': { benefit: 'Docker packages an application with its dependencies so it behaves consistently across environments.', url: 'https://docs.docker.com/get-started/' },
  'kubernetes': { benefit: 'Kubernetes helps teams coordinate deployment and recovery for containerized applications at scale.', url: 'https://kubernetes.io/docs/tutorials/' },
  'terraform': { benefit: 'Terraform lets you describe infrastructure as code so environments can be reviewed and recreated reliably.', url: 'https://developer.hashicorp.com/terraform/tutorials' },
  'cybersecurity': { benefit: 'Security fundamentals help you recognize threats early and build systems that better protect people and data.', url: 'https://portswigger.net/web-security' },
  'data analysis': { benefit: 'Data analysis turns raw information into evidence that can guide product and business decisions.', url: 'https://www.kaggle.com/learn' },
  'statistics': { benefit: 'Statistics helps you distinguish real patterns from noise and make more defensible conclusions from data.', url: 'https://www.khanacademy.org/math/statistics-probability' },
  'communication': { benefit: 'Clear communication makes your technical decisions, risks, and results understandable to teammates and stakeholders.', url: 'https://www.coursera.org/learn/wharton-communication-skills' },
};

const normalize = (value = '') => value.trim().toLowerCase().replace(/\s+/g, ' ');

export const getSkillLearningGuide = (skillName) => {
  const guide = guides[normalize(skillName)];
  if (guide) return guide;
  const query = encodeURIComponent(`${skillName} tutorial fundamentals practice`);
  return {
    benefit: `${skillName} builds a practical capability used in this role. Learning the fundamentals will help you apply it in projects and explain your decisions with confidence.`,
    url: `https://www.youtube.com/results?search_query=${query}`,
  };
};

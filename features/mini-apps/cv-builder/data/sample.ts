import { CVData, CVSettings } from "../types/cv";

export const DEFAULT_SETTINGS: CVSettings = {
  template: "modern",
  primaryColor: "#3b82f6", // Indigo / Blue
  secondaryColor: "#64748b",
  fontFamily: "vietnam",
  spacing: "normal",
  orientation: "portrait",
  showAvatar: true,
};

export const DEVELOPER_SAMPLE_DATA: CVData = {
  personalInfo: {
    name: "Alex Nguyen",
    title: "Senior Full-Stack Engineer / Tech Lead",
    email: "alex.nguyen@devspace.io",
    phone: "(+84) 987 654 321",
    location: "Ho Chi Minh City, Vietnam",
    website: "https://devspace.io",
    github: "github.com/alexnguyen-dev",
    linkedin: "linkedin.com/in/alex-nguyen-tech",
    avatar: "", // empty initial avatar, we will let users upload or use placeholder
  },
  summary: "Passionate Full-Stack Engineer with 6+ years of experience designing, building, and scaling high-performance web applications. Expert in React/Next.js, Node.js, and modern cloud architectures. Proven track record of leading agile teams, optimizing web performance (improving LCP by 45%), and building scalable developer tools.",
  workExperience: [
    {
      id: "w1",
      company: "VNG Corporation",
      position: "Tech Lead - Platform Engineering",
      location: "HCMC, Vietnam",
      startDate: "2023-05",
      endDate: "Present",
      current: true,
      description: "• Led a core engineering team of 6 to rebuild the internal cloud management console using Next.js App Router, resulting in a 40% speedup in developer onboarding.\n• Architected a real-time metrics dashboard handling 100k+ events/sec using WebSockets and Redis, reducing visualization latency from 3.2s to 150ms.\n• Implemented micro-frontend architecture which enabled independent team deployments, reducing deployment failure rates by 35%.\n• Conducted code reviews, established CI/CD guidelines, and mentored 4 junior engineers into mid-level positions.",
      techStack: ["Next.js", "TypeScript", "Node.js", "Tailwind CSS", "Redis", "Docker", "Kubernetes"],
    },
    {
      id: "w2",
      company: "FPT Software",
      position: "Senior Frontend Engineer",
      location: "HCMC, Vietnam",
      startDate: "2021-03",
      endDate: "2023-04",
      current: false,
      description: "• Engineered key frontend features for a global logistics SaaS application using React, Redux Toolkit, and Tailwind CSS.\n• Led the web performance optimization initiative; reduced bundle size by 45% via code-splitting, lazy loading, and SVG sprites, elevating Lighthouse score to 95+.\n• Developed a custom design system with accessible headless components, improving UX consistency and speeding up feature delivery by 25%.",
      techStack: ["React", "TypeScript", "Redux Toolkit", "Sass", "Jest", "GitLab CI"],
    },
    {
      id: "w3",
      company: "StartupLab",
      position: "Software Engineer",
      location: "Hanoi, Vietnam",
      startDate: "2020-01",
      endDate: "2021-02",
      current: false,
      description: "• Built and launched responsive e-commerce web applications with React and Node.js/Express.\n• Maintained PostgreSQL databases, wrote optimized SQL queries, and integrated Stripe/Paypal payment gateways.\n• Designed and documented RESTful APIs, securing them with JWT auth and rate limiting.",
      techStack: ["React", "Node.js", "Express", "PostgreSQL", "REST API", "JWT"],
    },
  ],
  projects: [
    {
      id: "p1",
      title: "KanbanFlow - Team Collaboration Tool",
      role: "Lead Creator",
      description: "A high-performance Kanban board application for project management. Features real-time state synchronization, drag-and-drop lists, drag-and-drop tasks, multi-user boards, and interactive burndown charts.",
      link: "github.com/alexnguyen-dev/kanban-flow",
      techStack: ["Next.js", "React 19", "Tailwind CSS v4", "Lucide React", "SQLite"],
    },
    {
      id: "p2",
      title: "Markdown Resume Engine",
      role: "Solo Developer",
      description: "A clean developer resume compiler that parses markdown files into beautiful vector PDFs using headless Chromium. Features customizable CSS themes and auto-schema validation.",
      link: "resume-engine.devspace.io",
      techStack: ["TypeScript", "Node.js", "Puppeteer", "Tailwind CSS"],
    },
  ],
  education: [
    {
      id: "e1",
      school: "FPT University",
      degree: "Bachelor of Science",
      fieldOfStudy: "Software Engineering",
      location: "HCMC, Vietnam",
      startDate: "2016-09",
      endDate: "2020-05",
      current: false,
      grade: "GPA: 3.6 / 4.0",
      description: "Excellent Student Scholarship holder. Valedictorian nominee. Completed thesis on decentralized identity protocols using blockchain.",
    },
  ],
  skills: [
    {
      id: "s1",
      category: "Languages & Core",
      skills: ["JavaScript", "TypeScript", "HTML5/CSS3", "Python", "SQL", "Go"],
    },
    {
      id: "s2",
      category: "Frameworks & Libraries",
      skills: ["React", "Next.js", "Node.js", "Express", "NestJS", "Tailwind CSS", "Redux"],
    },
    {
      id: "s3",
      category: "Databases & DevOps",
      skills: ["PostgreSQL", "MongoDB", "Redis", "AWS", "Docker", "Git", "GitHub Actions"],
    },
  ],
  languages: [
    {
      id: "l1",
      name: "Vietnamese",
      proficiency: "Native",
    },
    {
      id: "l2",
      name: "English",
      proficiency: "Professional Working (IELTS 7.5)",
    },
  ],
  certifications: [
    {
      id: "c1",
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      date: "2024-02",
    },
    {
      id: "c2",
      name: "Certified ScrumMaster (CSM)",
      issuer: "Scrum Alliance",
      date: "2023-11",
    },
  ],
  customSections: [],
};

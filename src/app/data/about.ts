import { SkillGroup, Cert, TimelineEntry } from '../shared/models/skill';

export const EXPERIENCE: TimelineEntry[] = [
  {
    role: 'Artificial Intelligence Researcher',
    org: 'Sheridan College',
    location: 'Oakville, ON',
    period: 'Sep 2026 – Present',
    points: [
      'Evaluate large language models for performance, response quality, and behavioural consistency',
      'Analyze how prompt design and contextual framing influence model outputs, accuracy, and response patterns',
      'Document research findings to support investigations into AI behaviour and model performance'
    ]
  },
  {
    role: 'Participant',
    org: 'ISSessions Capture the Flag',
    location: 'Toronto, ON',
    period: 'Feb 2026',
    points: [
      'Intercepted and modified HTTP requests through Burp Suite Proxy to analyze authentication behaviour',
      'Exploited SQL injection by modifying intercepted request parameters to gain access',
      'Constructed a custom exploit payload using Pwntools'
    ]
  }
];

export const EDUCATION: TimelineEntry[] = [
  {
    role: 'Honours Bachelor of Information Sciences (Cyber Security)',
    org: 'Sheridan College',
    location: 'Oakville, ON',
    period: 'Sep 2024 – Expected Apr 2028',
    points: [
      '3.56 GPA',
      'Coursework in Network and Distributed Systems Security, CPU Architecture, and Risk Assessment',
      'Labs in Wireshark traffic analysis, Nmap port scanning, and web and IoT forensics'
    ]
  }
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: 'AI Security & Safety',
    skills: ['AI Security', 'Prompt Injection', 'LLMs', 'LLM Evaluation', 'AI Agents', 'Safety Benchmarking']
  },
  {
    title: 'Security & Cryptography',
    skills: [
      'Cryptography',
      'Application Security',
      'OWASP Top 10',
      'Penetration Testing',
      'Threat Modelling',
      'Risk Assessment',
      'IAM'
    ]
  },
  {
    title: 'Programming & Backend',
    skills: ['Python', 'JavaScript', 'TypeScript', 'Flask', 'SQL', 'REST APIs', 'Docker', 'AWS']
  },
  {
    title: 'Tools & Networking',
    skills: ['Burp Suite', 'Wireshark', 'Nmap', 'Ghidra', 'TCP/IP', 'DNS', 'Linux']
  }
];

export const CERTS: Cert[] = [];

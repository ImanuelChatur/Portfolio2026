import { SkillGroup, Cert } from '../shared/models/skill';

export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: 'Offensive',
    skills: ['Web app testing', 'Burp Suite', 'Nmap', 'Metasploit']
  },
  {
    title: 'Defensive',
    skills: ['SIEM', 'Wireshark', 'Incident response', 'Log analysis']
  },
  {
    title: 'Languages & Tools',
    skills: ['Python', 'Bash', 'TypeScript', 'Linux']
  }
];

export const CERTS: Cert[] = [
  { year: 2026, name: 'Certification name', issuer: 'Issuer' },
  { year: 2025, name: 'Certification name', issuer: 'Issuer' }
];

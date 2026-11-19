export interface SkillGroup {
  title: string;
  skills: string[];
}

export interface Cert {
  year: number;
  name: string;
  issuer: string;
}

export interface TimelineEntry {
  role: string;
  org: string;
  location: string;
  period: string;
  points: string[];
}

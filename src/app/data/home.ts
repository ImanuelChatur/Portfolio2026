export const CURRENTLY = [
  { label: 'Studying', value: 'Honours BISc, Cyber Security @ Sheridan College' },
  { label: 'Researching', value: 'LLM evaluation and behavioural consistency' },
  { label: 'Building', value: 'A prompt-injection testbed for AI coding agents' }
];

export interface RecordField {
  label: string;
  value: string;
  note?: string;
}

// Profile pane on the home hero. Facts only from data/about.ts and PRODUCT.md.
export const SUBJECT_RECORD: RecordField[] = [
  { label: 'Focus', value: 'AI security: LLM evaluation, prompt injection against coding agents' },
  { label: 'Secondary', value: 'Application security, OWASP Top 10' },
  { label: 'Role', value: 'AI Researcher, Sheridan College', note: 'since Sep 2026' },
  { label: 'Program', value: 'Honours BISc, Cyber Security', note: 'expected Apr 2028' },
  { label: 'Location', value: 'Oakville, ON' },
  { label: 'Seeking', value: 'Co-op or internship in security' }
];

export interface ProjectArea {
  label: string;
  cls: 'area-ai' | 'area-appsec' | 'area-crypto';
}

// Area classification per project, derived from each project's real tags.
// Key order is display order: AI security leads.
export const PROJECT_CLASS: Record<string, ProjectArea> = {
  'ai-agent-security-testbed': { label: 'AI sec', cls: 'area-ai' },
  'bonker-banker': { label: 'AppSec', cls: 'area-appsec' },
  'dicom-integrity': { label: 'Crypto', cls: 'area-crypto' }
};

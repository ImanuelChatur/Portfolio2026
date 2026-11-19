export type ContentType = 'projects' | 'writeups';

export interface ContentMeta {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  featured?: boolean;
  repo?: string;
  demo?: string;
  thumbnail?: string;
  stars?: number;
  source?: string;
}

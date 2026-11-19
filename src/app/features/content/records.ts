import { ContentMeta, ContentType } from '../../shared/models/content';
import { PROJECT_CLASS, ProjectArea } from '../../data/home';

export interface ContentRecord extends ContentMeta {
  /** Stable record ID (`PRJ-001`) for projects; null for writeups. */
  id: string | null;
  /** Area classification for mapped projects; null otherwise. */
  area: ProjectArea | null;
}

const CLASS_ORDER = Object.keys(PROJECT_CLASS);
const rank = (slug: string) => {
  const i = CLASS_ORDER.indexOf(slug);
  return i === -1 ? CLASS_ORDER.length : i;
};

/**
 * Projects: AI security leads (positioning), unmapped projects keep index order after,
 * then IDs are numbered so Home, the list and the detail page all agree.
 * Writeups: index order (newest first), no ID or area.
 */
export function toRecords(type: ContentType, items: ContentMeta[]): ContentRecord[] {
  if (type === 'writeups') return items.map(item => ({ ...item, id: null, area: null }));
  return [...items]
    .sort((a, b) => rank(a.slug) - rank(b.slug))
    .map((item, i) => ({
      ...item,
      id: `PRJ-${String(i + 1).padStart(3, '0')}`,
      area: PROJECT_CLASS[item.slug] ?? null
    }));
}

/** Dates: projects are month-precision, writeups are day-precision. */
export const dateFormat = (type: ContentType) => (type === 'projects' ? 'yyyy-MM' : 'yyyy-MM-dd');

export const TYPE_LABEL: Record<ContentType, { plural: string; singular: string }> = {
  projects: { plural: 'Projects', singular: 'project' },
  writeups: { plural: 'Writeups', singular: 'writeup' }
};

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ContentList } from './content-list';

const PROJECTS = [
  { slug: 'bonker-banker', title: 'Bonker Banker', date: '2026-11-01', summary: 's', tags: ['Flask', 'Docker'] },
  { slug: 'dicom-integrity', title: 'DICOM', date: '2026-01-01', summary: 's', tags: ['Python'], stars: 4 },
  { slug: 'ai-agent-security-testbed', title: 'Testbed', date: '2026-09-01', summary: 's', tags: ['Flask'] }
];

describe('ContentList', () => {
  let fixture: ComponentFixture<ContentList>;
  let http: HttpTestingController;
  const el = () => fixture.nativeElement as HTMLElement;

  // The Content service loads both indexes; flush the one under test's sibling so the app settles.
  const flushOther = (type: string) =>
    http.expectOne(`content/${type === 'projects' ? 'writeups' : 'projects'}/index.json`).flush([]);

  async function load(type: 'projects' | 'writeups', body: unknown[]) {
    fixture.componentRef.setInput('type', type);
    fixture.detectChanges();
    http.expectOne(`content/${type}/index.json`).flush(body);
    flushOther(type);
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentList],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(ContentList);
    http = TestBed.inject(HttpTestingController);
  });

  it('renders project rows with IDs, areas, stars and detail links', async () => {
    await load('projects', PROJECTS);
    const rows = el().querySelectorAll('tbody tr');
    expect(rows.length).toBe(3);
    expect(rows[0].textContent).toContain('PRJ-001');
    expect(rows[0].textContent).toContain('Testbed');
    expect(rows[0].querySelector('a')?.getAttribute('href')).toBe('/projects/ai-agent-security-testbed');
    expect(el().querySelector('thead')?.textContent).toContain('Stars');
    expect(el().querySelector('h1')?.textContent).toContain('Projects');
  });

  it('filters rows by the selected tag and resets with All', async () => {
    await load('projects', PROJECTS);
    const chips = () => Array.from(el().querySelectorAll('mat-chip-option')) as HTMLElement[];
    expect(chips().map(c => c.textContent?.trim())).toEqual(['All', 'Flask', 'Docker', 'Python']);

    fixture.componentInstance.tag.set('Flask');
    fixture.detectChanges();
    const titles = Array.from(el().querySelectorAll('tbody h3')).map(h => h.textContent?.trim());
    expect(titles).toEqual(['Testbed', 'Bonker Banker']);
    expect(el().querySelector('.pane-head span')?.textContent).toContain('2 of');

    fixture.componentInstance.tag.set('');
    fixture.detectChanges();
    expect(el().querySelectorAll('tbody tr').length).toBe(3);
  });

  it('shows an empty state when nothing is published', async () => {
    await load('writeups', []);
    expect(el().querySelector('table')).toBeNull();
    expect(el().textContent).toContain('No writeups published yet');
  });

  it('shows an error with a retry button when the index fails', async () => {
    fixture.componentRef.setInput('type', 'writeups');
    fixture.detectChanges();
    http.expectOne('content/writeups/index.json').flush('x', { status: 500, statusText: 'Server Error' });
    flushOther('writeups');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el().querySelector('[role="alert"]')?.textContent).toContain('did not load');
    expect(el().querySelector('[role="alert"] button')?.textContent).toContain('Retry');
  });
});

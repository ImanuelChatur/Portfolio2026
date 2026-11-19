import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ContentDetail, renderMarkdown } from './content-detail';

const WRITEUPS = [
  {
    slug: 'box',
    title: 'HTB Box',
    date: '2026-10-12',
    summary: 'Root via SUID.',
    tags: ['HTB', 'Linux'],
    source: 'https://github.com/x/writeups/blob/main/box.md'
  }
];

const MARKDOWN = `---
title: HTB Box
---

# Recon

<script>alert(1)</script>

<img src=x onerror=alert(1)>

\`\`\`bash
nmap -sC 10.10.10.10
\`\`\`
`;

describe('renderMarkdown', () => {
  it('strips front matter and shifts headings down one level', () => {
    const html = renderMarkdown(MARKDOWN);
    expect(html).not.toContain('title: HTB Box');
    expect(html).toContain('<h2>Recon</h2>');
  });
});

describe('ContentDetail', () => {
  let fixture: ComponentFixture<ContentDetail>;
  let http: HttpTestingController;
  const el = () => fixture.nativeElement as HTMLElement;

  async function settle() {
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentDetail],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(ContentDetail);
    http = TestBed.inject(HttpTestingController);
  });

  function open(slug: string) {
    fixture.componentRef.setInput('type', 'writeups');
    fixture.componentRef.setInput('slug', slug);
    fixture.detectChanges();
  }

  it('renders the writeup, sanitizes it, and adds copy buttons to code', async () => {
    open('box');
    http.expectOne('content/writeups/index.json').flush(WRITEUPS);
    http.expectOne('content/projects/index.json').flush([]);
    // The body loads in parallel with the index.
    http.expectOne('content/writeups/box.md').flush(MARKDOWN);
    await settle();

    expect(el().querySelector('h1')?.textContent).toContain('HTB Box');
    expect(TestBed.inject(Title).getTitle()).toBe('HTB Box');

    const prose = el().querySelector('.prose') as HTMLElement;
    expect(prose.querySelector('h2')?.textContent).toBe('Recon');
    expect(prose.querySelector('script')).toBeNull();
    expect(prose.innerHTML).not.toContain('onerror');
    expect(prose.innerHTML).not.toContain('alert(1)');

    const copy = prose.querySelector('.code-block button[aria-label="Copy code"]');
    expect(copy).toBeTruthy();

    const source = Array.from(el().querySelectorAll('.actions a')).find(a => a.textContent?.includes('View source'));
    expect(source?.getAttribute('href')).toBe(WRITEUPS[0].source);
  });

  it('shows a not-found state when the slug is not in the index', async () => {
    open('missing');
    http.expectOne('content/writeups/index.json').flush(WRITEUPS);
    http.expectOne('content/projects/index.json').flush([]);
    http.match('content/writeups/missing.md').forEach(r => r.flush('', { status: 404, statusText: 'Not Found' }));
    await settle();

    expect(el().querySelector('h1')?.textContent).toContain('Not found');
    expect(el().textContent).toContain('There is no writeup at');
    expect(el().querySelector('.prose')).toBeNull();
    expect(TestBed.inject(Title).getTitle()).toBe('Not found');
  });
});

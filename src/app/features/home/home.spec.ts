import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('renders the identity pane and profile', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h1')?.textContent).toContain('Imanuel Chatur');
    expect(el.querySelectorAll('.profile dt').length).toBe(6);
    expect(el.querySelectorAll('.activity dt').length).toBe(3);
  });

  it('renders featured projects as table rows, AI testbed first', async () => {
    http.expectOne('content/projects/index.json').flush([
      { slug: 'bonker-banker', title: 'Bonker Banker', date: '2026-11-01', summary: 's', tags: ['a'], featured: true },
      { slug: 'ai-agent-security-testbed', title: 'Testbed', date: '2026-09-01', summary: 's', tags: ['b'], featured: true }
    ]);
    http.expectOne('content/writeups/index.json').flush([]);
    await fixture.whenStable();
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const rows = el.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('PRJ-001');
    expect(rows[0].textContent).toContain('Testbed');
    expect(rows[0].querySelector('.area')?.classList).toContain('area-ai');
    expect(rows[0].textContent).toContain('2026-09');
    expect(el.querySelector('#writeups-title')).toBeNull();
  });
});

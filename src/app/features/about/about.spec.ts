import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { About } from './about';
import { CERTS, EDUCATION, EXPERIENCE, SKILL_GROUPS } from '../../data/about';

describe('About', () => {
  let fixture: ComponentFixture<About>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [About],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(About);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders one log entry per experience and education record', () => {
    expect(el.querySelectorAll('.pane .entry').length).toBe(EXPERIENCE.length + EDUCATION.length);
  });

  it('renders one skills row per group and shows the group count', () => {
    expect(el.querySelectorAll('.skills > div').length).toBe(SKILL_GROUPS.length);
    const skillsHead = el.querySelector('#skills-title')?.parentElement;
    expect(skillsHead?.textContent).toContain(`${SKILL_GROUPS.length} groups`);
  });

  it('hides certifications while there are none', () => {
    expect(el.querySelector('#certs-title') !== null).toBe(CERTS.length > 0);
  });

  it('ends with a single link to contact', () => {
    const links = el.querySelectorAll('a[href="/contact"]');
    expect(links.length).toBe(1);
    expect(links[0].textContent).toContain('Get in touch');
  });
});

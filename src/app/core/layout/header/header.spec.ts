import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Header } from './header';

describe('Header', () => {
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows inline nav links on desktop and no menu button', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('nav ul a').length).toBeGreaterThan(0);
    expect(el.querySelector('[aria-label="Open menu"]')).toBeNull();
  });

  it('shows a labelled menu button on mobile', async () => {
    fixture.componentRef.setInput('isMobile', true);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('nav ul')).toBeNull();
    expect(el.querySelector('[aria-label="Open menu"]')).toBeTruthy();
  });

  it('theme toggle has an accessible label', () => {
    const btn = (fixture.nativeElement as HTMLElement).querySelector('[aria-label^="Switch to"]');
    expect(btn).toBeTruthy();
  });
});

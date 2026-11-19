import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Footer } from './footer';

describe('Footer', () => {
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('opens external links safely', () => {
    const external = (fixture.nativeElement as HTMLElement).querySelectorAll('a[target="_blank"]');
    expect(external.length).toBe(2);
    external.forEach(a => expect(a.getAttribute('rel')).toContain('noopener'));
  });
});

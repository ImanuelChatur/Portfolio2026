import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Contact } from './contact';
import { SOCIAL } from '../../data/nav';

describe('Contact', () => {
  let fixture: ComponentFixture<Contact>;
  let copyResult = true;
  const copied: string[] = [];
  const messages: string[] = [];

  beforeEach(async () => {
    copied.length = 0;
    messages.length = 0;
    copyResult = true;
    await TestBed.configureTestingModule({
      imports: [Contact],
      providers: [
        { provide: Clipboard, useValue: { copy: (text: string) => (copied.push(text), copyResult) } },
        { provide: MatSnackBar, useValue: { open: (message: string) => messages.push(message) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Contact);
    await fixture.whenStable();
  });

  it('renders the three channels from SOCIAL', () => {
    const links = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('.channel-link')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual([`mailto:${SOCIAL.email}`, SOCIAL.github, SOCIAL.linkedin]);
  });

  it('copies the email and confirms', () => {
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.copy')!.click();
    expect(copied).toEqual([SOCIAL.email]);
    expect(messages).toEqual(['Email copied']);
  });

  it('explains a failed copy', () => {
    copyResult = false;
    fixture.componentInstance.copyEmail();
    expect(messages).toEqual(["Couldn't copy. Select the address instead."]);
  });
});

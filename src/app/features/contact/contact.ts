import { Component, inject } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SOCIAL } from '../../data/nav';

interface Channel {
  label: string;
  icon: string;
  href: string;
  value: string;
  external: boolean;
}

/** Display form of a URL: no protocol, no www, no trailing slash. */
const displayUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

@Component({
  selector: 'app-contact',
  imports: [MatButtonModule, MatIconModule, MatListModule, MatTooltipModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);

  readonly email = SOCIAL.email;
  readonly mailto = `mailto:${SOCIAL.email}`;

  readonly channels: Channel[] = [
    { label: 'Email', icon: 'mail', href: this.mailto, value: SOCIAL.email, external: false },
    { label: 'GitHub', icon: 'code', href: SOCIAL.github, value: displayUrl(SOCIAL.github), external: true },
    {
      label: 'LinkedIn',
      icon: 'work',
      href: SOCIAL.linkedin,
      value: displayUrl(SOCIAL.linkedin),
      external: true
    }
  ];

  copyEmail(): void {
    const copied = this.clipboard.copy(this.email);
    this.snackBar.open(copied ? 'Email copied' : "Couldn't copy. Select the address instead.", undefined, {
      duration: copied ? 2500 : 5000,
      politeness: 'polite'
    });
  }
}

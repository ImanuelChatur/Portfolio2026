import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NAV_LINKS, SOCIAL } from '../../../data/nav';

@Component({
  imports: [RouterLink],
  selector: 'app-footer',
  styleUrl: './footer.scss',
  templateUrl: './footer.html'
})
export class Footer {
  readonly links = NAV_LINKS.filter(l => l.path !== '/');
  readonly social = SOCIAL;
  readonly year = new Date().getFullYear();
}

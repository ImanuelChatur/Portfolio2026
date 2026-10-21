import { Component } from '@angular/core';
import { SKILL_GROUPS, CERTS } from '../../data/about';

@Component({
  selector: 'app-about',
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About {
  skillGroups = SKILL_GROUPS;
  certs = CERTS;
}

import { Component } from '@angular/core';
import { SKILL_GROUPS, CERTS, EXPERIENCE, EDUCATION } from '../../data/about';

@Component({
  selector: 'app-about',
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About {
  experience = EXPERIENCE;
  education = EDUCATION;
  skillGroups = SKILL_GROUPS;
  certs = CERTS;
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { SKILL_GROUPS, CERTS, EXPERIENCE, EDUCATION } from '../../data/about';

@Component({
  selector: 'app-about',
  imports: [NgTemplateOutlet, RouterLink, MatButtonModule, MatIconModule, MatListModule],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class About {
  protected readonly experience = EXPERIENCE;
  protected readonly education = EDUCATION;
  protected readonly skillGroups = SKILL_GROUPS;
  protected readonly certs = CERTS;
}

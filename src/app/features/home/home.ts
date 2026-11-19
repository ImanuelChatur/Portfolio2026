import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatList, MatListItem, MatListItemLine, MatListItemMeta, MatListItemTitle } from '@angular/material/list';
import { Content } from '../../core/services/content';
import { CURRENTLY, PROJECT_CLASS, SUBJECT_RECORD } from '../../data/home';

const CLASS_ORDER = Object.keys(PROJECT_CLASS);
const rank = (slug: string) => {
  const i = CLASS_ORDER.indexOf(slug);
  return i === -1 ? CLASS_ORDER.length : i;
};

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    DatePipe,
    MatButton,
    MatCard,
    MatIcon,
    MatProgressBar,
    MatList,
    MatListItem,
    MatListItemTitle,
    MatListItemLine,
    MatListItemMeta
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private content = inject(Content);

  protected readonly currently = CURRENTLY;
  protected readonly profile = SUBJECT_RECORD;
  protected readonly projects = this.content.projects;

  protected readonly featured = computed(() =>
    this.projects.hasValue()
      ? this.projects
          .value()
          .filter(p => p.featured)
          // AI security leads (positioning); unmapped projects keep index order after.
          .sort((a, b) => rank(a.slug) - rank(b.slug))
          .slice(0, 3)
          .map((p, i) => ({
            ...p,
            id: `PRJ-${String(i + 1).padStart(3, '0')}`,
            area: PROJECT_CLASS[p.slug] ?? null,
            tags: p.tags.slice(0, 4)
          }))
      : []
  );

  protected readonly recentWriteups = computed(() =>
    this.content.writeups.hasValue() ? this.content.writeups.value().slice(0, 3) : []
  );

  protected retryProjects(): void {
    this.projects.reload();
  }
}

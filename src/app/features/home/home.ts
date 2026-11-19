import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatListItem, MatListItemLine, MatListItemMeta, MatListItemTitle, MatNavList } from '@angular/material/list';
import { Content } from '../../core/services/content';
import { CURRENTLY, SUBJECT_RECORD } from '../../data/home';
import { toRecords } from '../content/records';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    DatePipe,
    MatButton,
    MatCard,
    MatIcon,
    MatProgressBar,
    MatNavList,
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

  // IDs and area come from the shared record helper so they match the Projects page.
  protected readonly featured = computed(() =>
    this.projects.hasValue()
      ? toRecords('projects', this.projects.value())
          .filter(p => p.featured)
          .slice(0, 3)
          .map(p => ({ ...p, tags: p.tags.slice(0, 4) }))
      : []
  );

  protected readonly recentWriteups = computed(() =>
    this.content.writeups.hasValue() ? this.content.writeups.value().slice(0, 3) : []
  );

  protected retryProjects(): void {
    this.projects.reload();
  }
}

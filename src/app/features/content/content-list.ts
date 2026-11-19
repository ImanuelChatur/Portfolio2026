import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatChipListbox, MatChipListboxChange, MatChipOption } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Content } from '../../core/services/content';
import { ContentType } from '../../shared/models/content';
import { dateFormat, toRecords, TYPE_LABEL } from './records';

const INTRO: Record<ContentType, string> = {
  projects: 'Security tooling and web apps I have built. Each record opens the full case notes.',
  writeups: 'CTF and lab walkthroughs: what I tried, what worked, and why.'
};

@Component({
  selector: 'app-content-list',
  imports: [RouterLink, DatePipe, MatButton, MatChipListbox, MatChipOption, MatIcon, MatProgressBar],
  templateUrl: './content-list.html',
  styleUrl: './content-list.scss'
})
export class ContentList {
  private content = inject(Content);

  /** Bound from route `data.type`. */
  readonly type = input.required<ContentType>();

  protected readonly label = computed(() => TYPE_LABEL[this.type()]);
  protected readonly intro = computed(() => INTRO[this.type()]);
  protected readonly dateFormat = computed(() => dateFormat(this.type()));
  protected readonly index = computed(() => this.content.get(this.type()));

  protected readonly records = computed(() => {
    const index = this.index();
    return index.hasValue() ? toRecords(this.type(), index.value()) : [];
  });

  /** Tags across all records, most used first, then alphabetical. */
  protected readonly tags = computed(() => {
    const counts = new Map<string, number>();
    for (const r of this.records()) for (const t of r.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t);
  });

  /** Selected tag; '' means All. Resets when the content type changes. */
  readonly tag = linkedSignal<ContentType, string>({ source: this.type, computation: () => '' });

  protected readonly visible = computed(() => {
    const tag = this.tag();
    return tag ? this.records().filter(r => r.tags.includes(tag)) : this.records();
  });

  protected readonly caption = computed(() =>
    this.tag() ? `${this.label().plural} tagged ${this.tag()}` : this.label().plural
  );

  protected readonly hasStars = computed(() => this.records().some(r => r.stars != null));
  protected readonly hasArea = computed(() => this.records().some(r => r.area));

  protected onFilter(event: MatChipListboxChange): void {
    // Deselecting the active tag (value undefined) falls back to All.
    this.tag.set(typeof event.value === 'string' ? event.value : '');
  }

  protected retry(): void {
    this.index().reload();
  }
}

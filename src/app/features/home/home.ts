import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Content } from '../../core/services/content';
import { CURRENTLY } from '../../data/home';

@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  private content = inject(Content);

  currently = CURRENTLY;

  featured = computed(() =>
    this.content.projects.hasValue()
      ? this.content.projects.value().filter(p => p.featured).slice(0, 3)
      : []
  );

  recentWriteups = computed(() =>
    this.content.writeups.hasValue() ? this.content.writeups.value().slice(0, 3) : []
  );
}

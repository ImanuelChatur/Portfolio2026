import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';

export type ThemeChoice = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

/**
 * Light/dark theme. Defaults to the system preference; an explicit choice is stored in
 * localStorage and applied as html[data-theme] (which sets color-scheme, see _theme.scss).
 * index.html applies the stored value before Angular boots to avoid a flash.
 */
@Injectable({ providedIn: 'root' })
export class Theme {
  private readonly doc = inject(DOCUMENT);
  private readonly media = this.doc.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');

  private readonly systemDark = signal(this.media?.matches ?? false);
  readonly choice = signal<ThemeChoice>(this.readStored());
  readonly isDark = computed(() =>
    this.choice() === 'system' ? this.systemDark() : this.choice() === 'dark'
  );

  constructor() {
    this.media?.addEventListener('change', e => this.systemDark.set(e.matches));
  }

  toggle(): void {
    const next: ThemeChoice = this.isDark() ? 'light' : 'dark';
    // Choosing the same scheme the system already uses returns to following the system.
    const systemScheme = this.systemDark() ? 'dark' : 'light';
    this.set(next === systemScheme ? 'system' : next);
  }

  set(choice: ThemeChoice): void {
    this.choice.set(choice);
    const html = this.doc.documentElement;
    if (choice === 'system') html.removeAttribute('data-theme');
    else html.setAttribute('data-theme', choice);
    try {
      if (choice === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Storage unavailable (private mode, blocked): the choice still applies for this visit.
    }
  }

  private readStored(): ThemeChoice {
    const attr = this.doc.documentElement.getAttribute('data-theme');
    return attr === 'light' || attr === 'dark' ? attr : 'system';
  }
}

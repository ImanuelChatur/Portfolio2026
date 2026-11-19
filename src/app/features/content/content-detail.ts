import {
  afterNextRender,
  afterRenderEffect,
  ApplicationRef,
  Component,
  ComponentRef,
  computed,
  createComponent,
  DestroyRef,
  DOCUMENT,
  effect,
  ElementRef,
  EnvironmentInjector,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { MatButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { Marked } from 'marked';
import { Content } from '../../core/services/content';
import { ContentType } from '../../shared/models/content';
import { CodeCopy } from './code-copy';
import { dateFormat, toRecords, TYPE_LABEL } from './records';

const FRONT_MATTER = /^﻿?---\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/;

// The page owns h1 and the body pane title is h2, so Markdown headings shift down one level.
const markdown = new Marked({
  gfm: true,
  walkTokens: token => {
    if (token.type === 'heading') token.depth = Math.min(token.depth + 1, 6);
  }
});

/** Markdown to HTML. The result is bound with [innerHTML], so Angular's sanitizer still runs on it. */
export function renderMarkdown(source: string): string {
  return markdown.parse(source.replace(FRONT_MATTER, ''), { async: false });
}

@Component({
  selector: 'app-content-detail',
  imports: [DatePipe, RouterLink, MatButton, MatMiniFabButton, MatIcon, MatProgressBar, MatTooltip],
  templateUrl: './content-detail.html',
  styleUrl: './content-detail.scss'
})
export class ContentDetail {
  private content = inject(Content);
  private title = inject(Title);
  private doc = inject(DOCUMENT);
  private appRef = inject(ApplicationRef);
  private env = inject(EnvironmentInjector);
  private destroyRef = inject(DestroyRef);

  /** Bound from route `data.type` and the `:slug` param. */
  readonly type = input.required<ContentType>();
  readonly slug = input.required<string>();

  protected readonly label = computed(() => TYPE_LABEL[this.type()]);
  protected readonly dateFormat = computed(() => dateFormat(this.type()));
  protected readonly index = computed(() => this.content.get(this.type()));

  protected readonly meta = computed(() => {
    const index = this.index();
    if (!index.hasValue()) return null;
    return toRecords(this.type(), index.value()).find(r => r.slug === this.slug()) ?? null;
  });

  /** The index loaded fine but has no entry for this slug. */
  protected readonly notFound = computed(() => {
    const index = this.index();
    return !index.isLoading() && !index.error() && index.hasValue() && !this.meta();
  });

  protected readonly body = httpResource.text(() =>
    this.notFound() ? undefined : `content/${this.type()}/${this.slug()}.md`
  );

  protected readonly html = computed(() => (this.body.hasValue() ? renderMarkdown(this.body.value()) : ''));

  private readonly prose = viewChild<ElementRef<HTMLElement>>('prose');
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly sentinel = viewChild.required<ElementRef<HTMLElement>>('sentinel');
  private copies: ComponentRef<CodeCopy>[] = [];

  protected readonly showTop = signal(false);

  constructor() {
    effect(() => {
      const meta = this.meta();
      if (meta) this.title.setTitle(meta.title);
      else if (this.notFound()) this.title.setTitle('Not found');
    });

    // Enhance the sanitized HTML after it renders: code blocks get a copy button and wide
    // blocks become keyboard-scrollable. Nothing here re-injects or trusts Markdown HTML.
    afterRenderEffect(() => {
      const host = this.prose()?.nativeElement;
      if (!this.html() || !host) return;
      this.copies = this.copies.filter(ref => {
        const live = ref.location.nativeElement.isConnected;
        if (!live) ref.destroy();
        return live;
      });
      host.querySelectorAll('pre').forEach(pre => this.enhanceCode(pre));
      host.querySelectorAll('table').forEach(table => this.wrap(table, 'table-scroll', 'Table'));
    });

    // Back-to-top: show once a 120vh sentinel at the top of the page has scrolled out of view.
    afterNextRender(() => {
      if (typeof IntersectionObserver !== 'function') return;
      const io = new IntersectionObserver(([entry]) => this.showTop.set(!entry.isIntersecting));
      io.observe(this.sentinel().nativeElement);
      this.destroyRef.onDestroy(() => io.disconnect());
    });

    this.destroyRef.onDestroy(() => this.copies.forEach(ref => ref.destroy()));
  }

  protected scrollToTop(): void {
    const reduce = this.doc.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.doc.defaultView?.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    this.heading()?.nativeElement.focus({ preventScroll: true });
  }

  protected retryIndex(): void {
    this.index().reload();
  }

  protected retryBody(): void {
    this.body.reload();
  }

  private enhanceCode(pre: HTMLPreElement): void {
    const block = this.wrap(pre, 'code-block');
    if (!block) return;
    // Title bar like a pane head: language label (from marked's `language-x` class) + copy button.
    const head = this.doc.createElement('div');
    head.className = 'code-head';
    const lang = this.doc.createElement('span');
    lang.textContent = /language-([\w+#-]+)/.exec(pre.querySelector('code')?.className ?? '')?.[1] ?? 'code';
    head.append(lang);
    const ref = createComponent(CodeCopy, { environmentInjector: this.env });
    ref.setInput('code', pre.textContent ?? '');
    this.appRef.attachView(ref.hostView);
    head.append(ref.location.nativeElement);
    block.prepend(head);
    this.copies.push(ref);
  }

  /** Wraps an element once; returns the new wrapper, or null when already wrapped. */
  private wrap(el: HTMLElement, cls: string, label?: string): HTMLElement | null {
    if (el.parentElement?.classList.contains(cls)) return null;
    const wrapper = this.doc.createElement('div');
    wrapper.className = cls;
    const scroller = label ? wrapper : el;
    scroller.tabIndex = 0;
    if (label) {
      wrapper.setAttribute('role', 'region');
      wrapper.setAttribute('aria-label', label);
    }
    el.replaceWith(wrapper);
    wrapper.append(el);
    return wrapper;
  }
}

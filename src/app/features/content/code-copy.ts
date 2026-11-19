import { Component, inject, input } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';

/**
 * Copy-to-clipboard control for a rendered code block. Created programmatically by
 * ContentDetail after the sanitized Markdown renders (the HTML itself is never trusted).
 */
@Component({
  selector: 'app-code-copy',
  imports: [MatIconButton, MatIcon, MatTooltip],
  host: { class: 'code-copy' },
  template: `
    <button matIconButton type="button" aria-label="Copy code" matTooltip="Copy code" (click)="copy()">
      <mat-icon>content_copy</mat-icon>
    </button>
  `
})
export class CodeCopy {
  private clipboard = inject(Clipboard);
  private snackBar = inject(MatSnackBar);

  readonly code = input('');

  protected copy(): void {
    const ok = this.clipboard.copy(this.code());
    this.snackBar.open(ok ? 'Code copied' : 'Copy failed. Select the code and copy it manually.', undefined, {
      duration: 2500
    });
  }
}

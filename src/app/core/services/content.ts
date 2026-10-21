import { Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ContentMeta, ContentType } from '../../shared/models/content';

@Injectable({ providedIn: 'root' })
export class Content {
  readonly projects = this.index('projects');
  readonly writeups = this.index('writeups');

  private index(type: ContentType) {
    return httpResource<ContentMeta[]>(() => `content/${type}/index.json`, { defaultValue: [] });
  }
}

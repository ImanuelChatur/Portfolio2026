import { Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ContentMeta, ContentType } from '../../shared/models/content';

@Injectable({ providedIn: 'root' })
export class Content {
  readonly projects = this.index('projects');
  readonly writeups = this.index('writeups');

  /** The index resource for a content type (shared, loaded once per app). */
  get(type: ContentType) {
    return type === 'projects' ? this.projects : this.writeups;
  }

  private index(type: ContentType) {
    return httpResource<ContentMeta[]>(() => `content/${type}/index.json`, { defaultValue: [] });
  }
}

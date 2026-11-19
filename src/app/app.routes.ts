import { Routes } from '@angular/router';
import { ContentType } from './shared/models/content';

const list = () => import('./features/content/content-list').then(m => m.ContentList);
const detail = () => import('./features/content/content-detail').then(m => m.ContentDetail);
const type = (t: ContentType) => ({ type: t });

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home').then(m => m.Home), title: 'Home' },
  { path: 'projects', loadComponent: list, data: type('projects'), title: 'Projects' },
  // Detail pages set their own document title once the entry's metadata loads.
  { path: 'projects/:slug', loadComponent: detail, data: type('projects') },
  { path: 'writeups', loadComponent: list, data: type('writeups'), title: 'Writeups' },
  { path: 'writeups/:slug', loadComponent: detail, data: type('writeups') },
  { path: 'about', loadComponent: () => import('./features/about/about').then(m => m.About), title: 'About' },
  { path: 'contact', loadComponent: () => import('./features/contact/contact').then(m => m.Contact), title: 'Contact' },
  { path: '**', redirectTo: '' }
];

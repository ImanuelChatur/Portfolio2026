import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home').then(m => m.Home), title: 'Home' },
  { path: 'about', loadComponent: () => import('./features/about/about').then(m => m.About), title: 'About' },
  { path: 'contact', loadComponent: () => import('./features/contact/contact').then(m => m.Contact), title: 'Contact' },
  { path: '**', redirectTo: '' }
];

import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { routes } from './app.routes';

const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions({
        // Respect reduced motion for route transitions too.
        onViewTransitionCreated: ({ transition }) => {
          if (prefersReducedMotion()) transition.skipTransition();
        }
      }),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })
    ),
    {
      provide: MATERIAL_ANIMATIONS,
      useFactory: () => ({ animationsDisabled: prefersReducedMotion() })
    }
  ]
};

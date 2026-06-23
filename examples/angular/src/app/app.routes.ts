import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'basic', pathMatch: 'full' },
  {
    path: 'basic',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'groups',
    loadComponent: () =>
      import('./pages/groups/groups.component').then((m) => m.GroupsComponent),
  },
  {
    path: 'parents',
    loadComponent: () =>
      import('./pages/parents/parents.component').then(
        (m) => m.ParentsComponent
      ),
  },
  {
    path: 'validation',
    loadComponent: () =>
      import('./pages/validation/validation.component').then(
        (m) => m.ValidationComponent
      ),
  },
  {
    path: 'submit-handler',
    loadComponent: () =>
      import('./pages/submit-handler/submit-handler.component').then(
        (m) => m.SubmitHandlerComponent
      ),
  },
  {
    path: 'translation',
    loadComponent: () =>
      import('./pages/translation/translation.component').then(
        (m) => m.TranslationComponent
      ),
  },
  {
    path: 'component',
    loadComponent: () =>
      import('./pages/component/component.component').then(
        (m) => m.ComponentDemoComponent
      ),
  },
  {
    path: 'visibility',
    loadComponent: () =>
      import('./pages/visibility/visibility.component').then(
        (m) => m.VisibilityComponent
      ),
  },
  {
    path: 'computed-values',
    loadComponent: () =>
      import('./pages/computed-values/computed-values.component').then(
        (m) => m.ComputedValuesComponent
      ),
  },
  {
    path: 'themes',
    loadComponent: () =>
      import('./pages/themes/themes.component').then((m) => m.ThemesComponent),
  },
  {
    path: 'layout-nav',
    loadComponent: () =>
      import('./pages/layout-nav/layout-nav.component').then(
        (m) => m.LayoutNavComponent
      ),
  },
  {
    path: 'layout-tab',
    loadComponent: () =>
      import('./pages/layout-tab/layout-tab.component').then(
        (m) => m.LayoutTabComponent
      ),
  },
  {
    path: 'layout-wizard',
    loadComponent: () =>
      import('./pages/layout-wizard/layout-wizard.component').then(
        (m) => m.LayoutWizardComponent
      ),
  },
];

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
    path: 'custom-component',
    loadComponent: () =>
      import('./pages/custom-component/custom-component.component').then(
        (m) => m.CustomComponentComponent
      ),
  },
  {
    path: 'plugin',
    loadComponent: () =>
      import('./pages/plugin/plugin.component').then((m) => m.PluginComponent),
  },
];

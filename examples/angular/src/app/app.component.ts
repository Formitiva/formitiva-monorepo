import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  styles: [`
    .shell {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 240px;
      min-width: 240px;
      background: #1e1e2e;
      color: #cdd6f4;
      display: flex;
      flex-direction: column;
      padding: 0;
    }

    .sidebar-header {
      padding: 24px 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .sidebar-header h1 {
      margin: 0 0 4px;
      font-size: 1rem;
      font-weight: 700;
      color: #cba6f7;
      letter-spacing: 0.02em;
    }

    .sidebar-header p {
      margin: 0;
      font-size: 0.75rem;
      color: #6c7086;
    }

    nav {
      flex: 1;
      padding: 12px 0;
      overflow-y: auto;
    }

    nav a {
      display: flex;
      flex-direction: column;
      padding: 10px 20px;
      color: #a6adc8;
      text-decoration: none;
      font-size: 0.86rem;
      border-left: 3px solid transparent;
      transition: all 0.15s ease;
      line-height: 1.3;
    }

    nav a:hover {
      background: rgba(255,255,255,0.05);
      color: #cdd6f4;
    }

    nav a.active {
      border-left-color: #cba6f7;
      background: rgba(203, 166, 247, 0.1);
      color: #cba6f7;
    }

    nav a .nav-desc {
      font-size: 0.72rem;
      color: #585b70;
      margin-top: 2px;
    }

    nav a.active .nav-desc {
      color: #9399b2;
    }

    .main {
      flex: 1;
      overflow-y: auto;
      background: #f5f6f8;
    }
  `],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h1>&#64;formitiva/angular</h1>
          <p>Example application</p>
        </div>
        <nav>
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active">
              {{ item.label }}
              <span class="nav-desc">{{ item.description }}</span>
            </a>
          }
        </nav>
      </aside>
      <main class="main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class AppComponent {
  navItems: NavItem[] = [
    { path: 'basic',            label: 'Basic / Quick Start',   description: 'Contact form with inline submit' },
    { path: 'groups',           label: 'Field Groups',           description: 'Organize fields into collapsible groups' },
    { path: 'parents',          label: 'Conditional Fields',     description: 'Show/hide fields based on other values' },
    { path: 'validation',       label: 'Form Validation',        description: 'Cross-field validation handler' },
    { path: 'submit-handler',   label: 'Submit Handler',         description: 'Named registered submission handler' },
    { path: 'translation',      label: 'Translation / i18n',     description: 'Switch language at runtime' },
    { path: 'custom-component', label: 'Custom Component',       description: 'Point2D field via registerComponent' },
    { path: 'plugin',           label: 'Plugin',                 description: 'Bundle handlers into a plugin' },
  ];
}

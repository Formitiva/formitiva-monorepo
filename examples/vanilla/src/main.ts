import './styles.css';
import { router } from './router';

const navItems = [
  { path: 'basic',            label: 'Basic / Quick Start',   description: 'Contact form with inline submit' },
  { path: 'groups',           label: 'Field Groups',           description: 'Organize fields into collapsible groups' },
  { path: 'parents',          label: 'Conditional Fields',     description: 'Show/hide fields based on other values' },
  { path: 'validation',       label: 'Form Validation',        description: 'Cross-field validation handler' },
  { path: 'submit-handler',   label: 'Submit Handler',         description: 'Named registered submission handler' },
  { path: 'translation',      label: 'Translation / i18n',     description: 'Switch language at runtime' },
  { path: 'custom-component', label: 'Custom Component',       description: 'Point2D field via registerComponent' },
  { path: 'plugin',           label: 'Plugin',                 description: 'Bundle handlers into a plugin' },
];

const app = document.getElementById('app')!;
app.innerHTML = `
  <div class="shell">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>@formitiva/vanilla</h1>
        <p>Example application</p>
      </div>
      <nav id="nav"></nav>
    </aside>
    <main class="main" id="main"></main>
  </div>
`;

const nav  = document.getElementById('nav')!;
const main = document.getElementById('main')!;

// Render sidebar links
navItems.forEach(({ path, label, description }) => {
  const a = document.createElement('a');
  a.dataset['path'] = path;
  a.innerHTML = `${label}<span class="nav-desc">${description}</span>`;
  a.addEventListener('click', () => router.navigate(path));
  nav.appendChild(a);
});

function updateActive(path: string) {
  nav.querySelectorAll('a').forEach((a) => {
    a.classList.toggle('active', (a as HTMLAnchorElement).dataset['path'] === path);
  });
}

router.onNavigate(async (path, render) => {
  updateActive(path);
  main.innerHTML = '';
  await render(main);
});

// Start at current hash or default
router.start();

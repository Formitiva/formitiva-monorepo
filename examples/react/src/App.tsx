import { NavLink, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Groups from './pages/Groups';
import Parents from './pages/Parents';
import Validation from './pages/Validation';
import SubmitHandler from './pages/SubmitHandler';
import Translation from './pages/Translation';
import CustomComponent from './pages/CustomComponent';
import Plugin from './pages/Plugin';

const navItems = [
  { path: '/basic',            label: 'Basic / Quick Start',   description: 'Contact form with inline submit' },
  { path: '/groups',           label: 'Field Groups',           description: 'Organize fields into collapsible groups' },
  { path: '/parents',          label: 'Conditional Fields',     description: 'Show/hide fields based on other values' },
  { path: '/validation',       label: 'Form Validation',        description: 'Cross-field validation handler' },
  { path: '/submit-handler',   label: 'Submit Handler',         description: 'Named registered submission handler' },
  { path: '/translation',      label: 'Translation / i18n',     description: 'Switch language at runtime' },
  { path: '/custom-component', label: 'Custom Component',       description: 'Point2D field via registerComponent' },
  { path: '/plugin',           label: 'Plugin',                 description: 'Bundle handlers into a plugin' },
];

export default function App() {
  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h1 style={styles.sidebarTitle}>@formitiva/react</h1>
          <p style={styles.sidebarSubtitle}>Example application</p>
        </div>
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {}),
              })}
            >
              {item.label}
              <span style={styles.navDesc}>{item.description}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/basic" element={<Home />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/parents" element={<Parents />} />
          <Route path="/validation" element={<Validation />} />
          <Route path="/submit-handler" element={<SubmitHandler />} />
          <Route path="/translation" element={<Translation />} />
          <Route path="/custom-component" element={<CustomComponent />} />
          <Route path="/plugin" element={<Plugin />} />
        </Routes>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: { display: 'flex', minHeight: '100vh' },
  sidebar: {
    width: 240, minWidth: 240,
    background: '#1e1e2e', color: '#cdd6f4',
    display: 'flex', flexDirection: 'column',
  },
  sidebarHeader: {
    padding: '24px 20px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  sidebarTitle: {
    margin: '0 0 4px', fontSize: '1rem', fontWeight: 700,
    color: '#cba6f7', letterSpacing: '0.02em',
  },
  sidebarSubtitle: { margin: 0, fontSize: '0.75rem', color: '#6c7086' },
  nav: { flex: 1, padding: '12px 0', overflowY: 'auto' },
  navLink: {
    display: 'flex', flexDirection: 'column',
    padding: '10px 20px', color: '#a6adc8',
    textDecoration: 'none', fontSize: '0.86rem',
    borderLeft: '3px solid transparent',
    transition: 'all 0.15s ease', lineHeight: 1.3,
  },
  navLinkActive: {
    borderLeftColor: '#cba6f7',
    background: 'rgba(203, 166, 247, 0.1)',
    color: '#cba6f7',
  },
  navDesc: { fontSize: '0.72rem', color: '#585b70', marginTop: 2 },
  main: { flex: 1, overflowY: 'auto', background: '#f5f6f8' },
};

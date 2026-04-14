import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import App from './App.vue';
import './styles.css';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/',               redirect: '/basic' },
    { path: '/basic',          component: () => import('./pages/Home.vue') },
    { path: '/groups',         component: () => import('./pages/Groups.vue') },
    { path: '/parents',        component: () => import('./pages/Parents.vue') },
    { path: '/validation',     component: () => import('./pages/Validation.vue') },
    { path: '/submit-handler', component: () => import('./pages/SubmitHandler.vue') },
    { path: '/translation',    component: () => import('./pages/Translation.vue') },
    { path: '/component',       component: () => import('./pages/Component.vue') },
    { path: '/visibility',     component: () => import('./pages/Visibility.vue') },
    { path: '/computed-values', component: () => import('./pages/ComputedValues.vue') },
  ],
});

createApp(App).use(router).mount('#app');

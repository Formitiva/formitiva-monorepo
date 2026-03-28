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
    { path: '/custom-component', component: () => import('./pages/CustomComponent.vue') },
    { path: '/plugin',         component: () => import('./pages/Plugin.vue') },
  ],
});

createApp(App).use(router).mount('#app');

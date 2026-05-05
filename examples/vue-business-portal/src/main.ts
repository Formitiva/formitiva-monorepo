import { createApp } from 'vue';
import App from './App.vue';
import './styles.css';
// Side-effect: registers all business plugins with Formitiva
import './plugins';

createApp(App).mount('#app');

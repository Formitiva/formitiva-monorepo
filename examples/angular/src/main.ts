import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Register demo plugins (computed handlers, etc.) early at app startup
import './app/plugins/registerDemoPlugins';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

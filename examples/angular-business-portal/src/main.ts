import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Side-effect: registers all business plugins with Formitiva
import './app/plugins';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));

import { NgModule } from '@angular/core';
import { FormitivaComponent } from './components/form/formitiva.component';
import { FormitivaRendererComponent } from './components/form/formitiva-renderer.component';
import { SubmissionMessageComponent } from './components/form/submission-message.component';
import {
  StandardFieldLayoutComponent,
  InstanceNameComponent,
} from './components/layout/layout-components.component';
import { FieldRendererComponent } from './components/layout/field-renderer.component';
import { FieldGroupComponent } from './components/layout/field-group.component';

/**
 * Convenience module for applications that prefer NgModule-based imports.
 * Re-exports standalone components so consumers that use NgModules
 * (or cannot import standalone metadata from the package) can still
 * use Formitiva's components by importing this module.
 *
 * Usage:
 *   @NgModule({ imports: [FormitivaModule] })
 *   export class AppModule {}
 */
@NgModule({
  imports: [
    FormitivaComponent,
    FormitivaRendererComponent,
    SubmissionMessageComponent,
    StandardFieldLayoutComponent,
    InstanceNameComponent,
    FieldRendererComponent,
    FieldGroupComponent,
  ],
  exports: [
    FormitivaComponent,
    FormitivaRendererComponent,
    SubmissionMessageComponent,
    StandardFieldLayoutComponent,
    InstanceNameComponent,
    FieldRendererComponent,
    FieldGroupComponent,
  ],
})
export class FormitivaModule {}

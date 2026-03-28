import { NgModule } from '@angular/core';
import { FormitivaComponent } from './components/form/formitiva.component';

/**
 * Convenience module for applications that prefer NgModule-based imports.
 * Since FormitivaComponent is standalone, this simply re-exports it.
 *
 * Usage:
 *   @NgModule({ imports: [FormitivaModule] })
 *   export class AppModule {}
 */
@NgModule({
  imports: [FormitivaComponent],
  exports: [FormitivaComponent],
})
export class FormitivaModule {}

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
  signal,
  ChangeDetectorRef,
} from '@angular/core';
import type { OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { NgIf, NgFor, NgStyle } from '@angular/common';
import { FormitivaContextService } from '../../services/formitiva-context.service';
import { FieldRendererComponent } from '../layout/field-renderer.component';
import { FieldGroupComponent } from '../layout/field-group.component';
import { InstanceNameComponent } from '../layout/layout-components.component';
import { SubmissionMessageComponent } from './submission-message.component';
import {
  initFormState,
  computeFieldChange,
  computeVisibleGroups,
  computeSubmitErrors,
  isSubmitDisabled,
} from '@formitiva/core';
import type { FieldVisibilityStatus } from '@formitiva/core';
import { submitForm } from '@formitiva/core';
import type {
  DefinitionPropertyField,
  FieldValueType,
  ErrorType,
  FormitivaDefinition,
  FormitivaInstance,
  FormSubmissionHandler,
  FormValidationHandler,
} from '@formitiva/core';

@Component({
  selector: 'fv-formitiva-renderer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf, NgFor, NgStyle,
    FieldRendererComponent,
    FieldGroupComponent,
    InstanceNameComponent,
    SubmissionMessageComponent,
  ],
  template: `
    <div [ngStyle]="ctx.formStyle().container">
      <h2 *ngIf="definition.displayName" [ngStyle]="ctx.formStyle().titleStyle">
        {{ ctx.t()(definition.displayName) }}
      </h2>

      <fv-submission-message
        [message]="submissionMessage()"
        [success]="submissionSuccess()"
        [onDismiss]="dismissMessage"
      ></fv-submission-message>

      <fv-instance-name
        *ngIf="ctx.displayInstanceName() && instance"
        [name]="instanceName()"
        [onChange]="setInstanceName"
      ></fv-instance-name>

      <ng-container *ngFor="let group of visibleGroups(); trackBy: trackGroup">
        <ng-container *ngIf="group.name; else ungrouped">
          <fv-field-group
            [groupName]="group.name"
            [fields]="group.fields"
            [valuesMap]="valuesMap()"
            [handleChange]="handleChangeFn"
            [handleError]="handleErrorFn"
            [errorsMap]="errors()"
            [disabledByRef]="disabledByRef()"
          ></fv-field-group>
        </ng-container>
        <ng-template #ungrouped>
          <fv-field-renderer
            *ngFor="let field of group.fields; trackBy: trackField"
            [field]="field"
            [valuesMap]="valuesMap()"
            [handleChange]="handleChangeFn"
            [handleError]="handleErrorFn"
            [errorsMap]="errors()"
            [disabledByRef]="disabledByRef()"
          ></fv-field-renderer>
        </ng-template>
      </ng-container>

      <div *ngIf="loadedCount() < totalFields()" style="font-size:0.9em;color:var(--formitiva-text-muted, #666)">
        {{ ctx.t()('Loading more fields... (' + loadedCount() + '/' + totalFields() + ')') }}
      </div>

      <button
        (click)="handleSubmit()"
        [disabled]="isApplyDisabled()"
        class="formitiva-button"
        style="width:120px"
      >{{ ctx.t()('Submit') }}</button>
    </div>
  `,
})
export class FormitivaRendererComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) definition!: FormitivaDefinition;
  @Input({ required: true }) instance!: FormitivaInstance;
  @Input() onSubmit?: FormSubmissionHandler;
  @Input() onValidation?: FormValidationHandler;
  @Input() chunkSize = 50;
  @Input() chunkDelay = 50;

  readonly ctx = inject(FormitivaContextService);
  private readonly cdr = inject(ChangeDetectorRef);

  updatedProperties: DefinitionPropertyField[] = [];
  fieldMap: Record<string, DefinitionPropertyField> = {};
  valuesMap = signal<Record<string, FieldValueType>>({});
  visibility = signal<Record<string, boolean>>({});
  visibilityRefStatus = signal<Record<string, FieldVisibilityStatus>>({});
  disabledByRef = signal<Record<string, boolean>>({});
  errors = signal<Record<string, string>>({});
  submissionMessage = signal<string | null>(null);
  submissionSuccess = signal<boolean | null>(null);
  loadedCount = signal(0);
  totalFields = signal(0);
  instanceName = signal('');
  visibleGroups = signal<Array<{ name: string | undefined; fields: DefinitionPropertyField[] }>>([]);

  private initDone = false;
  private chunkTimer?: ReturnType<typeof setTimeout>;
  private rafHandle?: number;
  private targetInstance!: FormitivaInstance;
  private suppressClearOnNextInstanceUpdate = false;

  readonly handleChangeFn = (name: string, value: FieldValueType) => this.handleChange(name, value);
  readonly handleErrorFn = (name: string, error: ErrorType) => this.handleError(name, error);
  readonly dismissMessage = () => { this.submissionMessage.set(null); this.submissionSuccess.set(null); };
  readonly setInstanceName = (n: string) => {
    this.instanceName.set(n);
    this.submissionMessage.set(null);
    this.submissionSuccess.set(null);
  };

  ngOnInit(): void {
    this.init();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['definition'] || changes['instance']) {
      this.initDone = false;
      this.loadedCount.set(0);
      this.init();
    }
  }

  ngOnDestroy(): void {
    if (this.chunkTimer) clearTimeout(this.chunkTimer);
    if (this.rafHandle) cancelAnimationFrame(this.rafHandle);
  }

  private init(): void {
    const init = initFormState(this.definition, this.instance, this.ctx.t());

    this.rafHandle = requestAnimationFrame(() => {
      this.updatedProperties = init.updatedProperties;
      this.fieldMap = init.nameToField;
      this.valuesMap.set(init.valuesMap);
      this.visibility.set(init.visibility);
      this.totalFields.set(init.updatedProperties.length);
      this.instanceName.set(this.instance.name ?? '');
      this.targetInstance = this.instance;
      this.initDone = true;
      this.scheduleChunk();

      this.visibilityRefStatus.set(init.visibilityRefStatus);
      this.disabledByRef.set(init.disabledByRef);

      this.updateVisibleGroups();
      this.cdr.markForCheck();
    });
  }

  private scheduleChunk(): void {
    if (!this.initDone || this.loadedCount() >= this.totalFields()) return;
    this.chunkTimer = setTimeout(() => {
      this.loadedCount.update(prev => Math.min(prev + this.chunkSize, this.totalFields()));
      this.updateVisibleGroups();
      this.cdr.markForCheck();
      this.scheduleChunk();
    }, this.chunkDelay);
  }

  private updateVisibleGroups(): void {
    const groups = computeVisibleGroups(
      this.updatedProperties,
      this.visibility(),
      this.visibilityRefStatus(),
      this.loadedCount(),
    );
    this.visibleGroups.set(groups);
  }

  handleChange(name: string, value: FieldValueType): void {
    const field = this.fieldMap[name];
    if (!field) return;
    this.submissionMessage.set(null);
    this.submissionSuccess.set(null);

    const changed = computeFieldChange(name, value, {
      fieldMap: this.fieldMap,
      updatedProperties: this.updatedProperties,
      valuesMap: this.valuesMap(),
      visibility: this.visibility(),
    }, this.ctx.t());

    this.valuesMap.set(changed.newValues);
    this.ctx.valuesMap.set(changed.newValues);
    this.visibility.set(changed.newVisibility);
    this.visibilityRefStatus.set(changed.newVisRefStatus);
    this.disabledByRef.set(changed.newDisabledByRef);

    this.updateVisibleGroups();
    this.cdr.markForCheck();
  }

  handleError(name: string, error: ErrorType): void {
    if (this.fieldMap[name]?.disabled) {
      this.errors.update(prev => {
        if (!(name in prev)) return prev;
        const r = { ...prev };
        delete r[name];
        return r;
      });
      return;
    }
    this.errors.update(prev => {
      if (error) return { ...prev, [name]: String(error) };
      const r = { ...prev };
      delete r[name];
      return r;
    });
    this.cdr.markForCheck();
  }

  async handleSubmit(): Promise<void> {
    this.suppressClearOnNextInstanceUpdate = true;
    const prevName = this.targetInstance?.name;
    this.targetInstance.name = this.instanceName();

    let errorsForSubmit = this.errors();

    if (this.ctx.fieldValidationMode() === 'onSubmission') {
      const newErrors = computeSubmitErrors(
        this.updatedProperties,
        this.valuesMap(),
        this.ctx.definitionName(),
        this.ctx.t(),
      );
      this.errors.set(newErrors);
      errorsForSubmit = newErrors;
      if (Object.keys(newErrors).length > 0) {
        this.submissionMessage.set(this.ctx.t()('Please fix validation errors before submitting the form.'));
        this.submissionSuccess.set(false);
        this.cdr.markForCheck();
        return;
      }
      this.submissionMessage.set(null);
      this.submissionSuccess.set(null);
    }

    const result = await submitForm(
      this.definition,
      this.targetInstance,
      this.valuesMap(),
      this.ctx.t(),
      errorsForSubmit,
      this.onSubmit,
      this.onValidation
    );

    const msg = typeof result.message === 'string' ? result.message : String(result.message);
    const errMsg = Object.values(result.errors ?? {}).join('\n');
    this.submissionMessage.set(errMsg ? msg + '\n' + errMsg : msg);
    this.submissionSuccess.set(result.success);

    if (!result.success) {
      this.targetInstance.name = prevName ?? this.targetInstance.name;
      this.instanceName.set(prevName ?? '');
    }
    this.cdr.markForCheck();
  }

  isApplyDisabled(): boolean {
    return isSubmitDisabled(this.ctx.fieldValidationMode(), this.errors());
  }

  trackGroup(_: number, g: { name: string | undefined }): string {
    return g.name ?? `ungrouped-${_}`;
  }

  trackField(_: number, f: DefinitionPropertyField): string {
    return f.name;
  }
}

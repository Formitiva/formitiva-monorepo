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
  updateVisibilityMap,
  updateVisibilityBasedOnSelection,
  applyVisibilityRefs,
  applyComputedRefs,
} from '@formitiva/core';
import type { FieldVisibilityStatus } from '@formitiva/core';
import { renameDuplicatedGroups, groupConsecutiveFields } from '@formitiva/core';
import { submitForm } from '@formitiva/core';
import { validateField } from '@formitiva/core';
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
    const { properties } = this.definition;
    const nameToField = Object.fromEntries(
      properties.map(f => [f.name, { ...f, children: {} as Record<string, string[]> }])
    );

    properties.forEach(field => {
      if (!field.parents) return;
      Object.entries(field.parents).forEach(([parentName, selections]) => {
        const pf = nameToField[parentName];
        if (!pf) return;
        selections.forEach(sel => {
          pf.children ??= {};
          const key = String(sel);
          pf.children[key] = [...(pf.children[key] ?? []), field.name];
        });
      });
    });

    renameDuplicatedGroups(properties, nameToField);
    const updatedProps = Object.values(nameToField) as DefinitionPropertyField[];

    const valuesMapInit: Record<string, FieldValueType> = {};
    updatedProps.forEach(f => {
      if (f.type === 'unit') {
        const numVal = typeof f.defaultValue === 'number' ? String(f.defaultValue) : '';
        const unitVal = typeof f.defaultUnit === 'string' ? f.defaultUnit : String(f.defaultUnit ?? 'm');
        valuesMapInit[f.name] = [numVal, unitVal] as unknown as FieldValueType;
      } else {
        valuesMapInit[f.name] = f.defaultValue;
      }
    });

    this.targetInstance = this.instance;
    Object.keys(this.instance.values).forEach(key => {
      if (nameToField[key] !== undefined) valuesMapInit[key] = this.instance.values[key];
    });

    const vis = Object.fromEntries(updatedProps.map(f => [f.name, false]));
    const updatedVis = updateVisibilityMap(updatedProps, valuesMapInit, vis, nameToField);
      // Apply computed value handlers before setting initial state
      const initComputed = applyComputedRefs(updatedProps, valuesMapInit, this.ctx.t());
      if (Object.keys(initComputed).length > 0) Object.assign(valuesMapInit, initComputed);
    this.rafHandle = requestAnimationFrame(() => {
      this.updatedProperties = updatedProps;
      this.fieldMap = nameToField;
      this.valuesMap.set(valuesMapInit);
      this.visibility.set(updatedVis);
      this.totalFields.set(updatedProps.length);
      this.instanceName.set(this.instance.name ?? '');
      this.initDone = true;
      this.scheduleChunk();

      // Apply visibilityRef handlers
      const refStatus = applyVisibilityRefs(updatedProps, valuesMapInit, this.ctx.t());
      this.visibilityRefStatus.set(refStatus);
      this.disabledByRef.set(Object.fromEntries(Object.entries(refStatus).map(([n, s]) => [n, s === 'disable'])));

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
    const visMap = this.visibility();
    const refMap = this.visibilityRefStatus();
    const visible = this.updatedProperties.slice(0, this.loadedCount()).filter(f => {
      const refStatus = refMap[f.name];
      if (refStatus !== undefined) return refStatus !== 'invisible';
      return visMap[f.name];
    });
    const { groups } = groupConsecutiveFields(visible);
    this.visibleGroups.set(groups.map(g => ({ fields: g.fields, name: g.name ?? undefined })));
  }

  handleChange(name: string, value: FieldValueType): void {
    const field = this.fieldMap[name];
    if (!field) return;
    this.submissionMessage.set(null);
    this.submissionSuccess.set(null);

    this.valuesMap.update(prev => {
      const baseValues = { ...prev, [name]: value };
      const computedVals = applyComputedRefs(Object.values(this.fieldMap), baseValues, this.ctx.t());
      return Object.keys(computedVals).length > 0 ? { ...baseValues, ...computedVals } : baseValues;
    });
    this.ctx.valuesMap.set(this.valuesMap());

    const hasChildren = field.children && Object.keys(field.children).length > 0;
    const isParent = Object.values(this.fieldMap).some(f => f.parents && name in f.parents);
    if (hasChildren || isParent) {
      this.visibility.update(prev =>
        updateVisibilityBasedOnSelection(prev, this.fieldMap, { ...this.valuesMap(), [name]: value }, name, value)
      );
    }

    // Apply visibilityRef handlers
    const refStatus = applyVisibilityRefs(Object.values(this.fieldMap), this.valuesMap(), this.ctx.t());
    this.visibilityRefStatus.set(refStatus);
    this.disabledByRef.set(Object.fromEntries(Object.entries(refStatus).map(([n, s]) => [n, s === 'disable'])));

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
      const newErrors: Record<string, string> = {};
      const t = this.ctx.t();
      this.updatedProperties.forEach(field => {
        if (field.disabled) return;
        const value = this.valuesMap()[field.name];
        if (value === undefined) return;
        const err = validateField(this.ctx.definitionName(), field, value, t);
        if (err) newErrors[field.name] = err;
      });
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
    const mode = this.ctx.fieldValidationMode();
    if (mode === 'onEdit' || mode === 'onBlur' || mode === 'realTime') {
      return Object.values(this.errors()).some(Boolean);
    }
    return false;
  }

  trackGroup(_: number, g: { name: string | undefined }): string {
    return g.name ?? `ungrouped-${_}`;
  }

  trackField(_: number, f: DefinitionPropertyField): string {
    return f.name;
  }
}

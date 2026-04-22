import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
  signal,
  computed,
  ChangeDetectorRef,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { NgIf, NgFor, NgStyle, NgComponentOutlet } from '@angular/common';
import { FormitivaContextService } from '../../services/formitiva-context.service';
import { FieldRendererComponent } from '../layout/field-renderer.component';
import { FieldGroupComponent } from '../layout/field-group.component';
import { InstanceNameComponent } from '../layout/layout-components.component';
import { SubmissionMessageComponent } from './submission-message.component';
import { getLayoutAdapter } from '../../core/registries/layout-adapter-registry';
import { LayoutRenderContextService } from '../../services/layout-render-context.service';
import {
  initFormState,
  computeFieldChange,
  computeVisibleGroups,
  computeSubmitErrors,
  isSubmitDisabled,
  getLayout,
} from '@formitiva/core';
import type { FieldVisibilityStatus, LayoutConfig } from '@formitiva/core';
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
    NgIf, NgFor, NgStyle, NgComponentOutlet,
    FieldRendererComponent,
    FieldGroupComponent,
    InstanceNameComponent,
    SubmissionMessageComponent,
  ],
  providers: [LayoutRenderContextService],
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

      <!-- Layout adapter (pro plugin) -->
      <ng-container *ngIf="layoutAdapter && activeLayout">
        <ng-container
          [ngComponentOutlet]="layoutAdapter"
          [ngComponentOutletInputs]="layoutInputs()"
        ></ng-container>
      </ng-container>

      <!-- Normal layout (no adapter registered) -->
      <ng-container *ngIf="!layoutAdapter || !activeLayout">
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
      </ng-container>

      <div *ngIf="(!layoutAdapter || !activeLayout) && loadedCount() < totalFields()" style="font-size:0.9em;color:var(--formitiva-text-muted, #666)">
        {{ ctx.t()('Loading more fields...') + ' (' + loadedCount() + '/' + totalFields() + ')' }}
      </div>

      <!-- Submit button: shown when no adapter or no layout active -->
      <button
        *ngIf="!layoutAdapter || !activeLayout"
        (click)="handleSubmit()"
        [disabled]="isApplyDisabled()"
        class="formitiva-button"
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
  private readonly layoutCtx = inject(LayoutRenderContextService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly isApplyDisabled = computed(() => {
    if (this.activeLayout) {
      return Object.keys(
        computeSubmitErrors(
          this.updatedProperties,
          this.valuesMap(),
          this.ctx.definitionName(),
          this.ctx.t(),
        ),
      ).length > 0;
    }
    return isSubmitDisabled(this.ctx.fieldValidationMode(), this.errors());
  });

  readonly layoutInputs = computed(() => ({
    config: this.activeLayout,
    activeSection: this.activeSection(),
    onSectionChange: this.setSectionFn,
    t: this.ctx.t(),
  }));

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

  // Pro: layout registry
  activeLayout: LayoutConfig | null = null;
  readonly activeSection = signal<string>('');
  readonly layoutAdapter = getLayoutAdapter();

  readonly isWizardLastStep = computed(() => {
    if (!this.activeLayout || this.activeLayout.type !== 'wizard') return false;
    const sections = this.activeLayout.sections;
    return sections[sections.length - 1]?.name === this.activeSection();
  });

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
  readonly setSectionFn = (name: string) => {
    this.activeSection.set(name);
    this.updateVisibleGroups();
    this.cdr.markForCheck();
  };

  ngOnInit(): void {
    this.activeLayout = getLayout(this.definition?.layoutRef ?? '');
    this.activeSection.set(this.activeLayout?.defaultValue ?? '');
    this.init();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['definition'] || changes['instance']) {
      if (changes['definition']) {
        this.activeLayout = getLayout(this.definition?.layoutRef ?? '');
        this.activeSection.set(this.activeLayout?.defaultValue ?? '');
      }
      this.initDone = false;
      this.loadedCount.set(0);
      this.init();
    }
  }

  ngOnDestroy(): void {
    if (this.chunkTimer) clearTimeout(this.chunkTimer);
    if (this.rafHandle && isPlatformBrowser(this.platformId)) cancelAnimationFrame(this.rafHandle);
  }

  private init(): void {
    const init = initFormState(this.definition, this.instance, this.ctx.t());

    // Wire up layout context service handlers
    this.layoutCtx.handleChange = this.handleChangeFn;
    this.layoutCtx.handleError = this.handleErrorFn;
    this.layoutCtx.handleSubmit = () => this.handleSubmit();
    this.layoutCtx.setSectionFn = this.setSectionFn;
    // Keep t signal current so layout adapters always read the latest translation function.
    this.layoutCtx.t.set(this.ctx.t());
    // Note: layoutCtx.t is a computed getter sourced from ctx.t() — always current.

    this.rafHandle = isPlatformBrowser(this.platformId)
      ? requestAnimationFrame(() => {
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
        })
      : (Promise.resolve().then(() => {
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
        }), undefined);
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
    // Filter properties to the active layout section (if any)
    let propsToRender = this.updatedProperties;
    if (this.activeLayout) {
      const section = this.activeSection();
      const sectionProps = this.activeLayout.sections.find((n) => n.name === section)?.props ?? null;
      if (sectionProps) {
        propsToRender = this.updatedProperties.filter((p) => sectionProps!.includes(p.name));
      }
    }

    const groups = computeVisibleGroups(
      propsToRender,
      this.visibility(),
      this.visibilityRefStatus(),
      // In layout-adapter mode the section filter already limits props to a
      // small subset, so skip progressive chunk slicing.
      this.layoutAdapter ? undefined : this.loadedCount(),
    );
    this.visibleGroups.set(groups);

    this.syncLayoutContext(groups);
  }

  private syncLayoutContext(
    groups: Array<{ name: string | undefined; fields: DefinitionPropertyField[] }> = this.visibleGroups(),
  ): void {
    if (!this.layoutAdapter) {
      return;
    }

    this.layoutCtx.visibleGroups.set(groups);
    this.layoutCtx.valuesMap.set(this.valuesMap());
    this.layoutCtx.errors.set(this.errors());
    this.layoutCtx.disabledByRef.set(this.disabledByRef());
    this.layoutCtx.isApplyDisabled.set(this.isApplyDisabled());
    this.layoutCtx.isWizardLastStep.set(this.isWizardLastStep());
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
      this.syncLayoutContext();
      return;
    }
    this.errors.update(prev => {
      if (error) return { ...prev, [name]: String(error) };
      const r = { ...prev };
      delete r[name];
      return r;
    });
    this.syncLayoutContext();
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
        this.syncLayoutContext();
        this.cdr.markForCheck();
        return;
      }
      this.submissionMessage.set(null);
      this.submissionSuccess.set(null);
      this.syncLayoutContext();
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

  trackGroup(_: number, g: { name: string | undefined }): string {
    return g.name ?? `ungrouped-${_}`;
  }

  trackField(_: number, f: DefinitionPropertyField): string {
    return f.name;
  }
}

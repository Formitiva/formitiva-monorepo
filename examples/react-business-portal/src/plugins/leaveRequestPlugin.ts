/**
 * plugins/leaveRequestPlugin.ts
 *
 * Handles the "Leave Request" form (leave-request.json).
 *
 * JSON schema references:
 *   submitterRef  → "biz:leaveRequest"
 *   validatorRef  → "biz:leaveRequestValidator"
 *   visibilityRef → "biz:isSickLeave"       (on requiresMedicalCert)
 *   visibilityRef → "biz:isEmergencyLeave"  (on emergencyContactName, emergencyContactPhone)
 *
 * Business rules:
 *   • The "Medical Certificate Provided" checkbox appears only for sick leave.
 *   • Emergency contact fields appear only for emergency leave.
 *   • Both emergency contact fields are required when leaveType = "emergency".
 *   • On submit, the form values are forwarded to the submission bridge
 *     (in production this would create a leave request in your HRIS).
 */
import { registerPlugin } from '@formitiva/react';
import type {
  FormitivaPlugin,
  VisibilityHandler,
  FormValidationHandler,
} from '@formitiva/react';
import { submissionBridge } from './bridge';

// ── Visibility ─────────────────────────────────────────────────────────────────

/** Show the "Medical Certificate Provided" checkbox only for sick leave. */
const isSickLeave: VisibilityHandler = (_field, values) =>
  values['leaveType'] === 'sick' ? 'visible' : 'invisible';

/** Show emergency contact fields only when leave type is "emergency". */
const isEmergencyLeave: VisibilityHandler = (_field, values) =>
  values['leaveType'] === 'emergency' ? 'visible' : 'invisible';

// ── Validation ─────────────────────────────────────────────────────────────────

/** Both emergency contact fields are mandatory for emergency leave. */
const leaveRequestValidator: FormValidationHandler = (values, t) => {
  if (values['leaveType'] !== 'emergency') return undefined;
  const errors: string[] = [];
  if (!String(values['emergencyContactName']  ?? '').trim())
    errors.push(t('Emergency Contact Name is required for emergency leave.'));
  if (!String(values['emergencyContactPhone'] ?? '').trim())
    errors.push(t('Emergency Contact Phone is required for emergency leave.'));
  return errors.length > 0 ? errors : undefined;
};

// ── Plugin ─────────────────────────────────────────────────────────────────────

const leaveRequestPlugin: FormitivaPlugin = {
  name: 'leave-request-plugin',
  version: '1.0.0',
  description: 'Handles visibility, validation, and submission for the Leave Request form.',

  visibilityHandlers: {
    'biz:isSickLeave':      isSickLeave,
    'biz:isEmergencyLeave': isEmergencyLeave,
  },

  formValidators: {
    'biz:leaveRequestValidator': leaveRequestValidator,
  },

  submissionHandlers: {
    'biz:leaveRequest': (_def, _instance, values, _t) => {
      submissionBridge.onSubmit?.('Leave Request', values);
      return undefined;
    },
  },
};

/** Register the Leave Request plugin with Formitiva. */
export function registerLeaveRequestPlugin(): void {
  registerPlugin(leaveRequestPlugin, { conflictResolution: 'skip' });
}

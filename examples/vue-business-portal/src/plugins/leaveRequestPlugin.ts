import { registerPlugin } from '@formitiva/vue';
import type { FormitivaPlugin, VisibilityHandler, FormValidationHandler } from '@formitiva/vue';
import { submissionBridge } from './bridge';

const isSickLeave: VisibilityHandler = (_field, values) =>
  values['leaveType'] === 'sick' ? 'visible' : 'invisible';

const isEmergencyLeave: VisibilityHandler = (_field, values) =>
  values['leaveType'] === 'emergency' ? 'visible' : 'invisible';

const leaveRequestValidator: FormValidationHandler = (values, t) => {
  if (values['leaveType'] !== 'emergency') return undefined;
  const errors: string[] = [];
  if (!String(values['emergencyContactName']  ?? '').trim())
    errors.push(t('Emergency Contact Name is required for emergency leave.'));
  if (!String(values['emergencyContactPhone'] ?? '').trim())
    errors.push(t('Emergency Contact Phone is required for emergency leave.'));
  return errors.length > 0 ? errors : undefined;
};

const leaveRequestPlugin: FormitivaPlugin = {
  name: 'leave-request-plugin',
  version: '1.0.0',
  description: 'Visibility, validation, and submission for the Leave Request form.',
  visibilityHandlers: {
    'biz:isSickLeave':      isSickLeave,
    'biz:isEmergencyLeave': isEmergencyLeave,
  },
  formValidators: { 'biz:leaveRequestValidator': leaveRequestValidator },
  submissionHandlers: {
    'biz:leaveRequest': (_def, _instance, values, _t) => {
      submissionBridge.onSubmit?.('Leave Request', values);
      return undefined;
    },
  },
};

export function registerLeaveRequestPlugin(): void {
  registerPlugin(leaveRequestPlugin, { conflictResolution: 'skip' });
}

export { submissionBridge } from './bridge';
export { registerCustomerOnboardingPlugin } from './customerOnboardingPlugin';
export { registerSupportTicketPlugin }      from './supportTicketPlugin';
export { registerPurchaseOrderPlugin }      from './purchaseOrderPlugin';
export { registerLeaveRequestPlugin }       from './leaveRequestPlugin';

import { registerCustomerOnboardingPlugin } from './customerOnboardingPlugin';
import { registerSupportTicketPlugin }      from './supportTicketPlugin';
import { registerPurchaseOrderPlugin }      from './purchaseOrderPlugin';
import { registerLeaveRequestPlugin }       from './leaveRequestPlugin';

registerCustomerOnboardingPlugin();
registerSupportTicketPlugin();
registerPurchaseOrderPlugin();
registerLeaveRequestPlugin();

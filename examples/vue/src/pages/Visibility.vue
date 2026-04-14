<script setup lang="ts">
/**
 * Visibility.vue — Visibility Handler Example
 *
 * Demonstrates registering visibilityHandlers inside a FormitivaPlugin and
 * referencing them from field definitions via `visibilityRef`.
 *
 * The VisibilityPlugin registers two handlers:
 *  - 'demo:adminOnly'  → 'visible' for admin role, 'invisible' otherwise
 *  - 'demo:notViewer'  → 'disable' for viewer role, 'enable' otherwise
 */
import { Formitiva, registerPlugin } from '@formitiva/vue';
import type { FormitivaPlugin, VisibilityHandler } from '@formitiva/vue';

// ── Handler definitions ───────────────────────────────────────────────────────

const adminOnlyHandler: VisibilityHandler = (_fieldName, valuesMap) => {
  return valuesMap['role'] === 'admin' ? 'visible' : 'invisible';
};

const notViewerHandler: VisibilityHandler = (_fieldName, valuesMap) => {
  return valuesMap['role'] === 'viewer' ? 'disable' : 'enable';
};

// ── Plugin definition ─────────────────────────────────────────────────────────

const VisibilityPlugin: FormitivaPlugin = {
  name: 'visibility-demo-plugin',
  version: '1.0.0',
  description: 'Registers visibility handlers that show/hide or enable/disable fields based on the selected role.',
  visibilityHandlers: {
    'demo:adminOnly': adminOnlyHandler,
    'demo:notViewer': notViewerHandler,
  },
};

registerPlugin(VisibilityPlugin, { conflictResolution: 'skip' });

// ── Form definition ───────────────────────────────────────────────────────────

const definition = {
  name: 'VisibilityDemo',
  displayName: 'Visibility Handler Demo',
  version: '1.0.0',
  properties: [
    {
      type: 'dropdown',
      name: 'role',
      displayName: 'Role',
      defaultValue: 'editor',
      required: true,
      options: [
        { value: 'admin',  label: 'Admin' },
        { value: 'editor', label: 'Editor' },
        { value: 'viewer', label: 'Viewer' },
      ],
    },
    {
      type: 'text',
      name: 'adminSecret',
      displayName: 'Admin Secret Key',
      defaultValue: '',
      visibilityRef: 'demo:adminOnly',
      placeholder: 'Only visible to admins',
    },
    {
      type: 'multiline',
      name: 'content',
      displayName: 'Content',
      defaultValue: '',
      visibilityRef: 'demo:notViewer',
      placeholder: 'Viewers cannot edit this field',
    },
    {
      type: 'text',
      name: 'notes',
      displayName: 'Notes',
      defaultValue: '',
      placeholder: 'Visible and editable for all roles',
    },
  ],
};

const initialInstance = {
  name: 'visibilityDemo',
  version: '1.0.0',
  definition: 'VisibilityDemo',
  values: { role: 'editor', adminSecret: '', content: '', notes: '' },
};
</script>

<template>
  <div class="page-content">
    <h2>Visibility Handler</h2>
    <p class="desc">
      Register <code>visibilityHandlers</code> inside a <code>FormitivaPlugin</code> and
      reference them from field definitions via <code>visibilityRef</code>.
      Handlers return <code>'visible' | 'invisible' | 'enable' | 'disable'</code>
      based on the current form values.
      Switch the <em>Role</em> dropdown to see fields appear, disappear, or become disabled.
    </p>

    <table class="info-table">
      <thead><tr><th>Role</th><th>Admin Secret Key</th><th>Content</th></tr></thead>
      <tbody>
        <tr><td><strong>admin</strong></td><td>visible</td><td>enabled</td></tr>
        <tr><td><strong>editor</strong></td><td>hidden</td><td>enabled</td></tr>
        <tr><td><strong>viewer</strong></td><td>hidden</td><td>disabled</td></tr>
      </tbody>
    </table>

    <Formitiva
      :definition-data="definition"
      :instance="initialInstance"
      theme="material"
    />
  </div>
</template>

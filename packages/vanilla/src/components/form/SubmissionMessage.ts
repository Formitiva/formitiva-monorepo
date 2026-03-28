export interface SubmissionMessageResult {
  el: HTMLElement;
  update(message: string | null, success: boolean | null): void;
  destroy(): void;
}

export function createSubmissionMessage(
  t: (s: string) => string,
  onDismiss: () => void
): SubmissionMessageResult {
  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  el.style.display = 'none';

  const textEl = document.createElement('div');
  Object.assign(textEl.style, { whiteSpace: 'pre-wrap', flex: '1' });

  const dismissBtn = document.createElement('button');
  dismissBtn.textContent = '\u00D7';
  dismissBtn.setAttribute('aria-label', t('Dismiss'));
  Object.assign(dismissBtn.style, {
    marginLeft: '12px', background: 'transparent', border: 'none',
    cursor: 'pointer', color: 'inherit', fontSize: '16px', lineHeight: '1',
  });
  dismissBtn.addEventListener('click', () => {
    el.style.display = 'none';
    onDismiss();
  });

  Object.assign(el.style, {
    marginBottom: '12px', padding: '12px', borderRadius: '6px',
    display: 'none', alignItems: 'center', justifyContent: 'space-between',
  });
  el.appendChild(textEl);
  el.appendChild(dismissBtn);

  function update(message: string | null, suc: boolean | null) {
    if (!message) { el.style.display = 'none'; return; }
    textEl.textContent = message;
    const isSuccess = suc === true;
    el.style.backgroundColor = isSuccess ? 'rgba(76,175,80,0.12)' : 'rgba(225,29,72,0.06)';
    el.style.border = `1px solid ${isSuccess ? 'rgba(76,175,80,0.3)' : 'rgba(225,29,72,0.12)'}`;
    el.style.color = isSuccess ? 'var(--formitiva-success-color, #4CAF50)' : 'var(--formitiva-error-color, #e11d48)';
    el.style.display = 'flex';
  }

  return { el, update, destroy() {} };
}

export interface SubmissionMessageProps {
  message: string | null;
  success: boolean | null;
  onDismiss: () => void;
  t: (s: string) => string;
}

export const SubmissionMessage: React.FC<SubmissionMessageProps> = ({
  message,
  success,
  onDismiss,
  t,
}) => {
  if (!message) return null;

  return (
    <div
      role="status"
      style={{
        marginBottom: 12,
        padding: 12,
        borderRadius: 6,
        backgroundColor: success
          ? 'rgba(76, 175, 80, 0.12)'
          : 'rgba(225, 29, 72, 0.06)',
        border: `1px solid ${success ? 'rgba(76,175,80,0.3)' : 'rgba(225,29,72,0.12)'}`,
        color: success ? 'var(--formitiva-success-color, #4CAF50)' : 'var(--formitiva-error-color, #e11d48)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ whiteSpace: 'pre-wrap', flex: 1 }}>{message}</div>
      <button
        onClick={onDismiss}
        aria-label={t('Dismiss')}
        style={{
          marginLeft: 12,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'inherit',
          fontSize: 16,
          lineHeight: 1
        }}
      >
        {'\u00D7'}
      </button>
    </div>
  );
};
SubmissionMessage.displayName = 'SubmissionMessage';

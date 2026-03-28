import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgIf, NgStyle } from '@angular/common';

@Component({
  selector: 'fv-submission-message',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgStyle],
  template: `
    <div
      *ngIf="message"
      role="status"
      [ngStyle]="containerStyle"
    >
      <div style="white-space:pre-wrap;flex:1">{{ message }}</div>
      <button
        (click)="onDismiss()"
        [attr.aria-label]="'Dismiss'"
        style="margin-left:12px;background:transparent;border:none;cursor:pointer;color:inherit;font-size:16px;line-height:1"
      >&#215;</button>
    </div>
  `,
})
export class SubmissionMessageComponent {
  @Input() message: string | null = null;
  @Input() success: boolean | null = null;
  @Input() onDismiss: () => void = () => {};

  get containerStyle(): Record<string, string> {
    return {
      marginBottom: '12px',
      padding: '12px',
      borderRadius: '6px',
      backgroundColor: this.success ? 'rgba(76, 175, 80, 0.12)' : 'rgba(225, 29, 72, 0.06)',
      border: `1px solid ${this.success ? 'rgba(76,175,80,0.3)' : 'rgba(225,29,72,0.12)'}`,
      color: this.success ? 'var(--formitiva-success-color, #4CAF50)' : 'var(--formitiva-error-color, #e11d48)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    };
  }
}

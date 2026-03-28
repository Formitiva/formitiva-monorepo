import {
  ChangeDetectionStrategy,
  Component,
  Input,
  signal,
  inject,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import type { OnDestroy } from '@angular/core';
import { NgStyle } from '@angular/common';
import { FormitivaContextService } from '../../../services/formitiva-context.service';
import { isDarkTheme } from '@formitiva/core';

@Component({
  selector: 'fv-tooltip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgStyle],
  template: `
    <span
      #iconEl
      role="img"
      [attr.aria-label]="ctx.t()('Tooltip')"
      [ngStyle]="iconStyle"
      (mouseenter)="show($event)"
      (mouseleave)="hide()"
      (focus)="show($event)"
      (blur)="hide()"
      tabindex="0"
    >
      <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    </span>
    <!-- Always in DOM so ViewChild is always available for measurement -->
    <div
      #tooltipEl
      role="tooltip"
      [ngStyle]="tooltipStyle"
    >{{ ctx.t()(content) }}</div>
  `,
  styles: [`
    :host { position: relative; display: inline-flex; align-items: center; }
  `],
})
export class TooltipComponent implements OnDestroy {
  @Input({ required: true }) content!: string;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  readonly ctx = inject(FormitivaContextService);
  private cd = inject(ChangeDetectorRef);

  // visible() kept for any external references
  visible = signal(false);

  private iconBg: string | undefined;

  @ViewChild('iconEl', { static: true }) private iconEl?: ElementRef<HTMLElement>;
  // static: true — always in DOM, available before any change detection cycle
  @ViewChild('tooltipEl', { static: true }) private tooltipEl?: ElementRef<HTMLElement>;

  private posX = signal<string>('-9999px');
  private posY = signal<string>('0px');
  private tooltipOpacity = signal<string>('0');
  private tooltipDisplay = signal<string>('none');

  private sizeConfig: Record<string, Record<string, string>> = {
    small: { padding: '4px 8px', fontSize: '11px', maxWidth: '240px' },
    medium: { padding: '6px 10px', fontSize: '12px', maxWidth: '320px' },
    large: { padding: '8px 12px', fontSize: '13px', maxWidth: '400px' },
  };

  get iconStyle(): Record<string, string> {
    const isThemeDark = isDarkTheme(this.ctx.theme());
    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '1.2em',
      height: '1.2em',
      fontSize: '0.9em',
      fontWeight: 'bold',
      borderRadius: '50%',
      backgroundColor: this.iconBg ?? (isThemeDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
      color: `var(--formitiva-text-color, ${isThemeDark ? '#f0f0f0' : '#333'})`,
      border: `1px solid ${isThemeDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginLeft: '0.3em',
    };
  }

  get tooltipStyle(): Record<string, string> {
    const isThemeDark = isDarkTheme(this.ctx.theme());
    return {
      display: this.tooltipDisplay(),
      position: 'fixed',
      zIndex: '9999',
      ...this.sizeConfig[this.size],
      backgroundColor: isThemeDark ? 'rgba(30,30,30,0.97)' : 'rgba(40,40,40,0.95)',
      color: isThemeDark ? '#f0f0f0' : '#ffffff',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      pointerEvents: this.tooltipOpacity() === '1' ? 'auto' : 'none',
      wordBreak: 'break-word',
      whiteSpace: 'pre-wrap',
      left: this.posX(),
      top: this.posY(),
      transform: 'translateY(-50%)',
      opacity: this.tooltipOpacity(),
      transition: 'opacity 0.12s ease',
    };
  }

  show(_event: Event): void {
    const icon = this.iconEl?.nativeElement;
    const tip = this.tooltipEl?.nativeElement;
    if (!icon || !tip) return;

    const margin = 8;
    const rect = icon.getBoundingClientRect();
    const vw = window.innerWidth;
    const y = Math.round(rect.top + rect.height / 2);

    // Step 1: Place off-screen but visible so the browser can compute its size.
    // This is equivalent to React rendering with opacity:0 before useLayoutEffect.
    this.posX.set('-9999px');
    this.posY.set(`${y}px`);
    this.tooltipOpacity.set('0');
    this.tooltipDisplay.set('block');
    this.visible.set(true);

    // Step 2: Force synchronous Angular render so ngStyle is applied to the DOM.
    try { this.cd.detectChanges(); } catch (_) {}

    // Step 3: getBoundingClientRect() forces a browser reflow — sizes are now real.
    const tRect = tip.getBoundingClientRect();

    // Step 4: Compute final left position; shift left if it overflows right edge.
    let left = Math.round(rect.right + margin);
    if (tRect.width && left + tRect.width > vw - margin) {
      left = Math.max(margin, vw - margin - tRect.width);
    }
    if (left < margin) left = margin;

    // Step 5: Apply final position and make visible.
    this.posX.set(`${left}px`);
    this.tooltipOpacity.set('1');
    try { this.cd.detectChanges(); } catch (_) {}
  }

  hide(): void {
    this.visible.set(false);
    this.tooltipDisplay.set('none');
    this.tooltipOpacity.set('0');
    this.posX.set('-9999px');
  }

  ngOnDestroy(): void {
    this.hide();
  }
}

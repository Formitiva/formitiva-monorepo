import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  ElementRef,
  ViewChild,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import type { OnChanges, SimpleChanges, AfterViewInit, OnDestroy } from '@angular/core';
import { NgIf, NgFor, NgStyle } from '@angular/common';

export interface PopupOption {
  label: string;
}

export type PopupOptionMenuPosition = { x: number; y: number };

@Component({
  selector: 'fv-popup-option-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgFor, NgStyle],
  template: `
    <div
      *ngIf="visible"
      #menuEl
      [ngStyle]="menuStyle"
      (mousedown)="$event.stopPropagation()"
    >
      <div
        *ngFor="let opt of options"
        data-popup-menu="item"
        [ngStyle]="itemStyle"
        (mousedown)="onSelect(opt)"
      >{{ opt.label }}</div>
    </div>
  `,
})
export class PopupOptionMenuComponent<T extends PopupOption> implements OnChanges, AfterViewInit, OnDestroy {
  @Input() pos: PopupOptionMenuPosition | null = null;
  @Input() options: T[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() optionClicked = new EventEmitter<T>();

  @ViewChild('menuEl') menuEl?: ElementRef<HTMLDivElement>;

  private attachedToBody = false;

  constructor(private cdr: ChangeDetectorRef) {}

  private adjustedTop = 0;
  private adjustedLeft = 0;
  private ready = false;
  private adjustedWidth: number | null = null;
  private adjustedMaxHeight: number | null = null;

  get visible(): boolean {
    return !!this.pos && this.options.length > 0;
  }

  get menuStyle(): Record<string, string> {
    const style: Record<string, string> = {
      position: 'fixed',
      top: `${this.adjustedTop}px`,
      left: `${this.adjustedLeft}px`,
      visibility: this.ready ? 'visible' : 'hidden',
      backgroundColor: 'var(--formitiva-primary-bg, #fff)',
      border: '1px solid var(--formitiva-border-color, #ccc)',
      borderRadius: 'var(--formitiva-border-radius, 4px)',
      boxShadow: 'var(--formitiva-shadow, 0 2px 10px rgba(0,0,0,0.2))',
      zIndex: '9999',
      overflowY: 'auto',
      pointerEvents: 'auto',
      boxSizing: 'border-box',
    };

    if (this.adjustedWidth != null) {
      style['width'] = `${this.adjustedWidth}px`;
    } else {
      style['minWidth'] = 'var(--formitiva-menu-min-width, 150px)';
    }

    if (this.adjustedMaxHeight != null) {
      style['maxHeight'] = `${this.adjustedMaxHeight}px`;
    } else {
      style['maxHeight'] = 'var(--formitiva-menu-max-height, 300px)';
    }

    return style;
  }

  itemStyle = {
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '0.95em',
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pos'] && this.pos) {
      this.adjustedTop = this.pos.y;
      this.adjustedLeft = this.pos.x;
      this.ready = false;
      // adjust after next render cycle
      setTimeout(() => this.adjustPosition(), 0);
    }
  }

  private adjustPosition(): void {
    if (!this.menuEl || !this.pos) return;

    const el = this.menuEl.nativeElement;

    // Move menu element to document.body to avoid being clipped by transformed parents
    if (!this.attachedToBody && el.parentElement !== document.body) {
      document.body.appendChild(el);
      this.attachedToBody = true;
    }

    const margin = 10; // keep a small gap from viewport edges

    // Measure initial size
    let rect = el.getBoundingClientRect();
    const desiredWidth = rect.width;
    const desiredHeight = rect.height;

    const availableRight = Math.max(0, window.innerWidth - this.pos.x - margin);
    const availableLeft = Math.max(0, this.pos.x - margin);

    let left = this.pos.x;
    // If it fits to the right, keep it
    if (desiredWidth <= availableRight) {
      this.adjustedWidth = null;
      left = this.pos.x;
    } else if (desiredWidth <= availableRight + availableLeft) {
      // shift left so it fits within viewport
      const shift = desiredWidth - availableRight;
      left = Math.max(margin, this.pos.x - shift);
      this.adjustedWidth = null;
    } else {
      // cannot fit at full width, clamp width to viewport and pin to left margin
      this.adjustedWidth = Math.max(100, window.innerWidth - margin * 2);
      left = margin;
      // apply width immediately so we can re-measure height
      try { el.style.width = `${this.adjustedWidth}px`; } catch (_) {}
      rect = el.getBoundingClientRect();
    }

    // Vertical placement: try below, then shift up, else clamp height
    const availableBottom = Math.max(0, window.innerHeight - this.pos.y - margin);
    const availableTop = Math.max(0, this.pos.y - margin);

    let top = this.pos.y;
    if (rect.height <= availableBottom) {
      this.adjustedMaxHeight = null;
      top = this.pos.y;
    } else if (rect.height <= availableBottom + availableTop) {
      const shiftY = rect.height - availableBottom;
      top = Math.max(margin, this.pos.y - shiftY);
      this.adjustedMaxHeight = null;
    } else {
      // cannot fit vertically, pin to top margin and clamp maxHeight
      top = margin;
      this.adjustedMaxHeight = Math.max(80, window.innerHeight - margin * 2);
    }

    this.adjustedTop = top;
    this.adjustedLeft = left;
    this.ready = true;

    // Ensure view updates immediately
    try { this.cdr.detectChanges(); } catch (_) {}
  }

  onSelect(opt: T): void {
    this.optionClicked.emit(opt);
    this.closed.emit();
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.dataset?.['popupMenu'] === 'item') return;
    if (this.menuEl?.nativeElement.contains(target)) return;
    this.closed.emit();
  }

  ngAfterViewInit(): void {
    // noop — actual DOM relocation happens in adjustPosition
  }

  ngOnDestroy(): void {
    // If the menu element was moved to body, remove it to avoid orphan nodes
    try {
      if (this.attachedToBody && this.menuEl && this.menuEl.nativeElement.parentElement === document.body) {
        document.body.removeChild(this.menuEl.nativeElement);
      }
    } catch (_) {
      // ignore
    }
  }
}

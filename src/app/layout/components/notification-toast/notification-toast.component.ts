import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-notification-toast',
  imports: [CommonModule, ToastModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-toast
      position="top-right"
      [life]="5000"
      [showTransformOptions]="'translateX(100%)'"
      [hideTransformOptions]="'translateX(100%)'"
      [showTransitionOptions]="'300ms ease-out'"
      [hideTransitionOptions]="'250ms ease-in'"
      ariaLive="polite"
    />
  `,
  styles: ``,
})
export class NotificationToastComponent {}


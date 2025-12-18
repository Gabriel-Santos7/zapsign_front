import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading',
  imports: [CommonModule, ProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (fullScreen()) {
      <div class="loading-fullscreen" [attr.aria-busy]="true" aria-live="polite">
        <p-progressSpinner />
      </div>
    } @else {
      <div class="loading-inline" [attr.aria-busy]="true" aria-live="polite">
        <p-progressSpinner />
      </div>
    }
  `,
  styles: `
    .loading-fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 9999;
    }

    .loading-inline {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
  `,
})
export class LoadingComponent {
  fullScreen = input<boolean>(false);
}


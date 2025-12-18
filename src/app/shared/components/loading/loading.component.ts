import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (fullScreen()) {
      <div class="loading-fullscreen" [attr.aria-busy]="true" aria-live="polite" role="status">
        <div class="loading-content">
          <div class="spinner-container">
            <div class="spinner"></div>
          </div>
          @if (message()) {
            <p class="loading-message">{{ message() }}</p>
          }
        </div>
      </div>
    } @else {
      <div class="loading-inline" [attr.aria-busy]="true" aria-live="polite" role="status">
        <div class="spinner-container">
          <div class="spinner spinner-small"></div>
        </div>
        @if (message()) {
          <p class="loading-message">{{ message() }}</p>
        }
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
      background-color: rgba(249, 250, 251, 0.95);
      backdrop-filter: blur(4px);
      z-index: 9999;
      animation: fadeIn 0.2s ease-in-out;
    }

    .loading-inline {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-2xl);
      gap: var(--spacing-md);
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-lg);
    }

    .spinner-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--gray-200);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      position: relative;
    }

    .spinner-small {
      width: 32px;
      height: 32px;
      border-width: 3px;
    }

    .spinner::before {
      content: '';
      position: absolute;
      top: -4px;
      left: -4px;
      right: -4px;
      bottom: -4px;
      border-radius: 50%;
      border: 4px solid transparent;
      border-top-color: var(--primary-300);
      opacity: 0.3;
      animation: spin 1.2s linear infinite reverse;
    }

    .spinner-small::before {
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      border-width: 3px;
    }

    .loading-message {
      margin: 0;
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--text-secondary);
      text-align: center;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.6;
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    /* Versão alternativa com pontos animados */
    .spinner-dots {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      justify-content: center;
    }

    .spinner-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--primary-color);
      animation: dotBounce 1.4s ease-in-out infinite;
    }

    .spinner-dot:nth-child(1) {
      animation-delay: 0s;
    }

    .spinner-dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .spinner-dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes dotBounce {
      0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
      }
      40% {
        transform: scale(1.2);
        opacity: 1;
      }
    }
  `,
})
export class LoadingComponent {
  fullScreen = input<boolean>(false);
  message = input<string | null>(null);
}


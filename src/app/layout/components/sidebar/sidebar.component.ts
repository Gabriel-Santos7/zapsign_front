import {
  Component,
  computed,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, ButtonModule, TooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed()">
      <div class="sidebar-header">
        <p-button
          icon="pi pi-bars"
          [text]="true"
          (onClick)="toggleCollapse()"
          [ariaLabel]="collapsed() ? 'Expandir menu' : 'Colapsar menu'"
          [attr.aria-expanded]="!collapsed()"
          styleClass="toggle-button"
        ></p-button>
      </div>
      <nav class="sidebar-nav" [attr.aria-label]="'Navegação principal'">
        <ul class="nav-list">
          <li>
            <a
              routerLink="/dashboard"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="nav-item"
              [pTooltip]="collapsed() ? 'Dashboard' : ''"
              tooltipPosition="right"
            >
              <div class="nav-icon">
                <i class="pi pi-home" aria-hidden="true"></i>
              </div>
              <span class="nav-label">Dashboard</span>
            </a>
          </li>
          <li>
            <a
              routerLink="/documents"
              routerLinkActive="active"
              class="nav-item"
              [pTooltip]="collapsed() ? 'Documentos' : ''"
              tooltipPosition="right"
            >
              <div class="nav-icon">
                <i class="pi pi-file" aria-hidden="true"></i>
              </div>
              <span class="nav-label">Documentos</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  `,
  styles: `
    .sidebar {
      width: 260px;
      height: calc(100vh - 64px);
      background-color: var(--bg-primary);
      border-right: var(--border-width) solid var(--border-color);
      display: flex;
      flex-direction: column;
      transition: width var(--transition-slow) ease;
      position: fixed;
      left: 0;
      top: 64px;
      z-index: 999;
      box-shadow: var(--shadow-sm);
    }

    .sidebar.collapsed {
      width: 72px;
    }

    .sidebar-header {
      padding: var(--spacing-md);
      border-bottom: var(--border-width) solid var(--border-color);
      display: flex;
      justify-content: flex-end;
      background-color: var(--bg-primary);
    }

    .toggle-button {
      color: var(--text-secondary);
      transition: all var(--transition-base);

      &:hover {
        color: var(--primary-color);
        background-color: var(--bg-hover);
      }
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: var(--spacing-sm) 0;
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md) var(--spacing-lg);
      color: var(--text-secondary);
      text-decoration: none;
      transition: all var(--transition-base);
      border-left: 3px solid transparent;
      margin: 0 var(--spacing-sm);
      border-radius: var(--border-radius-md);
      position: relative;
      font-weight: 500;
      font-size: 0.9375rem;

      &:hover {
        background-color: var(--bg-hover);
        color: var(--primary-600);
        transform: translateX(2px);
      }

      &.active {
        background-color: var(--bg-active);
        color: var(--primary-700) !important;
        border-left-color: var(--primary-color);
        font-weight: 600;

        .nav-icon {
          background-color: var(--primary-color);
          color: white;
          box-shadow: var(--shadow-sm);
        }

        .nav-label {
          color: var(--primary-700) !important;
        }
      }
    }

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: var(--border-radius-md);
      transition: all var(--transition-base);
      flex-shrink: 0;

      i {
        font-size: 1.125rem;
      }
    }

    .nav-label {
      white-space: nowrap;
      transition: opacity var(--transition-base), color var(--transition-base);
      color: inherit;
    }

    .sidebar.collapsed .nav-label {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }

    .sidebar.collapsed .nav-item {
      justify-content: center;
      padding: var(--spacing-md);
      margin: 0 var(--spacing-sm);
    }

    .sidebar.collapsed .sidebar-header {
      justify-content: center;
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        box-shadow: var(--shadow-xl);
      }

      .sidebar:not(.collapsed) {
        transform: translateX(0);
      }

      .sidebar.collapsed {
        width: 260px;
        transform: translateX(-100%);
      }
    }
  `,
})
export class SidebarComponent {
  private readonly collapsedSignal = signal<boolean>(false);

  collapsed = this.collapsedSignal.asReadonly();

  toggleCollapse(): void {
    this.collapsedSignal.update((value) => !value);
  }
}


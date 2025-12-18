import {
  Component,
  computed,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, MenuModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sidebar" [class.collapsed]="collapsed()">
      <div class="sidebar-header">
        <button
          pButton
          icon="pi pi-bars"
          [text]="true"
          (onClick)="toggleCollapse()"
          [ariaLabel]="collapsed() ? 'Expandir menu' : 'Colapsar menu'"
          [attr.aria-expanded]="!collapsed()"
        />
      </div>
      <nav class="sidebar-nav" [attr.aria-label]="'Navegação principal'">
        <ul class="nav-list">
          <li>
            <a
              routerLink="/dashboard"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="nav-item"
              [class.collapsed]="collapsed()"
            >
              <i class="pi pi-home" aria-hidden="true"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a
              routerLink="/documents"
              routerLinkActive="active"
              class="nav-item"
              [class.collapsed]="collapsed()"
            >
              <i class="pi pi-file" aria-hidden="true"></i>
              <span>Documentos</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  `,
  styles: `
    .sidebar {
      width: 250px;
      height: calc(100vh - 60px);
      background-color: var(--surface-card);
      border-right: 1px solid var(--surface-border);
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      position: fixed;
      left: 0;
      top: 60px;
      z-index: 1000;
    }

    .sidebar.collapsed {
      width: 60px;
    }

    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid var(--surface-border);
      display: flex;
      justify-content: flex-end;
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      color: var(--text-color);
      text-decoration: none;
      transition: background-color 0.2s;
      border-left: 3px solid transparent;
    }

    .nav-item:hover {
      background-color: var(--surface-hover);
    }

    .nav-item.active {
      background-color: var(--primary-color);
      color: var(--primary-color-text);
      border-left-color: var(--primary-color-text);
    }

    .nav-item i {
      font-size: 1.25rem;
      min-width: 1.5rem;
      text-align: center;
    }

    .nav-item.collapsed span {
      display: none;
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
      }

      .sidebar:not(.collapsed) {
        transform: translateX(0);
      }

      .sidebar.collapsed {
        width: 250px;
        transform: translateX(0);
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


import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NotificationToastComponent } from '../notification-toast/notification-toast.component';

@Component({
  selector: 'app-main-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    NotificationToastComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="main-layout">
      <app-header />
      <div class="layout-content">
        <app-sidebar #sidebar />
        <main class="main-content" [class.sidebar-collapsed]="sidebar.collapsed()">
          <router-outlet />
        </main>
      </div>
      <app-notification-toast />
    </div>
  `,
  styles: `
    .main-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      background-color: var(--bg-secondary);
    }

    .layout-content {
      display: flex;
      flex: 1;
      overflow: hidden;
      margin-top: 64px; /* Altura do header */
      position: relative;
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      overflow-y: auto;
      overflow-x: hidden;
      background: var(--gradient-subtle);
      transition: margin-left var(--transition-slow) ease;
      padding: var(--spacing-xl);
      min-height: calc(100vh - 64px);
    }

    .main-content.sidebar-collapsed {
      margin-left: 72px;
    }

    /* Scrollbar customizada para o conteúdo principal */
    .main-content::-webkit-scrollbar {
      width: 8px;
    }

    .main-content::-webkit-scrollbar-track {
      background: transparent;
    }

    .main-content::-webkit-scrollbar-thumb {
      background: var(--gray-300);
      border-radius: var(--border-radius-full);
      border: 2px solid transparent;
      background-clip: padding-box;

      &:hover {
        background: var(--gray-400);
        background-clip: padding-box;
      }
    }

    @media (max-width: 1024px) {
      .main-content {
        padding: var(--spacing-lg);
      }
    }

    @media (max-width: 768px) {
      .layout-content {
        margin-top: 64px;
      }

      .main-content {
        margin-left: 0;
        padding: var(--spacing-md);
      }

      .main-content.sidebar-collapsed {
        margin-left: 0;
      }
    }
  `,
})
export class MainLayoutComponent {
  @ViewChild('sidebar') sidebar!: SidebarComponent;
}


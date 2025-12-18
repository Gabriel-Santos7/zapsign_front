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
    }

    .layout-content {
      display: flex;
      flex: 1;
      overflow: hidden;
      margin-top: 60px; /* Altura do header */
    }

    .main-content {
      flex: 1;
      margin-left: 250px;
      overflow-y: auto;
      background-color: var(--surface-ground);
      transition: margin-left 0.3s ease;
      padding: 0;
    }

    .main-content.sidebar-collapsed {
      margin-left: 60px;
    }

    @media (max-width: 768px) {
      .layout-content {
        padding-top: 0;
      }

      .main-content {
        margin-left: 0;
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


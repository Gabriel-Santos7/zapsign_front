import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationToastComponent } from './layout/components/notification-toast/notification-toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('zapsign_front');

  ngOnInit(): void {
    console.log('App component initialized');
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      @for (notification of notificationService.notifications(); track notification.id) {
        <div 
          class="px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md flex items-center gap-3 animate-in slide-in-from-right"
          [ngClass]="{
            'bg-emerald-500 text-white': notification.type === 'success',
            'bg-red-500 text-white': notification.type === 'error',
            'bg-yellow-500 text-white': notification.type === 'warning',
            'bg-blue-500 text-white': notification.type === 'info'
          }"
        >
          <span class="flex-1">{{ notification.message }}</span>
          <button 
            (click)="notificationService.remove(notification.id)"
            class="text-white hover:opacity-80"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in-from-right {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-in {
      animation: slide-in-from-right 0.3s ease-out;
    }
  `]
})
export class ToastNotificationComponent {
  constructor(public notificationService: NotificationService) {}
}

import { Component, signal, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { IconsModule } from './shared/icons.module';
import { AuthService } from './users/services/auth.service';
import { DbSchemaService } from './shared/services/db-schema.service';
import { DbSeederService } from './shared/services/db-seeder.service';
import { ConfirmService } from './shared/services/confirm.service';
import { ToastNotificationComponent } from './shared/components/toast-notification.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconsModule, CommonModule, ToastNotificationComponent, ConfirmDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private authService = inject(AuthService);
  private router = inject(Router);
  private dbSchema = inject(DbSchemaService);
  private dbSeeder = inject(DbSeederService);
  protected confirmService = inject(ConfirmService);

  protected readonly title = signal('Gen-farma');
  protected readonly sidebarCollapsed = signal(false);
  protected readonly currentUrl = signal('');
  protected readonly currentUser = this.authService.currentUser;

  constructor() {
    this.initDatabase();
    this.currentUrl.set(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl.set(event.urlAfterRedirects);
    });
  }

  private async initDatabase() {
    try {
      // Verificar si window.api está disponible (solo en Electron)
      if (typeof window !== 'undefined' && (window as any).api) {
        console.log('Inicializando base de datos (modo Electron)...');
        await this.dbSchema.initSchema();
        await this.dbSeeder.seedData();
        console.log('Base de datos inicializada correctamente');
      } else {
        console.warn('window.api no disponible - modo desarrollo sin Electron');
        console.warn('La aplicación funcionará en modo mock (sin persistencia)');
      }
    } catch (error) {
      console.error('Error al inicializar la base de datos:', error);
      console.warn('Continuando en modo desarrollo sin base de datos');
    }
  }

  protected readonly showSidebar = computed(() => {
    const url = this.currentUrl();
    return !url.includes('/login');
  });

  logout() {
    this.authService.logout();
  }
}

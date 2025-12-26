import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconsModule } from '@shared/icons.module';

@Component({
    selector: 'app-unauthorized',
    standalone: true,
    imports: [CommonModule, RouterLink, IconsModule],
    template: `
    <div class="h-screen flex items-center justify-center bg-gray-50 p-4">
        <div class="max-w-md w-full text-center">
            <div class="mb-6 flex justify-center">
                <div class="p-4 bg-red-100 rounded-full text-red-600">
                    <lucide-icon name="shield-off" [size]="64"></lucide-icon>
                </div>
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
            <p class="text-gray-600 mb-8">
                No tienes los permisos necesarios para acceder a esta sección. 
                Si crees que esto es un error, contacta al administrador del sistema.
            </p>
            <a routerLink="/dashboard" 
               class="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                <lucide-icon name="home" [size]="20"></lucide-icon>
                Volver al Inicio
            </a>
        </div>
    </div>
    `
})
export class UnauthorizedComponent { }

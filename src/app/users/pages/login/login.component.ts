import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { IconsModule } from '@shared/icons.module';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, IconsModule],
    template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div class="max-w-md w-full">
            <!-- Logo / Header -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center p-3 bg-emerald-600 rounded-2xl text-white mb-4 shadow-lg">
                    <lucide-icon name="pill" [size]="40"></lucide-icon>
                </div>
                <h1 class="text-3xl font-bold text-gray-900">Gen-farma</h1>
                <p class="text-gray-500 mt-2">Sistema de Gestión de Farmacia</p>
            </div>

            <!-- Login Card -->
            <div class="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <h2 class="text-xl font-semibold text-gray-800 mb-6">Iniciar Sesión</h2>
                
                <form (submit)="onSubmit($event)" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                        <div class="relative">
                            <span class="absolute left-3 top-2.5 text-gray-400">
                                <lucide-icon name="user" [size]="18"></lucide-icon>
                            </span>
                            <input type="text" [(ngModel)]="username" name="username" 
                                   class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                   placeholder="Ingresa tu usuario">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <div class="relative">
                            <span class="absolute left-3 top-2.5 text-gray-400">
                                <lucide-icon name="lock" [size]="18"></lucide-icon>
                            </span>
                            <input type="password" [(ngModel)]="password" name="password" 
                                   class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                   placeholder="••••••••">
                        </div>
                    </div>

                    <div *ngIf="error()" class="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                        {{ error() }}
                    </div>

                    <button type="submit" 
                            class="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-md mt-2">
                        Acceder al Sistema
                    </button>
                </form>

                <!-- Help Link -->
                <div class="mt-6 pt-6 border-t border-gray-100 text-center">
                    <p class="text-sm text-gray-500">¿Problemas para acceder?</p>
                    <p class="text-xs text-blue-600 mt-1 cursor-pointer hover:underline">Contactar soporte técnico</p>
                </div>
            </div>

            <!-- Demo Info (remove in real prod) -->
            <div class="mt-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                <p class="text-[10px] uppercase tracking-wider font-bold text-blue-600 mb-2">Datos de Prueba (Demo)</p>
                <div class="grid grid-cols-2 gap-2 text-xs">
                    <div class="p-2 bg-white rounded-lg border border-blue-50">
                        <span class="text-gray-500">Admin:</span> <span class="font-mono font-bold">admin / admin</span>
                    </div>
                    <div class="p-2 bg-white rounded-lg border border-blue-50">
                        <span class="text-gray-500">Farma:</span> <span class="font-mono font-bold">farma / farma</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
})
export class LoginComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    username = '';
    password = '';
    error = signal<string | null>(null);

    async onSubmit(e: Event) {
        e.preventDefault();
        this.error.set(null);

        if (!this.username || !this.password) {
            this.error.set('Por favor ingresa usuario y contraseña');
            return;
        }

        try {
            const success = await this.authService.login(this.username, this.password);
            if (success) {
                console.log('Login exitoso, redirigiendo a dashboard...');
                console.log('Usuario autenticado:', this.authService.isAuthenticated());
                
                // Pequeño delay para asegurar que el signal se propague
                setTimeout(() => {
                    console.log('Intentando navegar después del delay...');
                    console.log('Usuario autenticado (después delay):', this.authService.isAuthenticated());
                    
                    this.router.navigateByUrl('/dashboard').then(
                        (navigated) => {
                            if (navigated) {
                                console.log('Navegación exitosa a dashboard');
                            } else {
                                console.error('No se pudo navegar a dashboard');
                                // Intentar navegar a la raíz
                                this.router.navigate(['/']).then(() => {
                                    console.log('Redirigido a raíz');
                                });
                            }
                        }
                    ).catch((err) => {
                        console.error('Error al navegar:', err);
                        // Fallback: intentar navegar a raíz
                        this.router.navigate(['/']);
                    });
                }, 100);
            } else {
                this.error.set('Usuario o contraseña incorrectos');
            }
        } catch (error) {
            console.error('Error en el login:', error);
            this.error.set('Error al conectar con la base de datos. Verifica la consola para más detalles.');
        }
    }
}

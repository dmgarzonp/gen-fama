import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { Role, Usuario } from '@shared/models/usuario.model';
import { IconsModule } from '@shared/icons.module';

@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [CommonModule, FormsModule, IconsModule, RouterLink],
    template: `
    <div class="p-6 max-w-2xl mx-auto">
        <div class="flex items-center gap-4 mb-8">
            <button routerLink="/usuarios" class="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                <lucide-icon name="arrow-left"></lucide-icon>
            </button>
            <h1 class="text-2xl font-bold text-gray-800">{{ isEdit() ? 'Editar Usuario' : 'Nuevo Usuario' }}</h1>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <form (submit)="onSubmit($event)" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Nombre Completo -->
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <input type="text" [(ngModel)]="formData.nombre" name="nombre" required
                               class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                               placeholder="Ej. Juan Pérez">
                    </div>

                    <!-- Usuario -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                        <input type="text" [(ngModel)]="formData.username" name="username" required
                               class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                               placeholder="Ej. jperez">
                    </div>

                    <!-- Password -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input type="password" [(ngModel)]="formData.password" name="password" 
                               [required]="!isEdit()"
                               class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                               placeholder="••••••••">
                        <p *ngIf="isEdit()" class="text-xs text-gray-400 mt-1">Dejar en blanco para mantener la actual</p>
                    </div>

                    <!-- Rol -->
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-3">Rol del Sistema</label>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div *ngFor="let role of roles" 
                                 (click)="formData.role = role.id"
                                 class="cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col gap-2"
                                 [class.border-emerald-500]="formData.role === role.id"
                                 [class.bg-emerald-50]="formData.role === role.id"
                                 [class.border-gray-100]="formData.role !== role.id"
                                 [class.hover:border-emerald-200]="formData.role !== role.id">
                                <div class="flex justify-between items-start">
                                    <span class="font-bold text-gray-900 capitalize">{{ role.id }}</span>
                                    <div *ngIf="formData.role === role.id" class="text-emerald-600">
                                        <lucide-icon name="check-circle" size="20"></lucide-icon>
                                    </div>
                                </div>
                                <p class="text-xs text-gray-500 leading-relaxed">{{ role.desc }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-6 border-t">
                    <button type="button" routerLink="/usuarios"
                            class="px-6 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all font-medium">
                        Cancelar
                    </button>
                    <button type="submit"
                            class="px-8 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all font-bold">
                        {{ isEdit() ? 'Guardar Cambios' : 'Crear Usuario' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
    `
})
export class UserFormComponent implements OnInit {
    private usersService = inject(UsersService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    isEdit = signal(false);
    formData: Partial<Usuario> = {
        role: 'auxiliar',
        activo: true
    };

    roles: { id: Role, desc: string }[] = [
        { id: 'admin', desc: 'Control total del sistema, configuración y gestión de usuarios.' },
        { id: 'farmaceutico', desc: 'Gestión profesional de farmacia: inventario, compras y reportes.' },
        { id: 'auxiliar', desc: 'Operaciones diarias de ventas y consulta de existencias.' },
        { id: 'cajero', desc: 'Uso exclusivo de punto de venta y arqueo de caja.' }
    ];

    async ngOnInit() {
        const id = this.route.snapshot.params['id'];
        if (id) {
            this.isEdit.set(true);
            const user = await this.usersService.getUserById(Number(id));
            if (user) {
                this.formData = { ...user, password: '' };
            } else {
                this.router.navigate(['/usuarios']);
            }
        }
    }

    async onSubmit(e: Event) {
        e.preventDefault();
        await this.usersService.saveUser(this.formData);
        this.router.navigate(['/usuarios']);
    }
}

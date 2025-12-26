import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { Usuario } from '@shared/models/usuario.model';
import { IconsModule } from '@shared/icons.module';

@Component({
    selector: 'app-users-list',
    standalone: true,
    imports: [CommonModule, RouterLink, IconsModule],
    template: `
    <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <div class="flex flex-col gap-1">
                <h1 class="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
                <p class="text-sm text-gray-500">Administra los accesos y roles del personal.</p>
            </div>
            <button routerLink="nuevo" class="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all font-bold">
                <lucide-icon name="plus" size="18"></lucide-icon>
                <span>Nuevo Usuario</span>
            </button>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 text-gray-700 border-b">
                    <tr>
                        <th class="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Usuario</th>
                        <th class="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Nombre</th>
                        <th class="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Rol</th>
                        <th class="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Estado</th>
                        <th class="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr *ngFor="let user of users()" class="hover:bg-gray-50/50 transition-colors">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                    {{ user.username.charAt(0).toUpperCase() }}
                                </div>
                                <span class="font-semibold text-gray-900">{{ user.username }}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-gray-600">{{ user.nombre }}</td>
                        <td class="px-6 py-4">
                            <span class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest"
                                [class.bg-purple-100]="user.role === 'admin'"
                                [class.text-purple-700]="user.role === 'admin'"
                                [class.bg-blue-100]="user.role === 'farmaceutico'"
                                [class.text-blue-700]="user.role === 'farmaceutico'"
                                [class.bg-orange-100]="user.role === 'cajero'"
                                [class.text-orange-700]="user.role === 'cajero'"
                                [class.bg-gray-100]="user.role === 'auxiliar'"
                                [class.text-gray-700]="user.role === 'auxiliar'">
                                {{ user.role }}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <button (click)="usersService.toggleStatus(user.id)"
                                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight transition-all"
                                [class.bg-green-50]="user.activo" [class.text-green-700]="user.activo"
                                [class.bg-red-50]="!user.activo" [class.text-red-700]="!user.activo">
                                <span class="w-1.5 h-1.5 rounded-full" [class.bg-green-600]="user.activo" [class.bg-red-600]="!user.activo"></span>
                                {{ user.activo ? 'Activo' : 'Inactivo' }}
                            </button>
                        </td>
                        <td class="px-6 py-4 text-right space-x-1">
                            <button [routerLink]="['editar', user.id]" 
                                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Editar">
                                <lucide-icon name="edit" size="16"></lucide-icon>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="mt-8 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 text-sm text-blue-800 flex items-start gap-4">
            <lucide-icon name="info" class="text-blue-500 shrink-0 mt-0.5" size="20"></lucide-icon>
            <div>
                <p class="font-bold mb-1">Nota del Sistema</p>
                <p>Las modificaciones en esta sección afectan los permisos de acceso de cada colaborador. Asegúrate de asignar los roles según las responsabilidades reales en la farmacia.</p>
                <p class="mt-2 text-xs">Accediendo como: <strong>{{ currentUser()?.username }}</strong></p>
            </div>
        </div>
    </div>
    `
})
export class UsersListComponent {
    authService = inject(AuthService);
    usersService = inject(UsersService);
    currentUser = this.authService.currentUser;
    users = this.usersService.getUsers();
}

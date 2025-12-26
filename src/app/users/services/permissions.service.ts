import { Injectable, signal, computed } from '@angular/core';
import { Usuario, Role, Permission, ModuleName, ActionName } from '@shared/models/usuario.model';

@Injectable({ providedIn: 'root' })
export class PermissionsService {

    // Roles and their default permissions
    private readonly ROLE_PERMISSIONS: Record<Role, Permission[]> = {
        'admin': [
            // Admin has all permissions effectively, but we list them or handle via wildcard logic
            { module: 'ventas', action: 'view' }, { module: 'ventas', action: 'create' }, { module: 'ventas', action: 'edit' }, { module: 'ventas', action: 'delete' }, { module: 'ventas', action: 'discount' }, { module: 'ventas', action: 'void' },
            { module: 'inventario', action: 'view' }, { module: 'inventario', action: 'create' }, { module: 'inventario', action: 'edit' }, { module: 'inventario', action: 'delete' }, { module: 'inventario', action: 'adjust' },
            { module: 'compras', action: 'view' }, { module: 'compras', action: 'create' }, { module: 'compras', action: 'edit' }, { module: 'compras', action: 'delete' },
            { module: 'clientes', action: 'view' }, { module: 'clientes', action: 'create' }, { module: 'clientes', action: 'edit' }, { module: 'clientes', action: 'delete' },
            { module: 'reportes', action: 'view' }, { module: 'reportes', action: 'financial' },
            { module: 'usuarios', action: 'view' }, { module: 'usuarios', action: 'create' }, { module: 'usuarios', action: 'edit' }, { module: 'usuarios', action: 'delete' },
            { module: 'configuracion', action: 'view' }, { module: 'configuracion', action: 'edit' }
        ],
        'farmaceutico': [
            { module: 'ventas', action: 'view' }, { module: 'ventas', action: 'create' }, { module: 'ventas', action: 'edit' }, { module: 'ventas', action: 'discount' },
            { module: 'inventario', action: 'view' }, { module: 'inventario', action: 'create' }, { module: 'inventario', action: 'edit' }, { module: 'inventario', action: 'adjust' },
            { module: 'compras', action: 'view' }, { module: 'compras', action: 'create' }, { module: 'compras', action: 'edit' },
            { module: 'clientes', action: 'view' }, { module: 'clientes', action: 'create' }, { module: 'clientes', action: 'edit' },
            { module: 'reportes', action: 'view' }, { module: 'reportes', action: 'financial' },
            { module: 'usuarios', action: 'view' } // View only for staff management maybe
        ],
        'auxiliar': [
            { module: 'ventas', action: 'view' }, { module: 'ventas', action: 'create' },
            { module: 'inventario', action: 'view' },
            { module: 'clientes', action: 'view' }, { module: 'clientes', action: 'create' },
            { module: 'reportes', action: 'view' } // Limited reports (operative)
        ],
        'cajero': [
            { module: 'ventas', action: 'view' }, { module: 'ventas', action: 'create' },
            { module: 'clientes', action: 'view' }, { module: 'clientes', action: 'create' }
        ]
    };

    private _currentUserPermissions = signal<Permission[]>([]);

    constructor() { }

    loadPermissions(user: Usuario) {
        let perms = this.ROLE_PERMISSIONS[user.role] || [];

        // Merge with custom permissions if any
        if (user.permisos_personalizados) {
            perms = [...perms, ...user.permisos_personalizados];
        }

        // De-duplicate
        const uniquePerms = perms.filter((p, index, self) =>
            index === self.findIndex((t) => (
                t.module === p.module && t.action === p.action
            ))
        );

        this._currentUserPermissions.set(uniquePerms);
    }

    hasPermission(module: ModuleName, action: ActionName): boolean {
        // Special case for admin: if we want them to structurally have everything without listing
        // But listing is safer.
        return this._currentUserPermissions().some(p => p.module === module && p.action === action);
    }

    // For UI binding mostly
    can(module: ModuleName, action: ActionName): boolean {
        return this.hasPermission(module, action);
    }
}

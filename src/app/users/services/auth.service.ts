import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario, Role } from '@shared/models/usuario.model';
import { PermissionsService } from './permissions.service';
import { DatabaseService } from '@shared/services/database.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private router = inject(Router);
    private permissionsService = inject(PermissionsService);
    private db = inject(DatabaseService);

    private readonly STORAGE_KEY = 'gen_farma_user';

    currentUser = signal<Usuario | null>(null);

    constructor() {
        this.loadSession();
    }

    async login(username: string, password: string): Promise<boolean> {
        try {
            const results = await this.db.query<Usuario>(
                'SELECT * FROM usuarios WHERE username = ? AND password = ? AND activo = 1',
                [username, password]
            );

            if (results.length > 0) {
                const user = results[0];
                this.setSession(user);
                // Registrar log de acceso
                await this.db.execute(
                    'INSERT INTO logs_auditoria (usuario_id, accion, detalles) VALUES (?, ?, ?)',
                    [user.id, 'LOGIN', `Usuario ${username} inició sesión`]
                );
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error durante el login:', error);
            return false;
        }
    }

    logout() {
        this.currentUser.set(null);
        localStorage.removeItem(this.STORAGE_KEY);
        this.router.navigate(['/login']);
    }

    isAuthenticated(): boolean {
        return this.currentUser() !== null;
    }

    hasRole(role: Role | Role[]): boolean {
        const user = this.currentUser();
        if (!user) return false;

        if (Array.isArray(role)) {
            return role.includes(user.role);
        }
        return user.role === role;
    }

    private setSession(user: Usuario) {
        this.currentUser.set(user);
        this.permissionsService.loadPermissions(user);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    }

    private loadSession() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                const user = JSON.parse(stored);
                this.currentUser.set(user);
                this.permissionsService.loadPermissions(user);
            } catch (e) {
                console.error('Error loading session', e);
                localStorage.removeItem(this.STORAGE_KEY);
            }
        }
    }

    // findMockUser ha sido reemplazado por lógica de base de datos en login()
}

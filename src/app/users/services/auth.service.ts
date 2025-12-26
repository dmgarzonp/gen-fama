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
            console.log('Intentando login con:', username);
            
            // Verificar si window.api está disponible (solo en Electron)
            if (typeof window !== 'undefined' && (window as any).api) {
                const results = await this.db.query<Usuario>(
                    'SELECT * FROM usuarios WHERE username = ? AND password = ? AND activo = 1',
                    [username, password]
                );

                console.log('Resultados de la consulta:', results);

                if (results.length > 0) {
                    const user = results[0];
                    console.log('Usuario encontrado:', user);
                    this.setSession(user);
                    console.log('Sesión establecida, usuario actual:', this.currentUser());
                    // Registrar log de acceso (no bloquea el login si falla)
                    try {
                        await this.db.execute(
                            'INSERT INTO logs_auditoria (usuario_id, accion, detalles) VALUES (?, ?, ?)',
                            [user.id, 'LOGIN', `Usuario ${username} inició sesión`]
                        );
                    } catch (logError) {
                        console.warn('No se pudo registrar el log de auditoría:', logError);
                        // No bloquea el login si el log falla
                    }
                    return true;
                } else {
                    console.warn('No se encontró usuario con esas credenciales');
                }
            } else {
                // Modo desarrollo sin Electron - usar usuarios mock
                console.warn('window.api no disponible - usando modo desarrollo');
                return this.loginMock(username, password);
            }
            return false;
        } catch (error) {
            console.error('Error durante el login:', error);
            // En caso de error, intentar modo mock como fallback
            return this.loginMock(username, password);
        }
    }

    private loginMock(username: string, password: string): boolean {
        // Usuarios mock para desarrollo sin Electron
        const mockUsers: Usuario[] = [
            { id: 1, username: 'admin', nombre: 'Administrador Principal', password: 'admin', role: 'admin', activo: true },
            { id: 2, username: 'farma', nombre: 'Juan Farmacéutico', password: 'farma', role: 'farmaceutico', activo: true },
            { id: 3, username: 'auxiliar', nombre: 'Maria Auxiliar', password: 'user', role: 'auxiliar', activo: true },
            { id: 4, username: 'cajero', nombre: 'Carlos Cajero', password: 'user', role: 'cajero', activo: true },
        ];

        const user = mockUsers.find(u => u.username === username && u.password === password);
        if (user) {
            const { password: _, ...userWithoutPassword } = user;
            this.setSession(userWithoutPassword as Usuario);
            console.log('Login mock exitoso:', userWithoutPassword);
            return true;
        }
        console.warn('Credenciales mock no válidas');
        return false;
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
        // Actualizar signal primero
        this.currentUser.set(user);
        // Cargar permisos
        this.permissionsService.loadPermissions(user);
        // Guardar en localStorage
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        // Forzar detección de cambios (por si acaso)
        console.log('Sesión establecida, usuario actual:', this.currentUser());
        console.log('isAuthenticated():', this.isAuthenticated());
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

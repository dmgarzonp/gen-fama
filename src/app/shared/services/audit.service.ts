import { Injectable, inject } from '@angular/core';
import { DatabaseService } from './database.service';
import { AuthService } from '../../users/services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuditService {
    private db = inject(DatabaseService);
    private auth = inject(AuthService);

    async log(accion: string, tabla?: string, registroId?: number, detalles?: string) {
        const user = this.auth.currentUser();
        const usuarioId = user ? user.id : null;

        try {
            await this.db.execute(
                'INSERT INTO logs_auditoria (usuario_id, accion, tabla, registro_id, detalles) VALUES (?, ?, ?, ?, ?)',
                [usuarioId, accion, tabla, registroId, detalles]
            );
        } catch (error) {
            console.error('Error al registrar log de auditoría:', error);
        }
    }
}

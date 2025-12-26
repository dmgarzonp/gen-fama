export type Role = 'admin' | 'farmaceutico' | 'auxiliar' | 'cajero';

export type ModuleName = 'ventas' | 'inventario' | 'compras' | 'clientes' | 'reportes' | 'usuarios' | 'configuracion';
export type ActionName = 'view' | 'create' | 'edit' | 'delete' | 'discount' | 'void' | 'adjust' | 'financial';

export interface Permission {
    module: ModuleName;
    action: ActionName;
}

export interface Usuario {
    id: number;
    username: string;
    nombre: string;
    role: Role;
    permisos_personalizados?: Permission[]; // Sobrescribe los predeterminados del rol si es necesario
    activo: boolean | number;
    ultima_sesion?: string;
    avatar?: string;
    password?: string; // Solo para mock o transitorio, en prod nunca en frontend
}

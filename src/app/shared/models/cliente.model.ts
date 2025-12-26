export interface Cliente {
  id?: number;
  nombre_completo: string;
  identificacion: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  fecha_nacimiento?: string;
  alergias?: string;
  enfermedades_cronicas?: string;
  tipo?: string;
  limite_credito?: number;
  saldo_pendiente?: number;
  puntos?: number;
  compras?: number;
  recetas?: number;
  productos_frecuentes?: string[] | string; // Puede ser array o JSON string
  fecha_registro?: string;
  estado?: string;
}

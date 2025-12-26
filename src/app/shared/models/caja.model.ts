export type EstadoTurno = 'abierto' | 'cerrado';

export interface TurnoCaja {
  id?: number;
  usuario_id: number;
  usuario_nombre?: string;
  monto_inicial: number;
  monto_final?: number;
  hora_apertura: string;
  hora_cierre?: string;
  ventas: number;
  ingresos: number;
  egresos: number;
  estado: EstadoTurno;
  observaciones?: string;
  diferencia?: number;
}

export type TipoMovimiento = 'venta' | 'ingreso' | 'egreso';

export interface MovimientoCaja {
  id?: number;
  turno_id: number;
  tipo: TipoMovimiento;
  descripcion: string;
  monto: number;
  hora: string;
  venta_id?: number;
  metodo_pago?: string;
}

import { Injectable, signal } from '@angular/core';
import { ProductoVencimiento } from '@shared/models/expiracion.model';

@Injectable({ providedIn: 'root' })
export class ExpiracionService {
  private readonly _productos = signal<ProductoVencimiento[]>([
    {
      id: 1,
      nombre: 'Amoxicilina 500',
      presentacion: '500mg x 12 cápsulas',
      lote: 'L2024003',
      fechaVencimiento: new Date('2025-06-30'),
      diasRestantes: -45,
      cantidad: 89,
      valorTotal: 1335,
      proveedor: 'BioLab',
      estado: 'vencido',
    },
    {
      id: 2,
      nombre: 'Ibuprofeno 400',
      presentacion: '400mg x 10 tabletas',
      lote: 'L2024002',
      fechaVencimiento: new Date('2025-08-15'),
      diasRestantes: 30,
      cantidad: 15,
      valorTotal: 87,
      proveedor: 'MediCorp',
      estado: 'critico',
    },
  ]);

  productos = this._productos.asReadonly();
}



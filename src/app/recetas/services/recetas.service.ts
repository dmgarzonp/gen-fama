import { Injectable, signal } from '@angular/core';
import { Receta } from '@shared/models/receta.model';

@Injectable({ providedIn: 'root' })
export class RecetasService {
  // Datos de ejemplo comentados porque usan propiedades que no están en el modelo Receta
  private readonly _recetas = signal<Receta[]>([
    /* {
      id: 101,
      cliente_id: 1,
      fecha: '2025-01-05',
      medico: 'Dra. Carolina Ruiz',
      diagnostico: 'Hipertensión',
      estado: 'parcial',
    },
    {
      id: 102,
      cliente_id: 2,
      fecha: '2024-12-20',
      medico: 'Dr. Miguel Torres',
      diagnostico: 'Dolor crónico',
      estado: 'pendiente',
    }, */
  ]);

  recetas = this._recetas.asReadonly();

  getById(id: number): Receta | undefined {
    return this._recetas().find((r) => r.id === id);
  }

  upsert(receta: Receta) {
    const lista = this._recetas();
    const index = lista.findIndex((r) => r.id === receta.id);
    if (index >= 0) {
      const copia = [...lista];
      copia[index] = receta;
      this._recetas.set(copia);
    } else {
      this._recetas.set([...lista, { ...receta, id: Date.now() }]);
    }
  }

  delete(id: number) {
    this._recetas.update((lista) => lista.filter((r) => r.id !== id));
  }
}



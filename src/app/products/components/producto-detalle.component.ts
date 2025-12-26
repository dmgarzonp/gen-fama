import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '../../shared/icons.module';
import { Producto } from '@shared/models/producto.model';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './producto-detalle.component.html',
})
export class ProductoDetalleComponent implements OnInit {
  @Input() producto: Producto | null = null;
  @Input() mostrar: boolean = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() editar = new EventEmitter<Producto>();

  ngOnInit() {
    // Component initialized
  }

  cerrarModal() {
    this.cerrar.emit();
  }

  editarProducto() {
    if (this.producto) {
      this.editar.emit(this.producto);
    }
  }

  getStockClass(stock: number, minimo: number): string {
    if (stock <= minimo) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (stock <= minimo * 1.5) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  }

  getEstadoClass(estado: string): string {
    return estado === 'activo' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

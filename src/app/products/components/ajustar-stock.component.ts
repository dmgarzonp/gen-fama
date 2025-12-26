import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../../shared/icons.module';
import { Producto } from '@shared/models/producto.model';
import { ProductosService } from '../services/productos.service';
import { NotificationService } from '@shared/services/notification.service';

@Component({
  selector: 'app-ajustar-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './ajustar-stock.component.html',
})
export class AjustarStockComponent implements OnInit {
  @Input() producto: Producto | null = null;
  @Input() mostrar: boolean = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() actualizado = new EventEmitter<void>();

  private productosService = inject(ProductosService);
  private notificationService = inject(NotificationService);

  tipoAjuste: 'suma' | 'resta' | 'fijo' = 'suma';
  cantidad: number = 0;
  motivo: string = '';
  observaciones: string = '';

  ngOnInit() {
    if (this.producto) {
      this.cantidad = 0;
      this.motivo = '';
      this.observaciones = '';
    }
  }

  calcularNuevoStock(): number {
    if (!this.producto) return 0;
    const stockActual = this.producto.stock_actual || 0;
    
    if (this.tipoAjuste === 'suma') {
      return stockActual + (this.cantidad || 0);
    } else if (this.tipoAjuste === 'resta') {
      return Math.max(0, stockActual - (this.cantidad || 0));
    } else {
      return this.cantidad || 0;
    }
  }

  async guardarAjuste() {
    if (!this.producto) return;

    if (this.cantidad <= 0) {
      this.notificationService.show('La cantidad debe ser mayor a 0', 'error');
      return;
    }

    if (!this.motivo.trim()) {
      this.notificationService.show('Debe ingresar un motivo para el ajuste', 'error');
      return;
    }

    try {
      if (this.tipoAjuste === 'fijo') {
        // Actualizar stock directamente
        const productoActualizado: Producto = {
          ...this.producto,
          stock_actual: this.cantidad
        };
        await this.productosService.upsert(productoActualizado);
      } else {
        // Usar el método de actualización de stock
        await this.productosService.actualizarStock(
          this.producto.id!,
          this.cantidad,
          this.tipoAjuste
        );
      }

      this.notificationService.show('Stock actualizado correctamente', 'success');
      this.actualizado.emit();
      this.cerrarModal();
    } catch (error) {
      console.error('Error al ajustar stock:', error);
      this.notificationService.show('Error al actualizar el stock', 'error');
    }
  }

  cerrarModal() {
    this.cerrar.emit();
  }

  getStockClass(stock: number): string {
    if (!this.producto) return '';
    const minimo = this.producto.stock_minimo || 0;
    if (stock <= minimo) {
      return 'text-red-600 font-bold';
    } else if (stock <= minimo * 1.5) {
      return 'text-orange-600 font-semibold';
    }
    return 'text-emerald-600 font-semibold';
  }
}

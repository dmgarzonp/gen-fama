import { Component, Input, Output, EventEmitter, OnInit, inject, effect, Injector, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../../shared/icons.module';
import { Producto } from '@shared/models/producto.model';
import { CategoriasService } from '../../products/services/categorias.service';
import { Categoria } from '@shared/models/categoria.model';
import { NotificationService } from '@shared/services/notification.service';

@Component({
  selector: 'app-form-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './form-producto.component.html',
})
export class FormProductoComponent implements OnInit {
  @Input() producto: Producto | null = null;
  @Input() mostrar: boolean = false;
  @Output() guardar = new EventEmitter<Producto>();
  @Output() cerrar = new EventEmitter<void>();

  private categoriasService = inject(CategoriasService);
  private notificationService = inject(NotificationService);
  private injector = inject(Injector);

  tabActiva = 0;
  tabs = ['Información General', 'Precios', 'Inventario', 'Regulatorio'];
  
  categorias: { id: number; nombre: string }[] = [];

  formulario: Partial<Producto> = {
    codigo_barras: '',
    codigo_interno: '',
    nombre_comercial: '',
    principio_activo: '',
    presentacion: '',
    categoria_id: undefined,
    laboratorio: '',
    lote: '',
    fecha_vencimiento: new Date().toISOString().split('T')[0],
    ubicacion: '',
    stock_actual: 0,
    stock_minimo: 0,
    stock_maximo: 0,
    precio_compra: 0,
    precio_venta: 0,
    margen_ganancia: 0,
    requiere_receta: false,
    es_controlado: false,
    estado: 'activo'
  };

  ngOnInit() {
    // Cargar categorías usando effect dentro de un contexto de inyección
    runInInjectionContext(this.injector, () => {
      effect(() => {
        const categorias = this.categoriasService.categorias();
        this.categorias = categorias
          .filter((c: Categoria) => c.activo !== false && c.activo !== 0)
          .map((c: Categoria) => ({ id: c.id!, nombre: c.nombre }));
      });
    });

    // Cargar datos del producto si existe
    if (this.producto) {
      this.formulario = { ...this.producto };
      // Convertir booleanos/números a booleanos
      if (typeof this.formulario.requiere_receta === 'number') {
        this.formulario.requiere_receta = this.formulario.requiere_receta === 1;
      }
      if (typeof this.formulario.es_controlado === 'number') {
        this.formulario.es_controlado = this.formulario.es_controlado === 1;
      }
    }
  }

  calcularMargen() {
    if ((this.formulario.precio_compra || 0) > 0) {
      this.formulario.margen_ganancia = Math.round(
        (((this.formulario.precio_venta || 0) - (this.formulario.precio_compra || 0)) / (this.formulario.precio_compra || 1)) * 100
      );
    }
  }

  guardarProducto() {
    // Validar campos obligatorios
    if (!this.formulario.nombre_comercial || !this.formulario.nombre_comercial.trim()) {
      this.notificationService.show('El nombre comercial es obligatorio', 'error');
      return;
    }

    if (!this.formulario.principio_activo || !this.formulario.principio_activo.trim()) {
      this.notificationService.show('El principio activo es obligatorio', 'error');
      return;
    }

    if (!this.formulario.presentacion || !this.formulario.presentacion.trim()) {
      this.notificationService.show('La presentación es obligatoria', 'error');
      return;
    }

    if (!this.formulario.categoria_id) {
      this.notificationService.show('Debe seleccionar una categoría', 'error');
      return;
    }

    if (!this.formulario.precio_compra || this.formulario.precio_compra <= 0) {
      this.notificationService.show('El precio de compra debe ser mayor a 0', 'error');
      return;
    }

    if (!this.formulario.precio_venta || this.formulario.precio_venta <= 0) {
      this.notificationService.show('El precio de venta debe ser mayor a 0', 'error');
      return;
    }

    if (this.formulario.precio_venta < this.formulario.precio_compra) {
      this.notificationService.show('El precio de venta no puede ser menor al precio de compra', 'error');
      return;
    }

    // Asegurar que los valores numéricos estén correctos
    const producto: Producto = {
      ...this.formulario,
      precio_compra: Number(this.formulario.precio_compra) || 0,
      precio_venta: Number(this.formulario.precio_venta) || 0,
      stock_actual: Number(this.formulario.stock_actual) || 0,
      stock_minimo: Number(this.formulario.stock_minimo) || 0,
      stock_maximo: Number(this.formulario.stock_maximo) || 0,
      requiere_receta: this.formulario.requiere_receta ? 1 : 0,
      es_controlado: this.formulario.es_controlado ? 1 : 0,
    } as Producto;

    this.guardar.emit(producto);
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}

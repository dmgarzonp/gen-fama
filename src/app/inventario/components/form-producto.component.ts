import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../../shared/icons.module';
import { Producto } from '@shared/models/producto.model';

@Component({
  selector: 'app-form-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './form-producto.component.html',
})
export class FormProductoComponent implements OnInit {
  @Input() producto: Producto | null = null;
  @Output() guardar = new EventEmitter<Producto>();
  @Output() cerrar = new EventEmitter<void>();

  tabActiva = 0;
  tabs = ['Información General', 'Precios', 'Inventario', 'Regulatorio'];
  
  categorias = [
    'Analgésicos',
    'Antiinflamatorios',
    'Antibióticos',
    'Antivirales',
    'Vitaminas',
    'Suplementos',
    'Cuidado Personal',
    'Bebés',
    'Diabetes',
    'Cardiovascular',
    'Gastrointestinal',
    'Respiratorio'
  ];

  formulario: Partial<Producto> = {
    codigo_barras: '',
    codigo_interno: '',
    nombre_comercial: '',
    principio_activo: '',
    presentacion: '',
    categoria: '',
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
    if (this.producto) {
      this.formulario = { ...this.producto };
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
    if (!this.formulario.nombre_comercial || !this.formulario.principio_activo || 
        !this.formulario.presentacion || !this.formulario.categoria) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    this.guardar.emit(this.formulario as Producto);
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}

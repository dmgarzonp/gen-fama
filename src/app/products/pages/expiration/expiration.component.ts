import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../../../shared/icons.module';

interface ProductoVencimiento {
  id: number;
  nombre: string;
  presentacion: string;
  lote: string;
  fechaVencimiento: Date;
  diasRestantes: number;
  cantidad: number;
  valorTotal: number;
  proveedor: string;
  estado: 'vencido' | 'critico' | 'advertencia' | 'normal';
}

@Component({
  selector: 'app-expiration',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './expiration.component.html',
})
export class ExpirationComponent {
  productos: ProductoVencimiento[] = [
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
      estado: 'vencido'
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
      estado: 'critico'
    }
  ];

  rangoSeleccionado = 'todos';
  terminoBusqueda = '';

  getResumenRangos() {
    return {
      vencidos: this.productos.filter(p => p.estado === 'vencido').length,
      critico: this.productos.filter(p => p.estado === 'critico').length,
      advertencia: this.productos.filter(p => p.estado === 'advertencia').length,
      normal: this.productos.filter(p => p.estado === 'normal').length
    };
  }

  getValorPorRango(estado: string): number {
    return this.productos
      .filter(p => p.estado === estado)
      .reduce((sum, p) => sum + p.valorTotal, 0);
  }

  getEstadoClass(estado: string): string {
    switch(estado) {
      case 'vencido': return 'bg-red-100 text-red-800 border-red-200';
      case 'critico': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'advertencia': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  }

  productosFiltrados() {
    return this.productos.filter(producto => {
      const coincideBusqueda = !this.terminoBusqueda || 
        producto.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
        producto.lote.includes(this.terminoBusqueda);

      const coincideRango = this.rangoSeleccionado === 'todos' || producto.estado === this.rangoSeleccionado;

      return coincideBusqueda && coincideRango;
    });
  }

  marcarParaDevolucion(producto: ProductoVencimiento) {
    alert(`Producto ${producto.nombre} marcado para devolución`);
  }

  generarNotaCredito(producto: ProductoVencimiento) {
    alert(`Generando nota de crédito para ${producto.nombre}`);
  }

  darDeBaja(producto: ProductoVencimiento) {
    if (confirm(`¿Dar de baja ${producto.nombre}?`)) {
      alert(`Producto ${producto.nombre} dado de baja`);
    }
  }

  generarReporteValor() {
    const valorTotal = this.productos.reduce((sum, p) => sum + p.valorTotal, 0);
    alert(`Valor total de productos próximos a vencer: $${valorTotal.toFixed(2)}`);
  }

  generarReportePromocion() {
    const productosCriticos = this.productos.filter(p => p.estado === 'critico' || p.estado === 'vencido');
    alert(`Productos para promoción urgente: ${productosCriticos.length}`);
  }
}

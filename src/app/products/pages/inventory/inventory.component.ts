import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../../../shared/icons.module';
import { Producto } from '@shared/models/producto.model';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './inventory.component.html',
})
export class InventoryComponent {
  // Datos de ejemplo comentados porque usan camelCase y el modelo usa snake_case
  productos: Producto[] = [];
  /* Ejemplo de datos (comentado):
  [
    {
      id: 1,
      codigoBarras: '7501234567890',
      codigoInterno: 'MED001',
      nombreComercial: 'Paracetamol Forte',
      principioActivo: 'Paracetamol',
      presentacion: '500mg x 20 tabletas',
      categoria: 'Analgésicos',
      laboratorio: 'LabFarma',
      lote: 'L2024001',
      fechaVencimiento: new Date('2025-12-31'),
      ubicacion: 'A1-B2',
      stockActual: 245,
      stockMinimo: 50,
      stockMaximo: 500,
      precioCompra: 2.50,
      precioVenta: 4.50,
      margenGanancia: 80,
      requiereReceta: false,
      esControlado: false,
      estado: 'activo'
    },
    {
      id: 2,
      codigoBarras: '7501234567891',
      codigoInterno: 'MED002',
      nombreComercial: 'Ibuprofeno 400',
      principioActivo: 'Ibuprofeno',
      presentacion: '400mg x 10 tabletas',
      categoria: 'Antiinflamatorios',
      laboratorio: 'MediCorp',
      lote: 'L2024002',
      fechaVencimiento: new Date('2025-08-15'),
      ubicacion: 'A1-B3',
      stockActual: 15,
      stockMinimo: 30,
      stockMaximo: 200,
      precioCompra: 3.20,
      precioVenta: 5.80,
      margenGanancia: 81,
      requiereReceta: false,
      esControlado: false,
      estado: 'activo'
    },
    {
      id: 3,
      codigoBarras: '7501234567892',
      codigoInterno: 'MED003',
      nombreComercial: 'Amoxicilina 500',
      principioActivo: 'Amoxicilina',
      presentacion: '500mg x 12 cápsulas',
      categoria: 'Antibióticos',
      laboratorio: 'BioLab',
      lote: 'L2024003',
      fechaVencimiento: new Date('2025-06-30'),
      ubicacion: 'B2-A1',
      stockActual: 89,
      stockMinimo: 25,
      stockMaximo: 150,
      precioCompra: 8.50,
      precioVenta: 15.00,
      margenGanancia: 76,
      requiereReceta: true,
      esControlado: false,
      estado: 'activo'
    }
  ]
  */

  productosFiltrados: Producto[] = []; // [...this.productos];
  terminoBusqueda = '';
  filtroCategoria = '';
  filtroEstado = '';
  categorias = ['Analgésicos', 'Antiinflamatorios', 'Antibióticos', 'Vitaminas', 'Cuidado Personal', 'Bebés'];

  filtrarProductos() {
    // TODO: Implementar filtrado con datos reales
    this.productosFiltrados = this.productos.filter(producto => {
      const coincideBusqueda = !this.terminoBusqueda || 
        (producto.nombre_comercial || '').toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
        (producto.codigo_barras || '').includes(this.terminoBusqueda) ||
        (producto.principio_activo || '').toLowerCase().includes(this.terminoBusqueda.toLowerCase());

      const coincideCategoria = !this.filtroCategoria || producto.categoria === this.filtroCategoria;
      const coincideEstado = !this.filtroEstado || producto.estado === this.filtroEstado;

      return coincideBusqueda && coincideCategoria && coincideEstado;
    });
  }

  getStockClass(producto: Producto): string {
    if ((producto.stock_actual || 0) <= (producto.stock_minimo || 0)) {
      return 'text-red-600 font-medium';
    } else if ((producto.stock_actual || 0) <= ((producto.stock_minimo || 0) * 1.5)) {
      return 'text-orange-600 font-medium';
    }
    return 'text-emerald-600 font-medium';
  }

  mostrarFormularioProducto() {
    alert('Abrir formulario de nuevo producto');
  }

  verProducto(producto: Producto) {
    alert(`Ver detalles de: ${producto.nombre_comercial}`);
  }

  editarProducto(producto: Producto) {
    alert(`Editar: ${producto.nombre_comercial}`);
  }

  ajustarInventario(producto: Producto) {
    alert(`Ajustar inventario de: ${producto.nombre_comercial}`);
  }

  eliminarProducto(producto: Producto) {
    if (confirm(`¿Está seguro de eliminar ${producto.nombre_comercial}?`)) {
      const index = this.productos.findIndex(p => p.id === producto.id);
      if (index > -1) {
        this.productos.splice(index, 1);
        this.filtrarProductos();
      }

    }
  }
}


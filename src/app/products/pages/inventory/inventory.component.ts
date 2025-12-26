import { Component, OnInit, inject, effect, Injector, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../../../shared/icons.module';
import { Producto } from '@shared/models/producto.model';
import { ProductosService } from '../../services/productos.service';
import { CategoriasService } from '../../services/categorias.service';
import { FormProductoComponent } from '../../../inventario/components/form-producto.component';
import { AjustarStockComponent } from '../../components/ajustar-stock.component';
import { ProductoDetalleComponent } from '../../components/producto-detalle.component';
import { ConfirmService } from '@shared/services/confirm.service';
import { NotificationService } from '@shared/services/notification.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, FormProductoComponent, AjustarStockComponent, ProductoDetalleComponent],
  templateUrl: './inventory.component.html',
})
export class InventoryComponent implements OnInit {
  private productosService: ProductosService = inject(ProductosService);
  private categoriasService: CategoriasService = inject(CategoriasService);
  private confirmService: ConfirmService = inject(ConfirmService);
  private notificationService: NotificationService = inject(NotificationService);
  private injector = inject(Injector);

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  terminoBusqueda = '';
  filtroCategoria = '';
  filtroEstado = '';
  categorias: { id: number; nombre: string }[] = [];
  
  // Estados del formulario
  mostrarFormulario = false;
  productoEditando: Producto | null = null;
  
  // Estados de modales
  mostrarDetalle = false;
  mostrarAjusteStock = false;
  productoSeleccionado: Producto | null = null;

  ngOnInit() {
    // Cargar productos desde el servicio usando effect dentro de un contexto de inyección
    runInInjectionContext(this.injector, () => {
      effect(() => {
        const productos: Producto[] = this.productosService.productos();
        this.productos = productos;
        this.filtrarProductos();
      });
    });

    // Cargar categorías usando effect dentro de un contexto de inyección
    runInInjectionContext(this.injector, () => {
      effect(() => {
        const categorias = this.categoriasService.categorias();
        this.categorias = categorias
          .filter((c: any) => c.activo !== false && c.activo !== 0)
          .map((c: any) => ({ id: c.id!, nombre: c.nombre }));
      });
    });
  }

  async recargarProductos() {
    // Recargar productos cuando cambie el filtro de estado
    if (this.filtroEstado) {
      await this.productosService.cargarProductos(this.filtroEstado);
    } else {
      await this.productosService.cargarProductos();
    }
  }

  filtrarProductos() {
    this.productosFiltrados = this.productos.filter(producto => {
      const coincideBusqueda = !this.terminoBusqueda || 
        (producto.nombre_comercial || '').toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
        (producto.codigo_barras || '').includes(this.terminoBusqueda) ||
        (producto.codigo_interno || '').includes(this.terminoBusqueda) ||
        (producto.principio_activo || '').toLowerCase().includes(this.terminoBusqueda.toLowerCase());

      const coincideCategoria = !this.filtroCategoria || 
        (producto.categoria || '').toLowerCase() === this.filtroCategoria.toLowerCase();
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
    this.productoEditando = null;
    this.mostrarFormulario = true;
  }

  verProducto(producto: Producto) {
    this.productoSeleccionado = producto;
    this.mostrarDetalle = true;
  }

  editarProducto(producto: Producto) {
    this.productoEditando = producto;
    this.mostrarFormulario = true;
  }

  ajustarInventario(producto: Producto) {
    this.productoSeleccionado = producto;
    this.mostrarAjusteStock = true;
  }
  
  onStockActualizado() {
    this.mostrarAjusteStock = false;
    this.productoSeleccionado = null;
  }
  
  onEditarDesdeDetalle(producto: Producto) {
    this.mostrarDetalle = false;
    this.productoEditando = producto;
    this.mostrarFormulario = true;
  }

  async eliminarProducto(producto: Producto) {
    const confirmado = await this.confirmService.confirmarAccion({
      title: 'Eliminar Producto',
      message: `¿Está seguro de eliminar ${producto.nombre_comercial}? Esta acción marcará el producto como inactivo.`,
      type: 'warning',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });
    
    if (confirmado) {
      try {
        await this.productosService.delete(producto.id!);
        this.notificationService.show('Producto eliminado correctamente', 'success');
      } catch (error: any) {
        this.notificationService.show('Error al eliminar producto', 'error');
      }
    }
  }

  async guardarProducto(producto: Producto) {
    try {
      await this.productosService.upsert(producto);
      this.notificationService.show(
        producto.id ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
        'success'
      );
      this.cerrarFormulario();
    } catch (error: any) {
      console.error('Error al guardar producto:', error);
      this.notificationService.show('Error al guardar producto', 'error');
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.productoEditando = null;
  }
  
  cerrarDetalle() {
    this.mostrarDetalle = false;
    this.productoSeleccionado = null;
  }
  
  cerrarAjusteStock() {
    this.mostrarAjusteStock = false;
    this.productoSeleccionado = null;
  }

  // Estadísticas
  getTotalProductos(): number {
    return this.productos.length;
  }

  getProductosActivos(): number {
    return this.productos.filter(p => p.estado === 'activo').length;
  }

  getProductosBajoStock(): number {
    return this.productos.filter(p => (p.stock_actual || 0) <= (p.stock_minimo || 0)).length;
  }

  getValorInventario(): number {
    return this.productos.reduce((sum, p) => sum + ((p.stock_actual || 0) * (p.precio_compra || 0)), 0);
  }

  // Descargar plantilla CSV
  descargarPlantilla() {
    // Crear datos de ejemplo para la plantilla
    const plantilla = [
      {
        'Código de Barras': '7701234567890',
        'Código Interno': 'INT-001',
        'Nombre Comercial': 'Paracetamol 500mg',
        'Principio Activo': 'Paracetamol',
        'Presentación': 'Caja x 100 tabletas',
        'Categoría ID': '1',
        'Laboratorio': 'Genfar',
        'Lote': 'L2024001',
        'Fecha Vencimiento': '2026-12-31',
        'Ubicación': 'Estante A1',
        'Stock Actual': '50',
        'Stock Mínimo': '10',
        'Stock Máximo': '200',
        'Precio Compra': '15000',
        'Precio Venta': '25000',
        'Requiere Receta': '0',
        'Es Controlado': '0',
        'Estado': 'activo'
      },
      {
        'Código de Barras': '7701234567891',
        'Código Interno': 'INT-002',
        'Nombre Comercial': 'Ibuprofeno 400mg',
        'Principio Activo': 'Ibuprofeno',
        'Presentación': 'Caja x 20 tabletas',
        'Categoría ID': '1',
        'Laboratorio': 'Bayer',
        'Lote': 'L2024002',
        'Fecha Vencimiento': '2027-06-30',
        'Ubicación': 'Estante A2',
        'Stock Actual': '30',
        'Stock Mínimo': '15',
        'Stock Máximo': '150',
        'Precio Compra': '12000',
        'Precio Venta': '20000',
        'Requiere Receta': '0',
        'Es Controlado': '0',
        'Estado': 'activo'
      }
    ];

    // Convertir a CSV con formato correcto (manejo de comas dentro de valores)
    const headers = Object.keys(plantilla[0]);
    const escapeCSV = (value: string): string => {
      // Si contiene comas, comillas o saltos de línea, envolver en comillas y escapar comillas internas
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csv = [
      headers.map(escapeCSV).join(','),
      ...plantilla.map(row => 
        headers.map(header => escapeCSV(String(row[header as keyof typeof row] || ''))).join(',')
      )
    ].join('\n');

    // Agregar BOM UTF-8 para que Excel abra correctamente el archivo con caracteres especiales
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csv;

    // Crear blob y descargar
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_productos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.notificationService.show('Plantilla descargada correctamente', 'success');
  }

  // Parser CSV robusto que maneja comas dentro de valores entre comillas
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Comilla escapada
          current += '"';
          i++; // Saltar la siguiente comilla
        } else {
          // Toggle de comillas
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Fin del campo
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    // Agregar el último campo
    result.push(current.trim());
    return result;
  }

  // Procesar datos de productos (común para CSV y Excel)
  private async procesarDatosProductos(headers: string[], rows: string[][]): Promise<{ importados: number; errores: number; erroresDetalle: string[] }> {
    // Validar encabezados requeridos
    const headersRequeridos = [
      'Código de Barras', 'Código Interno', 'Nombre Comercial', 
      'Principio Activo', 'Presentación', 'Categoría ID'
    ];
    const headersFaltantes = headersRequeridos.filter(h => !headers.includes(h));
    
    if (headersFaltantes.length > 0) {
      throw new Error(`El archivo no contiene los encabezados requeridos: ${headersFaltantes.join(', ')}`);
    }

    let importados = 0;
    let errores = 0;
    const erroresDetalle: string[] = [];

    // Procesar cada fila
    for (let i = 0; i < rows.length; i++) {
      const values = rows[i];
      
      // Saltar filas vacías
      if (values.every(v => !v || v.trim() === '')) continue;
      
      try {
        if (values.length !== headers.length) {
          errores++;
          erroresDetalle.push(`Fila ${i + 2}: Número de columnas incorrecto (esperado ${headers.length}, encontrado ${values.length})`);
          continue;
        }

        // Obtener valores de los campos
        const getValue = (headerName: string): string => {
          const index = headers.indexOf(headerName);
          return index >= 0 ? (String(values[index] || '').trim()) : '';
        };

        // Validar campos requeridos
        const nombreComercial = getValue('Nombre Comercial');
        if (!nombreComercial) {
          errores++;
          erroresDetalle.push(`Fila ${i + 2}: El campo "Nombre Comercial" es obligatorio`);
          continue;
        }

        // Validar y parsear categoría
        const categoriaIdStr = getValue('Categoría ID');
        const categoriaId = categoriaIdStr ? parseInt(categoriaIdStr, 10) : null;
        
        if (!categoriaId || isNaN(categoriaId)) {
          errores++;
          erroresDetalle.push(`Fila ${i + 2}: "Categoría ID" debe ser un número válido`);
          continue;
        }

        // Validar que la categoría exista
        const categoriaExiste = this.categorias.some(c => c.id === categoriaId);
        if (!categoriaExiste) {
          errores++;
          erroresDetalle.push(`Fila ${i + 2}: La categoría con ID ${categoriaId} no existe`);
          continue;
        }

        // Parsear valores numéricos con validación
        const parseNumber = (value: string, defaultValue: number = 0): number => {
          const parsed = value ? parseFloat(value) : defaultValue;
          return isNaN(parsed) ? defaultValue : parsed;
        };

        const parseInteger = (value: string, defaultValue: number = 0): number => {
          const parsed = value ? parseInt(value, 10) : defaultValue;
          return isNaN(parsed) ? defaultValue : parsed;
        };

        // Construir objeto producto
        const producto: Partial<Producto> = {
          codigo_barras: getValue('Código de Barras') || '',
          codigo_interno: getValue('Código Interno') || '',
          nombre_comercial: nombreComercial,
          principio_activo: getValue('Principio Activo') || '',
          presentacion: getValue('Presentación') || '',
          categoria_id: categoriaId,
          laboratorio: getValue('Laboratorio') || '',
          lote: getValue('Lote') || '',
          fecha_vencimiento: getValue('Fecha Vencimiento') || '',
          ubicacion: getValue('Ubicación') || '',
          stock_actual: parseInteger(getValue('Stock Actual'), 0),
          stock_minimo: parseInteger(getValue('Stock Mínimo'), 0),
          stock_maximo: parseInteger(getValue('Stock Máximo'), 0),
          precio_compra: parseNumber(getValue('Precio Compra'), 0),
          precio_venta: parseNumber(getValue('Precio Venta'), 0),
          requiere_receta: getValue('Requiere Receta') === '1' || getValue('Requiere Receta').toLowerCase() === 'true',
          es_controlado: getValue('Es Controlado') === '1' || getValue('Es Controlado').toLowerCase() === 'true',
          estado: getValue('Estado') || 'activo'
        };

        // Validar que el estado sea válido
        if (producto.estado !== 'activo' && producto.estado !== 'inactivo') {
          producto.estado = 'activo';
        }

        // Calcular margen de ganancia si hay precios
        if (producto.precio_compra && producto.precio_venta && producto.precio_compra > 0) {
          producto.margen_ganancia = ((producto.precio_venta - producto.precio_compra) / producto.precio_compra) * 100;
        }

        // Guardar producto
        await this.productosService.upsert(producto as Producto);
        importados++;
      } catch (error: any) {
        errores++;
        erroresDetalle.push(`Fila ${i + 2}: ${error.message || 'Error desconocido'}`);
      }
    }

    return { importados, errores, erroresDetalle };
  }

  // Importar desde archivo (CSV o Excel)
  async importarProductos(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isCSV && !isExcel) {
      this.notificationService.show('Por favor, seleccione un archivo CSV o Excel (.xlsx, .xls) válido', 'error');
      event.target.value = '';
      return;
    }

    try {
      if (isCSV) {
        // Procesar archivo CSV
        const reader = new FileReader();
        reader.onload = async (e: any) => {
          try {
            const text = e.target.result;
            const lines = text.split(/\r?\n/).filter((line: string) => line.trim());
            
            if (lines.length < 2) {
              this.notificationService.show('El archivo CSV debe contener al menos una fila de encabezados y una fila de datos', 'error');
              event.target.value = '';
              return;
            }

            // Parsear encabezados
            const headers = this.parseCSVLine(lines[0]).map((h: string) => h.trim().replace(/^"|"$/g, ''));
            
            // Procesar filas
            const rows: string[][] = [];
            for (let i = 1; i < lines.length; i++) {
              if (!lines[i].trim()) continue;
              const values = this.parseCSVLine(lines[i]).map((v: string) => v.trim().replace(/^"|"$/g, ''));
              rows.push(values);
            }

            const resultado = await this.procesarDatosProductos(headers, rows);
            this.mostrarResultadoImportacion(resultado);
          } catch (error: any) {
            console.error('Error al procesar el archivo CSV:', error);
            this.notificationService.show(
              `Error al procesar el archivo CSV: ${error.message || 'Error desconocido'}`,
              'error'
            );
          } finally {
            event.target.value = '';
          }
        };
        reader.readAsText(file, 'UTF-8');
      } else {
        // Procesar archivo Excel
        const reader = new FileReader();
        reader.onload = async (e: any) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Obtener la primera hoja
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            if (!worksheet) {
              this.notificationService.show('El archivo Excel no contiene hojas válidas', 'error');
              event.target.value = '';
              return;
            }

            // Convertir a JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
            
            if (jsonData.length < 2) {
              this.notificationService.show('El archivo Excel debe contener al menos una fila de encabezados y una fila de datos', 'error');
              event.target.value = '';
              return;
            }

            // Primera fila son los encabezados
            const headers = (jsonData[0] as any[]).map((h: any) => String(h || '').trim());
            
            // Resto de filas son los datos
            const rows: string[][] = [];
            for (let i = 1; i < jsonData.length; i++) {
              const row = (jsonData[i] as any[]).map((cell: any) => String(cell || '').trim());
              rows.push(row);
            }

            const resultado = await this.procesarDatosProductos(headers, rows);
            this.mostrarResultadoImportacion(resultado);
          } catch (error: any) {
            console.error('Error al procesar el archivo Excel:', error);
            this.notificationService.show(
              `Error al procesar el archivo Excel: ${error.message || 'Error desconocido'}`,
              'error'
            );
          } finally {
            event.target.value = '';
          }
        };
        reader.readAsArrayBuffer(file);
      }
    } catch (error: any) {
      console.error('Error al leer el archivo:', error);
      this.notificationService.show(
        `Error al leer el archivo: ${error.message || 'Error desconocido'}`,
        'error'
      );
      event.target.value = '';
    }
  }

  // Mostrar resultado de la importación
  private mostrarResultadoImportacion(resultado: { importados: number; errores: number; erroresDetalle: string[] }) {
    const { importados, errores, erroresDetalle } = resultado;
    
    let mensaje = `Importación completada: ${importados} productos importados`;
    if (errores > 0) {
      mensaje += `, ${errores} errores`;
      // Mostrar primeros 5 errores en consola para debugging
      console.warn('Errores de importación:', erroresDetalle.slice(0, 5));
    }

    this.notificationService.show(
      mensaje,
      importados > 0 ? 'success' : 'error'
    );

    // Si hay errores, mostrar detalles en consola
    if (errores > 0 && erroresDetalle.length > 0) {
      console.error('Detalles de errores:', erroresDetalle);
    }
  }
}


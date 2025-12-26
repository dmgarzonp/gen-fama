import { Injectable, signal, computed, inject } from '@angular/core';
import { Ticket, LineaTicket, MetodoPago } from '@shared/models/pos.model';
import { Producto } from '@shared/models/producto.model';
import { SalesRepository } from '@shared/services/sales-repository.service';

function crearTicketVacio(): Ticket {
  return {
    fecha: new Date().toISOString(),
    lineas: [],
    descuento_tipo: null,
    descuento_valor: 0,
    subtotal: 0,
    impuestos: 0,
    total_bruto: 0,
    total_descuento: 0,
    total_neto: 0,
    total: 0,
    cliente_id: undefined,
    requiere_receta: false,
    metodo_pago: 'efectivo',
    recibido: 0,
    cambio: 0,
  };
}

@Injectable({ providedIn: 'root' })
export class PosService {
  private salesRepo = inject(SalesRepository);
  private readonly _ticket = signal<Ticket>(crearTicketVacio());

  ticket = this._ticket.asReadonly();

  totalBruto = computed(() => this._ticket().total_bruto);
  totalNeto = computed(() => this._ticket().total_neto);

  limpiar() {
    this._ticket.set(crearTicketVacio());
  }

  agregarProducto(producto: Producto, cantidad = 1) {
    const t = structuredClone(this._ticket());
    const existente = t.lineas.find((l: LineaTicket) => l.producto_id === producto.id);
    if (existente) {
      existente.cantidad += cantidad;
      existente.subtotal = existente.cantidad * existente.precio_unitario;
    } else {
      const linea: LineaTicket = {
        producto_id: producto.id!,
        nombre: producto.nombre_comercial,
        cantidad,
        precio_unitario: producto.precio_venta,
        subtotal: producto.precio_venta * cantidad,
        requiere_receta: !!producto.requiere_receta,
        es_controlado: !!producto.es_controlado,
      };
      t.lineas.push(linea);
    }
    this.recalcular(t);
  }

  quitarLinea(index: number) {
    const t = structuredClone(this._ticket());
    t.lineas.splice(index, 1);
    this.recalcular(t);
  }

  setDescuento(tipo: 'percentage' | 'fixed' | null, valor: number) {
    const t = structuredClone(this._ticket());
    t.descuento_tipo = tipo;
    t.descuento_valor = valor;
    this.recalcular(t);
  }

  setMetodoPago(metodo: MetodoPago) {
    const t = structuredClone(this._ticket());
    t.metodo_pago = metodo;
    this._ticket.set(t);
  }

  setCliente(clienteId?: number) {
    const t = structuredClone(this._ticket());
    t.cliente_id = clienteId;
    this._ticket.set(t);
  }

  setRecibido(monto: number) {
    const t = structuredClone(this._ticket());
    t.recibido = monto;
    t.cambio = Math.max(0, monto - t.total_neto);
    this._ticket.set(t);
  }

  async finalizarVenta() {
    const ticket = this._ticket();
    if (ticket.lineas.length === 0) return;

    try {
      const ventaId = await this.salesRepo.saveSale(ticket);
      this.limpiar();
      return ventaId;
    } catch (error) {
      console.error('Error al finalizar la venta:', error);
      throw error;
    }
  }

  private recalcular(t: Ticket) {
    t.total_bruto = t.lineas.reduce((s: number, l: LineaTicket) => s + l.subtotal, 0);
    // Asumimos impuestos como parte del total bruto para simplificación o calculados extra
    t.subtotal = t.total_bruto / 1.18; // Ejemplo IGV 18% incluido
    t.impuestos = t.total_bruto - t.subtotal;

    if (!t.descuento_tipo || !t.descuento_valor || t.descuento_valor <= 0) {
      t.total_descuento = 0;
    } else if (t.descuento_tipo === 'percentage') {
      t.total_descuento = Math.min(t.total_bruto, (t.total_bruto * (t.descuento_valor || 0)) / 100);
    } else {
      t.total_descuento = Math.min(t.total_bruto, t.descuento_valor || 0);
    }
    t.total_neto = Math.max(0, t.total_bruto - t.total_descuento);
    t.total = t.total_neto; // Alias
    t.cambio = Math.max(0, t.recibido - t.total_neto);
    t.requiere_receta = t.lineas.some((l: LineaTicket) => !!l.es_controlado || !!l.requiere_receta);
    this._ticket.set(t);
  }
}



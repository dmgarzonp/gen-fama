import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconsModule } from '../../shared/icons.module';
import { Cliente } from '@shared/models/cliente.model';
import { ClientesService } from '@features/clientes/services/clientes.service';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconsModule],
  templateUrl: './clientes-list.component.html',
})
export class ClientesListComponent {
  private clientesService = inject(ClientesService);
  clientes = this.clientesService.clientes;

  terminoBusqueda = signal('');
  tipoFiltro = signal<string>('todos');
  estadoFiltro = signal<string>('todos');

  clientesFiltrados() {
    return this.clientes().filter((cliente) => {
      const coincideBusqueda =
        !this.terminoBusqueda() ||
        cliente.nombre_completo.toLowerCase().includes(this.terminoBusqueda().toLowerCase()) ||
        cliente.identificacion.includes(this.terminoBusqueda()) ||
        (cliente.email || '').toLowerCase().includes(this.terminoBusqueda().toLowerCase());

      const coincideTipo = this.tipoFiltro() === 'todos' || cliente.tipo === this.tipoFiltro();
      const coincideEstado = this.estadoFiltro() === 'todos' || cliente.estado === this.estadoFiltro();

      return coincideBusqueda && coincideTipo && coincideEstado;
    });
  }

  async eliminarCliente(cliente: Cliente) {
    if (confirm(`¿Está seguro de eliminar a ${cliente.nombre_completo}?`)) {
      await this.clientesService.delete(cliente.id!);
    }
  }

  getTotalClientes(): number {
    return this.clientes().length;
  }

  getClientesVIP(): number {
    return this.clientes().filter((c) => c.tipo === 'VIP').length;
  }

  getClientesCredito(): number {
    return this.clientes().filter((c) => c.tipo === 'Crédito').length;
  }

  getSaldoPendienteTotal(): number {
    return this.clientes().reduce((sum, c) => sum + (c.saldo_pendiente || 0), 0);
  }

  getTipoClass(tipo: string): string {
    switch (tipo) {
      case 'VIP':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Crédito':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getEstadoClass(estado: string): string {
    return estado === 'activo'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : 'bg-red-100 text-red-800 border-red-200';
  }
}

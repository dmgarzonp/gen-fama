import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../shared/icons.module';

interface Turno {
  id: number;
  usuario: string;
  montoInicial: number;
  horaApertura: Date;
  horaCierre?: Date;
  montoFinal?: number;
  ventas: number;
  ingresos: number;
  egresos: number;
  estado: 'abierto' | 'cerrado';
}

interface Movimiento {
  id: number;
  tipo: 'venta' | 'ingreso' | 'egreso';
  descripcion: string;
  monto: number;
  hora: Date;
  metodo?: string;
}

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './caja.component.html',
})
export class CajaComponent {
  turnoActual: Turno | null = null;
  movimientos: Movimiento[] = [];
  historialTurnos: Turno[] = [
    {
      id: 1,
      usuario: 'Juan Pérez',
      montoInicial: 5000,
      horaApertura: new Date(Date.now() - 86400000),
      horaCierre: new Date(Date.now() - 43200000),
      montoFinal: 8750,
      ventas: 3750,
      ingresos: 0,
      egresos: 0,
      estado: 'cerrado'
    },
    {
      id: 2,
      usuario: 'María García',
      montoInicial: 3000,
      horaApertura: new Date(Date.now() - 172800000),
      horaCierre: new Date(Date.now() - 129600000),
      montoFinal: 6420,
      ventas: 3420,
      ingresos: 0,
      egresos: 0,
      estado: 'cerrado'
    }
  ];

  abrirTurno() {
    this.turnoActual = {
      id: Date.now(),
      usuario: 'Usuario Actual',
      montoInicial: 5000,
      horaApertura: new Date(),
      ventas: 0,
      ingresos: 0,
      egresos: 0,
      estado: 'abierto'
    };
    this.movimientos = [];
  }

  cerrarTurno() {
    if (this.turnoActual) {
      this.turnoActual.estado = 'cerrado';
      this.turnoActual.horaCierre = new Date();
      this.turnoActual.montoFinal = this.turnoActual.montoInicial + this.turnoActual.ventas + this.turnoActual.ingresos - this.turnoActual.egresos;
      this.historialTurnos.unshift(this.turnoActual);
      this.turnoActual = null;
      this.movimientos = [];
    }
  }

  realizarArqueo() {
    const montoEsperado = this.turnoActual!.montoInicial + this.turnoActual!.ventas + this.turnoActual!.ingresos - this.turnoActual!.egresos;
    alert(`Arqueo parcial: Monto esperado $${montoEsperado.toLocaleString()}`);
  }

  registrarIngreso() {
    const descripcion = prompt('Descripción del ingreso:');
    const monto = prompt('Monto del ingreso:');
    
    if (descripcion && monto) {
      const montoNum = parseFloat(monto);
      if (!isNaN(montoNum)) {
        this.movimientos.push({
          id: Date.now(),
          tipo: 'ingreso',
          descripcion,
          monto: montoNum,
          hora: new Date()
        });
        this.turnoActual!.ingresos += montoNum;
      }
    }
  }

  registrarEgreso() {
    const descripcion = prompt('Descripción del egreso:');
    const monto = prompt('Monto del egreso:');
    
    if (descripcion && monto) {
      const montoNum = parseFloat(monto);
      if (!isNaN(montoNum)) {
        this.movimientos.push({
          id: Date.now(),
          tipo: 'egreso',
          descripcion,
          monto: montoNum,
          hora: new Date()
        });
        this.turnoActual!.egresos += montoNum;
      }
    }
  }

  verReporteTurno(turno: Turno) {
    alert(`Generando reporte del turno #${turno.id} - ${turno.usuario}`);
  }

  getDiferencia(turno: Turno): number {
    if (!turno.montoFinal) return 0;
    const esperado = turno.montoInicial + turno.ventas + turno.ingresos - turno.egresos;
    return turno.montoFinal - esperado;
  }

  getDiferenciaColor(turno: Turno): string {
    const diff = this.getDiferencia(turno);
    if (diff > 0) return 'text-emerald-600';
    if (diff < 0) return 'text-red-600';
    return 'text-gray-600';
  }
}

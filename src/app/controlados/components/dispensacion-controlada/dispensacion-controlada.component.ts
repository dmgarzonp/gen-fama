import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../../../shared/icons.module';

@Component({
    selector: 'app-dispensacion-controlada',
    standalone: true,
    imports: [CommonModule, FormsModule, IconsModule],
    template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200 flex justify-between items-start">
          <div>
            <div class="flex items-center gap-2 text-red-600 mb-1">
              <lucide-icon name="alert-triangle" [size]="24"></lucide-icon>
              <span class="font-bold text-lg">Medicamento Controlado</span>
            </div>
            <p class="text-gray-600">Se requiere receta retenida para dispensar este producto.</p>
          </div>
          <button (click)="cancelar.emit()" class="text-gray-400 hover:text-gray-600">
            <lucide-icon name="x" [size]="24"></lucide-icon>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto space-y-6">
          <div class="bg-red-50 p-4 rounded-lg border border-red-100 flex gap-3">
             <div class="bg-red-100 p-2 rounded-full h-fit">
                <lucide-icon name="pill" [size]="20" class="text-red-700"></lucide-icon>
             </div>
             <div>
               <h3 class="font-semibold text-red-900">{{ nombreProducto }}</h3>
               <p class="text-sm text-red-700">Stock Actual: {{ stockActual }}</p>
             </div>
          </div>

          <form class="space-y-4">
            <!-- Datos del Médico -->
            <div class="border-b border-gray-100 pb-4">
              <h4 class="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <lucide-icon name="stethoscope" [size]="18" class="text-blue-500"></lucide-icon>
                Datos del Médico Prescriptor
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input [(ngModel)]="medicoNombre" name="medicoNombre" type="text" class="w-full px-3 py-2 border rounded-lg" placeholder="Dr. Juan Pérez" required>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nro Colegiatura (CMP)</label>
                  <input [(ngModel)]="medicoColegiatura" name="medicoColegiatura" type="text" class="w-full px-3 py-2 border rounded-lg" placeholder="CMP-12345" required>
                </div>
              </div>
            </div>

            <!-- Datos del Paciente -->
            <div class="border-b border-gray-100 pb-4">
              <h4 class="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <lucide-icon name="user" [size]="18" class="text-blue-500"></lucide-icon>
                Datos del Paciente
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input [(ngModel)]="pacienteNombre" name="pacienteNombre" type="text" class="w-full px-3 py-2 border rounded-lg" placeholder="Ana María..." required>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">DNI / Pasaporte</label>
                  <input [(ngModel)]="pacienteDni" name="pacienteDni" type="text" class="w-full px-3 py-2 border rounded-lg" placeholder="Documento de identidad" required>
                </div>
              </div>
            </div>

            <!-- Datos de la Receta -->
            <div>
              <h4 class="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <lucide-icon name="file-text" [size]="18" class="text-blue-500"></lucide-icon>
                Detalles de Receta
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nro de Receta</label>
                    <input [(ngModel)]="nroReceta" name="nroReceta" type="text" class="w-full px-3 py-2 border rounded-lg" placeholder="S/N si no tiene" required>
                 </div>
                 <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Receta</label>
                    <select [(ngModel)]="tipoReceta" name="tipoReceta" class="w-full px-3 py-2 border rounded-lg">
                      <option value="retenida">Receta Médica Retenida</option>
                      <option value="especial">Receta Especial (Estupefacientes)</option>
                    </select>
                 </div>
              </div>
            </div>

            <!-- Autorización QF -->
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
               <label class="block text-sm font-medium text-gray-700 mb-2">Firma Digital (PIN del Químico Farmacéutico)</label>
               <div class="flex gap-2">
                 <input [(ngModel)]="pinQf" name="pinQf" type="password" class="flex-1 px-3 py-2 border rounded-lg" placeholder="Ingrese PIN de 4 dígitos" maxlength="4">
                 <div *ngIf="pinQf().length === 4" class="text-green-600 flex items-center text-sm font-medium animate-pulse">
                    <lucide-icon name="check-circle" [size]="16" class="mr-1"></lucide-icon>
                    PIN Válido
                 </div>
               </div>
               <p class="text-xs text-gray-500 mt-1">Esta acción generará un registro inmutable en el libro de controlados.</p>
            </div>

          </form>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-lg">
          <button (click)="cancelar.emit()" class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">
            Cancelar Venta
          </button>
          <button 
            (click)="validarYConfirmar()" 
            [disabled]="!formularioValido()"
            class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <lucide-icon name="lock" [size]="18"></lucide-icon>
            Autorizar Dispensación
          </button>
        </div>
      </div>
    </div>
  `
})
export class DispensacionControladaComponent {
    @Input() nombreProducto = '';
    @Input() stockActual = 0;

    @Output() confirmar = new EventEmitter<any>();
    @Output() cancelar = new EventEmitter<void>();

    medicoNombre = signal('');
    medicoColegiatura = signal('');
    pacienteNombre = signal('');
    pacienteDni = signal('');
    nroReceta = signal('');
    tipoReceta = signal<'retenida' | 'especial'>('retenida');
    pinQf = signal('');

    formularioValido() {
        return this.medicoNombre() &&
            this.medicoColegiatura() &&
            this.pacienteNombre() &&
            this.pacienteDni() &&
            this.pinQf().length >= 4; // Validación simple de PIN
    }

    validarYConfirmar() {
        if (this.formularioValido()) {
            this.confirmar.emit({
                medicoNombre: this.medicoNombre(),
                medicoColegiatura: this.medicoColegiatura(),
                pacienteNombre: this.pacienteNombre(),
                pacienteDni: this.pacienteDni(),
                nroReceta: this.nroReceta(),
                tipoReceta: this.tipoReceta(),
                pin: this.pinQf()
            });
        }
    }
}

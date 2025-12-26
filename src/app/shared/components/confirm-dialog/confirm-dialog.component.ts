import { Component, Input, Output, EventEmitter, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {
  @Input() mostrar: boolean | Signal<boolean> = false;
  @Input() titulo = '';
  @Input() mensaje = '';
  @Input() tipo: 'info' | 'warning' | 'error' | 'success' = 'warning';
  @Input() textoConfirmar = 'Confirmar';
  @Input() textoCancelar = 'Cancelar';
  @Input() mostrarCancelar = true;

  protected mostrarValue = computed(() => {
    return typeof this.mostrar === 'function' ? this.mostrar() : this.mostrar;
  });

  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  onConfirmar() {
    this.confirmar.emit();
  }

  onCancelar() {
    this.cancelar.emit();
  }

  onCerrar() {
    this.cerrar.emit();
  }

  getIconClass(): string {
    switch (this.tipo) {
      case 'success':
        return 'text-emerald-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  }

  getButtonClass(): string {
    switch (this.tipo) {
      case 'success':
        return 'bg-emerald-500 hover:bg-emerald-600';
      case 'error':
        return 'bg-red-500 hover:bg-red-600';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  }
}

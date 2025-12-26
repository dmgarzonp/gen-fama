import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  private readonly _mostrar = signal(false);
  private readonly _opciones = signal<ConfirmOptions>({
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    showCancel: true
  });

  private resolveCallback?: (confirmed: boolean) => void;

  readonly mostrar = this._mostrar.asReadonly();
  readonly opciones = this._opciones.asReadonly();

  confirmarAccion(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this._opciones.set({
        title: options.title,
        message: options.message,
        type: options.type || 'warning',
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        showCancel: options.showCancel !== false
      });
      this.resolveCallback = resolve;
      this._mostrar.set(true);
    });
  }

  onConfirmar() {
    if (this.resolveCallback) {
      this.resolveCallback(true);
      this.resolveCallback = undefined;
    }
    this._mostrar.set(false);
  }

  onCancelar() {
    if (this.resolveCallback) {
      this.resolveCallback(false);
      this.resolveCallback = undefined;
    }
    this._mostrar.set(false);
  }

  onCerrar() {
    if (this.resolveCallback) {
      this.resolveCallback(false);
      this.resolveCallback = undefined;
    }
    this._mostrar.set(false);
  }
}

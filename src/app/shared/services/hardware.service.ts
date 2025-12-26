import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class HardwareService {
    private barcodeSubject = new Subject<string>();
    barcodeScanned$ = this.barcodeSubject.asObservable();

    private buffer = '';
    private lastKeyTime = 0;

    constructor() {
        this.initBarcodeListener();
    }

    private initBarcodeListener() {
        window.addEventListener('keydown', (event) => {
            const currentTime = Date.now();

            // Los lectores de códigos de barras suelen ser muy rápidos (<50ms entre caracteres)
            if (currentTime - this.lastKeyTime > 50) {
                this.buffer = '';
            }

            if (event.key === 'Enter') {
                if (this.buffer.length > 3) {
                    this.barcodeSubject.next(this.buffer);
                    this.buffer = '';
                }
            } else if (event.key.length === 1) {
                this.buffer += event.key;
            }

            this.lastKeyTime = currentTime;
        });
    }

    async openCashDrawer() {
        console.log('Enviando comando de apertura de cajón...');
        // Comando ESC/POS estándar para abrir cajón: ESC p m t1 t2
        // En hexadecimal: 1B 70 00 19 FA
        // Esto se enviaría a la impresora térmica
        try {
            // placeholder para intercomunicación con el driver de la impresora
            // window.api.printRaw('\x1B\x70\x00\x19\xFA');
        } catch (error) {
            console.error('Error al abrir el cajón:', error);
        }
    }
}

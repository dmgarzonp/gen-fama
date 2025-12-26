import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ScaleService {
    private weightSubject = new Subject<number>();
    weight$ = this.weightSubject.asObservable();

    constructor() { }

    /**
     * Inicia la lectura de la báscula via Serial (Simulado o IPC)
     */
    startReading() {
        console.log('Iniciando lectura de báscula...');
        // En una implementación real con Electron, usaríamos un puente IPC
        // que se comunique con 'serialport' en el proceso Main.

        // Simulación: Peso aleatorio para productos a granel
        setInterval(() => {
            const fakeWeight = Math.random() * 2; // entre 0 y 2kg
            this.weightSubject.next(fakeWeight);
        }, 2000);
    }

    stopReading() {
        console.log('Lectura de báscula detenida.');
    }
}

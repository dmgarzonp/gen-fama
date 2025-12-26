import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../users/services/auth.service';
import { fromEvent, merge, Subscription, timer } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class SessionService {
    private authService = inject(AuthService);
    private router = inject(Router);

    private readonly TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos
    private idleSubscription?: Subscription;

    constructor() { }

    startMonitoring() {
        this.stopMonitoring();

        const activity$ = merge(
            fromEvent(window, 'mousemove'),
            fromEvent(window, 'keydown'),
            fromEvent(window, 'click'),
            fromEvent(window, 'scroll')
        );

        this.idleSubscription = activity$
            .pipe(
                // Reiniciar el temporizador cada vez que haya actividad
                switchMap(() => timer(this.TIMEOUT_MS)),
                tap(() => {
                    console.log('Sesión expirada por inactividad');
                    this.authService.logout();
                })
            )
            .subscribe();
    }

    stopMonitoring() {
        if (this.idleSubscription) {
            this.idleSubscription.unsubscribe();
            this.idleSubscription = undefined;
        }
    }
}

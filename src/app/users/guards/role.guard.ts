import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '@shared/models/usuario.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
        return router.createUrlTree(['/login']);
    }

    const requiredRoles = route.data['roles'] as Role[];

    if (!requiredRoles || requiredRoles.length === 0) {
        return true; // No roles required
    }

    if (authService.hasRole(requiredRoles)) {
        return true;
    }

    // Redirect to unauthorized or home if role doesn't match
    console.warn(`Access denied for ${state.url}. Required roles: ${requiredRoles}`);
    return router.createUrlTree(['/unauthorized']); // Or home
};

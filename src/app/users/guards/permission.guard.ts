import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PermissionsService } from '../services/permissions.service';
import { ModuleName, ActionName } from '@shared/models/usuario.model';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const authService = inject(AuthService);
    const permissionsService = inject(PermissionsService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
        return router.createUrlTree(['/login']);
    }

    const requiredPermission = route.data['permission'] as { module: ModuleName, action: ActionName };

    if (!requiredPermission) {
        return true;
    }

    if (permissionsService.hasPermission(requiredPermission.module, requiredPermission.action)) {
        return true;
    }

    console.warn('Access denied. Missing permission:', requiredPermission);
    return router.createUrlTree(['/unauthorized']);
};

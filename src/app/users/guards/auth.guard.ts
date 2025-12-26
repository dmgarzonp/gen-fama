import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = authService.isAuthenticated();
  console.log('AuthGuard - Verificando autenticación:', isAuth);
  console.log('AuthGuard - Usuario actual:', authService.currentUser());
  console.log('AuthGuard - Ruta solicitada:', state.url);

  if (isAuth) {
    console.log('AuthGuard - Acceso permitido');
    return true;
  }

  console.log('AuthGuard - Acceso denegado, redirigiendo a login');
  // Redirigir al login si no está autenticado
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

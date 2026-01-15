import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If already done loading, check immediately
  if (!authService.isLoading()) {
    if (authService.isAuthenticated()) {
      return true;
    }
    router.navigate(['/login']);
    return false;
  }

  // Wait for loading to complete, then check auth
  return toObservable(authService.isLoading).pipe(
    filter(loading => !loading),
    take(1),
    map(() => {
      if (authService.isAuthenticated()) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    })
  );
};

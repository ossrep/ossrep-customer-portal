import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CustomerService } from '../services/customer.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const customerService = inject(CustomerService);
  const router = inject(Router);

  // If already done loading, check immediately
  if (!authService.isLoading()) {
    if (authService.isAuthenticated()) {
      // Load customer data if not already loaded
      if (!customerService.customer()) {
        customerService.loadCustomerData();
      }
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
        // Load customer data if not already loaded
        if (!customerService.customer()) {
          customerService.loadCustomerData();
        }
        return true;
      }
      router.navigate(['/login']);
      return false;
    })
  );
};

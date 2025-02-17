import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { AlertHelper } from '../helpers/alert-helper';
// import { LoginService } from '../../login/services/login.service';
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(LoginService);
  const alertHelper = inject(AlertHelper);
  if (!auth.isAuthenticated()) {
    alertHelper.viewAlert("error", "EXPIRED", "Your session has expired. Please log in!").then(() => {
      auth.logout();
    });
    return false;
  }
  return true;
};

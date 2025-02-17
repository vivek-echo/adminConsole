import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AlertHelper } from '../helpers/alert-helper';
import { environment } from '../../../environments/environment';
import { LoginService } from '../../services/login.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

export const serverErrorInterceptor: HttpInterceptorFn = (req, next) => {
  // Inject dependencies
  const alertHelper = inject(AlertHelper);
  const authService = inject(LoginService);
  const modalService = inject(NgbModal);

  // Helper methods
  const handleSessionExpired = () => {
    alertHelper.viewAlert('error', 'EXPIRED', 'Session Expired! Please log in again.').then(() => {
      modalService.dismissAll();
      authService.logout();
    });
  };

  const handleBadRequest = () => {
    alertHelper.viewAlert('error', 'Error', 'Something went wrong. Please try again.');
  };

  const handleNotFound = () => {
    alertHelper.viewAlert('error', 'Not Found', 'The requested resource was not found.');
  };
  const handleDBErrors = (error: HttpErrorResponse) => {
    alertHelper.viewAlert('error', 'QUERY_EXECUTION_ERROR', error.error.msg);
  };

  const handleValidationErrors = (error: HttpErrorResponse) => {
    if (error.error) {
      let errorMessage = '';

      if (error.error.msg) {
        if (typeof error.error.msg === 'string') {
          errorMessage += `<i class="fa-solid fa-arrow-right text-danger"></i> ${error.error.msg}<br>`;
        } else if (typeof error.error.msg === 'object') {
          Object.values(error.error.msg).forEach((messages: any) => {
            if (Array.isArray(messages)) {
              messages.forEach((msg: string) => {
                errorMessage += `<i class="fa-solid fa-arrow-right text-danger"></i> ${msg}<br>`;
              });
            } else if (typeof messages === 'string') {
              errorMessage += `<i class="fa-solid fa-arrow-right text-danger"></i> ${messages}<br>`;
            }
          });
        }
      }

      alertHelper.viewAlertHtml('error', 'VALIDATION_ERROR', errorMessage);
    } else {
      const fallbackMessage = '<i class="fa-solid fa-arrow-right text-danger"></i> Invalid data provided.';
      alertHelper.viewAlertHtml('error', 'VALIDATION_ERROR', fallbackMessage);
    }
  };

  const handleServerError = () => {
    alertHelper.viewAlert('error', 'Server Error', 'A server error occurred. Please try again later.');
  };

  const handleUnexpectedError = () => {
    if (environment.production) {
      console.log('Non-critical error suppressed.');
    } else {
      alertHelper.viewAlert('error', 'Error', 'An unexpected error occurred. Please try again.');
    }
  };

  // Interceptor logic
  return next(req).pipe(
    retry(0),
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          handleSessionExpired();
          break;
        case 400:
          handleBadRequest();
          break;
        case 404:
          handleNotFound();
          break;
        case 422:
          handleValidationErrors(error);
          break;
        case 423:
          handleDBErrors(error);
          break;
        case 500:
          handleServerError();
          break;
        default:
          handleUnexpectedError();
      }
      return throwError(() => error);
    })
  );
};

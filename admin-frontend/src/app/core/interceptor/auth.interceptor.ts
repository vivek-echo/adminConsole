import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Bypass condition
  if (req.headers.get('skipInterCept') === 'true') {
    const newHeaders = req.headers.delete('skipInterCept');
    return next(req.clone({ headers: newHeaders }));
  }

  // Retrieve tokens
  const jwtToken = sessionStorage.getItem('jwtToken');
  const isFormData = req.headers.get('Form-Type') === 'form-data';

  // Modify request
  const modifiedRequest = jwtToken ? addAuthToken(req, jwtToken, isFormData) : req;

  return next(modifiedRequest);
};

// Helper function to add authorization headers
const addAuthToken = (
  request: HttpRequest<any>,
  jwtToken: string,
  isFormData: boolean
): HttpRequest<any> => {
  const authHeaders: any = {
    authorization: `Bearer ${jwtToken}`,
  };
  if (!isFormData) {
    authHeaders['Content-Type'] = 'application/json';
  }

  return request.clone({ setHeaders: authHeaders });
};

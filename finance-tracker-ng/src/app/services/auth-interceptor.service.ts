import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { OKTA_AUTH } from '@okta/okta-angular';
// import {OktaAuth} from '@okta/okta-auth-js';
import OktaAuth from '@okta/okta-auth-js/core';
import { from, lastValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor{

  /*
   Interceptors are used to intercept and handle HTTP requests
      and responses globally, allowing you to modify or 
      process them before they are sent to the server or
      after they are received by the client. 
   They are part of Angular's HttpClient module and 
      provide a powerful way to centralize logic that applies to
      all HTTP communications in your application.
  */

  constructor(@Inject(OKTA_AUTH) private oktaAuth : OktaAuth) { }
  
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const accessToken = this.oktaAuth.getAccessToken();
    if (accessToken && req.url.startsWith('http://localhost:8080/api')) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${accessToken}`)
      });
      return next.handle(authReq);
    }
    return next.handle(req);
  }

}

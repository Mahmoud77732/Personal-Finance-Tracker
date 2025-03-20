import { Component, Inject, OnInit } from '@angular/core';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js/core';
import OktaSignIn from '@okta/okta-signin-widget';
import myAppConfig from '../../config/my-app-config';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  // templateUrl: './login.component.html',
  template: '<div id="okta-sign-in-widget"></div>',
  styles: []
})
export class LoginComponent implements OnInit {
  oktaSignin: any;

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth, private router: Router) {
    this.oktaSignin = new OktaSignIn({
      baseUrl: myAppConfig.oidc.issuer.split('/oauth2')[0],
      clientId: myAppConfig.oidc.clientId,
      redirectUri: myAppConfig.oidc.redirectUri,
      useClassicEngine: true, // Force Classic Engine
      authParams: {
        pkce: true,
        issuer: myAppConfig.oidc.issuer,
        scopes: myAppConfig.oidc.scopes,
        responseType: ['code'] // Explicitly use Authorization Code flow
      }
    });
  }

  async ngOnInit(): Promise<void> {
    const isAuthenticated = await this.oktaAuth.isAuthenticated();
    if (isAuthenticated) {
      this.router.navigateByUrl('/dashboard');
      return;
    }

    this.oktaSignin.remove();
    this.oktaSignin.renderEl(
      { el: '#okta-sign-in-widget' },
      (response: any) => {
        if (response.status === 'SUCCESS') {
          this.oktaAuth.tokenManager.setTokens(response.tokens);
          this.router.navigateByUrl('/dashboard');
        }
      },
      (error: any) => console.error('Login error:', error)
    );
  }

  ngOnDestroy() {
    this.oktaSignin.remove();
  }
}

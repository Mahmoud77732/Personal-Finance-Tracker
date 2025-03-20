import { NgModule, Injector } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';

import {OktaAuthGuard, OktaCallbackComponent} from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';

function sendToLoginPage(oktaAuth: typeof OktaAuth, injector: Injector ){
  //Use injector to access any service available within your app
  const router = injector.get(Router)

  //Redirect the user to your custom login page
  router.navigate(['/login']);
}

const routes: Routes = [
  { path: 'login/callback', component: OktaCallbackComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

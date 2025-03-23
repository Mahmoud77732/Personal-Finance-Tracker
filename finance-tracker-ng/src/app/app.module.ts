import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OKTA_AUTH, OKTA_CONFIG, OktaAuthModule } from '@okta/okta-angular';
import myAppConfig from './config/my-app-config';
import {OktaAuth} from  '@okta/okta-auth-js';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { TransactionFormComponent } from './components/transaction-form/transaction-form.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { EditTransactionDialogComponent } from './components/edit-transaction-dialog/edit-transaction-dialog.component';
import { AddTransactionDialogComponent } from './components/add-transaction-dialog/add-transaction-dialog.component';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const oktaConfig = myAppConfig.oidc;
const oktaAuth = new OktaAuth(oktaConfig);

@NgModule({
  declarations: [
    AppComponent, 
    LoginComponent, 
    DashboardComponent, TransactionListComponent, TransactionFormComponent, EditTransactionDialogComponent, AddTransactionDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    ReactiveFormsModule,
    OktaAuthModule,
    FormsModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatSortModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  providers: [
    { 
      provide: OKTA_CONFIG, useValue: { oktaAuth } 
    },
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: AuthInterceptorService, 
      multi: true 
    },
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
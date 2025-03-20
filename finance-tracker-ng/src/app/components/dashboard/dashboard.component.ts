import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <h2>Dashboard</h2>
    <app-transaction-form></app-transaction-form>
    <app-transaction-list></app-transaction-list>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  // categories: any[] = [];

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    // this.transactionService.getCategories().subscribe({
    //   next: (data: any) => this.categories = data._embedded.categories,
    //   error: error => console.error(error)
    // });
  }
  
}

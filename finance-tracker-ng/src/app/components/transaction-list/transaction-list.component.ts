import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-transaction-list',
  template: `
    <h2>Transactions</h2>
    <ul>
      <li *ngFor="let transaction of transactions">
      {{ transaction.amount }} - {{ transaction.date }} - {{ transaction.category?.name }}
      </li>
    </ul>
  `,
  styles: []
})
export class TransactionListComponent{
  transactions: any[] = [];

  constructor(private transactionService: TransactionService) {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.transactionService.getTransactions().subscribe({
      next: (transactions) => {
        console.log('Transactions:', transactions);
        this.transactions = transactions;
      },
      error: (err) => console.error('Error fetching transactions:', err)
    });
  }

}

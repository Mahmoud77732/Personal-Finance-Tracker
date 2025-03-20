import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <h2>Categories</h2>
    <ul>
      <li *ngFor="let category of categories">{{ category.name }}</li>
    </ul>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  categories: any[] = [];

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.transactionService.getCategories().subscribe({
      next: (data: any) => this.categories = data._embedded.categories,
      error: error => console.error(error)
    });
  }
  
}

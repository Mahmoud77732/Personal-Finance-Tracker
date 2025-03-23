import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-transaction-form',
  templateUrl: 'transaction-form.component.html',
  styleUrl: 'transaction-form.component.css'
})
export class TransactionFormComponent implements OnInit{

  transaction: Transaction = { 
    amount: 0, 
    date: new Date().toISOString().split('T')[0], 
    type: 'expense', 
    category: { id: 0, name: '' },
    user: {id: 0, email: ''}
  };

  categories: any[] = [];
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.transactionService.getCategories().subscribe({
      next: (data: any) => this.categories = data._embedded.categories,
      error: error => console.error(error)
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    console.log('Sending transaction:', this.transaction); // Debug
    this.transactionService.addTransaction(this.transaction).subscribe({
      next: (response) => {
        this.successMessage = 'Transaction added successfully!';
        console.log('Transaction response:', response);
        this.transaction = { amount: 0, date: new Date().toISOString().split('T')[0], type: 'expense', category: { id: 0, name: '' }, user: {id: 0, email: ''} };
      },
      error: error => {
        console.error(error);
        this.errorMessage = error.status === 401 ? 'Please log in to add transactions.' : 'Error adding transaction: ' + error.message;
      },
      complete: () => {
        console.log('Transaction submission complete.');
      }
    });
  }

}

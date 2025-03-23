import { Component, OnInit } from '@angular/core';
import { Transaction } from '../../models/transaction';
import { Category } from '../../models/category';
import { MatDialogRef } from '@angular/material/dialog';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-add-transaction-dialog',
  templateUrl: './add-transaction-dialog.component.html',
  styleUrl: './add-transaction-dialog.component.css'
})
export class AddTransactionDialogComponent implements OnInit {

  transaction: Transaction = {
    amount: 0,
    date: new Date().toISOString().split('T')[0], // Default to today
    type: 'expense',
    category: null!,
    user: null! // We'll set this dynamically if needed
  };
  categories: Category[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddTransactionDialogComponent>,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: (err) => console.error('Error fetching categories:', err)
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.transaction);
  }

  compareCategories(c1: Category, c2: Category): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

}

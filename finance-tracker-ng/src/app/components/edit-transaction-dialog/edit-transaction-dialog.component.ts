import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Transaction } from '../../models/transaction';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category.service';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-edit-transaction-dialog',
  templateUrl: './edit-transaction-dialog.component.html',
  styleUrl: './edit-transaction-dialog.component.css'
})
export class EditTransactionDialogComponent implements OnInit{

  categories: Category[] = [];
  users: User[] = [];

  constructor(
    public dialogRef: MatDialogRef<EditTransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Transaction,
    private categoryService: CategoryService,
    private userService: UserService
  ) {

  }

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        // Ensure data.category matches a fetched category by ID
        if (this.data.category && this.data.category.id) {
          this.data.category = this.categories.find(c => c.id === this.data.category.id) || this.data.category;
        }
      },
      error: (err) => console.error('Error fetching categories:', err)
    });
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        if (this.data.user && this.data.user.id) {
          this.data.user = this.users.find(u => u.id === this.data.user.id) || this.data.user;
        }
      },
      error: (err) => console.error('Error fetching users:', err)
    });
  }

  compareCategories(c1: Category, c2: Category): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  compareUsers(u1: User, u2: User): boolean {
    return u1 && u2 ? u1.id === u2.id : u1 === u2;
  }

  onCancel(): void {
    this.dialogRef.close(); // Close without saving
  }

  onSave(): void {
    this.dialogRef.close(this.data); // Return updated transaction
  }

}

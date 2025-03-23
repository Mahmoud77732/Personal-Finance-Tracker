import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { EditTransactionDialogComponent } from '../edit-transaction-dialog/edit-transaction-dialog.component';
import { AddTransactionDialogComponent } from '../add-transaction-dialog/add-transaction-dialog.component';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Page } from '../../models/page';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css']
})
export class TransactionListComponent implements OnInit, OnDestroy{
  transactions: Transaction[] = [];
  displayedColumns: string[] = ['amount', 'date', 'type', 'category', 'user', 'actions'];
  editingTransaction: Transaction | null = null; // Track the transaction being edited
  totalElements = 0;
  pageSize = 5;
  pageIndex = 0;
  sortField = 'id';
  sortDirection = 'asc';
  typeFilter = '';
  amountFilter: number | null = null;
  loading = false;
  exportLoading = false;
  private subscription: Subscription = new Subscription(); // rxjx
  
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private transactionService: TransactionService, 
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {

  }

  ngOnInit(): void {
    this.loadTransactions();
    this.subscription.add(
      this.transactionService.transactionsUpdated.subscribe(
        () => {this.loadTransactions();}) // Refresh list on update
    );
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges(); // Ensure paginator is ready
    console.log('Paginator initialized:', this.paginator);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe(); // Clean up
  }

  loadTransactions(): void {
    this.loading = true;
    const sort = `${this.sortField},${this.sortDirection}`;
    console.log(`Loading page ${this.pageIndex} with size ${this.pageSize}, sort ${sort}, typeFilter: ${this.typeFilter}, amountFilter: ${this.amountFilter}`);
    this.transactionService.getTransactions(this.pageIndex, this.pageSize, sort, this.typeFilter, this.amountFilter).subscribe({
      next: (page: Page<Transaction>) => {
        console.log('Page data:', page.content);
        this.transactions = page.content;
        this.totalElements = page.totalElements;
        this.pageSize = page.size;
        this.pageIndex = page.number;
        this.paginator.length = page.totalElements; // Explicitly set length
        this.paginator.pageSize = page.size;
        this.paginator.pageIndex = page.number;
        this.cdr.detectChanges();
        console.log(`Paginator updated - length: ${this.paginator.length}, pageSize: ${this.paginator.pageSize}, pageIndex: ${this.paginator.pageIndex}`);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching transactions:', err);
        this.snackBar.open('Failed to load transactions', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
        this.loading = false;
      }
    });
  }

  exportToCsv(): void {
    this.exportLoading = true;
    this.transactionService.getAllTransactions(this.typeFilter, this.amountFilter).subscribe({
      next: (allTransactions: Transaction[]) => {
        const headers = ['ID', 'Amount', 'Date', 'Type', 'Category', 'User'];
        const rows = allTransactions.map(t => [
          t.id || '',
          t.amount || '',
          t.date || '',
          t.type || '',
          t.category?.name || 'Unknown',
          t.user?.email || 'No User'
        ]);

        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(value => `"${value}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'all_transactions.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.exportLoading = false;
        this.snackBar.open('Export completed successfully', 'Close', { duration: 2000 });
      },
      error: (err) => {
        console.error('Error exporting transactions:', err);
        this.snackBar.open('Failed to export transactions', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
        this.exportLoading = false;
      }
    });
  }

  applyTypeFilter(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value || '';
    this.typeFilter = value.trim().toLowerCase();
    this.pageIndex = 0;
    this.loadTransactions();
  }

  applyAmountFilter(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value || '';
    const amount = parseFloat(value.trim());
    this.amountFilter = isNaN(amount) ? null : amount;
    this.pageIndex = 0;
    this.loadTransactions();
  }

  onSortChange(sort: Sort): void {
    this.sortField = sort.active;
    this.sortDirection = sort.direction || 'asc';
    this.pageIndex = 0; // Reset to first page
    this.loadTransactions();
  }

  onPageChange(event: PageEvent): void {
    console.log('Page event:', event);
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTransactions();
  }

  deleteTransaction(id: number): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.deleteTransaction(id).subscribe({
        next: () => {
          console.log(`Transaction ${id} deleted`);
          this.snackBar.open(`Transaction ${id} deleted`, 'Close', { duration: 2000 });
        },
        error: (err) => {
          console.error('Error deleting transaction:', err);
          this.snackBar.open('Failed to delete transaction', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
        }
      });
    }
  }

  startEditing(transaction: Transaction): void {
    this.editingTransaction = { ...transaction }; // Clone to avoid direct edits
  }

  saveTransaction(): void {
    if (this.editingTransaction) {
      this.transactionService.updateTransaction(this.editingTransaction).subscribe({
        next: () => {
          console.log(`Transaction ${this.editingTransaction!.id} updated`);
          this.editingTransaction = null; // Exit edit mode
        },
        error: (err) => console.error('Error updating transaction:', err)
      });
    }
  }

  cancelEditing(): void {
    this.editingTransaction = null; // Discard changes
  }

  openEditDialog(transaction: Transaction): void {
    const dialogRef = this.dialog.open(EditTransactionDialogComponent, {
      width: '400px',
      data: { ...transaction } // Clone transaction for editing
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.transactionService.updateTransaction(result).subscribe({
          next: () => {
            console.log(`Transaction ${result.id} updated`);
            this.snackBar.open(`Transaction ${result.id} updated`, 'Close', { duration: 2000 });
          },
          error: (err) => {
            console.error('Error updating transaction:', err);
            this.snackBar.open('Failed to update transaction', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
          }
        });
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddTransactionDialogComponent, {
      width: '400px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.transactionService.addTransaction(result).subscribe({
          next: (transaction) => 
            {
              console.log(`Transaction ${transaction.id} added`);
              this.snackBar.open('Transaction added successfully', 'Close', { duration: 2000 });
            },
          error: (err) => {
            console.error('Error adding transaction:', err);
            this.snackBar.open(err.message || 'Failed to add transaction', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
          }
        });
      }
    });
  }

}

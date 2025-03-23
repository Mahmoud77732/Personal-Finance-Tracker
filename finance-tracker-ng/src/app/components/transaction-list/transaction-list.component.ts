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
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css'],
  providers: [DatePipe] // Add DatePipe for formatting
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
  startDate: Date | null = null;
  endDate: Date | null = null;
  loading = false;
  exportLoading = false;
  totalIncome = 0;
  totalExpense = 0;
  netBalance = 0;
  allTotalIncome: number = 0;
  allTotalExpense: number = 0;
  allNetTotal: number = 0;
  length = 0;
  private subscription: Subscription = new Subscription(); // rxjx
  
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private transactionService: TransactionService, 
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe
  ) {

  }

  ngOnInit(): void {
    this.loadTransactions();
    this.subscription.add(
      this.transactionService.transactionsUpdated.subscribe(
        () => {
          this.loadTransactions();
          this.loadAllTotals();
        }) // Refresh list on update
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
    const startDateStr = this.startDate ? this.datePipe.transform(this.startDate, 'yyyy-MM-dd') : null;
    const endDateStr = this.endDate ? this.datePipe.transform(this.endDate, 'yyyy-MM-dd') : null;
    console.log(`Loading page ${this.pageIndex} with size ${this.pageSize}, sort ${sort}, typeFilter: ${this.typeFilter}, amountFilter: ${this.amountFilter}, startDate: ${startDateStr}, endDate: ${endDateStr}`);
    this.transactionService.getTransactions(this.pageIndex, this.pageSize, sort, this.typeFilter, this.amountFilter, startDateStr, endDateStr).subscribe({
      next: (page: Page<Transaction>) => {
        console.log('Page data:', page.content);
        console.log('Page metadata:', { totalElements: page.totalElements, totalPages: page.totalPages });
        this.transactions = page.content;
        this.totalElements = page.totalElements;
        this.updatePaginator();
        this.calculatePageTotals();
        this.cdr.detectChanges();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching transactions:', err);
        this.loading = false;
      }
    });
    this.loadAllTotals();
  }

  loadAllTotals(): void {
    const startDateStr = this.startDate ? this.datePipe.transform(this.startDate, 'yyyy-MM-dd')! : null;
    const endDateStr = this.endDate ? this.datePipe.transform(this.endDate, 'yyyy-MM-dd')! : null;
    this.transactionService.getTotals(this.typeFilter, this.amountFilter, startDateStr, endDateStr).subscribe({
      next: (totals: { totalIncome: number; totalExpense: number; netTotal: number }) => {
        console.log('Raw totals from service:', totals);
        this.allTotalIncome = totals.totalIncome;
        this.allTotalExpense = totals.totalExpense;
        this.allNetTotal = totals.netTotal;
        console.log('Assigned totals - Income:', this.allTotalIncome, 'Expense:', this.allTotalExpense, 'Net:', this.allNetTotal);
        console.log('Types - Income:', typeof this.allTotalIncome, 'Expense:', typeof this.allTotalExpense, 'Net:', typeof this.allNetTotal);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error in loadAllTotals:', error);
        this.allTotalIncome = 0;
        this.allTotalExpense = 0;
        this.allNetTotal = 0;
        this.cdr.detectChanges();
      }
    });
  }

  calculatePageTotals(): void {
    this.totalIncome = this.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    this.totalExpense = this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + -t.amount, 0);  // Match backend: expenses are negated
    this.netBalance = this.totalIncome + this.totalExpense;  // Use netBalance to match HTML
    console.log(`Page Totals - Income: ${this.totalIncome}, Expense: ${this.totalExpense}, Net: ${this.netBalance}`);
  }

  updatePaginator(): void {
    if (this.paginator) {
      this.paginator.length = this.totalElements; // Set paginator length
      this.paginator.pageIndex = this.pageIndex;
      this.paginator.pageSize = this.pageSize;
      console.log(`Paginator updated - length: ${this.paginator.length}, pageSize: ${this.paginator.pageSize}, pageIndex: ${this.paginator.pageIndex}`);
    }
  }

  handlePageEvent(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTransactions();
  }


  exportToCsv(): void {
    this.exportLoading = true;
    const startDateStr = this.startDate ? this.datePipe.transform(this.startDate, 'yyyy-MM-dd') : null;
    const endDateStr = this.endDate ? this.datePipe.transform(this.endDate, 'yyyy-MM-dd') : null;
    this.transactionService.getAllTransactions(this.typeFilter, this.amountFilter, startDateStr, endDateStr).subscribe({
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

  onSortChange(event: any): void {
    this.sortField = event.active;
    this.sortDirection = event.direction;
    this.pageIndex = 0;
    this.loadTransactions();
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTransactions();
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

  applyDateRange(): void {
    this.pageIndex = 0;
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

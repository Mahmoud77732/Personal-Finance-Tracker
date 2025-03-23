import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OKTA_AUTH } from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js/core';
import { Transaction } from '../models/transaction';
import { Observable, forkJoin, from, of, Subject } from 'rxjs';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { Page } from '../models/page';
import { Category } from '../models/category';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private baseUrl = 'http://localhost:8080/api';
  private transactionsUpdated$ = new Subject<void>(); // For notifying updates

  constructor(private http: HttpClient, @Inject(OKTA_AUTH) private oktaAuth: OktaAuth) {}

  getCategories() : Observable<any>{
    return this.http.get(`${this.baseUrl}/categories`);
  }

  get transactionsUpdated(): Observable<void> {
    return this.transactionsUpdated$.asObservable();
  }

  getTransactions(page: number = 0, size: number = 5, sort: string = 'id,asc', typeFilter: string = '', amountFilter: number | null = null): Observable<Page<Transaction>> {
    let url = `${this.baseUrl}/transactions?page=${page}&size=${size}&sort=${sort}`;
    if (typeFilter || amountFilter !== null) {
      const typeParam = typeFilter ? `type=${encodeURIComponent(typeFilter)}` : 'type=';
      const amountParam = amountFilter !== null ? `amount=${amountFilter}` : 'amount=';
      url = `${this.baseUrl}/transactions/search/searchByTypeOrAmount?${typeParam}&${amountParam}&page=${page}&size=${size}&sort=${sort}`;
    }
    return this.http.get<HalTransactionsResponse>(url).pipe(
      switchMap(response => {
        const transactions = response._embedded?.transactions || [];
        console.log('Raw transactions response:', transactions);
        if (transactions.length === 0) {
          return of({
            content: [] as Transaction[],
            totalElements: response.page?.totalElements || 0,
            totalPages: response.page?.totalPages || 0,
            number: response.page?.number || 0,
            size: response.page?.size || size
          } as Page<Transaction>);
        }
        return forkJoin(
          transactions.map((t: any) =>
            this.resolveTransactionDetails(t)
          )
        ).pipe(
          map((content: any) => ({
            content,
            totalElements: response.page.totalElements,
            totalPages: response.page.totalPages,
            number: response.page.number,
            size: response.page.size
          } as Page<Transaction>))
        );
      }),
      catchError(err => {
        console.error('Error fetching transactions:', err);
        throw err;
      })
    );
  }

  getAllTransactions(typeFilter: string = '', amountFilter: number | null = null): Observable<Transaction[]> {
    // Use a large size to fetch all (adjust based on your data size or backend limit)
    const largeSize = 1000; // Assuming you won't exceed 1000 transactions; adjust if needed
    const sort = 'id,asc';
    let url = `${this.baseUrl}/transactions?page=0&size=${largeSize}&sort=${sort}`;
    if (typeFilter || amountFilter !== null) {
      const typeParam = typeFilter ? `type=${encodeURIComponent(typeFilter)}` : 'type=';
      const amountParam = amountFilter !== null ? `amount=${amountFilter}` : 'amount=';
      url = `${this.baseUrl}/transactions/search/searchByTypeOrAmount?${typeParam}&${amountParam}&page=0&size=${largeSize}&sort=${sort}`;
    }
    return this.http.get<HalTransactionsResponse>(url).pipe(
      switchMap(response => {
        const transactions = response._embedded?.transactions || [];
        if (transactions.length === 0) {
          return of([]);
        }
        return forkJoin(
          transactions.map((t: Transaction) => this.resolveTransactionDetails(t))
        );
      }),
      catchError(err => {
        console.error('Error fetching all transactions:', err);
        throw err;
      })
    );
  }

  private resolveTransactionDetails(transaction: Transaction): Observable<Transaction> {
    const categoryUrl = transaction._links?.category?.href;
    const userUrl = transaction._links?.user?.href;

    const category$ = categoryUrl ? this.http.get<Category>(categoryUrl) : of(transaction.category);
    const user$ = userUrl ? this.http.get<User>(userUrl) : of(transaction.user);

    return forkJoin([category$, user$]).pipe(
      map(([category, user]) => {
        if (category) {
          transaction.category = category;
          console.log(`Resolved category for transaction ${transaction.id}:`, category);
        }
        if (user) {
          transaction.user = user;
        }
        return transaction;
      })
    );
  }

  addTransaction(transaction: Transaction): Observable<Transaction> {
    return from(this.oktaAuth.getUser()).pipe(
      switchMap(user => {
        console.log('Okta user:', user);
        const userEmail = user.preferred_username; // Use email or sub as identifier
        // Fetch the backend User by email (or sub)
        return this.http.get<any>(`${this.baseUrl}/users/search/findByEmail?email=${userEmail}`).pipe(
          switchMap(userEntity => {
            const userId = userEntity.id; // Numeric ID from backend
            const payload = {
              amount: transaction.amount,
              date: transaction.date,
              type: transaction.type,
              category: transaction.category ? `${this.baseUrl}/categories/${transaction.category.id}` : null,
              user: `${this.baseUrl}/users/${userId}`
            };
            console.log('POST payload:', JSON.stringify(payload, null, 2));
            return this.http.post<Transaction>(`${this.baseUrl}/transactions`, payload, {
              headers: { 'Content-Type': 'application/json' }
            }).pipe(
              tap(() => this.transactionsUpdated$.next()) // Refresh list
            );
          })
        );
      }),
      catchError(err => {
        const errorMsg = err.status === 401 ? 'Unauthorized: Please log in again.' :
                         err.status === 400 ? 'Invalid transaction data.' :
                         err.status === 404 ? 'Resource not found (e.g., category or user).' :
                         `Server error: ${err.status} - ${err.message}`;
        console.error('Error adding transaction:', errorMsg, err);
        throw new Error(errorMsg); // Structured error for component
      })
    );
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/transactions/${id}`).pipe(
      tap(() => this.transactionsUpdated$.next()), // Notify listeners
      catchError(err => {
        console.error(`Error deleting transaction ${id}:`, err);
        throw err;
      })
    );
  }

  updateTransaction(transaction: Transaction): Observable<Transaction> {
    const url = `${this.baseUrl}/transactions/${transaction.id}`;
    const body = {
      amount: transaction.amount,
      date: transaction.date,
      type: transaction.type,
      category: transaction.category ? `${this.baseUrl}/categories/${transaction.category.id}` : null,
      user: transaction.user ? `${this.baseUrl}/users/${transaction.user.id}` : null
    };
    console.log('body_update: ', body);
    return this.http.patch<Transaction>(url, body).pipe(
      tap(() => this.transactionsUpdated$.next()),
      catchError(err => {
        console.error(`Error updating transaction ${transaction.id}:`, err);
        throw err;
      })
    );
  }

}

interface HalTransactionsResponse {
  _embedded?: {
    transactions: Transaction[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
  _links?: any; // Optional, can refine further if needed
}
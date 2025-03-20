import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OKTA_AUTH } from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js/core';
import { Transaction } from '../models/transaction';
import { Observable, forkJoin, from, of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, @Inject(OKTA_AUTH) private oktaAuth: OktaAuth) {}

  getCategories() : Observable<any>{
    return this.http.get(`${this.baseUrl}/categories`);
  }

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<any>(`${this.baseUrl}/transactions`).pipe(
      map(response => {
        const transactions = response._embedded?.transactions || [];
        console.log('Raw transactions response:', transactions);
        return transactions;
      }),
      switchMap((transactions: any[]) => {
        if (transactions.length === 0) {
          return of([] as Transaction[]);
        }
        return forkJoin(
          transactions.map(t => {
            const categoryUrl = t._links?.category?.href;
            if (!categoryUrl) {
              console.warn('Skipping transaction with missing category URL:', t);
              return of({
                id: t.id,
                amount: t.amount,
                date: t.date,
                type: t.type,
                category: { id: 0, name: 'Unknown' },
                user: t._links?.user?.href ? { id: 0, email: 'Unknown' } : undefined,
                _links: t._links
              } as Transaction);
            }
            return this.http.get<{ id: number; name: string }>(categoryUrl).pipe(
              map(category => ({
                id: t.id,
                amount: t.amount,
                date: t.date,
                type: t.type,
                category,
                user: t._links?.user?.href ? { id: 0, email: 'Unknown' } : undefined, // Placeholder for user
                _links: t._links
              } as Transaction)),
              catchError(err => {
                console.error('Error fetching category for transaction:', t, err);
                return of({
                  id: t.id,
                  amount: t.amount,
                  date: t.date,
                  type: t.type,
                  category: { id: 0, name: 'Unknown' },
                  user: t._links?.user?.href ? { id: 0, email: 'Unknown' } : undefined,
                  _links: t._links
                } as Transaction);
              })
            );
          })
        );
      }),
      catchError(err => {
        console.error('Error fetching transactions:', err);
        throw err;
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
              category: `${this.baseUrl}/categories/${transaction.category.id}`,
              user: `${this.baseUrl}/users/${userId}`
            };
            console.log('POST payload:', JSON.stringify(payload, null, 2));
            return this.http.post<Transaction>(`${this.baseUrl}/transactions`, payload, {
              headers: { 'Content-Type': 'application/json' }
            });
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

}
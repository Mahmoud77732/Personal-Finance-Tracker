import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<any>(`${this.baseUrl}/users`).pipe(
      map(response => response._embedded?.users || []),
      map(users => users.map((u: any) => ({
        id: u.id,
        email: u.email
      })))
    );
  }

}

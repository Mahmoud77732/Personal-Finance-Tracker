import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}
  
  getCategories(): Observable<Category[]> {
    return this.http.get<any>(`${this.baseUrl}/categories`).pipe(
      map(response => response._embedded?.categories || []),
      map(categories => categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name
      })))
    );
  }
}
